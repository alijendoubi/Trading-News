# Security Policy

## Supported Versions

We actively support the latest release on the default branch.

| Version | Supported |
|--------|-----------|
| latest (default branch) | ✅ |
| older releases/tags | ⚠️ Best effort |

## Reporting a Vulnerability

If you believe you’ve found a security vulnerability in **Trading Hub**, please report it responsibly.

### ✅ Preferred method (private)
- Use **GitHub Security Advisories** (recommended):
  1. Go to the repository → **Security** tab
  2. Click **Report a vulnerability**
  3. Provide the details below

### If GitHub Security Advisories are not available
- Open an issue **only if** the report contains **no sensitive details** (no exploit steps, tokens, private URLs, or user data).
- Otherwise, contact the maintainers privately (add your email/contact here if you want).

## What to Include in Your Report

Please include as much of the following as possible:
- A clear description of the vulnerability and the affected component(s)
- Steps to reproduce (keep it minimal and safe)
- Impact (what an attacker could do)
- Any proof-of-concept (PoC) you can share **safely**
- Suggested fix/mitigation (optional)
- Your environment (OS, browser, version, configuration)

## Response Timeline

We aim to follow this process:
- **Acknowledgement:** within 72 hours
- **Initial assessment:** within 7 days
- **Fix / mitigation plan:** as soon as practical depending on severity
- **Coordinated disclosure:** after a patch is available (or a mitigation is published)

## Disclosure Guidelines

Please do **not** publicly disclose the issue until:
- we confirm the vulnerability, and
- a fix is released (or we agree on a disclosure date).

We appreciate coordinated disclosure and will credit reporters when requested.

## Security Best Practices (for Contributors)

When contributing, please:
- Avoid committing secrets (API keys, tokens, private URLs)
- Use environment variables and `.env.example`
- Keep dependencies updated and prefer audited packages
- Validate and sanitize all user inputs
- Apply least-privilege permissions (CI, tokens, cloud credentials)
- Add security checks in CI (linting, dependency scanning) when possible

## Scope

This policy covers:
- Source code and configuration in this repository
- CI/CD workflows in this repository
- Official releases published from this repository

Out of scope:
- Vulnerabilities in third-party services outside this repository’s control
- Social engineering or physical attacks

---

Thank you for helping keep **Trading Hub** secure.
