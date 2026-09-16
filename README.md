# Fábio Command Center · 1.4.0

Aplicação estática em português de Portugal para consulta clínica, ferramentas pessoais e despesas. A revisão 1.4.0 substitui o bloqueio visual por um cofre local cifrado, consolida dados públicos e carrega os módulos apenas quando necessários.

## Primeiro acesso e dados existentes

A consulta pública não exige conta. Ao entrar na área pessoal, é necessário criar uma frase-passe própria com pelo menos 14 caracteres e aceitar a migração dos dados locais existentes. O PIN antigo já não desbloqueia o novo mecanismo. Os dados antigos só são removidos do armazenamento em claro depois de a migração cifrada ter sido verificada.

A frase-passe não é enviada nem guardada. Não existe recuperação central: perder a frase-passe e as cópias utilizáveis pode significar perder acesso aos dados. Exportar uma cópia completa cifrada nas Definições e guardá-la fora do navegador. Os dados não são sincronizados entre dispositivos.

## Segurança e limites

Cofre AES-GCM-256 com derivação PBKDF2/SHA-256, 600 000 iterações, salt e IV aleatórios. Pesquisa, navegação, exportação e snapshots privados exigem desbloqueio; a sessão bloqueia por inatividade. Importações e gravações normais validam o schema antes de alterar os dados. Importações têm pré-visualização e recuperação da versão anterior.

Este modelo protege dados em repouso no navegador bloqueado; não é autenticação num servidor. Não protege contra um dispositivo comprometido, extensões maliciosas ou código malicioso executado enquanto o cofre está aberto. Não colocar dados identificáveis de doentes. Backups cifrados contêm preferências públicas em claro, conforme o inventário apresentado na aplicação.

## Modo offline

A base é preparada automaticamente. Nas Definições podem preparar-se os pacotes completos de clínica, pensos/imagens e ferramentas pessoais. O estado disponível exige a verificação de todos os recursos do pacote. Pesquisa externa, material externo e notícias recentes continuam dependentes de ligação.

Uma atualização aguarda confirmação antes de recarregar a página. Guardar o trabalho em curso antes de aceitar. Os recursos da versão anterior são conservados para separadores ainda abertos. A página `recovery.html` permite remover apenas caches e service workers deste caminho, sem apagar o cofre ou dados de outras aplicações. Não limpar os dados do navegador como primeira tentativa de resolução.

## Conteúdo clínico

Preservam-se 923 registos de medicação, incluindo 276 substituições históricas, 200 casos de treino e 28 pensos com 46 imagens. Esta consolidação não é uma revisão clínica independente. Os casos incluem variantes de objetivos, não 200 diagnósticos distintos. Fontes e avisos relevantes permanecem visíveis; ausência de informação não é preenchida por suposição. O analisador de imagens ECG permanece experimental, não um diagnóstico certificado.

## Desenvolvimento e testes

Requisitos: Node 22 e Python 3.11. Sem dependências de execução instaladas via npm.

```sh
python scripts/recover-antibiotics.py
node --expose-internals scripts/build-clinical-data.cjs
node --expose-internals scripts/build-assets.cjs
node --test tests/audit-unit.mjs
python scripts/audit-integrity.py
python -m pip install playwright==1.55.0 pyee==13.0.0 greenlet==3.2.4
python -m playwright install --with-deps chromium webkit
python tests/audit-browser.py
python tests/audit-upgrade.py
python scripts/stage-site.py
```

Os testes usam perfis sintéticos. Nunca apontar testes de migração a um perfil real. Para testar a migração completa, arquivar o commit de referência num diretório temporário e definir `FCC_LEGACY_ROOT`; ver o workflow `Quality gate 1.4`. Os relatórios são artefactos do Actions, não dados pessoais guardados no repositório.

## Publicação

Ver `DEPLOYMENT.md`. O workflow inclui verificação antes do seu próprio job de publicação e uma auditoria HTTPS após publicação. A publicação automática diretamente de `main` é uma configuração independente e só deixa de ignorar esse bloqueio depois de alterar Source para GitHub Actions nas definições Pages. A configuração administrativa não foi alterada por código.
