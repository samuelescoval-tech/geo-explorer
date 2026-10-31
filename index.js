#!/usr/bin/env node

const { trilha } = require('./comandos/trilha');
const { desafio } = require('./comandos/desafio');
const { certificado } = require('./comandos/certificado');

const [,, comando, ...args] = process.argv;

const comandos = {
  trilha,
  desafio,
  certificado,
};

if (!comando) {
  console.error('\nUso: geo-explorer <comando> [args]');
  console.error('Comandos disponíveis: trilha, desafio, certificado\n');
  process.exit(1);
}

if (!comandos[comando]) {
  console.error(`\nComando "${comando}" não reconhecido.`);
  console.error(`Comandos disponíveis: ${Object.keys(comandos).join(', ')}\n`);
  process.exit(1);
}

comandos[comando](args);
