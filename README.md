# geo-explorer

CLI para explorar trilhas de aprendizado, acompanhar desafios e emitir certificados de conclusão.

## Requisitos

- Node.js 18 ou superior (usa `node --test` nativo)
- Sem dependências externas — apenas módulos da biblioteca padrão

## Instalação

```bash
git clone https://github.com/samuelescoval-tech/geo-explorer.git
cd geo-explorer
```

Nenhum `npm install` necessário.

## Uso

```bash
node index.js <comando> [argumentos]
```

### `trilha` — explorar trilhas de aprendizado

```bash
# Listar todas as trilhas disponíveis
node index.js trilha --listar

# Ver módulos e desafio de uma trilha (nível padrão: iniciante)
node index.js trilha JavaScript
node index.js trilha Python intermediario
node index.js trilha JavaScript avancado
```

### `desafio` — acompanhar desafios

```bash
# Ver enunciado e status de um desafio
node index.js desafio JavaScript iniciante

# Marcar um desafio como concluído (persiste em dados/progresso.json)
node index.js desafio --concluir JavaScript iniciante
node index.js desafio --concluir Python avancado

# Ver status de todos os desafios de todas as trilhas
node index.js desafio --status
```

### `certificado` — verificar e listar certificados

```bash
# Verificar se uma trilha está completa e exibir o certificado
node index.js certificado JavaScript

# Listar o status de certificação de todas as trilhas
node index.js certificado --listar
```

Um certificado é emitido quando todos os níveis da trilha (iniciante, intermediario, avancado) têm o desafio marcado como concluído.

## Testes

```bash
npm test
```

Executa todos os arquivos `*.test.js` dentro de `testes/` via `node --test`.  
Cada arquivo de teste usa um arquivo temporário isolado (`dados/progresso.*.test.json`) e nunca toca `dados/progresso.json`.

## Estrutura do projeto

```
geo-explorer/
├── index.js                  # Entry point — lê argv e despacha para o comando
├── package.json
├── comandos/
│   ├── trilha.js             # listarTrilhas, mostrarTrilha
│   ├── desafio.js            # mostrarDesafio, concluirDesafio, statusDesafios
│   └── certificado.js        # verificarCertificado, listarCertificados
├── dados/
│   ├── trilhas.json          # Trilhas, módulos e desafios por nível (somente leitura)
│   └── progresso.json        # Estado persistente de desafios concluídos
├── testes/
│   ├── trilha.test.js
│   ├── desafio.test.js
│   └── certificado.test.js
└── docs/
```

## Trilhas disponíveis

| Tecnologia | Níveis |
|---|---|
| JavaScript | iniciante, intermediario, avancado |
| Python | iniciante, intermediario, avancado |

## Dados e persistência

O progresso do usuário é salvo em `dados/progresso.json` como uma lista de chaves no formato `tecnologia:nivel` (ex.: `javascript:iniciante`). O arquivo começa vazio e é atualizado pelo comando `desafio --concluir`. Não há banco de dados nem dependência de rede.
