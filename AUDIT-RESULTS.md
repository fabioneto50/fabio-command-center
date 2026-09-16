# Auditoria de implementação · 16 de setembro de 2026

## Resultado técnico confirmado antes da integração

Candidato de aplicação: `656f7a83c3db63361e0e51fd7a350c9d6fd436f9`.
Build: `1.4.0-7efe76ad53aa`.
Execução verificável: https://github.com/fabioneto50/fabio-command-center/actions/runs/35076897685

121 testes unitários, 558 verificações estáticas, 1038 verificações de aplicação e 40 verificações de atualização entre versões passaram. Chromium e WebKit foram executados em Linux; aplicação a 390×844 e 1440×1000 e verificações adicionais de reflow a 320, 430 e 768 píxeis. Os testes usam dados sintéticos e não acederam ao perfil de Fábio. Os números são verificações/assertions, não utilizadores, agentes autónomos nem cenários clínicos independentes.

## Implementação

Cofre local cifrado e bloqueio coerente; guarda de navegação, pesquisa e exportação; migração validada, backup completo por inventário, importação com preview e recuperação; reposições por âmbito; datas civis de Lisboa e recorrências; validação dimensional bidirecional e distinção entre vazio e zero; invalidação de resultados após edição; carregamento modular; catálogo canónico e paginação; navegação por URL, favoritos, recentes e ordem; pesquisa estruturada; atualidade das notícias; modal/foco/teclado e melhorias responsivas; pacotes offline completos e verificados; aplicação de atualização apenas com consentimento.

A revisão posterior encontrou e corrigiu estado incorreto ao voltar de uma ficha de medicação, filtros/página perdidos no reload, consulta indevida ao worker de uma versão pendente, recursos antigos indisponíveis para outro separador, gravações normais com schema inválido e links javascript em dados de investigação importados. Os testes foram alargados para reproduzir esses casos.

## Conteúdo preservado

923 medicamentos com 276 substituições históricas; 200 casos; 28 pensos e 46 imagens; 66 registos de vias de antibióticos recuperados de documentação institucional recebida. A integridade confirma preservação/transcrição e não certifica a validade clínica de cada recomendação.

## Limites que não devem ser apresentados como concluídos

A revisão clínica por afirmação, versão e revisor e a validação diagnóstica do analisador ECG não foram realizadas. O ECG continua experimental. Acessibilidade integral, VoiceOver, comportamento em iPhone físico e desempenho real em utilização de turno precisam de validação manual. Não há métricas de campo p75/Core Web Vitals: tempos de arranque de laboratório não equivalem a dados de utilizadores.

No WebKit, a perda de ligação foi testada fechando as ligações ao servidor de origem; não se declarou que toda a rede externa estivesse desligada. Chromium inclui contexto offline real.

A proteção obrigatória de publicação depende da configuração Pages descrita em `DEPLOYMENT.md`. A versão atual de código foi auditada antes de integrar; a ausência de permissões administrativas para mudar a origem de publicação não é contornada por um workflow.

## Evidência final

A execução `Quality gate 1.4` do commit integrado acrescenta o teste da migração real 1.3.2 -> 1.4.0 e produz os artefactos `quality-evidence-<sha>`. A verificação posterior do site produz `live-evidence-<sha>`; os resultados só devem ser dados como aprovados depois de consultar esses artefactos. Os testes e as capturas são evidência do âmbito executado, não garantia de ausência de todos os defeitos.
