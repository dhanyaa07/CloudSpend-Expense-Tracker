---
name: CloudSpend AI provider fallback
description: Why the current Copilot response layer does not depend on an external model provider.
---

CloudSpend should keep a ledger-grounded response fallback available when Replit AI Integrations cannot be provisioned. The user declined the managed upgrade and supplied an `OPENAI_API_KEY` through Replit Secrets, so the API can use OpenAI when available without making the key part of the client or chat.

**Why:** The app must remain usable and explain spending if the user's provider key is invalid, rate-limited, unavailable, or later removed.

**How to apply:** Read the key only from server environment secrets, send only the authenticated user's summarized ledger context, and keep the same response contract for both OpenAI and fallback answers.