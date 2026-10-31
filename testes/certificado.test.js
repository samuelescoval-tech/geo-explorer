const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ── arquivo temporário isolado — nunca toca dados/progresso.json ──────────────
const PROGRESSO_TMP = path.join(__dirname, '..', 'dados', 'progresso.certificado.test.json');
process.env.PROGRESSO_PATH = PROGRESSO_TMP;

const { verificarCertificado, listarCertificados, niveisPendentes } = require('../comandos/certificado');

// ── utilidades de teste ───────────────────────────────────────────────────────

function capturarSaida(fn) {
  const saidas = [];
  const erros = [];
  const logOrig = console.log.bind(console);
  const errorOrig = console.error.bind(console);
  console.log = (...args) => saidas.push(args.join(' '));
  console.error = (...args) => erros.push(args.join(' '));
  try { fn(); } finally {
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

const TODOS_JS = ['javascript:iniciante', 'javascript:intermediario', 'javascript:avancado'];
const TODOS_PY = ['python:iniciante', 'python:intermediario', 'python:avancado'];

// ── Teste 1: certificado bloqueado quando há níveis pendentes ─────────────────
{
  setProgresso([]);
  const { saidas } = capturarSaida(() => verificarCertificado('JavaScript'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('não disponível'), 'Deve informar que o certificado não está disponível');
  assert.ok(texto.includes('iniciante'), 'Deve listar nível iniciante como pendente');
  assert.ok(texto.includes('intermediario'), 'Deve listar nível intermediario como pendente');
  assert.ok(texto.includes('avancado'), 'Deve listar nível avancado como pendente');
  console.log('✔ verificarCertificado — bloqueado com todos os níveis pendentes');
}

// ── Teste 2: certificado bloqueado com apenas alguns níveis concluídos ─────────
{
  setProgresso(['javascript:iniciante', 'javascript:intermediario']);
  const { saidas } = capturarSaida(() => verificarCertificado('JavaScript'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('não disponível'), 'Deve indicar que não está disponível');
  assert.ok(texto.includes('avancado'), 'Deve listar avancado como pendente');
  assert.ok(!texto.includes('iniciante'), 'Não deve listar iniciante como pendente');
  console.log('✔ verificarCertificado — bloqueado com nível avancado pendente');
}

// ── Teste 3: certificado emitido quando todos os níveis estão concluídos ───────
{
  setProgresso(TODOS_JS);
  const resultado = capturarSaida(() => verificarCertificado('JavaScript'));
  const texto = resultado.saidas.join('\n');
  assert.ok(texto.includes('CERTIFICADO'), 'Deve exibir o certificado');
  assert.ok(texto.includes('JavaScript'), 'Deve conter a tecnologia');
  assert.ok(texto.includes('todos os desafios concluídos'), 'Deve confirmar conclusão total');
  console.log('✔ verificarCertificado — emite certificado com todos os níveis concluídos');
}

// ── Teste 4: verificarCertificado retorna false quando bloqueado ───────────────
{
  setProgresso([]);
  let retorno;
  capturarSaida(() => { retorno = verificarCertificado('Python'); });
  assert.strictEqual(retorno, false, 'Deve retornar false quando há pendências');
  console.log('✔ verificarCertificado — retorna false quando bloqueado');
}

// ── Teste 5: verificarCertificado retorna true quando elegível ────────────────
{
  setProgresso(TODOS_JS);
  let retorno;
  capturarSaida(() => { retorno = verificarCertificado('JavaScript'); });
  assert.strictEqual(retorno, true, 'Deve retornar true quando todos os níveis estão concluídos');
  console.log('✔ verificarCertificado — retorna true quando elegível');
}

// ── Teste 6: listarCertificados exibe status correto para cada trilha ──────────
{
  setProgresso(TODOS_JS);
  const { saidas } = capturarSaida(() => listarCertificados());
  const texto = saidas.join('\n');
  assert.ok(texto.includes('JavaScript'), 'Deve listar JavaScript');
  assert.ok(texto.includes('Python'), 'Deve listar Python');
  // JS está completo → disponível; Python não → mostra fração
  assert.ok(texto.includes('disponível'), 'JavaScript deve aparecer como disponível');
  assert.ok(texto.includes('0/3'), 'Python deve aparecer com 0/3 níveis');
  console.log('✔ listarCertificados — exibe status correto para cada trilha');
}

// ── Teste 7: tecnologia inexistente chama process.exit ────────────────────────
{
  setProgresso([]);
  const saiu = mockExit(() => capturarSaida(() => verificarCertificado('Java')));
  assert.ok(saiu, 'Deve chamar process.exit para tecnologia inexistente');
  console.log('✔ verificarCertificado — tecnologia inexistente chama process.exit');
}

// ── Limpeza — remove arquivo temporário ──────────────────────────────────────
fs.unlinkSync(PROGRESSO_TMP);

console.log('\nTodos os testes passaram.\n');
