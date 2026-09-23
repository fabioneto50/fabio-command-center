"""Remove the remaining blanket validation claim without changing IV results."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'iv-compatibility.js'
s=p.read_text()
old='Consulta rápida de compatibilidade física em Y-site com validação multi-fonte.'
new='Consulta de resultados documentais de compatibilidade física em Y-site, com condições e referências.'
if old in s:
    assert s.count(old)==1
    p.write_text(s.replace(old,new))
else:
    assert new in s, 'Unexpected compatibility heading; review before changing.'
print('Compatibility heading no longer asserts blanket clinical validation.')
