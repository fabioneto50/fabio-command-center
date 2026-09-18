"""Idempotent CSS-only migration of the active runtime's legacy type scale.
Only font-size declarations and named CSS rules change. No clinical text, JSON,
calculation functions, authentication or user storage is read or rewritten.
"""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'asset-manifest.json').read_text());prefix='release/'+manifest['build']+'/'
files=['index.html']+sorted({p[len(prefix):] for p in manifest['assets'] if p.startswith(prefix) and p.endswith(('.js','.css'))})
protected=['fcc-core.js','fcc-store.js','fcc-clinical-ui.js']+[str(p.relative_to(ROOT)) for p in (ROOT/'data').glob('*.json')]
hashes={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in protected}
pattern=re.compile(r'(font-size\s*:\s*)(\d*\.?\d+)(px|rem|em)(?=\s*(?:[;!}"\n]|$))')
changed={}
for name in files:
 path=ROOT/name;text=path.read_text();count=[0]
 def replace(m):
  pixels=float(m[2])*(16 if m[3] in ['em','rem'] else 1)
  if pixels<13:
   count[0]+=1;return m[1]+'var(--fcc-caption,.8125rem)'
  return m[0]
 updated=pattern.sub(replace,text)
 if updated!=text:path.write_text(updated);changed[name]=count[0]
