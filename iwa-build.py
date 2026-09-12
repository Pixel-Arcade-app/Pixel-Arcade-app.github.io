#!/usr/bin/env python3
import re, shutil
from pathlib import Path

ROOT = Path('.').resolve()
OUT = ROOT / 'iwa-dist'
EXCLUDED_DIRS = {'.git', '.github', 'iwa-dist', 'iwa', '__pycache__'}
EXCLUDED_FILES = {'iwa-keygen.html', 'iwa-build.py'}
ALLOWED = {'.html','.htm','.js','.css','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.json','.txt','.webmanifest','.woff','.woff2','.mp3','.wav','.ogg','.mp4','.webm'}
EVENT_RE = re.compile(r'\s+(on[a-zA-Z]+)\s*=\s*(["\'])([\s\S]*?)\2', re.I)
SCRIPT_RE = re.compile(r'<script\b([^>]*)>([\s\S]*?)</script\s*>', re.I)


def copy_tree():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for p in ROOT.rglob('*'):
        rel = p.relative_to(ROOT)
        if any(part in EXCLUDED_DIRS for part in rel.parts):
            continue
        if p.is_dir() or p.name in EXCLUDED_FILES:
            continue
        if p.suffix.lower() not in ALLOWED:
            continue
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, target)


def is_js_script(attrs):
    if re.search(r'\bsrc\s*=', attrs, re.I):
        return False
    typ = re.search(r'\btype\s*=\s*["\']([^"\']+)', attrs, re.I)
    return not typ or typ.group(1).lower() in ('text/javascript','application/javascript','application/ecmascript','text/ecmascript','module')


def transform_html(path: Path):
    original = path.read_text(encoding='utf-8')
    handlers = []
    counter = 0

    def strip_events(tag_match):
        nonlocal counter
        tag = tag_match.group(0)
        if tag.startswith('</') or tag.lower().startswith('<script'):
            return tag
        found = list(EVENT_RE.finditer(tag))
        if not found:
            return tag
        markers = []
        for m in found:
            marker = f'h{counter}'
            counter += 1
            handlers.append((marker, m.group(1)[2:].lower(), m.group(3)))
            markers.append(marker)
        for m in reversed(found):
            tag = tag[:m.start()] + tag[m.end():]
        return tag[:-1] + ' data-iwa-handlers="' + ','.join(markers) + '">'

    text = re.sub(r'<[^>]+>', strip_events, original)
    scripts = []

    def extract_script(m):
        attrs, body = m.group(1) or '', m.group(2) or ''
        if not is_js_script(attrs):
            return m.group(0)
        name = f'__iwa/{path.stem}-inline-{len(scripts)}.js'
        scripts.append((name, body))
        return f'<script src="/{name}"></script>'

    text = SCRIPT_RE.sub(extract_script, text)

    if handlers:
        lines = ['(() => {', '  const handlers = {']
        for marker, event, code in handlers:
            lines.append(f'    {marker!r}: {{ event: {event!r}, fn: function(event) {{')
            lines.append('      const __result = (function(event) {')
            lines.append(code)
            lines.append('      }).call(this, event);')
            lines.append('      if (__result === false) { event.preventDefault(); event.stopPropagation(); }')
            lines.append('    }},')
        lines.extend([
            '  };',
            '  document.querySelectorAll("[data-iwa-handlers]").forEach(el => {',
            '    for (const id of el.getAttribute("data-iwa-handlers").split(",")) {',
            '      const h = handlers[id];',
            '      if (!h) continue;',
            '      const target = (el.tagName === "BODY" && h.event === "load") ? window : el;',
            '      target.addEventListener(h.event, h.fn);',
            '    }',
            '  });',
            '})();'
        ])
        scripts.append((f'__iwa/{path.stem}-handlers.js', '\n'.join(lines) + '\n'))

    for name, body in scripts:
        out = OUT / name
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(body, encoding='utf-8')
    path.write_text(text, encoding='utf-8')


def main():
    copy_tree()
    for p in OUT.rglob('*.html'):
        transform_html(p)
    print(f'IWA staging ready: {sum(1 for _ in OUT.rglob("*"))} files')


if __name__ == '__main__':
    main()
