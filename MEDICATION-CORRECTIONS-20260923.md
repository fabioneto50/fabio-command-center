# Correções pontuais do catálogo — 23/09/2026

Esta atualização aplica correções documentadas e suspende instruções ambíguas. **Não conclui a revisão clínica integral das 923 fichas nem constitui aprovação farmacêutica.**

## Rastreabilidade

- `data/medication-corrections-20260923.json`: 47 alterações de campos, com valor anterior, valor posterior, achado e fonte/limite.
- `data/baseline-before-medication-20260923.json`: hashes da base anterior.
- As 923 entradas e respetivos identificadores são preservados. Os rótulos antigos de validação/confiança ficam em `legacyReviewMetadata` e não são tomados como validação atual.
- As correções clínicas abrangem somente os campos indicados em `auditCorrections`. Os restantes campos permanecem sujeitos à revisão individual.

## Alterações principais

Unidades do remifentanilo; distinção de propofol 10/20 mg/mL; suspensão de exemplos/preparações com apresentação, unidade, quantidade ou volume inequívocos em falta; cinco campos de função renal/hepática; referência de carbimazol retirada de tiamazol; 12 associações incorretas de estabilidade removidas (117 vínculos documentais permanecem); prazo de Keppra solução oral atualizado pela EMA; condições de compatibilidade explicitadas; remoção de alegações de validação por contagem de ligações; nove regras já existentes tornadas consultáveis no seletor.

Dados de compatibilidade física não passam a constituir estabilidade química ou prazo de conservação. Dúvidas de fabricante, concentração, protocolo ou unidades da fonte não são resolvidas por suposição. Os documentos institucionais de origem não foram reescritos como se tivessem sido revistos.

## Build e testes

Build: `1.4.0-2484781810f6`.

Os workflows de preparação 35898226909 e 35899139183 terminaram com sucesso. Foram registados 128 testes unitários, 571 verificações de integridade e 1042 verificações gerais de navegador antes e depois; 56 verificações dirigidas de dados/código e 192 verificações dirigidas de navegador. A segunda ronda voltou a executar os controlos após retirar a alegação de validação global no título. Commit de dados/runtime verificado: `5e4d20c2b123ce443b6e6188f3a505a2fce6582d`.

A integração mantém o quality gate existente. O workflow `Published medication corrections check` verifica, após a integração, o build efetivamente publicado, em perfis novos de Chromium/WebKit e dimensões 390/1440. Os resultados e capturas estão nos artefactos de execução; não são uma certificação clínica ou um teste físico de todos os dispositivos.

## Reproduzir as correções limitadas

```sh
python scripts/apply-medication-corrections-20260923.py --install
python scripts/finalize-medication-wording-20260923.py
python scripts/recover-antibiotics.py
node --expose-internals scripts/build-clinical-data.cjs
node --expose-internals scripts/build-assets.cjs
node --test tests/audit-unit.mjs
python scripts/audit-integrity.py
node tests/medication-corrections-20260923.cjs
python tests/medication-corrections-browser-20260923.py
```

O script mantém os valores anteriores no ledger e interrompe perante alterações subsequentes incompatíveis, em vez de as substituir silenciosamente. A geração de dados volta a aplicar as alterações pontuais para que uma reconstrução não recupere instruções já retiradas.

## Pendências

Continuam incompletas a verificação individual de todos os campos, a revisão das preparações e prazos dos produtos não identificados, o preenchimento dos campos genéricos/ausentes e a rastreabilidade de cada afirmação às fontes. Confirmar o RCM da apresentação efetivamente usada e o protocolo institucional. Um SmPC britânico não demonstra autorização ou disponibilidade em Portugal.
