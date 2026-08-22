# FCC Content Modules

Arquitetura para acrescentar conteúdo sem reescrever navegação, HTML ou o motor dos separadores.

## Princípio

O motor está em `fcc-content-core-v1.js`. A configuração/extensões ficam em `fcc-content-config-v1.js`.

Existem três níveis principais:

1. **Item/cartão dentro de uma área existente** — por exemplo, um novo cartão em Sépsis / Choque.
2. **Item de catálogo** — por exemplo, nova medicação ou novo penso.
3. **Novo subseparador completo** — criado declarativamente com título, posição e itens.

## Novo cartão em Sépsis / Choque

```js
FCCContentManifest.addSepsisCard({
  id: 'sepsis-reavaliacao-perfusao',
  title: 'Reavaliação da perfusão',
  subtitle: 'Choque · tendência e resposta',
  tags: ['Sépsis', 'Perfusão'],
  sections: [
    { title: 'Avaliar', text: 'Conteúdo a inserir.' },
    { title: 'Reavaliar', text: 'Conteúdo a inserir.' }
  ]
});
```

## Nova medicação

```js
FCCContentManifest.addMedication({
  id: 'med-nome',
  title: 'Nome do medicamento',
  subtitle: 'Grupo terapêutico',
  tags: ['Medicação', 'Grupo'],
  sections: [
    { title: 'Resumo', text: '...' },
    { title: 'Farmacocinética', text: '...' },
    { title: 'Monitorização', text: '...' },
    { title: 'Precauções', text: '...' }
  ]
});
```

## Novo penso

Para um cartão modular independente:

```js
FCCContentManifest.addDressing({
  id: 'penso-nome',
  title: 'Nome do penso',
  subtitle: 'Tipo / dimensão',
  tags: ['Penso', 'Função'],
  sections: [
    { title: 'Indicação', text: '...' },
    { title: 'Composição / função', text: '...' }
  ]
});
```

Para integrar um produto diretamente no catálogo atual de Pensos:

```js
FCCContentManifest.addCatalogueDressing({
  name: 'Nome®',
  presentations: [['Apresentação', 'CÓDIGO']],
  tags: ['Penso', 'Função'],
  indication: '...',
  components: '...',
  links: ['https://...'],
  images: [
    { src: './assets/pensos/nome-01.avif', label: 'Imagem principal', kind: 'primary' },
    { src: './assets/pensos/nome-02.avif', label: 'Imagem complementar 1', kind: 'supporting' }
  ]
});
```

O catálogo usa a estrutura `name`, `presentations`, `tags`, `indication`, `components`, `links` e, quando aplicável, `images`.

### Atualizar apenas as imagens de um penso

```js
FCCContentManifest.addDressingImages('Nome®', [
  { src: './assets/pensos/nome-01.avif', label: 'Imagem principal', kind: 'primary' },
  { src: './assets/pensos/nome-02.avif', label: 'Imagem complementar 1', kind: 'supporting' }
]);
```

As imagens passam a pertencer aos **dados do próprio produto** (`product.images`). O renderizador visual apenas lê esse campo; não mantém um catálogo paralelo de imagens.

## Novo subseparador

```js
FCCContentManifest.addSubtab({
  page: 'clinical',
  id: 'clin-novo-topico',
  label: 'Novo tópico',
  after: 'clin-sepsis',
  title: 'Novo tópico',
  description: 'Descrição curta.',
  filterable: true,
  items: [
    {
      id: 'item-1',
      title: 'Primeiro cartão',
      tags: ['Grupo'],
      sections: [{ title: 'Resumo', text: '...' }]
    }
  ]
});
```

## Regras para futuras implementações

- Conteúdo novo deve ser adicionado como dados/configuração sempre que possível.
- Imagens de produtos devem ser registadas em `images` no próprio item de catálogo; não criar manifestos paralelos para a mesma entidade.
- Não duplicar navegação nem criar novos `onclick` manuais quando o registo modular consegue gerar a interface.
- IDs devem ser únicos e estáveis.
- O motor de renderização deve ser alterado apenas quando surgir um novo comportamento reutilizável, não para acrescentar conteúdo.
- Antes e depois de cada alteração, validar sintaxe JavaScript, referências do loader, IDs duplicados, navegação, cache offline e funcionamento dos módulos críticos.
