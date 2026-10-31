const fs = require('fs');
const path = require('path');

const TRILHAS_PATH = path.join(__dirname, '..', 'dados', 'trilhas.json');
const PROGRESSO_PATH = path.join(__dirname, '..', 'dados', 'progresso.json');

// ── helpers de dados ──────────────────────────────────────────────────────────

function carregarTrilhas() {
  return JSON.parse(fs.readFileSync(TRILHAS_PATH, 'utf-8')).trilhas;
}

function carregarProgresso() {
  return JSON.parse(fs.readFileSync(PROGRESSO_PATH, 'utf-8'));
}

function salvarProgresso(progresso) {
  fs.writeFileSync(PROGRESSO_PATH, JSON.stringify(progresso, null, 2) + '\n', 'utf-8');
}

function chave(tecnologia, nivel) {
  return `${tecnologia.toLowerCase()}:${nivel.toLowerCase()}`;
}

function resolverTrilhaENivel(tecnologia, nivel) {
  const trilhas = carregarTrilhas();
  const trilha = trilhas.find(
    t => t.tecnologia.toLowerCase() === tecnologia.toLowerCase()
  );

  if (!trilha) {
    console.error(`\nTrilha "${tecnologia}" não encontrada.`);
    console.error('Use "trilha --listar" para ver as trilhas disponíveis.\n');
    process.exit(1);
  }

  const nivelNorm = nivel ? nivel.toLowerCase() : 'iniciante';

  if (!trilha.niveis.includes(nivelNorm)) {
    console.error(`\nNível "${nivel}" não existe para a trilha ${trilha.tecnologia}.`);
    console.error(`Níveis disponíveis: ${trilha.niveis.join(', ')}\n`);
    process.exit(1);
  }

  return { trilha, nivel: nivelNorm };
}

// ── funções públicas ──────────────────────────────────────────────────────────

function mostrarDesafio(tecnologia, nivel) {
  const { trilha, nivel: nivelNorm } = resolverTrilhaENivel(tecnologia, nivel);
  const desafio = trilha.desafios[nivelNorm];
  const progresso = carregarProgresso();
  const concluido = progresso.concluidos.includes(chave(tecnologia, nivelNorm));

  console.log(`\n=== Desafio: ${trilha.tecnologia} — ${nivelNorm} ===\n`);
  console.log(`  ${desafio}\n`);
  console.log(`  Status: ${concluido ? '✔ concluído' : '○ pendente'}\n`);
}

function concluirDesafio(tecnologia, nivel) {
  const { trilha, nivel: nivelNorm } = resolverTrilhaENivel(tecnologia, nivel);
  const progresso = carregarProgresso();
  const k = chave(tecnologia, nivelNorm);

  if (progresso.concluidos.includes(k)) {
    console.log(`\nDesafio ${trilha.tecnologia} — ${nivelNorm} já estava marcado como concluído.\n`);
    return;
  }

  progresso.concluidos.push(k);
  salvarProgresso(progresso);
  console.log(`\n✔ Desafio ${trilha.tecnologia} — ${nivelNorm} marcado como concluído!\n`);
}

function statusDesafios() {
  const trilhas = carregarTrilhas();
  const progresso = carregarProgresso();

  console.log('\nStatus dos desafios:\n');
  trilhas.forEach(t => {
    console.log(`  ${t.tecnologia}`);
    t.niveis.forEach(n => {
      const k = chave(t.tecnologia, n);
      const feito = progresso.concluidos.includes(k);
      console.log(`    ${feito ? '✔' : '○'} ${n}`);
    });
  });
  console.log('');
}

// ── dispatcher ────────────────────────────────────────────────────────────────

function desafio(args) {
  if (args.includes('--status') || args.includes('-s')) {
    statusDesafios();
    return;
  }

  if (args.includes('--concluir') || args.includes('-c')) {
    const idx = args.indexOf('--concluir') !== -1
      ? args.indexOf('--concluir')
      : args.indexOf('-c');
    const tecnologia = args[idx + 1];
    const nivel = args[idx + 2] || 'iniciante';

    if (!tecnologia) {
      console.error('\nUso: desafio --concluir <tecnologia> [nivel]\n');
      process.exit(1);
    }

    concluirDesafio(tecnologia, nivel);
    return;
  }

  const tecnologia = args[0];

  if (!tecnologia) {
    console.error('\nUso: desafio <tecnologia> [nivel]');
    console.error('     desafio --concluir <tecnologia> [nivel]');
    console.error('     desafio --status\n');
    process.exit(1);
  }

  const nivel = args[1] || 'iniciante';
  mostrarDesafio(tecnologia, nivel);
}

module.exports = { desafio, mostrarDesafio, concluirDesafio, statusDesafios };
