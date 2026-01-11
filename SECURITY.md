# Security Policy

## Supported Versions

Only the latest major version of Rainy Day is currently supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.5.x   | :white_check_mark: |
| 0.4.x   | :x:                |
| < 0.4.0 | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability within Rainy Day, please follow these steps:

1.  **Do NOT open a public issue.** Security vulnerabilities should be handled discreetly to protect users.
2.  **Email the maintainers** directly at `security@rainyday.app` (or contact the repo owner via their profile).
3.  Provide a detailed description of the vulnerability, including:
    - Steps to reproduce.
    - Potential impact.
    - Affected components (Client, Auth, Local Storage, etc.).

We are committed to:

- Acknowledge your report within 48 hours.
- Verify the issue and determine its severity.
- Work on a patch and release it as a priority.
- Credit you for the discovery (unless you prefer anonymity).

## Token Storage

Rainy Day uses the native OS Keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) to store sensitive refresh tokens. We do **not** store these in plain text files. If you find any instance where sensitive data is logged or stored insecurely, please report it immediately.
