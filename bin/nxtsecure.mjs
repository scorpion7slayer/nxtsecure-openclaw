#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '..');
const skillDir = resolve(rootDir, 'skills', 'openclaw-security-audit');
const scriptsDir = resolve(skillDir, 'scripts');
const referencesDir = resolve(skillDir, 'references');

const paths = {
  audit: resolve(scriptsDir, 'openclaw_security_audit.sh'),
  cron: resolve(scriptsDir, 'install_cron.sh'),
  vt: resolve(scriptsDir, 'openclaw_virustotal_check.sh'),
  configExample: resolve(referencesDir, 'openclaw-security-audit.conf.example')
};

function printHelp() {
  console.log(`nxtsecure openclaw

Usage:
  nxtsecure help
  nxtsecure openclaw help
  nxtsecure openclaw audit [--config PATH]
  nxtsecure openclaw cron install [--log PATH]
  nxtsecure openclaw vt url <url> [--allow-uploads]
  nxtsecure openclaw vt file <path> [--allow-uploads]
  nxtsecure openclaw config init [--output PATH] [--force]
  nxtsecure openclaw doctor
  nxtsecure openclaw paths

Examples:
  nxtsecure openclaw config init --output ./openclaw-security-audit.conf
  nxtsecure openclaw audit --config ./openclaw-security-audit.conf
  nxtsecure openclaw cron install --log ~/openclaw-security-audit.log
  nxtsecure openclaw doctor
  nxtsecure openclaw vt url https://example.test
  nxtsecure openclaw vt file /tmp/sample.bin --allow-uploads
`);
}

function fail(message, exitCode = 1) {
  console.error(`[ERROR] ${message}`);
  process.exit(exitCode);
}

function runBashScript(scriptPath, args = [], env = {}) {
  if (!existsSync(scriptPath)) {
    fail(`Missing script: ${scriptPath}`);
  }

  const result = spawnSync('bash', [scriptPath, ...args], {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, ...env }
  });

  if (result.error) {
    fail(result.error.message);
  }

  process.exit(result.status ?? 1);
}

function takeOption(argv, optionName) {
  const index = argv.indexOf(optionName);
  if (index === -1) {
    return undefined;
  }
  if (index === argv.length - 1) {
    fail(`Missing value for ${optionName}`);
  }
  return argv[index + 1];
}

function hasFlag(argv, flagName) {
  return argv.includes(flagName);
}

function commandExists(commandName) {
  const result = spawnSync('sh', ['-c', `command -v "${commandName}"`], {
    stdio: 'ignore'
  });
  return result.status === 0;
}

function withoutOption(argv, optionName) {
  const index = argv.indexOf(optionName);
  if (index === -1) {
    return argv.slice();
  }
  const clone = argv.slice();
  clone.splice(index, 2);
  return clone;
}

function withoutFlag(argv, flagName) {
  return argv.filter((item) => item !== flagName);
}

function commandAudit(argv) {
  const configPath = takeOption(argv, '--config');
  const args = configPath ? withoutOption(argv, '--config') : argv.slice();
  if (args.length !== 0) {
    fail(`Unknown audit arguments: ${args.join(' ')}`);
  }
  runBashScript(paths.audit, [], configPath ? { OPENCLAW_AUDIT_CONFIG: resolve(rootDir, configPath) } : {});
}

function commandCron(argv) {
  if (argv[0] !== 'install') {
    fail('Usage: nxtsecure openclaw cron install [--log PATH]');
  }

  const logPath = takeOption(argv, '--log');
  const args = logPath ? withoutOption(argv.slice(1), '--log') : argv.slice(1);
  if (args.length !== 0) {
    fail(`Unknown cron arguments: ${args.join(' ')}`);
  }

  runBashScript(paths.cron, [], logPath ? { OPENCLAW_AUDIT_LOG: logPath } : {});
}