p=ROOT/'fcc-ui.css';text=p.read_text();text=text.replace('--fcc-body:1rem;--fcc-label:.9375rem;','--fcc-body:.9375rem;--fcc-label:.875rem;');p.write_text(text)
p=ROOT/'fcc-design.css';text=p.read_text()
text=text.replace('.pagehead h2{font-size:32px!important;', '.pagehead h2{font-size:28px!important;')
text=text.replace('.pagehead h2{font-size:28px!important;letter-spacing:-.8px}', '.pagehead h2{font-size:24px!important;letter-spacing:-.6px}')
text=text.replace('.card h3{font-size:19px!important;', '.card h3{font-size:18px!important;')
marker='/* Unified reading hierarchy: typography revision 8. */'
if marker not in text:
 text+='''
/* Unified reading hierarchy: typography revision 8. */
/* Stable semantic roles for eagerly and lazily rendered modules.
   Compact mode reduces space, not captions below the shared 13px base. */
html[data-fcc-design] body .page :is(.ivc-status,.ivc-chip,.ivsrc-state){font-size:var(--fcc-caption)!important;line-height:1.45!important;letter-spacing:.02em}
html[data-fcc-design] body .page :is(.ivc-result,.ivc-evidence-lite) h3{font-size:1.125rem!important;line-height:1.35!important;margin:0}
html[data-fcc-design] body .page :is(.ivc-result,.ivc-evidence-lite) p{font-size:.875rem!important;line-height:1.5!important}
html[data-fcc-design] body .page :is(.ivc-action,.ivc-evidence-lite .limits,.ivsrc-summary){font-size:.875rem!important;line-height:1.5!important;overflow-wrap:anywhere}
html[data-fcc-design] body .ivc-status{font-weight:700}
html[data-fcc-design] body .ivc-evidence-lite{padding:14px}
html[data-fcc-design] body .ivc-evidence-lite .limits{padding:8px 10px}
html[data-fcc-design] body .ivc-v2-sources{gap:8px}
html[data-fcc-design] body :is(.ivc-v2-sources a,.ivcat-sources a){display:inline-flex;align-items:center;min-height:44px;font-size:var(--fcc-caption)!important;line-height:1.4;padding:7px 10px;color:var(--clinical)!important;background:var(--panel)!important;border-color:var(--line-strong)!important;text-decoration:underline;text-underline-offset:3px}
html[data-fcc-design] body .ivsrc-panel{background:var(--panel)!important;border-color:var(--line)!important}
html[data-fcc-design] body .ivsrc-head h4{font-size:1rem!important;line-height:1.4}
html[data-fcc-design] body .ivsrc-head p{font-size:.875rem!important;line-height:1.5!important;margin:4px 0 0}
html[data-fcc-design] body .ivsrc-row{grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr) 44px;gap:12px;padding:10px 12px}
html[data-fcc-design] body .ivsrc-name{min-width:0;overflow-wrap:anywhere}
html[data-fcc-design] body .ivsrc-name b{font-size:.875rem!important;line-height:1.4;font-weight:650}
html[data-fcc-design] body .ivsrc-name span{font-size:var(--fcc-caption)!important;line-height:1.45;color:var(--muted)!important}
html[data-fcc-design] body .ivsrc-state{font-weight:600;white-space:normal;overflow-wrap:anywhere;padding:6px 9px;border-radius:10px}
html[data-fcc-design] body .ivsrc-state:before{flex-shrink:0}
html[data-fcc-design] body .ivsrc-link{width:44px;min-width:44px;height:44px;font-size:1rem;color:var(--clinical)!important;background:var(--panel)!important;border-color:var(--line-strong)!important}
html[data-fcc-design] body .ivsrc-note{font-size:var(--fcc-caption)!important;line-height:1.5!important;color:var(--muted)!important;background:var(--panel)!important;padding:10px 12px}
html[data-fcc-design] body .ivsrc-compatible{color:var(--good)!important;background:var(--tactical-soft)!important;border-color:var(--good)!important}
html[data-fcc-design] body .ivsrc-incompatible{color:var(--danger)!important;background:var(--panel)!important;border-color:var(--danger)!important}
html[data-fcc-design] body .ivsrc-conditional{color:var(--warn)!important;background:var(--amber-soft)!important;border-color:var(--warn)!important}
html[data-fcc-design] body .ivsrc-unknown{color:var(--muted)!important;background:var(--panel)!important;border-color:var(--line-strong)!important}
html[data-fcc-design] body .ivc-evidence-lite .limits{color:var(--warn)!important;background:var(--amber-soft)!important;border-color:var(--warn)!important}
html[data-fcc-design] body .ivc-suggestion strong{font-size:.9375rem!important;line-height:1.4}
html[data-fcc-design] body .ivc-suggestion span{font-size:var(--fcc-caption)!important;line-height:1.45}
html[data-fcc-design] body .ivc-suggestion{min-height:44px;padding:9px 10px}
html[data-fcc-design] body .page[data-fcc-compact] .sub .pagehead h2{font-size:1.375rem!important;line-height:1.3}
html[data-fcc-design] body .page .fcc-detail-warning>strong{font-size:.875rem!important}
@media(max-width:640px){
 html[data-fcc-design] body .ivsrc-row{grid-template-columns:minmax(0,1fr) 44px;gap:6px 10px}
 html[data-fcc-design] body .ivsrc-state{grid-column:1;grid-row:2}
 html[data-fcc-design] body .ivsrc-link{grid-column:2;grid-row:1/3}
 html[data-fcc-design] body .ivsrc-head{gap:6px}
}
'''
label_marker='/* Safety-label reflow at the readable type scale. */'
if label_marker not in text:
 text+='''
/* Safety-label reflow at the readable type scale. */
html[data-fcc-design] body .cuf-symbol-card{grid-template-columns:132px minmax(0,1fr);gap:12px;align-items:start}
html[data-fcc-design] body .cuf-symbol-art{min-width:0;width:132px;max-width:100%}
html[data-fcc-design] body .cuf-sym-yellow{width:132px;max-width:100%;height:auto;padding:7px;line-height:1.3;overflow-wrap:normal;word-break:normal;font-weight:800}
html[data-fcc-design] body .cuf-sym-yellow small{max-width:100%;line-height:1.35!important;font-weight:800}
html[data-fcc-design] body .cuf-sym-oct{width:88px;height:82px}
html[data-fcc-design] body .cuf-sym-tall{width:100%;box-sizing:border-box;overflow-wrap:normal}
@media(max-width:420px){
 html[data-fcc-design] body .cuf-symbol-card{grid-template-columns:minmax(0,1fr)}
 html[data-fcc-design] body .cuf-symbol-art{justify-self:start}
}
'''
p.write_text(text)
info=ROOT/'build-info.json';meta=json.loads(info.read_text());meta['interfaceRevision']='8 — tipografia legível e consistente em todos os módulos';info.write_text(json.dumps(meta,ensure_ascii=False,indent=2))
for p,digest in hashes.items():assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==digest,p+' must remain unchanged'
evidence=ROOT/'audit-evidence';evidence.mkdir(exist_ok=True)
(evidence/'typography-source-changes.json').write_text(json.dumps({'legacyDeclarations':changed,'total':sum(changed.values()),'protectedSHA256':hashes,'scope':'font-size declarations and named CSS rules only'},indent=2))
print('CSS-only typography migration:',sum(changed.values()),'legacy declarations in',len(changed),'runtime sources; protected files unchanged')
