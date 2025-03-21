const fs = require('fs');
const stringSimilarity = require('string-similarity');

const TypeToDiference = ['integral', 'desnatado', 'semi desnatado', 'zero', 'light', 'zero lactose'];
const TypeSynonyms = {'zero lactose': ['sem lactose'] };

function normalizeText(text) {
  let normalized = text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\-_/]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Itera sobre cada tipo principal e seus sinônimos
for (const mainType in TypeSynonyms) {
  if (TypeSynonyms.hasOwnProperty(mainType)) {
    // Obtém a lista de sinônimos para o tipo principal
    const synonyms = TypeSynonyms[mainType];

    // Cria uma expressão regular para encontrar os sinônimos
    const synonymPattern = synonyms
      .map(s => s.replace(/ /g, '\\s+')) // Substitui espaços por \s+
      .join('|'); // Junta os sinônimos com "|" para o regex

    const regex = new RegExp(`\\b(${synonymPattern})\\b`, 'gi');

    // Substitui os sinônimos pelo tipo principal na string normalizada
    normalized = normalized.replace(regex, mainType);
  }
}

  // Processamento de tamanho
  const size = extractSize(normalized);
  if (size) {
    // Verifica se o valor do tamanho é um número inteiro
    const isInteger = size.value % 1 === 0;
  
    // Formata o valor: inteiro como string ou decimal com 3 casas
    const formattedValue = isInteger ? size.value.toString() : size.value.toFixed(3);
  
    // Cria o padrão regex para encontrar o valor e a unidade
    const pattern = /(\d+[,.]?\d*)\s?(l|ml|kg|g)/i;
  
    // Substitui o valor e a unidade encontrados pelo valor formatado e a unidade do objeto `size`
    normalized = normalized.replace(pattern, `${formattedValue}${size.unit}`);
  }

  return normalized.split(' ').sort().join(' ');
}

const unitMap = {
  'g': 'g',
  'grama': 'g',
  'gramas': 'g',
  'kg': 'kg',
  'quilo': 'kg',
  'quilos': 'kg',
  'l': 'l',
  'litro': 'l',
  'litros': 'l',
  'ml': 'ml'
};

function extractSize(text) {
  const regex = /(\d+[,.]?\d*)\s?(l|ml|kg|g|litro|litros|quilo|quilos|grama|gramas)\b/i;
  const match = text.match(regex);

  if (!match) return null;

  let value = parseFloat(match[1].replace(',', '.'));
  let unit = match[2].toLowerCase();


  const conversions = {
    'ml': { unit: 'l', factor: 0.001 },
    'g': { unit: 'kg', factor: 0.001 },
    'grama': { unit: 'kg', factor: 0.001 },
    'gramas': { unit: 'kg', factor: 0.001 }
  };

  if (conversions[unit]) {
    value *= conversions[unit].factor;
    unit = conversions[unit].unit;
  }

  // Arredondar para 3 casas decimais
  value = Math.round(value * 1000) / 1000;

  return { value, unit };
}

function extractType(text) {

  for (const type of TypeToDiference) {
    // Verifica se o texto inclui o tipo atual
    if (text.includes(type)) {
      // Retorna o tipo encontrado
      return type;
    }
  }

  return null;
}

function groupProducts(products, threshold = 0.85) {
  const groups = [];
  const processed = new Set();

  const isSameSize = (size1, size2) => {
    // Se um dos tamanhos for nulo ou indefinido, considerar como iguais
    if (!size1 || !size2) {
      return true;
    }
  
    // Comparar os valores e as unidades dos dois tamanhos
    const isValueEqual = size1.value === size2.value;
    const isUnitEqual = size1.unit === size2.unit;
  
    // Retornar true apenas se ambos, valor e unidade, forem iguais
    return isValueEqual && isUnitEqual;
  };

  for (let i = 0; i < products.length; i++) {
    if (processed.has(i)) continue;

    const current = products[i];
    const currentNorm = normalizeText(current.title);
    const currentSize = extractSize(currentNorm);

    const group = [current];
    processed.add(i);

    for (let j = i + 1; j < products.length; j++) {
      if (processed.has(j)) continue;

      const compare = products[j];
      const compareNorm = normalizeText(compare.title);
      const compareSize = extractSize(compareNorm);


      if (extractType(currentNorm) !== extractType(compareNorm) || !isSameSize(currentSize, compareSize)) 
      {
        continue;
      }


      const similarity = stringSimilarity.compareTwoStrings(currentNorm, compareNorm);
      
      if (similarity >= threshold) {
        group.push(compare);
        processed.add(j);
      }
    }

    groups.push(group);
  }

  return groups;
}

  // Função para categorizar e agrupar os produtos
  function categorizeProduct(data) {
    let result = [];
  
    // Agrupando os produtos por categoria
    let categories = groupProducts(data);
  
    categories.forEach(group => {
      let category = group[0].title;
      result.push({
        category: category,
        count: group.length,
        products: group.map(product => ({
          title: product.title,
          supermarket: product.supermarket
        }))
      });
    });
  
    return result;
  }
  
  // Ler o arquivo JSON e processar os dados
  fs.readFile('data01.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }
  
    try {
      const jsonData = JSON.parse(data);
      const resultado = categorizeProduct(jsonData);
      console.log(JSON.stringify(resultado, null, 2));
    } catch (error) {
      console.error('Erro ao processar JSON:', error);
    }
  });
  
  