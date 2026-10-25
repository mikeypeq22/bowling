from pathlib import Path
import re
P=Path(__file__).parent
html=(P/'index.html').read_text()
html,n=re.subn(r'<link\b[^>]*href="style.css"[^>]*>',lambda m:'<style>\n'+(P/'style.css').read_text()+'\n</style>',html,count=1)
assert n==1,'style replacement failed'
for name in ['assets/asset-map.js','engine.js','app.js']:
    pattern=f'<script src="{re.escape(name)}"></script>'
    html,n=re.subn(pattern,lambda m:'<script>\n'+(P/name).read_text().replace('</script>','<\\/script>')+'\n</script>',html,count=1)
    assert n==1,f'script replacement failed: {name}'
target=P.parent/'From_Gutter_to_Glory_Playable_v0.7.html'
target.write_text(html)
print(target,target.stat().st_size)
