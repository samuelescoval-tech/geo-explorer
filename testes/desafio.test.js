const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ── arquivo temporário isolado — nunca toca dados/progresso.json ──────────────
const PROGRESSO_TMP = path.join(__dirname, '..', 'dados', 'progresso.desafio.test.json');
process.env.PROGRESSO_PATH = PROGRESSO_TMP;

const { mostrarDesafio, concluirDesafio, statusDesafios } = require('../comandos/desafio');

// ── utilidades de teste ───────────────────────────────────────────────────────

function capturarSaida(fn) {
  const saidas = [];
  const erros = [];
  const logOrig = console.log.bind(console);
  const errorOrig = console.error.bind(console);

  console.log = (...args) => saidas.push(args.join(' '));
  console.error = (...args) => erros.push(args.join(' '));

  try {
    fn();
  } finally {
    console.log = logOrig;
    console.error = errorOrig;
  }

  return { saidas, erros };
}

function mockExit(fn) {
  const exitOrig = process.exit;
  let exitChamado = false;
  process.exit = () => { exitChamado = true; throw new Error('exit'); };
  try { fn(); } catch (e) { /* saída esperada */ }
  process.exit = exitOrig;
  return exitChamado;
}

function setProgresso(concluidos) {
  fs.writeFileSync(
    PROGRESSO_TMP,
    JSON.stringify({ concluidos }, null, 2) + '\n',
    'utf-8'
  );
}

// ── Teste 1: mostrarDesafio exibe enunciado e status pendente ─────────────────
{
  setProgresso([]);
  const { saidas } = capturarSaida(() => mostrarDesafio('JavaScript', 'iniciante'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('JavaScript'), 'Deve mostrar a tecnologia');
  assert.ok(texto.includes('iniciante'), 'Deve mostrar o nível');
  assert.ok(texto.includes('inverte uma string'), 'Deve mostrar o enunciado');
  assert.ok(texto.includes('pendente'), 'Status deve ser pendente antes de concluir');
  console.log('✔ mostrarDesafio — exibe enunciado e status pendente');
}

// ── Teste 2: concluirDesafio persiste no disco e confirma ─────────────────────
{
  setProgresso([]);
  const { saidas } = capturarSaida(() => concluirDesafio('JavaScript', 'iniciante'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('concluído'), 'Deve confirmar conclusão');

  const progresso = JSON.parse(fs.readFileSync(PROGRESSO_TMP, 'utf-8'));
  assert.ok(
    progresso.concluidos.includes('javascript:iniciante'),
    'Deve persistir a chave no arquivo temporário'
  );
  console.log('✔ concluirDesafio — persiste no disco e confirma');
}

// ── Teste 3: mostrarDesafio exibe status concluído após marcar ────────────────
{
  setProgresso([]);
  capturarSaida(() => concluirDesafio('Python', 'avancado'));
  const { saidas } = capturarSaida(() => mostrarDesafio('Python', 'avancado'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('concluído'), 'Status deve ser concluído após marcar');
  console.log('✔ mostrarDesafio — exibe status concluído após marcar');
}

// ── Teste 4: concluirDesafio duas vezes não duplica a entrada ─────────────────
{
  setProgresso([]);
  capturarSaida(() => concluirDesafio('Python', 'intermediario'));
  capturarSaida(() => concluirDesafio('Python', 'intermediario'));
  const progresso = JSON.parse(fs.readFileSync(PROGRESSO_TMP, 'utf-8'));
  const ocorrencias = progresso.concluidos.filter(k => k === 'python:intermediario').length;
  assert.strictEqual(ocorrencias, 1, 'Não deve duplicar entradas no progresso');
  console.log('✔ concluirDesafio — não duplica entradas');
}

// ── Teste 5: statusDesafios exibe todas as tecnologias e níveis ───────────────
{
  setProgresso([]);
  const { saidas } = capturarSaida(() => statusDesafios());
  const texto = saidas.join('\n');
  assert.ok(texto.includes('JavaScript'), 'Deve listar JavaScript');
  assert.ok(texto.includes('Python'), 'Deve listar Python');
  assert.ok(texto.includes('iniciante'), 'Deve listar o nível iniciante');
  assert.ok(texto.includes('avancado'), 'Deve listar o nível avancado');
  console.log('✔ statusDesafios — exibe todas as tecnologias e níveis');
}

// ── Teste 6: tecnologia inexistente chama process.exit ────────────────────────
{
  setProgresso([]);
  const saiu = mockExit(() => capturarSaida(() => mostrarDesafio('Ruby', 'iniciante')));
  assert.ok(saiu, 'Deve chamar process.exit para tecnologia inexistente');
  console.log('✔ mostrarDesafio — tecnologia inexistente chama process.exit');
}

// ── Teste 7: nível inexistente chama process.exit ─────────────────────────────
{
  setProgresso([]);
  const saiu = mockExit(() => capturarSaida(() => mostrarDesafio('JavaScript', 'expert')));
  assert.ok(saiu, 'Deve chamar process.exit para nível inexistente');
  console.log('✔ mostrarDesafio — nível inexistente chama process.exit');
}

// ── Limpeza — remove arquivo temporário ──────────────────────────────────────
fs.unlinkSync(PROGRESSO_TMP);

console.log('\nTodos os testes passaram.\n');
