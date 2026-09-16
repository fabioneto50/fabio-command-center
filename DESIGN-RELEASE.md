# Website · Biblioteca e navegação · 16/09/2026

## Âmbito

Alterações exclusivas no site https://fabioneto50.github.io/fabio-command-center/ e no repositório `fabioneto50/fabio-command-center`. A imagem da aplicação Replit foi usada como referência visual; essa aplicação não foi alterada.

## Comportamento

Clínica abre a Biblioteca clínica, sem selecionar automaticamente um subgrupo e sem abrir um menu modal. Pessoal abre a sua página de seleção depois do desbloqueio do cofre, mantendo a proteção existente. As áreas pessoais com subgrupos também aguardam seleção explícita. «Todos os módulos» regressa à seleção; tocar novamente no destino da barra inferior faz o mesmo. Ligações diretas e favoritos abrem o conteúdo escolhido.

## Apresentação e funcionalidades

Lista de cartões horizontais com ícone, título, descrição, estrela independente e seta. Pesquisa de módulos, incluindo nomes anteriores; filtros Todos, Módulos, Calculadoras e Favoritos na biblioteca. Os 24 módulos clínicos são preservados: Calculadoras reúne 9 módulos com ferramentas de cálculo e Módulos os restantes 15. A ordenação personalizada existente continua a ter prioridade.

A área pessoal mantém Despesas, Emergência, Comunicações, Veículos e Investigação, com filtros Ferramentas e Registos. A nova página Favoritos apresenta os módulos e fichas clínicas guardados no armazenamento já existente. Não guarda conteúdo privado em novos favoritos.

Barra inferior: Início, Clínica, Pessoal, Favoritos e Definições. Fundo opaco e espaço inferior para não cobrir o fim do conteúdo. Paleta clara em tons verdes, tema escuro, ícones SVG coerentes, tipografia e apresentação uniforme de cartões, formulários e definições. Filtros numa linha com deslocação horizontal nos ecrãs estreitos; estrelas com área de toque de 44×44 px. Cabeçalho pessoal reserva espaço para o botão de bloqueio.

## Verificação e limites

Antes da publicação, o código é testado no workflow Design and navigation review e no Quality gate 1.4 do pull request. A revisão geral abrange cálculos, cofre e migração, dados, navegação, atualizações e modo offline. Os testes específicos acrescentam filtros, favoritos, recarregamento, área pessoal, temas e adaptação a 320, 390, 430, 768 e 1440 px. Capturas e resultados ficam nos artefactos das execuções. A auditoria HTTPS repete verificações depois da publicação.

O primeiro teste de favoritos verificava a visibilidade antes de terminar o carregamento assíncrono. Foi corrigido para aguardar pelo painel real; o critério de visibilidade foi mantido. As regressões não são substituídas por uma simples verificação do URL.

Os perfis e dados utilizados são sintéticos. Chromium e WebKit são executados em Linux, não em iPhone físico. Esta alteração não revê recomendações clínicas nem muda as fórmulas, dados clínicos ou o esquema do cofre. A configuração administrativa de Pages mantém-se; não se declara que a proteção de publicação pendente descrita em DEPLOYMENT.md foi ativada por esta entrega.
