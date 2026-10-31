const assert = require('assert');
const fs = require('fs');
const path = require('path');

const PROGRESSO_PATH = path.join(__dirname, '..', 'dados', 'progresso.json');
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

// Reinicia progresso.json antes de cada grupo de testes que escreve no disco
function resetarProgresso() {
  fs.writeFileSync(PROGRESSO_PATH, JSON.stringify({ concluidos: [] }, null, 2) + '\n', 'utf-8');
}

// ── Teste 1: mostrarDesafio exibe enunciado e status pendente ─────────────────
{
  resetarProgresso();
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
  resetarProgresso();
  const { saidas } = capturarSaida(() => concluirDesafio('JavaScript', 'iniciante'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('concluído'), 'Deve confirmar conclusão');

  const progresso = JSON.parse(fs.readFileSync(PROGRESSO_PATH, 'utf-8'));
  assert.ok(
    progresso.concluidos.includes('javascript:iniciante'),
    'Deve persistir a chave no progresso.json'
  );
  console.log('✔ concluirDesafio — persiste no disco e confirma');
}

// ── Teste 3: mostrarDesafio exibe status concluído após marcar ────────────────
{
  resetarProgresso();
  capturarSaida(() => concluirDesafio('Python', 'avancado'));
  const { saidas } = capturarSaida(() => mostrarDesafio('Python', 'avancado'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('concluído'), 'Status deve ser concluído após marcar');
  console.log('✔ mostrarDesafio — exibe status concluído após marcar');
}

// ── Teste 4: concluirDesafio duas vezes não duplica a entrada ─────────────────
{
  resetarProgresso();
  capturarSaida(() => concluirDesafio('Python', 'intermediario'));
  capturarSaida(() => concluirDesafio('Python', 'intermediario'));
  const progresso = JSON.parse(fs.readFileSync(PROGRESSO_PATH, 'utf-8'));
  const ocorrencias = progresso.concluidos.filter(k => k === 'python:intermediario').length;
  assert.strictEqual(ocorrencias, 1, 'Não deve duplicar entradas no progresso');
  console.log('✔ concluirDesafio — não duplica entradas');
}

// ── Teste 5: statusDesafios exibe todas as tecnologias e níveis ───────────────
{
  resetarProgresso();
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
  resetarProgresso();
  const saiu = mockExit(() => capturarSaida(() => mostrarDesafio('Ruby', 'iniciante')));
  assert.ok(saiu, 'Deve chamar process.exit para tecnologia inexistente');
  console.log('✔ mostrarDesafio — tecnologia inexistente chama process.exit');
}

// ── Teste 7: nível inexistente chama process.exit ─────────────────────────────
{
  resetarProgresso();
  const saiu = mockExit(() => capturarSaida(() => mostrarDesafio('JavaScript', 'expert')));
  assert.ok(saiu, 'Deve chamar process.exit para nível inexistente');
  console.log('✔ mostrarDesafio — nível inexistente chama process.exit');
}

// ── Limpeza ───────────────────────────────────────────────────────────────────
resetarProgresso();

console.log('\nTodos os testes passaram.\n');
