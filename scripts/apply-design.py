"""Design migration completed; current source files are authoritative."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
assert all((root/n).exists() for n in ['fcc-areas.js','fcc-design.css','fcc-appearance.js'])
print('Using committed reference-library sources; no historical patch reapplied.')
