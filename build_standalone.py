from pathlib import Path
import re
p=Path(__file__).parent
s=(p/'index.html').read_text()
s,n=re.subn(r'<link\b[^>]*href="style.css"[^>]*>',lambda m:'<style>\n'+(p/'style.css').read_text()+'\n</style>',s,count=1);assert n==1
for nme in ['assets/asset-map.js','engine.js','app.js','firebase-config.js']:
 s,n=re.subn(r'<script src="'+re.escape(nme)+r'">\s*</script>', lambda m:'<script>\n'+(p/nme).read_text().replace('</script>','<\\/script>')+'\n</script>',s,count=1);assert n==1,nme
# Standalone deliberately local-demo-only (config stays null). No Firebase credentials bundled.
cloud=(p/'cloud.js').read_text()
s,n=re.subn(r'<script type="module" src="cloud.js"></script>',lambda m:'<script>\n;(async()=>{\n'+cloud+'\n})().catch(console.error);\n</script>',s,count=1);assert n==1
output=p.parent/'From_Gutter_to_Glory_Playable_v0.91.html'
output.write_text(s)
print('Wrote',output,output.stat().st_size)
