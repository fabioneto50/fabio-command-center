# Fábio Command Center — Auditoria e baseline MASTER

## Alterações estruturais
- Chave de dados permanente: `fcc-master-user-data-v1`.
- Schema de dados separado da versão da aplicação.
- Migração automática de V4/V3/V2 quando o browser/origem permite acesso ao mesmo localStorage.
- Backup MASTER com dados + content pack.
- Update Packs independentes: permitem atualizar conteúdo e referências sem substituir dados pessoais.
- Source Registry com data de verificação e aviso de revisão após 180 dias.
- Autodiagnóstico integrado com testes matemáticos e integridade de estado/DOM.
- Support Snapshot para diagnóstico sem exportar o conteúdo completo.

## Melhorias funcionais
- Pesquisa global.
- Inventário: itens personalizados, validade, data de revisão e CSV.
- Meshtastic: firmware, bateria, etiquetas, localização e exportação de logs.
- Garage: full-to-full fuel consumption e remoção de registos.
- Research: edição, PICO, GRADE/certeza, risco de viés e BibTeX.
- Ventilador: PEEP total, validade de Pplat, estado passivo, interpretação Ppeak-Pplat limitada a VC-AC.

## Segurança clínica
- Outputs continuam classificados como cálculo/alerta/ponto a rever, não prescrição.
- KDIGO 2026 AKI/AKD é marcado como draft/public review, não guideline final.
- Referências ESC são mantidas como links externos; conteúdo/algoritmos ESC não são reproduzidos no motor.
- Source Registry foi verificado em 2026-08-19.

## Política de evolução
A partir desta versão:
1. O schema `fcc-master-user-data-v1` é mantido.
2. Novos campos são adicionados por migração não destrutiva.
3. Atualizações de conteúdo entram preferencialmente por `FCC_UpdatePack_*.json`.
4. Só se muda de schema quando houver uma razão técnica forte; nesse caso haverá migração automática.

## Hardening final
- Update Packs passam a alimentar Source Registry, Drug Reference, casos e checklists.
- Novo artigo e edição de artigo usam fluxos separados.
- BME280 vazio é `null`, não 0.
- Links dinâmicos limitados a HTTP/HTTPS.
- Categorias custom do inventário atualizam dinamicamente.
- Os três nodes são normalizados para LilyGO Plus / 433 MHz / BME280.
