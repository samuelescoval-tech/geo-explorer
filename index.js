#!/usr/bin/env node

const { trilha } = require('./comandos/trilha');
const { desafio } = require('./comandos/desafio');

const [,, comando, ...args] = process.argv;

const comandos = {
  trilha,
  desafio,
};

if (!comando) {
  console.error('\nUso: geo-explorer <comando> [args]');
  console.error('Comandos disponíveis: trilha, desafio\n');
  process.exit(1);
}

if (!comandos[comando]) {
  console.error(`\nComando "${comando}" não reconhecido.`);
  console.error(`Comandos disponíveis: ${Object.keys(comandos).join(', ')}\n`);
  process.exit(1);
}

comandos[comando](args);
