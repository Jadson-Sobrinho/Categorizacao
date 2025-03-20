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
  
  