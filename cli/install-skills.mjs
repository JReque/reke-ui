#!/usr/bin/env node
/**
 * reke-ui install-skills
 *
 * Copies consumer-facing agent skills (LLM instructions) from this package
 * into the current project's `.claude/skills/` directory, so any AI agent
 * working in that project knows how to consume reke-ui correctly.
 *
 * Why this exists:
 * reke-ui ships agent skills (.claude/skills/) that document its consumer
 * API, the React bridge contract, and the 3-layer token system. These skills
 * are LLM-first instructions — they only help when they live in a directory
 * the agent scans. Library `node_modules/.../.claude/skills/` is NEVER
 * scanned automatically by skill-registry. This CLI puts them where they
 * belong.
 *
 * What it does:
 *   1. Locates the reke-ui package's bundled `.claude/skills/`.
 *   2. Copies CONSUMER skills only (not internal-maintainer skills) to
 *      `<consumer-cwd>/.claude/skills/`.
 *   3. Writes a marker file with the reke-ui version so we can detect drift.
 *   4. Prints next-step instructions for the user.
 *
 * What it does NOT do:
 *   - It does not invoke skill-registry. skill-registry is an agent skill,
 *     not a CLI tool. The user must ask their agent to update the registry
 *     after install (we print the exact phrase to use).
 *   - It does not modify package.json, tsconfig, or any project file other
 *     than files under `.claude/skills/reke-ui-*` and the marker.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
// Package root is one level up from cli/
const PKG_ROOT = resolve(SCRIPT_DIR, '..');
const SOURCE_SKILLS = join(PKG_ROOT, '.claude', 'skills');

// Skills published to consumers. Internal-maintainer skills (lit-expert,
// reke-component, test-runner, a11y-checker, update-docs) are deliberately
// excluded — those only help when working ON reke-ui itself.
const CONSUMER_SKILLS = ['reke-ui-consumer', 'reke-bridge', 'reke-design-system'];

const CWD = process.cwd();
const TARGET_DIR = join(CWD, '.claude', 'skills');
const MARKER_FILE = join(CWD, '.claude', '.reke-ui-skills-version');

const args = process.argv.slice(2);
const FORCE = args.includes('--force') || args.includes('-f');
const DRY = args.includes('--dry-run') || args.includes('-n');

function log(msg) {
  process.stdout.write(`${msg}\n`);
}
function warn(msg) {
  process.stderr.write(`\x1b[33m${msg}\x1b[0m\n`);
}
function err(msg) {
  process.stderr.write(`\x1b[31m${msg}\x1b[0m\n`);
}

function readPkgVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function readMarker() {
  if (!existsSync(MARKER_FILE)) return null;
  try {
    return JSON.parse(readFileSync(MARKER_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeMarker(version, skills) {
  writeFileSync(
    MARKER_FILE,
    `${JSON.stringify(
      {
        package: 'reke-ui',
        version,
        installedAt: new Date().toISOString(),
        skills,
      },
      null,
      2,
    )}\n`,
  );
}

function installSkill(name, version) {
  const src = join(SOURCE_SKILLS, name);
  const dst = join(TARGET_DIR, name);
  if (!existsSync(src)) {
    warn(`  ⚠ skill missing in package: ${name} (skipping)`);
    return false;
  }
  if (existsSync(dst) && !FORCE) {
    const existing = readMarker();
    const sameVersion = existing && existing.version === version;
    if (sameVersion) {
      log(`  = ${name} (already at v${version})`);
      return false;
    }
    log(`  → ${name} (updating from v${existing?.version || '?'} to v${version})`);
  } else {
    log(`  + ${name}`);
  }
  if (DRY) return true;
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
  return true;
}

function main() {
  log('\nreke-ui install-skills');
  log('───────────────────────');

  if (!existsSync(SOURCE_SKILLS)) {
    err(`error: source skills not found at ${SOURCE_SKILLS}`);
    err('Is this a corrupted reke-ui install?');
    process.exit(1);
  }

  const version = readPkgVersion();
  log(`reke-ui version : ${version}`);
  log(`target          : ${TARGET_DIR}`);
  if (DRY) log('mode            : DRY RUN (no files written)\n');
  else log('');

  if (!DRY) mkdirSync(TARGET_DIR, { recursive: true });

  log('skills:');
  const installed = [];
  for (const name of CONSUMER_SKILLS) {
    const ok = installSkill(name, version);
    if (ok) installed.push(name);
  }

  if (!DRY && installed.length > 0) {
    writeMarker(version, installed);
  }

  log('');
  if (installed.length === 0 && !DRY) {
    log('Nothing to do — skills already up to date.');
    log('Run with --force to reinstall.\n');
    return;
  }

  log('Next step:');
  log('  Ask your agent to regenerate the skill registry. Phrase it as:');
  log('    "actualizá las skills" / "update skill registry"\n');
  log('Or run any skill-registry-aware command in this project; the agent');
  log('will pick up the new skills under .claude/skills/reke-ui-*\n');
}

try {
  main();
} catch (e) {
  err(`fatal: ${e.message || e}`);
  process.exit(1);
}
