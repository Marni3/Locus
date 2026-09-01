---
name: firestore-vector-search
description: Use whenever storing embeddings in Firestore, running a KNN/vector similarity query, designing a collection that will back semantic search or a concept/idea graph, or debugging vector index errors. Covers embedding storage shape, composite vector index setup, query patterns (findNearest, pre-filtering), cost/quota tradeoffs, and re-embedding strategy. Always consult this before writing a new Firestore collection that stores embedding vectors, and before writing any findNearest query.
---

# Firestore vector search

This builds on `third-party-integration-standards` — Firestore access still goes through `src/integrations/firestore/`.

## Storage shape
Store the embedding as a `VectorValue` field alongside the source document, not in a separate collection, unless the source documents are large (then split: keep a lightweight `embeddings` collection with `{ sourceRef, vector, model, dims, createdAt }`, and dereference on match). Always store:
- `vector` (the embedding itself)
- `model` and `dims` — you WILL change embedding models eventually; without this you can't tell old vectors from new ones or safely re-embed
- `createdAt` — for staleness checks

## Index requirements
Vector search requires a composite index on the vector field (`gcloud firestore indexes composite create ... --query-scope=COLLECTION --field-config=vector-config=...` or console equivalent). This is not automatic like scalar fields — a missing index produces a runtime error, not a slow query. Add index creation to your deploy/setup scripts, not as a manual one-off step someone forgets.

## Query pattern
- Use `findNearest()` with a `distanceMeasure` chosen deliberately (`COSINE` for normalized semantic embeddings — this is the right default for text embeddings; `EUCLIDEAN` only if you have a specific reason).
- Pre-filter with a `where()` clause before the vector search where possible (e.g., scope to `userId`) — narrowing the candidate set is cheaper and more accurate than filtering results after.
- Always set a `limit` — unbounded nearest-neighbor queries are a cost and latency risk.
- Treat the distance score as a ranking signal, not a hard threshold, unless you've empirically validated a cutoff for your embedding model.

## Re-embedding strategy
When you change embedding models (you will), old and new vectors are not comparable. Never mix them in one query. Either:
- Version the collection/field (`vector_v2`) and backfill before cutover, or
- Store `model` per-document and filter queries to a single model version.
Do not silently overwrite old vectors in place without a backfill plan — that's an outage waiting to happen for any feature depending on them (like the idea graph).

## Cost/quota notes
- Vector queries are billed and quota-limited differently from normal reads — check current Firestore vector search quotas before assuming it scales like a normal query.
- Batch embedding generation (don't call the embeddings API per-keystroke or per-message synchronously in the request path) — generate asynchronously after a conversation/entry is saved, not blocking the user-facing save action.

## For the idea/concept graph specifically
- Each extracted "concept" node should store its own embedding, separate from the source entry's embedding — you'll want to query "similar concepts" and "similar entries" independently.
- Keep a `sourceEntryIds: string[]` on each concept node rather than duplicating concept text per entry — this is what lets the graph merge the same concept surfacing across multiple entries instead of creating near-duplicate nodes.
