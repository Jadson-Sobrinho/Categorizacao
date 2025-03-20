const fs = require('fs');
const stringSimilarity = require('string-similarity');


const wordsToDiference = ['integral', 'desnatado', 'sem lactose', 'zero', 'light'];


function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')  //tira caracteres especiais
    .replace(/\s+/g, ' ')  //tira espaços extras
    .trim();
}


function extractSize(text) {
  const regex = /(\d+(\.\d+)?\s?(kg|g|l|ml))/i; //verificar se tem pacotes e mg
  const match = text.match(regex);
  return match ? match[0] : null;
}


//extrair marca do produto
function extractBrand(text) {
    const words = text.split(' ');
    return words.length > 2 ? words[words.length - 2] : null;
  }



//extrair o tipo do porduto: integral', 'desnatado', 'sem lactose', 'zero', 'light
function extractType(text) {
    return wordsToDiference.find(word => text.includes(word)) || null;
}
  


//agrupar produtos semelhantes
function groupProducts(product, threshold = 0.8) {
    let groups = [];
    let processed = new Set();
  
    for (let i = 0; i < product.length; i++) {
      if (processed.has(i)) continue;
  
      let actualProduct = product[i];
      let normalizedName = normalizeText(actualProduct.title);
      let actualSize = extractSize(normalizedName);
      let actualBrand = extractBrand(normalizedName);
      let actualType = extractType(normalizedName);
  
      let group = [actualProduct];
      processed.add(i);
  
      for (let j = i + 1; j < product.length; j++) {
        if (processed.has(j)) continue;
  
        let comparedName = normalizeText(product[j].title);
        let comparedSize = extractSize(comparedName);
        let comparedBrand = extractBrand(comparedName);
        let comparedType = extractType(comparedName);
  
        let similarity = stringSimilarity.compareTwoStrings(normalizedName, comparedName);
  


        /* Regras de comparação
        *
        * Tipos diferentes (integral vs. desnatado).
        * Marcas diferentes (Italac vs. Piracanjuba).
        * Tamanhos/quantidades diferentes (1L vs. 2L).
        *
        */

        if (actualType !== comparedType) continue;
        if (actualBrand !== comparedBrand) continue;
        if (actualSize !== comparedSize) continue;
        
        
        if (similarity >= threshold) {
          group.push(product[j]);
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
  
  