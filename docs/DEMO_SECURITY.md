# TENTACIONES AI COMMERCE — DEMO SECURITY & FAIL-CLOSED GUARDRAILS

============================================================
CANONICAL DOCUMENT: docs/DEMO_SECURITY.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: SECURITY POLICY
CORRESPONDING CODE CONTRACT: src/security/demo-guardrails.ts
============================================================

## 1. Security Philosophy: Fail-Closed Isolation

When operating in `PUBLIC_DEMO` mode, security is not an afterthought or an advisory filter—it is an **active gatekeeper with fail-closed semantics**. If an anomaly, secret, private endpoint, or real payment credential is encountered at any layer, the system immediately throws a `SecurityViolationError` and halts execution.

```
Incoming Request
      ↓
[ assertsSafeDemoMode() ] ── (Detects private host / api key / prod token) ──> [ FAIL-CLOSED: Block & Log ]
      ↓ Validated Safe
[ ITentacionesExperienceService (DemoAdapter) ]
      ↓ Response Generated
[ sanitizeErrorMessage() & redactSensitivePayload() ]
      ↓
Client Delivery (0 Leaks)
```

---

## 2. Implemented Guardrail Mechanisms

### 2.1 Configuration Validation (`assertSafeDemoMode`)
Located in `src/security/demo-guardrails.ts`, this invariant verifies:
- `DEMO_MODE` is strictly true in `PUBLIC_DEMO`.
- `PLATFORM_API_KEY` is undefined or empty. Attempting to launch `PUBLIC_DEMO` with an active platform secret fails immediately.
- `PLATFORM_BASE_URL` cannot point to internal corporate domains (e.g. `*.internal.corp`, `10.*.*.*`, `192.168.*.*`, `*.corp.local`).

### 2.2 Payment Token Guardrail (`assertNoProductionPayments`)
- Any checkout or payment request containing real-world payment tokens (e.g., tokens matching `tok_live_`, `tok_prod_`, or standard 16-digit credit card Luhn patterns) is rejected.
- Only synthetic tokens prefixed with `demo_token_` or `sim_` are permitted.

### 2.3 Error Sanitization (`sanitizeErrorMessage`)
- Strips file system paths (e.g., `c:\Users\...`, `/var/run/...`), internal port numbers, platform class names, and raw SQL/database errors.
- Replaces complex runtime exceptions with standardized, safe human messages (e.g., *"Service temporarily unavailable in demo mode"*).

### 2.4 Payload Redaction (`redactSensitivePayload`)
- Deeply inspects JSON objects and stringifies sensitive fields (`password`, `apiKey`, `token`, `secret`, `authorization`, `creditCard`) replacing their values with `"[REDACTED_DEMO_PROTECTED]"`.

---

## 3. DOM & Browser-Level Security

The storefront client codebase adheres to uncompromising DOM hygiene:
- **0 `.innerHTML` invocations:** All DOM updates use `document.createElement()`, `element.textContent`, and explicit property setters.
- **0 `eval()` or `Function()` constructors:** Dynamic script execution is completely absent.
- **0 `.outerHTML` manipulations.**
- **0 `document.write()` calls.**
- **Strict Content Security Policy (CSP):** Delivered with `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'`.
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 4. Threat Model & Mitigation Summary

| Threat Scenario | Vector | Guardrail Mitigation |
| :--- | :--- | :--- |
| Reverse engineering of core platform algorithms | JavaScript bundle inspection | 0 core code in client; `DemoAdapter` runs isolated synthetic logic. |
| Accidental leakage of staging/prod API keys | Environment misconfiguration | `assertSafeDemoMode()` refuses to boot if secrets exist in `PUBLIC_DEMO`. |
| Real transaction submission during showcase | Live card data entered in checkout | `assertNoProductionPayments()` rejects non-demo tokens with fail-closed error. |
| Data exfiltration via modified API URL | Overridden `PLATFORM_BASE_URL` | Blocklist of private IP ranges & corporate domains in configuration assertion. |
| XSS injection in search or AI chat | User input reflection | DOM constructed strictly with text nodes and sanitized attribute bindings. |
