import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Sparkles, 
  Tag, 
  BookMarked, 
  ShieldCheck, 
  Check, 
  Plus, 
  Trash2, 
  Download,
  Bell,
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { UserSettings, PersonaTone, ReflectionMode, Interaction, NotebookItem } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (updated: UserSettings) => void;
  allInteractions: Interaction[];
  allNotebookItems: NotebookItem[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const TONES: { id: PersonaTone; label: string; desc: string }[] = [
  { id: 'Warm', label: 'Warm & Empathic', desc: 'Compassionate, emotionally validating, and supportive.' },
  { id: 'Direct', label: 'Direct & Strategic', desc: 'Crisp, structured, cut-to-the-chase clarity.' },
  { id: 'Reflective', label: 'Deep Inquirer', desc: 'Probing philosophical questions and cognitive mirroring.' },
  { id: 'Mindful', label: 'Mindful & Grounding', desc: 'Gentle, spacious, and presence-oriented.' },
  { id: 'Playful', label: 'Creative & Playful', desc: 'Spontaneous brainstorming with novel connections.' },
];

const STANCES: { id: ReflectionMode; label: string }[] = [
  { id: 'reflect', label: 'Reflective Mirror' },
  { id: 'brainstorm', label: 'Idea Spark' },
  { id: 'actionable', label: 'Action Blueprint' },
  { id: 'mindful', label: 'Mindful Unpack' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  allInteractions,
  allNotebookItems,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'tags' | 'notebook' | 'data' | 'integrations'>('persona');
  const [formState, setFormState] = useState<UserSettings>(settings);
  const [newTagInput, setNewTagInput] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookValidationStatus, setWebhookValidationStatus] = useState<{ isValid: boolean; error?: string } | null>(null);

  const handleTestWebhook = async () => {
    if (!formState.webhookUrl?.trim()) return;
    setIsTestingWebhook(true);
    try {
      const res = await fetch('/api/notifications/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: formState.webhookUrl.trim() }),
      });
      const data = await res.json();
      setWebhookValidationStatus({
        isValid: Boolean(data.isValid),
        error: data.error,
      });
    } catch (err: any) {
      setWebhookValidationStatus({
        isValid: false,
        error: err.message || 'Validation request failed',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  React.useEffect(() => {
    setFormState(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formState);
    onShowToast('Preferences saved successfully.', 'success');
    onClose();
  };

  const handleAddCategory = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (formState.categories.includes(trimmed)) {
      onShowToast('Category already exists.', 'info');
      return;
    }
    setFormState({
      ...formState,
      categories: [...formState.categories, trimmed],
    });
    setNewTagInput('');
  };

  const handleRemoveCategory = (cat: string) => {
    if (formState.categories.length <= 1) {
      onShowToast('At least one category is required.', 'error');
      return;
    }
    setFormState({
      ...formState,
      categories: formState.categories.filter((c) => c !== cat),
    });
  };

  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      reflectionsCount: allInteractions.length,
      notebookCount: allNotebookItems.length,
      reflections: allInteractions,
      notebook: allNotebookItems,
      settings: formState,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflect-ai-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Export downloaded successfully.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-stone-900/30 backdrop-blur-xs animate-fade-in">
      <div 
        id="settings-drawer-panel"
        className="w-full max-w-2xl bg-[#FDFBF7] h-full shadow-2xl border-l border-stone-200 flex flex-col justify-between"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-heading text-xl font-bold text-stone-900 leading-tight">
                Settings &amp; Preferences
              </h3>
              <p className="text-xs text-stone-500">Configure your companion tone, tags, and notebook</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip & Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Tab List */}
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-stone-200 bg-[#F9F7F2] p-3 space-y-1 shrink-0">
            <button
              onClick={() => setActiveTab('persona')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'persona'
                  ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Persona &amp; Tone</span>
            </button>

            <button
              onClick={() => setActiveTab('tags')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'tags'
                  ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Tags &amp; Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('notebook')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'notebook'
                  ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Notebook</span>
            </button>

            <button
              id="settings-tab-data"
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Model &amp; Data</span>
            </button>

            <button
              id="settings-tab-integrations"
              onClick={() => setActiveTab('integrations')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'integrations'
                  ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Integrations &amp; Alerts</span>
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'persona' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                    Tone Presets
                  </label>
                  <div className="space-y-2">
                    {TONES.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setFormState({ ...formState, personaTone: t.id })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          formState.personaTone === t.id
                            ? 'bg-white border-emerald-700/80 ring-1 ring-emerald-700/20 shadow-2xs'
                            : 'bg-white/60 border-stone-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-900">{t.label}</span>
                          {formState.personaTone === t.id && (
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                    Default Stance on New Entries
                  </label>
                  <select
                    value={formState.defaultStance}
                    onChange={(e) => setFormState({ ...formState, defaultStance: e.target.value as ReflectionMode })}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  >
                    {STANCES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                    System Prompt &amp; Custom Instructions
                  </label>
                  <p className="text-[11px] text-stone-500 mb-2">
                    Guide how your companion analyzes, frames insights, and responds to your reflections.
                  </p>
                  <textarea
                    rows={4}
                    value={formState.customInstructions}
                    onChange={(e) => setFormState({ ...formState, customInstructions: e.target.value })}
                    placeholder="e.g. I am an engineer transitioning to product leadership. Challenge my assumptions with strategic inquiry and help me clarify priorities."
                    className="w-full p-3 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'tags' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                    Manage Categories &amp; Tags
                  </label>
                  <p className="text-[11px] text-stone-500 mb-4">
                    This is the single source of truth for categories, keeping the sidebar taxonomy perfectly in sync.
                  </p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      placeholder="Add new category (e.g., Reading, Health)..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formState.categories.map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-lg text-xs"
                      >
                        <span className="font-medium text-stone-800">{cat}</span>
                        <button
                          onClick={() => handleRemoveCategory(cat)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notebook' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                    Notebook Automation
                  </label>
                  <p className="text-[11px] text-stone-500 mb-4">
                    Configure how quotes and takeaways are filed into your personal notebook.
                  </p>

                  <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.autoGenerateContextHint}
                        onChange={(e) => setFormState({ ...formState, autoGenerateContextHint: e.target.checked })}
                        className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
                      />
                      <div>
                        <span className="text-xs font-semibold text-stone-800">Auto-Generate Context Hints</span>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          When saving an excerpt, automatically generate a 1-sentence analytical context note.
                        </p>
                      </div>
                    </label>

                    <div className="pt-3 border-t border-stone-100">
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        Default Folder Naming
                      </label>
                      <select
                        value={formState.defaultFolderPattern}
                        onChange={(e) => setFormState({ ...formState, defaultFolderPattern: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      >
                        <option value="source_title">Source Reflection Title (Default)</option>
                        <option value="category">Category Name</option>
                        <option value="date">Month &amp; Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                    Model &amp; Data Management
                  </label>
                  <p className="text-[11px] text-stone-500 mb-4">
                    Export your complete journal archive or manage privacy settings.
                  </p>

                  <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-stone-800">Export All Data (JSON)</p>
                        <p className="text-[11px] text-stone-500">
                          {allInteractions.length} reflections &bull; {allNotebookItems.length} saved notes
                        </p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Archive</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                {/* Outbound Privacy Notice */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950">
                    <Shield className="w-4 h-4 text-emerald-800" />
                    <span>Outbound Privacy Sanitizer Active</span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    Any prompt or reflection sent to external synthesis engines or webhooks is automatically scrubbed of phone numbers, emails, and street addresses before egress. Your original reflections remain intact and unredacted in your private journal.
                  </p>
                </div>

                {/* Morning Digest Email */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                    Morning Reflection Digest
                  </label>
                  <p className="text-[11px] text-stone-500 mb-3">
                    Receive a gentle morning summary of recent realizations and open inquiries.
                  </p>
                  <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        id="settings-email-notifications-toggle"
                        type="checkbox"
                        checked={Boolean(formState.emailNotifications)}
                        onChange={(e) => setFormState({ ...formState, emailNotifications: e.target.checked })}
                        className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
                      />
                      <div>
                        <span className="text-xs font-semibold text-stone-800">Email Digest</span>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Dispatches daily at 7:00 AM. In development mode, digests log safely to server console.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Webhook Dispatcher */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                    Zapier / Custom Webhook
                  </label>
                  <p className="text-[11px] text-stone-500 mb-3">
                    Forward concluded reflection digests to your personal automation endpoint with strict SSRF protection.
                  </p>
                  <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        Endpoint URL (HTTPS Required)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="settings-webhook-url-input"
                          type="url"
                          value={formState.webhookUrl || ''}
                          onChange={(e) => {
                            setFormState({ ...formState, webhookUrl: e.target.value });
                            setWebhookValidationStatus(null);
                          }}
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                        />
                        <button
                          id="settings-test-webhook-btn"
                          type="button"
                          onClick={handleTestWebhook}
                          disabled={isTestingWebhook || !formState.webhookUrl?.trim()}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {isTestingWebhook ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-800" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                          )}
                          <span>Test SSRF</span>
                        </button>
                      </div>
                    </div>

                    {webhookValidationStatus && (
                      <div
                        id="settings-webhook-status-badge"
                        className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                          webhookValidationStatus.isValid
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border border-rose-200 text-rose-900'
                        }`}
                      >
                        {webhookValidationStatus.isValid ? (
                          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                        )}
                        <span>
                          {webhookValidationStatus.isValid
                            ? 'Webhook URL is valid, safe, and passed SSRF validation.'
                            : `Blocked: ${webhookValidationStatus.error || 'Invalid or prohibited webhook destination.'}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
