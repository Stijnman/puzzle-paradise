# Security Policy

Puzzle Paradise is a static GitHub Pages site. It does not intentionally collect credentials, payment data, or personal information and does not require a backend service.

## Supported version

Security fixes target the current `main` branch.

## What to report

Useful security reports include:

- cross-site scripting or unsafe HTML injection
- malicious or compromised third-party resources
- exposed credentials, tokens, or private keys
- workflow or GitHub Pages configuration that could permit unauthorized changes
- dependency or GitHub Action supply-chain concerns
- privacy behavior that contradicts the project's no-tracking claim

Gameplay bugs should use the normal bug-report template instead.

## Reporting

Do not publish working exploit details or credentials in a public issue.

Use GitHub's private vulnerability reporting feature if it is available for this repository. If private reporting is unavailable, contact the maintainer through the [Stijnman GitHub profile](https://github.com/Stijnman) and request a private channel.

Include:

- affected file or workflow
- reproduction steps
- impact
- proof of concept where appropriate
- suggested remediation if known

## Handling secrets

If a secret is accidentally committed, removing it from the latest file is not sufficient. Revoke or rotate the credential first, then remove it from repository history where appropriate.
