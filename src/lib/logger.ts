/**
 * Cloud Run Structured Logger & Error Reporting Engine
 * Outputs native single-line JSON on stdout/stderr for Google Cloud Logging ingestion.
 * Adheres to Locus Software Standards (Threat Zone 5: Zero secrets in logs & Threat Zone 1: PII protection).
 */

import { Request, Response, NextFunction } from 'express';

export type LogSeverity = 'DEFAULT' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface LogContext {
  traceId?: string;
  component?: string;
  durationMs?: number;
  statusCode?: number;
  userId?: string;
  entryId?: string;
  modelUsed?: string;
  sanitizerRedactions?: number;
  [key: string]: unknown;
}

const SERVICE_NAME = 'locus';
const SERVICE_VERSION = '1.0.0';
const DEFAULT_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || 'cohort-3-track-1-project';

// Sensitive keys and pattern rules for Threat Zone 5 compliance
const SENSITIVE_KEY_REGEX = /^(password|secret|key|token|authorization|apikey|content|prompt|excerpt|history|conversation)$/i;
const API_KEY_REGEX = /AIzaSy[A-Za-z0-9_-]{33}/g;
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi;

/**
 * Strips sensitive keys and redacts API keys/auth tokens from any logged metadata.
 */
export function sanitizeLogMetadata(data: unknown, depth = 0): unknown {
  if (depth > 5 || data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data.replace(API_KEY_REGEX, '[REDACTED_API_KEY]').replace(BEARER_REGEX, 'Bearer [REDACTED_TOKEN]');
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogMetadata(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = '[REDACTED_PAYLOAD]';
      } else {
        sanitized[key] = sanitizeLogMetadata(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Extracts GCP Trace ID from X-Cloud-Trace-Context header
 * Format: TRACE_ID/SPAN_ID;o=TRACE_TRUE
 */
export function parseCloudTrace(traceContext?: string, projectId = DEFAULT_PROJECT_ID): string | undefined {
  if (!traceContext) return undefined;
  const match = traceContext.match(/^([a-f0-9]+)/i);
  if (!match) return undefined;
  return `projects/${projectId}/traces/${match[1]}`;
}

/**
 * Determines if running in Google Cloud Run or production environment
 */
export function isCloudRun(): boolean {
  return Boolean(process.env.K_SERVICE || process.env.NODE_ENV === 'production');
}

/**
 * Writes a structured entry to stdout or stderr
 */
export function writeLog(
  severity: LogSeverity,
  message: string,
  context: LogContext = {},
  error?: Error | unknown
): void {
  const sanitizedMsg = String(message)
    .replace(API_KEY_REGEX, '[REDACTED_API_KEY]')
    .replace(BEARER_REGEX, 'Bearer [REDACTED_TOKEN]');
  
  const sanitizedContext = (sanitizeLogMetadata(context) as LogContext) || {};
  const trace = context.traceId ? parseCloudTrace(context.traceId) : undefined;
  const timestamp = new Date().toISOString();

  // If running on Cloud Run, format as single-line JSON for native ingestion
  if (isCloudRun()) {
    const logEntry: Record<string, unknown> = {
      severity,
      message: sanitizedMsg,
      timestamp,
      serviceContext: {
        service: SERVICE_NAME,
        version: SERVICE_VERSION
      },
      ...sanitizedContext
    };

    if (trace) {
      logEntry['logging.googleapis.com/trace'] = trace;
    }

    if (error instanceof Error) {
      logEntry['@type'] = 'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent';
      logEntry['stack_trace'] = error.stack;
      logEntry['message'] = `${sanitizedMsg}\n${error.stack || error.message}`;
    }

    const output = JSON.stringify(logEntry);
    if (severity === 'ERROR' || severity === 'CRITICAL') {
      process.stderr.write(`${output}\n`);
    } else {
      process.stdout.write(`${output}\n`);
    }
  } else {
    // Local dev: calm human-readable output
    const timeStr = timestamp.split('T')[1].slice(0, 8);
    const prefix = `[${timeStr}] [${severity}]${context.component ? ` [${context.component}]` : ''}:`;
    if (severity === 'ERROR' || severity === 'CRITICAL') {
      console.error(prefix, sanitizedMsg, error || '');
    } else if (severity === 'WARNING') {
      console.warn(prefix, sanitizedMsg);
    } else {
      console.log(prefix, sanitizedMsg);
    }
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => writeLog('DEBUG', msg, ctx),
  info: (msg: string, ctx?: LogContext) => writeLog('INFO', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => writeLog('WARNING', msg, ctx),
  error: (msg: string, err?: Error | unknown, ctx?: LogContext) => writeLog('ERROR', msg, ctx, err),
  critical: (msg: string, err?: Error | unknown, ctx?: LogContext) => writeLog('CRITICAL', msg, ctx, err)
};

/**
 * Express Request Logger Middleware
 * Correlates Cloud Trace IDs and records endpoint latency
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const traceHeader = req.headers['x-cloud-trace-context'] as string | undefined;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;
    const severity: LogSeverity = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARNING' : 'INFO';

    // Omit health check polling from flooding production logs
    if (req.path === '/api/health' && statusCode === 200) {
      return;
    }

    writeLog(severity, `${req.method} ${req.path} ${statusCode} (${durationMs}ms)`, {
      traceId: traceHeader,
      component: 'http',
      method: req.method,
      path: req.path,
      statusCode,
      durationMs
    });
  });

  next();
}
