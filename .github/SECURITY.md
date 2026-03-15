# Security Policy

## Supported versions

Security fixes are applied to the latest published version of `nxtsecure-openclaw` on the `main` branch.

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |
| Older   | No        |

## Reporting a vulnerability

If you discover a security issue in this repository, do not open a public GitHub issue.

Report it privately to the maintainer:

- GitHub account: `scorpion7slayer`
- Repository: `scorpion7slayer/nxtsecure-openclaw`

Preferred process:

1. Open a private security advisory in the GitHub repository if available.
2. If private advisory reporting is not available, contact the maintainer directly through GitHub.
3. Include clear reproduction steps, affected version, impact, and any suggested remediation.

## Scope

This policy covers:

- the `nxtsecure-openclaw` npm package
- the `nxtsecure` CLI
- the bundled OpenClaw skill files
- GitHub Actions workflows in this repository

## Response expectations

- Initial acknowledgment target: within 7 days
- Triage and severity assessment: as soon as practical
- Fix and release timing: depends on severity and reproducibility

## Disclosure policy

Please give the maintainer reasonable time to investigate and release a fix before any public disclosure.

## User guidance

Users should:

- update to the latest published version
- avoid exposing test or development configurations to the public internet
- review SSH, firewall, and VirusTotal-related settings before production use
