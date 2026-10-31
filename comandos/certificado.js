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

function chave(tecnologia, nivel) {
  return `${tecnologia.toLowerCase()}:${nivel.toLowerCase()}`;
}

// Retorna os níveis pendentes de uma trilha. Array vazio = todos concluídos.
function niveisPendentes(trilha, concluidos) {
  return trilha.niveis.filter(n => !concluidos.includes(chave(trilha.tecnologia, n)));
}

// ── funções públicas ──────────────────────────────────────────────────────────

function verificarCertificado(tecnologia) {
  const trilhas = carregarTrilhas();
  const trilha = trilhas.find(
    t => t.tecnologia.toLowerCase() === tecnologia.toLowerCase()
  );

  if (!trilha) {
    console.error(`\nTrilha "${tecnologia}" não encontrada.`);
    console.error('Use "trilha --listar" para ver as trilhas disponíveis.\n');
    process.exit(1);
  }

  const { concluidos } = carregarProgresso();
  const pendentes = niveisPendentes(trilha, concluidos);

  if (pendentes.length > 0) {
    console.log(`\n✗ Certificado de ${trilha.tecnologia} ainda não disponível.\n`);
    console.log('  Níveis pendentes:');
    pendentes.forEach(n => console.log(`    ○ ${n}`));
    console.log('');
    return false;
  }

  const linha = '─'.repeat(46);
  console.log(`\n${linha}`);
  console.log('  CERTIFICADO DE CONCLUSÃO');
  console.log(linha);
  console.log(`  Trilha    : ${trilha.tecnologia}`);
  console.log(`  Níveis    : ${trilha.niveis.join(', ')}`);
  console.log(`  Status    : todos os desafios concluídos ✔`);
  console.log(`${linha}\n`);
  return true;
}

function listarCertificados() {
  const trilhas = carregarTrilhas();
  const { concluidos } = carregarProgresso();

  console.log('\nCertificados:\n');
  trilhas.forEach(t => {
    const pendentes = niveisPendentes(t, concluidos);
    const total = t.niveis.length;
    const feitos = total - pendentes.length;
    const status = pendentes.length === 0 ? '✔ disponível' : `○ ${feitos}/${total} níveis`;
    console.log(`  ${t.tecnologia.padEnd(14)} ${status}`);
  });
  console.log('');
}

// ── dispatcher ────────────────────────────────────────────────────────────────

function certificado(args) {
  if (args.includes('--listar') || args.includes('-l')) {
    listarCertificados();
    return;
  }

  const tecnologia = args[0];

  if (!tecnologia) {
    console.error('\nUso: certificado <tecnologia>');
    console.error('     certificado --listar\n');
    process.exit(1);
  }

  verificarCertificado(tecnologia);
}

module.exports = { certificado, verificarCertificado, listarCertificados, niveisPendentes };
