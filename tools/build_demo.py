"""Build PLAYABLE_DEMO.html: one self-contained file (local saves only) from the project sources.
Usage: python3 build_demo.py PROJECT_DIR
Inlines style.css, theme.css (fonts as base64), the asset map (SVG art as data URIs), engine.js and
app.js; drops the Firebase scripts and unlocks the local demo.
"""
import base64, re, sys, os
from urllib.parse import quote

root = sys.argv[1]
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
html = rd('index.html')

def font_uri(m):
    path = m.group(1)
    data = base64.b64encode(open(os.path.join(root, path), 'rb').read()).decode()
    return f"url('data:font/woff2;base64,{data}')"


def art_uri(m):
    path = m.group(1)
    svg = open(os.path.join(root, path), encoding='utf-8').read()
    return "'data:image/svg+xml;charset=utf-8," + quote(svg, safe=" =:/;,.-_()") + "'"

theme = re.sub(r"url\('(assets/fonts/[^']+)'\)", font_uri, rd('theme.css'))
theme = re.sub(r"url\('(assets/art/[^']+\.svg)'\)", lambda m: "url(" + art_uri(m) + ")", theme)
amap = re.sub(r"'(assets/art/[^']+\.svg)'", art_uri, rd('assets/asset-map.js'))
script_safe = lambda js: js.replace('</script', '<\\/script')

html = re.sub(r'<link href="assets/fonts/[^"]+" rel="preload"[^>]*/>', '', html)
html = html.replace('<link href="style.css?v=1.07.1" rel="stylesheet"/>', '<style>' + rd('style.css') + '</style>')
html = html.replace('<link href="theme.css?v=1.07.1" rel="stylesheet"/>', '<style>' + theme + '</style>')
tail = ('<script>' + script_safe(amap) + '</script><script>' + script_safe(rd('engine.js')) + '</script><script>'
        + script_safe(rd('app.js')) + '</script>\n<script>window.GTGApp.unlockDemo();document.getElementById("cloudGate").classList.add("hidden");</script></body></html>')
start = html.index('<script src="assets/asset-map.js')
html = html[:start] + tail
assert 'cloud.js' not in html and 'theme.css' not in html and 'style.css?v' not in html
open(os.path.join(root, 'PLAYABLE_DEMO.html'), 'w', encoding='utf-8').write(html)
print('PLAYABLE_DEMO.html', len(html) // 1024, 'KB')
