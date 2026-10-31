const assert = require('assert');
const { listarTrilhas, mostrarTrilha } = require('../comandos/trilha');

// Captura stdout/stderr para testes silenciosos
function capturarSaida(fn) {
  const saidas = [];
  const erros = [];
  const stdoutOrig = process.stdout.write.bind(process.stdout);
  const stderrOrig = process.stderr.write.bind(process.stderr);
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

// Teste 1: listarTrilhas exibe JavaScript e Python
{
  const { saidas } = capturarSaida(() => listarTrilhas());
  const texto = saidas.join('\n');
  assert.ok(texto.includes('JavaScript'), 'Deve listar JavaScript');
  assert.ok(texto.includes('Python'), 'Deve listar Python');
  assert.ok(texto.includes('iniciante'), 'Deve exibir níveis');
  console.log('✔ listarTrilhas exibe JavaScript e Python');
}

// Teste 2: mostrarTrilha — JavaScript iniciante
{
  const { saidas } = capturarSaida(() => mostrarTrilha('JavaScript', 'iniciante'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('JavaScript'), 'Deve mostrar tecnologia');
  assert.ok(texto.includes('iniciante'), 'Deve mostrar o nível');
  assert.ok(texto.includes('Variáveis e tipos'), 'Deve mostrar módulo');
  assert.ok(texto.includes('inverte uma string'), 'Deve mostrar o desafio');
  console.log('✔ mostrarTrilha — JavaScript iniciante');
}

// Teste 3: mostrarTrilha — Python avancado
{
  const { saidas } = capturarSaida(() => mostrarTrilha('Python', 'avancado'));
  const texto = saidas.join('\n');
  assert.ok(texto.includes('Python'), 'Deve mostrar tecnologia');
  assert.ok(texto.includes('avancado'), 'Deve mostrar o nível');
  assert.ok(texto.includes('Decorators'), 'Deve mostrar módulo avançado');
  assert.ok(texto.includes('memoize'), 'Deve mostrar o desafio avançado');
  console.log('✔ mostrarTrilha — Python avancado');
}

// Teste 4: tecnologia inexistente deve chamar process.exit(1)
{
  const exitOrig = process.exit;
  let exitChamado = false;
  process.exit = (code) => { exitChamado = true; throw new Error('exit:' + code); };

  try {
    capturarSaida(() => mostrarTrilha('Ruby', 'iniciante'));
  } catch (e) { /* saída esperada */ }

  process.exit = exitOrig;
  assert.ok(exitChamado, 'Deve chamar process.exit para tecnologia inexistente');
  console.log('✔ mostrarTrilha — tecnologia inexistente chama process.exit');
}

// Teste 5: nível inexistente deve chamar process.exit(1)
{
  const exitOrig = process.exit;
  let exitChamado = false;
  process.exit = (code) => { exitChamado = true; throw new Error('exit:' + code); };

  try {
    capturarSaida(() => mostrarTrilha('JavaScript', 'expert'));
  } catch (e) { /* saída esperada */ }

  process.exit = exitOrig;
  assert.ok(exitChamado, 'Deve chamar process.exit para nível inexistente');
  console.log('✔ mostrarTrilha — nível inexistente chama process.exit');
}

console.log('\nTodos os testes passaram.\n');
