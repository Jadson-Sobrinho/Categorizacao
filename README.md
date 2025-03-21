# Documentação do Código de Agrupamento de Produtos

Este documento descreve o funcionamento de um código responsável por normalizar, categorizar e agrupar produtos com base em características como tipo e tamanho. O código realiza a leitura de um arquivo JSON contendo informações sobre os produtos e aplica uma série de transformações para categorizar os itens.

## Dependências

O código utiliza as seguintes dependências externas:
- **fs**: Para manipulação de arquivos no sistema de arquivos local.
- **string-similarity**: Para calcular a similaridade entre strings.

## Funcionalidades

### 1. **normalizeText(text)**

A função `normalizeText` é responsável por normalizar o texto de entrada, removendo acentos, caracteres especiais e espaços extras, e aplicando outras transformações.

#### Como Funciona:
- **Transformações de texto**:
  - Converte o texto para minúsculas.
  - Remove acentos.
  - Remove caracteres especiais, mantendo apenas letras, números, espaços e alguns caracteres específicos (como hífens e barra).
  - Substitui múltiplos espaços consecutivos por um único espaço.
  - Substitui sinônimos pelo tipo principal (por exemplo, "sem lactose" é substituído por "zero lactose").
- **Processamento de tamanho**:
  - Se um valor de tamanho é encontrado (litros, gramas, etc.), ele é formatado para ter até 3 casas decimais.
  
#### Parâmetros:
- `text` (string): O texto a ser normalizado.

#### Retorno:
- Retorna o texto normalizado.

---

### 2. **extractSize(text)**

A função `extractSize` é responsável por extrair o tamanho e a unidade de medida de um produto a partir do texto fornecido.

#### Como Funciona:
- Usa uma expressão regular para encontrar valores numéricos seguidos de unidades de medida (como "ml", "l", "kg", etc.).
- Realiza conversões entre unidades de medida (por exemplo, "ml" para "l" ou "g" para "kg").
- Arredonda o valor para 3 casas decimais.

#### Parâmetros:
- `text` (string): O texto contendo as informações de tamanho.

#### Retorno:
- Um objeto com as propriedades `value` (valor numérico) e `unit` (unidade de medida), ou `null` caso nenhum tamanho seja encontrado.

---

### 3. **extractType(text)**

A função `extractType` é responsável por extrair o tipo de produto de um texto com base em uma lista de tipos pré-definidos.

#### Como Funciona:
- Verifica se o texto contém algum dos tipos definidos no array `TypeToDiference` (por exemplo, "integral", "desnatado", etc.).
- Retorna o tipo correspondente, ou `null` se nenhum tipo for encontrado.

#### Parâmetros:
- `text` (string): O texto a ser analisado.

#### Retorno:
- O tipo de produto encontrado ou `null`.

---

### 4. **groupProducts(products, threshold = 0.85)**

A função `groupProducts` agrupa uma lista de produtos com base em sua similaridade textual e tamanho, usando um valor de limiar (threshold).

#### Como Funciona:
- Compara cada produto com todos os outros para verificar se eles são semelhantes, levando em consideração o tipo e o tamanho.
- Se a similaridade entre os produtos for maior que o limiar (default de 0.85), os produtos são agrupados.
- Produtos com tipos diferentes ou tamanhos diferentes são considerados como pertencentes a grupos diferentes.

#### Parâmetros:
- `products` (array de objetos): Lista de produtos a serem agrupados.
- `threshold` (opcional, número): O valor limiar para a similaridade (entre 0 e 1). O padrão é 0.85.

#### Retorno:
- Uma lista de grupos de produtos, onde cada grupo é um array de objetos representando os produtos semelhantes.

---

### 5. **categorizeProduct(data)**

A função `categorizeProduct` organiza os produtos em categorias, agrupando-os com base nos tipos e tamanhos.

#### Como Funciona:
- Chama a função `groupProducts` para agrupar os produtos.
- Para cada grupo de produtos, a função cria um objeto com a categoria (o título do primeiro produto do grupo), a contagem de produtos no grupo e uma lista de produtos.

#### Parâmetros:
- `data` (array de objetos): A lista de produtos a ser categorizada.

#### Retorno:
- Uma lista de objetos com a categoria, contagem de produtos e a lista de produtos de cada categoria.

---

### 6. **Leitura de Arquivo e Processamento**

No final do código, um arquivo JSON chamado `data01.json` é lido. Após a leitura, o conteúdo é processado para categorizar os produtos.

#### Como Funciona:
- A função `fs.readFile` é usada para ler o arquivo JSON de forma assíncrona.
- Após a leitura, o JSON é analisado e a função `categorizeProduct` é chamada para agrupar e categorizar os produtos.
- O resultado final é impresso no console no formato JSON.

