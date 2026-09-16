# Publicação e recuperação · 1.4.0

## Configuração administrativa pendente

Em 16/09/2026, a leitura da configuração Pages devolveu `build_type: legacy`, origem `main` e pasta `/`. Nessa configuração, um push em main pode publicar antes dos testes. A existência de um workflow verde não muda essa configuração.

O workflow `Quality gate 1.4` está preparado para `verify -> deploy -> live-audit`: build determinístico, testes unitários e estáticos, Chromium/WebKit, atualização entre versões, migração real da versão 1.3.2, pacote público com integridade verificada e verificação do site HTTPS. O job deploy só executa quando a configuração já é `workflow`; não tenta elevar permissões nem alterar definições administrativas.

Para ativar esse mecanismo no GitHub: Settings > Pages > Build and deployment > Source > GitHub Actions. Depois executar manualmente `Quality gate 1.4` em main. Não criar um segundo workflow de publicação independente. Para impedir alterações diretas não verificadas em main, configurar também proteção de branch com pull request e o check `verify` obrigatório. Estas opções exigem acesso administrativo e não ficam concluídas apenas por editar este ficheiro.

Fonte oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Regras de release

Não integrar um candidato com testes falhados. Preservar atualizações de `news-feed.json` feitas entretanto em main. O build deve permanecer idêntico à versão auditada: `asset-manifest.json` enumera 110 recursos correntes e os respetivos hashes. O pacote `_site` exclui testes, ferramentas de transferência e código-fonte solto, mas conserva diretórios de releases anteriores necessários a separadores abertos.

Uma verificação HTTPS posterior compara todos os hashes do manifesto publicado e abre a aplicação real em Chromium/WebKit com perfis limpos. Isso não substitui testes manuais em iPhone físico, VoiceOver ou recolha de métricas em utilizadores reais.

## Recuperação sem apagar dados

Guardar o trabalho e exportar backup quando o cofre estiver acessível. Aplicar atualizações em Definições após confirmação. Se a cache impedir o arranque, abrir `recovery.html`; a ação exige confirmação e limita a limpeza ao caminho deste site. Não usar `localStorage.clear()`, não apagar os dados do navegador e não reverter automaticamente para a versão antiga com bloqueio visual/PIN. Uma reversão de código exige nova análise de compatibilidade do cofre e das caches.
