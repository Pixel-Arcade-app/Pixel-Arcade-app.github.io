#!/usr/bin/env python3
import os, re, shutil
from pathlib import Path

ROOT = Path('.').resolve()
OUT = ROOT / 'iwa-dist'
EXCLUDED_DIRS = {'.git', '.github', 'iwa-dist', 'iwa', '__pycache__'}
EXCLUDED_FILES = {'iwa-keygen.html', 'iwa-build.py'}
ALLOWED = {'.html','.htm','.js','.css','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.json','.txt','.webmanifest','.woff','.woff2','.mp3','.wav','.ogg','.mp4','.webm'}


def copy_tree():
    if OUT.exists(): shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for p in ROOT.rglob('*'):
        rel = p.relative_to(ROOT)
        if any(part in EXCLUDED_DIRS for part in rel.parts):
            continue
        if p.is_dir() or p.name in EXCLUDED_FILES:
            continue
        if p.suffix.lower() not in ALLOWED and rel.parts[0] != '.well-known':
            continue
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, target)


def extract_inline(html_path: Path):
    text = html_path.read_text(encoding='utf-8')
    scripts = []
    counter = 0

    def script_repl(m):
        nonlocal counter
        attrs = m.group(1) or ''
        body = m.group(2) or ''
        if re.search(r'\bsrc\s*=', attrs, re.I):
            return m.group(0)
        typ = re.search(r'\btype\s*=\s*["\']([^"\']+)', attrs, re.I)
        if typ and typ.group(1).lower() not in ('text/javascript','application/javascript','application/ecmascript','text/ecmascript','module'):
            return m.group(0)
        name = f'__iwa/{html_path.stem}-inline-{counter}.js'
        counter += 1
        scripts.append((name, body))
        return f'<script src="/{name}"></script>'

    text = re.sub(r'<script\b([^>]*)>([\s\S]*?)</script\s*>', script_repl, text, flags=re.I)

    handlers = []
    hid = 0
    attr_re = re.compile(r'\s+(on[a-zA-Z]+)\s*=\s*(["\'])([\s\S]*?)\2', re.I)

    def tag_repl(m):
        nonlocal hid
        tag = m.group(0)
        attrs = m.group(1)
        changed = False
        out_attrs = attrs
        local = []
        for am in attr_re.finditer(attrs):
            event_attr = am.group(1).lower()
            code = am.group(3)
            event = event_attr[2:]
            marker = f'h{hid}'
            hid += 1
            out_attrs = out_attrs.replace(am.group(0), '', 1)
            local.append((marker, event, code))
            changed = True
        if not changed:
            return tag
        if not re.search(r'\bdata-iwa-handler\s*=', out_attrs, re.I):
            out_attrs += f' data-iwa-handler="{marker}"'
        else:
            # Multiple inline handlers on one element are uncommon; use a unique marker per handler.
            out_attrs = out_attrs.replace(f'data-iwa-handler="{marker}"', f'data-iwa-handler="{marker}"')
        handlers.extend(local)
        return tag[:1] + out_attrs + tag[tag.rfind('>'):]

    text = re.sub(r'<([a-zA-Z][^>]*)>', lambda m: tag_repl(m), text)

    if handlers:
        for marker, event, code in handlers:
            # If several handlers were on one tag, each marker is appended as a separate attribute below.
            pass
        # Re-run a targeted pass so each handler gets its own data attribute on the right tag.
        # The first pass assigned only the last marker; rebuild from the original event order using a simpler replacement.
        text = re.sub(r'\sdata-iwa-handler="h\d+"', '', text)
        next_id = 0
        def handler_tag(m):
            nonlocal next_id
            tag = m.group(0)
            found = list(attr_re.finditer(tag))
            if not found:
                return tag
            # The source event attributes were removed by the previous pass, so this branch is intentionally empty.
            return tag
        # The first pass already collected handlers, but to keep mapping exact, attach markers by DOM order.
        # We use a second pass over the original transformed HTML with a sequential marker on every element that
        # has a generated handler in the collected list.
        idx = 0
        def attach(m):
            nonlocal idx
            if idx >= len(handlers): return m.group(0)
            # Only attach when this element was one of the transformed tags. The marker is harmless on other tags,
            # so we only use elements carrying the temporary marker from the first pass if present.
            return m.group(0)
        # Because the compact pages mostly contain one handler per element, keep the collected handlers in a
        # dedicated delegated dispatcher using element order markers generated from a DOM query at runtime.
        # Replace all original event attributes directly in a fresh regex pass is safer, so reload the source.
        original = html_path.read_text(encoding='utf-8')
        scripts2 = []
        def strip_scripts_for_handlers(mm):
            attrs = mm.group(1) or ''
            body = mm.group(2) or ''
            if re.search(r'\bsrc\s*=', attrs, re.I): return mm.group(0)
            typ = re.search(r'\btype\s*=\s*["\']([^"\']+)', attrs, re.I)
            if typ and typ.group(1).lower() not in ('text/javascript','application/javascript','application/ecmascript','text/ecmascript','module'):
                return mm.group(0)
            return '<script></script>'
        original_no_inline = re.sub(r'<script\b([^>]*)>([\s\S]*?)</script\s*>', strip_scripts_for_handlers, original, flags=re.I)
        seq = 0
        def direct_tag(m):
            nonlocal seq
            tag = m.group(0)
            found = list(attr_re.finditer(tag))
            if not found: return tag
            additions = []
            for am in found:
                event_attr = am.group(1).lower()
                event = event_attr[2:]
                code = am.group(3)
                marker = f'h{seq}'; seq += 1
                additions.append((marker,event,code))
                tag = tag.replace(am.group(0),'',1)
            for marker,_,_ in additions:
                tag = tag[:-1] + f' data-iwa-handler="{marker}">'
            handlers.clear(); handlers.extend([])
            return tag
        clean = re.sub(r'<[a-zA-Z][^>]*>', direct_tag, original_no_inline)
        # Extract inline scripts from the clean version and regenerate the script list cleanly.
        final_scripts = []
        def final_script(mm):
            attrs = mm.group(1) or ''
            body = mm.group(2) or ''
            if re.search(r'\bsrc\s*=', attrs, re.I): return mm.group(0)
            typ = re.search(r'\btype\s*=\s*["\']([^"\']+)', attrs, re.I)
            if typ and typ.group(1).lower() not in ('text/javascript','application/javascript','application/ecmascript','text/ecmascript','module'):
                return mm.group(0)
            name = f'__iwa/{html_path.stem}-inline-{len(final_scripts)}.js'
            final_scripts.append((name, body))
            return f'<script src="/{name}"></script>'
        clean = re.sub(r'<script\b([^>]*)>([\s\S]*?)</script\s*>', final_script, clean, flags=re.I)

        js = ['(() => {']
        for marker, event, code in []:
            pass
        # Reconstruct handlers directly from the original HTML in document order.
        hs=[]
        for tm in re.finditer(r'<[a-zA-Z][^>]*>', original_no_inline):
            for am in attr_re.finditer(tm.group(0)):
                marker=f'h{len(hs)}'; event=am.group(1).lower()[2:]; code=am.group(3)
                hs.append((marker,event,code))
        for marker,event,code in hs:
            safe = code.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
            js.append(f'  const el=document.querySelector(`[data-iwa-handler="{marker}"]`);')
            js.append(f'  if(el) el.addEventListener({event!r}, function(event){{ const __r=(function(event){{\n{safe}\n}}).call(this,event); if(__r===false){{event.preventDefault();event.stopPropagation();}} }});')
        js.append('})();\n')
        final_scripts.append((f'__iwa/{html_path.stem}-handlers.js','\n'.join(js)))
        for name,body in final_scripts:
            out = OUT / name
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(body,encoding='utf-8')
        html_path.write_text(clean,encoding='utf-8')
        return

    # No handlers: just write the script extractions from the first pass.
    for name,body in scripts:
        out=OUT/name; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(body,encoding='utf-8')
    html_path.write_text(text,encoding='utf-8')


def main():
    copy_tree()
    for p in OUT.rglob('*.html'):
        extract_inline(p)
    print(f'IWA staging ready: {sum(1 for _ in OUT.rglob("*"))} files')

if __name__ == '__main__':
    main()
