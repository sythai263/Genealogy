#!/usr/bin/env node
/**
 * Codemod: rewrite deep absolute imports to 2nd-level / flat barrels.
 * Also normalizes `@/` → `@` for known aliases.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const ALIASES = [
  'components',
  'hooks',
  'lib',
  'types',
  'constants',
  'schemas',
  'contexts',
  'data',
  'services',
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.next') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mts|cts)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function relFromSrc(file) {
  return toPosix(path.relative(SRC, file));
}

function rewriteSpecifier(spec, fileRel) {
  const slashAlias = spec.match(/^@\/([a-z-]+)(\/.*)?$/);
  if (slashAlias && ALIASES.includes(slashAlias[1])) {
    const alias = slashAlias[1];
    const rest = slashAlias[2] || '';
    if (!rest || rest === '/') {
      return { kind: 'barrel', value: `@${alias}` };
    }
    return rewriteDeep(`@${alias}${rest}`, fileRel);
  }

  const deep = spec.match(
    /^@(components|hooks|lib|types|constants|schemas|contexts|data|services)\/(.+)$/
  );
  if (deep) {
    return rewriteDeep(spec, fileRel);
  }

  return { kind: 'unchanged', value: spec };
}

function rewriteDeep(spec, fileRel) {
  const m = spec.match(
    /^@(components|hooks|lib|types|constants|schemas|contexts|data|services)\/(.+)$/
  );
  if (!m) return { kind: 'unchanged', value: spec };

  const alias = m[1];
  const rest = m[2].replace(/\\/g, '/');
  const parts = rest.split('/').filter(Boolean);

  if (
    ['hooks', 'types', 'constants', 'schemas', 'contexts', 'data', 'services'].includes(
      alias
    )
  ) {
    if (fileRel.startsWith(`${alias}/`)) {
      const targetFile = parts.join('/');
      const fromDir = path.posix.dirname(fileRel);
      let rel = path.posix.relative(fromDir, `${alias}/${targetFile}`);
      if (!rel.startsWith('.')) rel = `./${rel}`;
      rel = rel.replace(/\.(ts|tsx)$/, '');
      return { kind: 'relative', value: rel };
    }
    return { kind: 'barrel', value: `@${alias}` };
  }

  if (alias === 'lib') {
    if (fileRel.startsWith('lib/')) {
      const targetFile = parts.join('/');
      const fromDir = path.posix.dirname(fileRel);
      let rel = path.posix.relative(fromDir, `lib/${targetFile}`);
      if (!rel.startsWith('.')) rel = `./${rel}`;
      rel = rel.replace(/\.(ts|tsx)$/, '');
      return { kind: 'relative', value: rel };
    }
    if (parts[0] === 'validations') {
      return {
        kind: 'barrel',
        value: parts.length > 1 ? '@lib/validations' : '@lib',
      };
    }
    return { kind: 'barrel', value: '@lib' };
  }

  if (alias === 'components') {
    if (parts.length === 0) return { kind: 'unchanged', value: spec };
    const feature = parts[0];
    if (parts.length === 1) {
      return { kind: 'barrel', value: `@components/${feature}` };
    }
    if (fileRel.startsWith(`components/${feature}/`)) {
      const targetFile = parts.slice(1).join('/');
      const fromDir = path.posix.dirname(fileRel);
      let rel = path.posix.relative(
        fromDir,
        `components/${feature}/${targetFile}`
      );
      if (!rel.startsWith('.')) rel = `./${rel}`;
      rel = rel.replace(/\.(ts|tsx)$/, '');
      return { kind: 'relative', value: rel };
    }
    return { kind: 'barrel', value: `@components/${feature}` };
  }

  return { kind: 'unchanged', value: spec };
}

const IMPORT_RE =
  /import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]\s*;?/g;

function parseImportClause(clause) {
  const trimmed = clause.trim();
  let defaultImport = null;
  let namespaceImport = null;
  const named = [];

  let body = trimmed;

  const ns = body.match(/^\*\s+as\s+(\w+)$/);
  if (ns) {
    return {
      defaultImport: null,
      namespaceImport: ns[1],
      named: [],
      sideEffect: false,
    };
  }

  const defNamed = body.match(/^(\w+)\s*,\s*\{([\s\S]*)\}$/);
  if (defNamed) {
    defaultImport = defNamed[1];
    body = `{${defNamed[2]}}`;
  } else if (/^\{[\s\S]*\}$/.test(body)) {
    // named only
  } else if (/^\w+$/.test(body)) {
    return {
      defaultImport: body,
      namespaceImport: null,
      named: [],
      sideEffect: false,
    };
  }

  const namedMatch = body.match(/\{([\s\S]*)\}/);
  if (namedMatch) {
    const inner = namedMatch[1];
    for (const part of inner.split(',')) {
      const p = part.trim();
      if (!p) continue;
      const tm = p.match(/^(type\s+)?(\w+)(?:\s+as\s+(\w+))?$/);
      if (tm) {
        named.push({
          isType: Boolean(tm[1]),
          imported: tm[2],
          local: tm[3] || tm[2],
        });
      }
    }
  }

  return { defaultImport, namespaceImport, named, sideEffect: false };
}

function formatImport(isTypeOnly, info, spec) {
  if (info.namespaceImport) {
    return `import ${isTypeOnly ? 'type ' : ''}* as ${info.namespaceImport} from '${spec}';`;
  }
  if (info.defaultImport && info.named.length === 0) {
    return `import ${isTypeOnly ? 'type ' : ''}${info.defaultImport} from '${spec}';`;
  }
  if (info.defaultImport && info.named.length > 0) {
    const named = info.named
      .map((n) => {
        const t = n.isType && !isTypeOnly ? 'type ' : '';
        return n.imported === n.local
          ? `${t}${n.imported}`
          : `${t}${n.imported} as ${n.local}`;
      })
      .join(', ');
    return `import ${isTypeOnly ? 'type ' : ''}${info.defaultImport}, { ${named} } from '${spec}';`;
  }
  if (info.named.length > 0) {
    const named = info.named
      .map((n) => {
        const t = n.isType && !isTypeOnly ? 'type ' : '';
        return n.imported === n.local
          ? `${t}${n.imported}`
          : `${t}${n.imported} as ${n.local}`;
      })
      .join(', ');
    return `import ${isTypeOnly ? 'type ' : ''}{ ${named} } from '${spec}';`;
  }
  return `import '${spec}';`;
}

function processFile(file) {
  const fileRel = relFromSrc(file);
  let text = fs.readFileSync(file, 'utf8');
  const original = text;

  const matches = [...text.matchAll(IMPORT_RE)];
  if (matches.length === 0) return false;

  const groups = new Map();
  const replacements = [];

  for (const match of matches) {
    const full = match[0];
    const isTypeOnly = Boolean(match[1]);
    const clause = match[2];
    const spec = match[3];
    const start = match.index;
    const end = start + full.length;

    const rewritten = rewriteSpecifier(spec, fileRel);
    if (rewritten.value === spec) continue;

    const info = parseImportClause(clause);
    const key = rewritten.value;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ isTypeOnly, info, raw: full });
    replacements.push({ start, end, key, isTypeOnly, info });
  }

  if (replacements.length === 0) {
    let changed = false;
    text = text.replace(IMPORT_RE, (full, _typeKw, _clause, spec) => {
      const m = spec.match(/^@\/([a-z-]+)$/);
      if (m && ALIASES.includes(m[1])) {
        changed = true;
        return full.replace(spec, `@${m[1]}`);
      }
      return full;
    });
    if (changed && text !== original) {
      fs.writeFileSync(file, text);
      return true;
    }
    return false;
  }

  const mergedByKey = new Map();
  for (const [key, items] of groups) {
    let isTypeOnly = items.every((i) => i.isTypeOnly);
    let defaultImport = null;
    let namespaceImport = null;
    const namedMap = new Map();

    for (const item of items) {
      if (item.info.defaultImport) defaultImport = item.info.defaultImport;
      if (item.info.namespaceImport) namespaceImport = item.info.namespaceImport;
      for (const n of item.info.named) {
        namedMap.set(n.local, {
          imported: n.imported,
          isType: n.isType || item.isTypeOnly,
        });
      }
      if (!item.isTypeOnly) isTypeOnly = false;
    }

    const named = [...namedMap.entries()].map(([local, v]) => ({
      imported: v.imported,
      local,
      isType: isTypeOnly ? false : v.isType,
    }));

    mergedByKey.set(key, {
      isTypeOnly,
      info: { defaultImport, namespaceImport, named, sideEffect: false },
    });
  }

  const seenKey = new Set();
  const sorted = [...replacements].sort((a, b) => b.start - a.start);
  let result = text;
  for (const rep of sorted) {
    if (seenKey.has(rep.key)) {
      let end = rep.end;
      if (result[end] === '\n') end += 1;
      result = result.slice(0, rep.start) + result.slice(end);
    } else {
      seenKey.add(rep.key);
      const merged = mergedByKey.get(rep.key);
      const stmt = formatImport(merged.isTypeOnly, merged.info, rep.key);
      result = result.slice(0, rep.start) + stmt + result.slice(rep.end);
    }
  }

  result = result.replace(IMPORT_RE, (full, _typeKw, _clause, spec) => {
    const m = spec.match(/^@\/([a-z-]+)$/);
    if (m && ALIASES.includes(m[1])) {
      return full.replace(spec, `@${m[1]}`);
    }
    const r = rewriteSpecifier(spec, fileRel);
    if (r.value !== spec) {
      return full.replace(spec, r.value);
    }
    return full;
  });

  if (result !== original) {
    fs.writeFileSync(file, result);
    return true;
  }
  return false;
}

const files = walk(SRC);
let count = 0;
for (const f of files) {
  if (processFile(f)) {
    count += 1;
    console.log('updated', relFromSrc(f));
  }
}
console.log(`\nDone. ${count} files updated.`);
