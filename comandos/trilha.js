const fs = require('fs');
const path = require('path');

const TRILHAS_PATH = path.join(__dirname, '..', 'dados', 'trilhas.json');

function carregarTrilhas() {
  const conteudo = fs.readFileSync(TRILHAS_PATH, 'utf-8');
  return JSON.parse(conteudo).trilhas;
}

function listarTrilhas() {
  const trilhas = carregarTrilhas();
  console.log('\nTrilhas disponíveis:\n');
  trilhas.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.tecnologia}`);
    console.log(`     Níveis: ${t.niveis.join(', ')}`);
  });
  console.log('');
}

function mostrarTrilha(tecnologia, nivel) {
  const trilhas = carregarTrilhas();
  const trilha = trilhas.find(
    t => t.tecnologia.toLowerCase() === tecnologia.toLowerCase()
  );

  if (!trilha) {
    console.error(`\nTrilha "${tecnologia}" não encontrada.`);
    console.error('Use "trilha --listar" para ver as trilhas disponíveis.\n');
    process.exit(1);
  }

  const nivelNormalizado = nivel ? nivel.toLowerCase() : 'iniciante';

  if (!trilha.niveis.includes(nivelNormalizado)) {
    console.error(`\nNível "${nivel}" não existe para a trilha ${trilha.tecnologia}.`);
    console.error(`Níveis disponíveis: ${trilha.niveis.join(', ')}\n`);
    process.exit(1);
  }

  const modulos = trilha.modulos[nivelNormalizado];
  const desafio = trilha.desafios[nivelNormalizado];

  console.log(`\n=== Trilha: ${trilha.tecnologia} — ${nivelNormalizado} ===\n`);
  console.log('Módulos:');
  modulos.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
  console.log(`\nDesafio:\n  ${desafio}\n`);
}

function trilha(args) {
  if (args.includes('--listar') || args.includes('-l')) {
    listarTrilhas();
    return;
  }

  const tecnologia = args[0];

  if (!tecnologia) {
    console.error('\nUso: trilha <tecnologia> [nivel]');
    console.error('     trilha --listar\n');
    process.exit(1);
  }

  const nivel = args[1] || 'iniciante';
  mostrarTrilha(tecnologia, nivel);
}

module.exports = { trilha, listarTrilhas, mostrarTrilha };
