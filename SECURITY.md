# Security Policy

## Supported versions

Security fixes target the latest GitHub Release.

## Reporting a vulnerability

Do not disclose a suspected vulnerability in a public issue. Use a [private GitHub security advisory](https://github.com/6jeffr3y/dsh-burpsuite-mcp/security/advisories/new) and include the affected version, prerequisites, reproduction steps and impact.

## Deployment requirements

The Burp bridge exposes traffic inspection and request mutation operations. Keep its listener on `127.0.0.1` unless an authenticated, access-controlled network protects the route. Do not expose port `9639` directly to an untrusted network.
