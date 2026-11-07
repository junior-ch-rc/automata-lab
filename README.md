# Automata Lab

Laboratório web de linguagens formais, com português como idioma inicial e traduções independentes em inglês, francês, espanhol, chinês simplificado e hindi.

## Executar

Requer Python 3 para servir os arquivos e Node.js 20+ para executar os testes. A aplicação não tem dependências de execução nem etapa de compilação.

```sh
npm run dev
# Abra http://localhost:4173
npm test
```

Publique a pasta `dist` em qualquer hospedagem estática. Não abra `index.html` diretamente por file://: o navegador precisa carregar módulos e traduções por HTTP.

## Recursos entregues

- Editor SVG amplo, com modo expandido, zoom por botões ou roda do mouse, enquadramento e deslocamento pelo botão de navegação ou Espaço + arraste. Estados podem ser posicionados fora da área original.
- Menus junto ao elemento clicado: nome, estado inicial/final e exclusão de estados; edição, inclusão e exclusão individual de cada transição.
- Uma seta por par de origem e destino, com rótulos agrupados. Curvas são recalculadas ao mover estados e procuram desviar de estados intermediários; sentidos opostos permanecem separados. Em diagramas muito densos, sobreposições entre curvas ou rótulos ainda podem exigir reorganização dos estados.
- Animação com iniciar/pausar, velocidade ajustável, estados ativos e fluxo visual nas setas; controles rápidos dentro do editor expandido. Efeitos decorativos respeitam a preferência de movimento reduzido.
- Organizar, desfazer e refazer até 60 alterações.
- AFD e AFN com ε: simulação por conjuntos e fecho ε, execução passo a passo e testes em lote.
- Autômatos com pilha não determinísticos: exploração de configurações, leitura/empilhamento/desempilhamento, pilha visível durante a execução.
- Máquina de Turing não determinística de uma fita: fita esparsa, escrita e movimentos L/R/S; inspeção da fita durante os passos.
- Determinização por construção de subconjuntos, incluindo estado poço; minimização de AFD por refinamento de partições.
- Comparação exata de linguagens de autômatos finitos, com menor contraexemplo quando diferentes, dentro do limite de exploração.
- Expressões regulares: união `|`, concatenação, `*`, `+`, `?`, parênteses, ε, conjunto vazio ∅ e escape `\`; construção de Thompson.
- Autômato finito → expressão regular por eliminação de estados.
- Gramáticas livres de contexto: reconhecimento Earley com recursão à esquerda e regras vazias; não inclui geração de árvore sintática.
- Gramática regular → autômato; autômato → gramática regular; gramática livre de contexto → autômato com pilha.
- Tabela de transições, exemplos com instruções e guia de uso.
- Salvamento automático no navegador; troca entre famílias preserva o último modelo de cada família durante a sessão e nos salvamentos seguintes.
- Importação por arquivo ou texto JSON/JFLAP XML; exportação JSON, JFLAP e SVG.
- Interface responsiva, controles com rótulos acessíveis e troca de idioma sem recarregar a página.

## Convenções e limites

Um símbolo é um ponto de código Unicode. A palavra ε no campo de transição significa transição vazia; no simulador, deixe a entrada vazia para testar a palavra vazia. No lote, uma linha `ε` significa palavra vazia.

Pilha: topo à esquerda; inicialmente vazia; aceitação por estado final depois de consumir toda a entrada. Não há teste implícito de pilha vazia: use marcador de fundo e transição explícita, como nos exemplos.

Turing: símbolo branco `□`, fita ilimitada representada de forma esparsa, cabeçote começa em 0. Aceitação ao alcançar estado final; parada sem transição rejeita. Resultado sem decisão ao alcançar limite aparece como “inconclusivo”.

Gramáticas: variáveis de uma letra A–Z, primeira produção define a variável inicial; espaços no lado direito são símbolos literais. Use `S → aSb | ε`, sem espaços dentro de `aSb`. Gramáticas regulares para conversão aceitam `A → aB`, `A → a`, `A → B`, `A → ε`.

Limites de proteção: 150 estados, 1.500 transições, 200 símbolos de entrada, 500 níveis de simulação, 2.000 configurações por nível e 15.000 configurações visitadas; lote de até 80 palavras com até 100 símbolos e 150 níveis por palavra. Earley: gramática até 10.000 caracteres e 100.000 itens processados. Comparação de linguagens: até 20.000 pares. Eliminação de estados: até 12 estados e 15.000 caracteres intermediários. Thompson: até 150 estados; uma expressão gerada por eliminação pode ultrapassar esse limite ao ser reconvertida. Autômato → gramática: até 26 estados e terminais compatíveis com a sintaxe da gramática.

O simulador exibe todos os estados ativos. Para pilha e Turing, o painel detalha a primeira configuração do nível, além da quantidade de configurações. A visualização não representa uma única trajetória quando há não determinismo.

Arquivos JFLAP: autômatos finitos, pilha e Turing de uma fita. Importação multifita é rejeitada explicitamente. Exportação usa IDs numéricos e branco compatível com JFLAP. Não há garantia de compatibilidade com todas as variantes históricas de arquivos JFLAP.

Esta versão **não possui paridade integral com o JFLAP**. Não inclui transdutores Mealy/Moore, Turing multifita, L-systems, autômatos celulares, circuitos, parsing LL/LR, CYK, transformação para formas normais, árvores de derivação, colaboração, contas de alunos, correção de exercícios ou banco de dados compartilhado. Estes itens exigem desenvolvimento adicional. As traduções foram verificadas estruturalmente; revisão linguística humana ainda é recomendável.

## Tecnologia e dados

JavaScript ES Modules, HTML e CSS, SVG e algoritmos puros, sem framework ou servidor de aplicação. Essa escolha evita download de um framework e chamadas ao servidor a cada simulação. Não foi realizada comparação de desempenho entre tecnologias. O armazenamento usa localStorage: exporte JSON para backup e portabilidade. Não há sincronização entre dispositivos. Fontes externas são opcionais e têm fallback para fontes do sistema.

`dist/engine.js`: algoritmos puros. `dist/io.js`: validação e arquivos. `dist/app.js`: interface. `dist/locales/*.json`: traduções com o mesmo conjunto de chaves. `tests/engine.test.js`: testes dos algoritmos; `tests/editor.test.js`: agrupamento de transições, desvio de obstáculos, setas opostas, laços, zoom ancorado e enquadramento.

## Verificação

26 grupos de testes automatizados passaram. Cobrem milhares de palavras geradas: aceitação/rejeição, ε e ciclos, quantificadores, equivalência das conversões, minimização, pilha, Turing, Earley, validação de modelos, escape XML e integridade dos seis dicionários.

Verificações manuais no navegador: caso q1–q2–q3 com retorno q3→q1, agrupamento de rótulos, editar/excluir/adicionar rótulos, zoom, navegação, arraste com recálculo de curvas, desfazer, menus, modo expandido, animação e pausa; também foram verificadas na versão anterior: execução, rejeição, lote, alteração de nome de estado, desfazer, pilha com aceitação e rejeição, escrita em fita, conversão de gramática em pilha, importação de XML JFLAP e troca de idiomas. Os testes não equivalem a uma auditoria completa de acessibilidade, revisão linguística ou compatibilidade de todos os arquivos JFLAP.

## GitHub Pages

O workflow `.github/workflows/pages.yml` executa os testes antes de publicar `dist` no GitHub Pages. Em Settings → Pages, a origem deve ser **GitHub Actions**. Commits na branch `main` atualizam o site automaticamente; pull requests executam apenas os testes. O site usa caminhos relativos para funcionar dentro de `/automata-lab/`.
