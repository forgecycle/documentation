#!/usr/bin/env node
// Imports the public documentation from a checkout of the private
// forgecycle/forgecycle repository and a forgecycle binary built from it.
//
//   node scripts/import.mjs --source ../forgecycle --bin ../forgecycle/.build/forgecycle
//
// Only the files named in PAGES are published. Everything this script writes
// (GENERATED below) is replaced on every run: edit the source repository, not
// the generated pages. Links are rewritten to site URLs; a link to a file
// that is not published, or a mention of an ADR, fails the import.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import GithubSlugger from 'github-slugger';

const BASE = '/documentation';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DOCS = path.join(ROOT, 'src/content/docs');
const GENERATED = [
	path.join(DOCS, 'start'),
	path.join(DOCS, 'concepts'),
	path.join(DOCS, 'guides'),
	path.join(DOCS, 'reference'),
	path.join(ROOT, 'public/schemas'),
	path.join(ROOT, 'src/generated'),
];

// Each page comes from a whole file, or from README.md sections (by their
// "## " heading). "replace" entries must each match, so a reworded source
// fails loudly instead of publishing stale edits.
const PAGES = [
	{
		out: 'start/introduction',
		order: 1,
		title: 'Introduction',
		description: 'What ForgeCycle is and how its four roles work together.',
		source: 'README.md',
		sections: [null], // the text before the first "## " heading
	},
	{
		out: 'start/quick-start',
		order: 2,
		title: 'Quick start',
		description: 'Set a project up and run a first task.',
		source: 'README.md',
		sections: ['Quick start'],
		dropSubsections: ['Upgrading from a version with flat commands', 'Upgrading from Foreman and Builder'],
		replace: [
			[
				/^Requirements: Git\. Building from source[\s\S]*?for `make check`\.\n/m,
				'Requirements: Git, and at least one of the supported agent CLIs (see\n[CLI adapters](/documentation/guides/adapters/)).\n',
			],
		],
	},
	{
		out: 'start/installing',
		order: 3,
		title: 'Installing and updating',
		description: 'Install a release binary on your PATH or per project, and keep it updated.',
		source: 'README.md',
		sections: ['Installing'],
		dropSubsections: ['From source'],
	},
	{
		out: 'start/upgrading',
		order: 4,
		title: 'Upgrading from older versions',
		description: 'Renamed commands, roles, and keys from earlier ForgeCycle versions.',
		source: 'README.md',
		sections: ['Quick start'],
		onlySubsections: ['Upgrading from a version with flat commands', 'Upgrading from Foreman and Builder'],
	},
	{
		out: 'concepts/the-loop',
		order: 1,
		title: 'The loop',
		description: 'From a large plan to a roadmap, and from a task to reviewed commits.',
		source: 'README.md',
		sections: ['The loop'],
	},
	{
		out: 'concepts/security',
		order: 2,
		title: 'Security and authority',
		description: 'What each role may do, and what ForgeCycle does not protect against.',
		source: 'docs/security.md',
	},
	{
		out: 'guides/commands',
		order: 1,
		title: 'Using the CLI',
		description: 'Task, roadmap, and project commands; switching agents; stops and next steps.',
		source: 'README.md',
		sections: ['Commands'],
	},
	{
		out: 'guides/configuration',
		order: 2,
		title: 'Configuration',
		description: 'Configuration files, policies, candidates, approval, gates, and other options.',
		source: 'docs/configuration.md',
	},
	{
		out: 'guides/adapters',
		order: 3,
		title: 'CLI adapters',
		description: 'How ForgeCycle drives OpenCode, Codex CLI, Claude Code CLI, and agy.',
		source: 'docs/adapters.md',
	},
	{
		out: 'guides/recovery',
		order: 4,
		title: 'Recovery and troubleshooting',
		description: 'Read a stop, resume, pause, and recover task runs and roadmap runs.',
		source: 'docs/recovery.md',
	},
	{
		out: 'guides/dashboard',
		order: 5,
		title: 'Dashboard',
		description: 'The local, read-only dashboard served by forgecycle serve.',
		source: 'README.md',
		sections: ['Observability'],
	},
	{
		out: 'guides/observability',
		order: 6,
		title: 'Observability in depth',
		description: 'The operation journal, dashboard options, privacy, and quality figures.',
		source: 'docs/observability.md',
	},
	{
		out: 'reference/protocol',
		order: 10,
		title: 'Protocol and state machine',
		description: 'Roles, handoffs, validation, states, stops, and roadmap runs.',
		source: 'docs/protocol.md',
	},
	{
		out: 'reference/agent-skill',
		order: 30,
		title: 'Agent skill',
		description: 'The skill forgecycle init installs for coding agents that operate ForgeCycle.',
		source: 'skills/forgecycle/SKILL.md',
		prepend:
			':::note\nThis is the agent skill that `forgecycle init` installs into `.claude/skills/forgecycle/` and `.agents/skills/forgecycle/`. It is written for the coding agent that operates ForgeCycle.\n:::\n\n',
	},
];

// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
	options: { source: { type: 'string' }, bin: { type: 'string' } },
});
if (!args.source || !args.bin) {
	console.error('usage: node scripts/import.mjs --source DIR --bin FORGECYCLE');
	process.exit(64);
}
const SOURCE = path.resolve(args.source);
const BIN = path.resolve(args.bin);

const errors = [];
const fail = (msg) => errors.push(msg);
const read = (rel) => fs.readFileSync(path.join(SOURCE, rel), 'utf8');
const run = (...argv) => execFileSync(BIN, argv, { encoding: 'utf8', env: { ...process.env, COLUMNS: '79' } });

const version = run('version').trim();
const isRelease = /^\d+\.\d+\.\d+$/.test(version);

// Split Markdown into lines tagged with whether they are inside a code fence.
function fenced(text) {
	let fence = null;
	return text.split('\n').map((line) => {
		const m = line.match(/^\s*(`{3,}|~{3,})/);
		let inFence = fence !== null;
		if (m) {
			if (fence === null) {
				fence = m[1];
				inFence = true;
			} else if (m[1].startsWith(fence[0]) && m[1].length >= fence.length) {
				fence = null;
				inFence = true;
			}
		}
		return { line, inFence };
	});
}

// Sections of a file by heading level: returns [{heading, lines}] where
// heading is null for the text before the first heading of that level.
function splitByHeading(lines, level) {
	const marker = '#'.repeat(level) + ' ';
	const out = [{ heading: null, lines: [] }];
	for (const l of lines) {
		if (!l.inFence && l.line.startsWith(marker)) {
			out.push({ heading: l.line.slice(marker.length).trim(), lines: [] });
		} else {
			out.at(-1).lines.push(l);
		}
	}
	return out;
}

// Raise every heading by `by` levels (outside code fences).
function promote(lines, by) {
	if (by <= 0) return lines;
	return lines.map((l) => {
		if (l.inFence) return l;
		const m = l.line.match(/^(#{2,6}) /);
		if (!m) return l;
		const level = Math.max(2, m[1].length - by);
		return { ...l, line: '#'.repeat(level) + l.line.slice(m[1].length) };
	});
}

function body(page) {
	let lines = fenced(read(page.source));
	if (page.source.endsWith('SKILL.md')) {
		// Drop the skill's own YAML front matter.
		const end = lines.findIndex((l, i) => i > 0 && l.line === '---');
		lines = lines.slice(end + 1);
	}
	if (page.sections) {
		const sections = splitByHeading(lines, 2);
		const picked = [];
		for (const name of page.sections) {
			const s = sections.find((x) => x.heading === name);
			if (!s) fail(`${page.out}: section "${name}" not found in ${page.source}`);
			else picked.push(...(name === null ? s.lines.filter((l) => !l.line.startsWith('# ')) : s.lines));
		}
		lines = picked;
		if (page.dropSubsections || page.onlySubsections) {
			const subs = splitByHeading(lines, 3);
			const names = page.dropSubsections ?? page.onlySubsections;
			for (const n of names) {
				if (!subs.some((s) => s.heading === n)) fail(`${page.out}: subsection "${n}" not found`);
			}
			const keep = page.dropSubsections
				? subs.filter((s) => !names.includes(s.heading))
				: subs.filter((s) => names.includes(s.heading));
			lines = keep.flatMap((s) =>
				s.heading === null ? s.lines : [{ line: `### ${s.heading}`, inFence: false }, ...s.lines],
			);
		}
		lines = promote(lines, 1);
	} else {
		// Whole file: drop its title, which becomes the page title.
		const i = lines.findIndex((l) => !l.inFence && l.line.startsWith('# '));
		if (i >= 0) lines.splice(i, 1);
	}
	return lines;
}

// Heading slugs per page, to resolve links to "file.md#anchor".
function headingSlugs(lines) {
	const slugger = new GithubSlugger();
	return lines
		.filter((l) => !l.inFence && /^#{2,6} /.test(l.line))
		.map((l) => slugger.slug(l.line.replace(/^#+ /, '').replace(/`/g, '')));
}

const url = (out) => `${BASE}/${out}/`;

// ---------------------------------------------------------------------------
// Build every page's body first, then the link map, then rewrite links.

const built = PAGES.map((page) => ({ page, lines: body(page) }));

// "source#slug" -> url. README sections map their own "## " heading to the page.
const links = new Map();
for (const { page, lines } of built) {
	if (!links.has(page.source) && !page.sections) links.set(page.source, url(page.out));
	if (page.sections?.includes(null)) links.set(page.source, url(page.out));
	for (const s of page.sections ?? []) {
		if (s) links.set(`${page.source}#${new GithubSlugger().slug(s)}`, url(page.out));
	}
	for (const slug of headingSlugs(lines)) {
		const key = `${page.source}#${slug}`;
		if (!links.has(key)) links.set(key, `${url(page.out)}#${slug}`);
	}
}

function rewriteLinks(text, page) {
	return text.replace(/\]\(([^)\s]+)\)/g, (whole, target) => {
		if (/^[a-z]+:/i.test(target)) return whole;
		const [file, anchor] = target.split('#');
		const rel = file ? path.posix.normalize(path.posix.join(path.posix.dirname(page.source), file)) : page.source;
		const key = anchor ? `${rel}#${anchor}` : rel;
		const to = links.get(key);
		if (!to) {
			fail(`${page.out}: link to unpublished "${target}" (resolved as ${key})`);
			return whole;
		}
		return `](${to})`;
	});
}

// ADRs are not published: drop references to them.
function stripAdrs(text) {
	return text
		.replace(/\s*\(\[ADR \d{4}\]\([^)]*\)\)/g, '')
		.replace(/\s*\(ADR \d{4}(?:, ADR \d{4})*\)/g, '')
		.replace(/,? ADR \d{4}\)/g, ')')
		.replace(/\(ADR \d{4}, /g, '(');
}

function transform(lines, page) {
	const out = [];
	let prose = [];
	const flush = () => {
		if (prose.length) out.push(rewriteLinks(stripAdrs(prose.join('\n')), page));
		prose = [];
	};
	for (const l of lines) {
		if (l.inFence) {
			flush();
			out.push(l.line);
		} else prose.push(l.line);
	}
	flush();
	let text = out.join('\n').trim() + '\n';
	for (const [from, to] of page.replace ?? []) {
		if (!from.test(text)) fail(`${page.out}: replacement ${from} did not match`);
		text = text.replace(from, to);
	}
	if (page.out === 'start/installing' && isRelease) {
		text = text.replace('version=X.Y.Z   # the release', `version=${version}   # the release`);
	}
	if (/\bADRs? \d{4}/.test(text)) fail(`${page.out}: still mentions an ADR`);
	return (page.prepend ?? '') + text;
}

function frontmatter({ title, description, order }) {
	const q = (s) => JSON.stringify(s);
	return [
		'---',
		`# Generated by scripts/import.mjs from forgecycle ${version}. Do not edit.`,
		`title: ${q(title)}`,
		`description: ${q(description)}`,
		'sidebar:',
		`  order: ${order}`,
		'---',
		'',
		'',
	].join('\n');
}

function write(out, content) {
	const file = path.join(DOCS, `${out}.md`);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}

// ---------------------------------------------------------------------------
// CLI reference, generated from the binary's help.

function cliPages() {
	const overview = run('help');
	const groups = { project: [], task: [], roadmap: [] };
	let group = null;
	for (const line of overview.split('\n')) {
		const h = line.match(/^(Project|Task|Roadmap) commands:$/);
		if (h) {
			group = h[1].toLowerCase();
			continue;
		}
		if (!line.startsWith('  ')) group = line.trim() === '' ? group : null;
		const m = group && line.match(/^ {2}([a-z]+) {2,}(.+)$/);
		if (m) groups[group].push({ name: m[1], summary: m[2] });
	}
	for (const g of Object.values(groups)) if (!g.length) fail('CLI: a command group in the help overview is empty');

	const block = (text) => '```text\n' + text.trimEnd() + '\n```\n';
	write(
		'reference/cli',
		frontmatter({ title: 'CLI overview', description: 'forgecycle help: every command and exit status.', order: 1 }) +
			`Output of \`forgecycle help\` for ForgeCycle ${version}. Each command's own help follows on the [project](${url('reference/cli-project')}), [task](${url('reference/cli-task')}), and [roadmap](${url('reference/cli-roadmap')}) command pages.\n\n` +
			block(overview),
	);
	const titles = { project: 'Project commands', task: 'Task commands', roadmap: 'Roadmap commands' };
	const order = { project: 2, task: 3, roadmap: 4 };
	for (const [g, cmds] of Object.entries(groups)) {
		const prefix = g === 'project' ? [] : [g];
		let text = `Output of \`forgecycle help ${prefix.join(' ')}${prefix.length ? ' ' : ''}<command>\` for ForgeCycle ${version}.\n\n`;
		for (const c of cmds) {
			text += `## ${['forgecycle', ...prefix, c.name].join(' ')}\n\n${c.summary}.\n\n${block(run('help', ...prefix, c.name))}\n`;
		}
		write(
			`reference/cli-${g}`,
			frontmatter({ title: titles[g], description: `Help for every forgecycle ${g === 'project' ? 'project' : g} command.`, order: order[g] }) + text,
		);
	}
}

// ---------------------------------------------------------------------------
// JSON schemas, served as files with an index page.

function schemaPage() {
	const dir = path.join(SOURCE, 'schemas');
	const outDir = path.join(ROOT, 'public/schemas');
	fs.mkdirSync(outDir, { recursive: true });
	const rows = [];
	for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.schema.json')).sort()) {
		const raw = fs.readFileSync(path.join(dir, name), 'utf8');
		const schema = JSON.parse(raw);
		fs.writeFileSync(path.join(outDir, name), raw);
		const desc = (schema.description ?? schema.title ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ');
		rows.push(`| [\`${name}\`](${BASE}/schemas/${name}) | ${desc} |`);
	}
	write(
		'reference/schemas',
		frontmatter({ title: 'JSON schemas', description: 'Schemas for configuration, state, handoffs, and roadmaps.', order: 20 }) +
			`The JSON Schemas ForgeCycle ${version} validates configuration, run state, handoff front matter, and roadmap files against. See [Protocol and state machine](${url('reference/protocol')}) for how they are used.\n\n| Schema | Describes |\n| --- | --- |\n${rows.join('\n')}\n`,
	);
}

// ---------------------------------------------------------------------------

for (const dir of GENERATED) fs.rmSync(dir, { recursive: true, force: true });

for (const { page, lines } of built) write(page.out, frontmatter(page) + transform(lines, page));
cliPages();
schemaPage();

fs.mkdirSync(path.join(ROOT, 'src/generated'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/generated/release.json'), JSON.stringify({ version, isRelease }, null, 2) + '\n');

if (errors.length) {
	console.error(errors.map((e) => `import: error: ${e}`).join('\n'));
	process.exit(1);
}
console.log(`import: wrote ${PAGES.length} pages, the CLI reference, and the schemas for forgecycle ${version}`);