function commandVirusTotal(argv) {
  const allowUploads = hasFlag(argv, '--allow-uploads');
  const cleaned = allowUploads ? withoutFlag(argv, '--allow-uploads') : argv.slice();
  const mode = cleaned[0];
  const value = cleaned[1];

  if (!mode || !value || cleaned.length !== 2 || !['url', 'file'].includes(mode)) {
    fail('Usage: nxtsecure openclaw vt url <url> [--allow-uploads] | nxtsecure openclaw vt file <path> [--allow-uploads]');
  }

  const scriptArgs = mode === 'url' ? ['--url', value] : ['--file', value];
  runBashScript(paths.vt, scriptArgs, {
    VIRUSTOTAL_ALLOW_UPLOADS: allowUploads ? '1' : '0'
  });
}

function commandConfig(argv) {
  if (argv[0] !== 'init') {
    fail('Usage: nxtsecure openclaw config init [--output PATH] [--force]');
  }

  const force = hasFlag(argv, '--force');
  const output = takeOption(argv, '--output') ?? './openclaw-security-audit.conf';
  const cleaned = force ? withoutFlag(argv.slice(1), '--force') : argv.slice(1);
  const finalArgs = output ? withoutOption(cleaned, '--output') : cleaned;
  if (finalArgs.length !== 0) {
    fail(`Unknown config arguments: ${finalArgs.join(' ')}`);
  }

  const targetPath = resolve(rootDir, output);
  if (existsSync(targetPath) && !force) {
    fail(`Config already exists: ${targetPath}. Use --force to overwrite.`);
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(paths.configExample, targetPath);
  console.log(`Created config: ${targetPath}`);
}

function commandPaths(argv) {
  if (argv.length !== 0) {
    fail(`Unknown paths arguments: ${argv.join(' ')}`);
  }

  console.log(`root=${rootDir}`);
  console.log(`skill=${skillDir}`);
  console.log(`audit=${paths.audit}`);
  console.log(`cron=${paths.cron}`);
  console.log(`vt=${paths.vt}`);
  console.log(`configExample=${paths.configExample}`);
}

function commandDoctor(argv) {
  if (argv.length !== 0) {
    fail(`Unknown doctor arguments: ${argv.join(' ')}`);
  }

  const checks = [
    ['node >= 18', Number.parseInt(process.versions.node.split('.')[0], 10) >= 18, process.versions.node],
    ['bash available', commandExists('bash'), 'required for bundled scripts'],
    ['git available', commandExists('git'), 'recommended for release workflow'],
    ['npm available', commandExists('npm'), 'required for package workflow'],
    ['audit script present', existsSync(paths.audit), paths.audit],
    ['cron script present', existsSync(paths.cron), paths.cron],
    ['VirusTotal helper present', existsSync(paths.vt), paths.vt],
    ['config example present', existsSync(paths.configExample), paths.configExample]
  ];

  let failures = 0;
  for (const [label, ok, detail] of checks) {
    console.log(`${ok ? 'OK' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`);
    if (!ok) {
      failures += 1;
    }
  }

  if (failures > 0) {
    process.exit(1);
  }
}

function runOpenClaw(argv) {
  const [command = 'help', ...rest] = argv;

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    case 'audit':
      commandAudit(rest);
      break;
    case 'cron':
      commandCron(rest);
      break;
    case 'vt':
      commandVirusTotal(rest);
      break;
    case 'config':
      commandConfig(rest);
      break;
    case 'doctor':
      commandDoctor(rest);
      break;
    case 'paths':
      commandPaths(rest);
      break;
    default:
      fail(`Unknown openclaw command: ${command}`);
  }
}

const [namespace = 'help', ...rest] = process.argv.slice(2);

switch (namespace) {
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  case 'openclaw':
    runOpenClaw(rest);
    break;
  default:
    fail(`Unknown namespace: ${namespace}. Expected: openclaw`);
}
