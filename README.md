# nxtsecure-openclaw

OpenClaw security audit skill with an integrated npm CLI.

Published and maintained by `scorpion7slayer`.

## Install

```bash
npm install -g nxtsecure-openclaw
```

Then use:

```bash
nxtsecure openclaw help
```

## What this repository contains

- An OpenClaw skill in `skills/openclaw-security-audit/`
- A Node-based CLI exposed as `nxtsecure openclaw`
- Bash runners for audit, cron setup, and VirusTotal browser-assisted checks

## What the skill checks

- Firewall enabled
- `fail2ban` active
- SSH hardened with key-only auth and a non-default port
- Unexpected listening ports
- Docker container allowlisting
- Disk usage threshold
- Failed login attempts in the last 24 hours
- Automatic security package updates
- VirusTotal review for URLs and files without using a VirusTotal API key

## Quick start

1. Create a local config:

```bash
npm run nxtsecure -- openclaw config init --output ./openclaw-security-audit.conf
```

2. Review and edit the generated config.

3. Run the audit:

```bash
npm run nxtsecure -- openclaw audit --config ./openclaw-security-audit.conf
```

4. Install the nightly cron job at 23:00:

```bash
npm run nxtsecure -- openclaw cron install --log ~/openclaw-security-audit.log
```

## CLI commands

```bash
npm run nxtsecure -- openclaw help
npm run nxtsecure -- openclaw audit --config ./openclaw-security-audit.conf
npm run nxtsecure -- openclaw cron install --log ~/openclaw-security-audit.log
npm run nxtsecure -- openclaw doctor
npm run nxtsecure -- openclaw vt url https://example.test
npm run nxtsecure -- openclaw vt file /path/to/sample.bin
```

## Doctor

Use `doctor` to verify that the local environment is ready before running the audit:

```bash
npm run nxtsecure -- openclaw doctor
```

It checks the presence of Node.js, npm, bash, git, and the bundled audit files.

## Release and publish

This repository is configured for npm trusted publishing with GitHub Actions.

1. Make sure npm trusted publishing points to:
   `scorpion7slayer / nxtsecure-openclaw / publish.yml`
2. Update the version in `package.json`
3. Commit and push to `main`
4. Create and push a matching git tag:

```bash
git tag v0.1.3
git push origin v0.1.3
```

Pushing a `v*` tag triggers `.github/workflows/publish.yml`, which publishes the package to npm using OIDC.

## VirusTotal mode

This repository intentionally avoids the VirusTotal API.

- URL checks are prepared for the public VirusTotal website through the OpenClaw browser tool.
- File checks compute the SHA-256 locally and prepare the public VirusTotal report URL.
- If a file is flagged, the agent must ask the user whether to keep or remove it.

## Repository layout

```text
bin/nxtsecure.mjs
package.json
skills/openclaw-security-audit/SKILL.md
skills/openclaw-security-audit/references/openclaw-security-audit.conf.example
skills/openclaw-security-audit/scripts/install_cron.sh
skills/openclaw-security-audit/scripts/openclaw_security_audit.sh
skills/openclaw-security-audit/scripts/openclaw_virustotal_check.sh
```
