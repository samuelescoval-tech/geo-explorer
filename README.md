# geo-explorer

CLI para explorar trilhas de aprendizado, acompanhar desafios e emitir
certificados de conclusão, com um servidor MCP que expõe os mesmos recursos
para outras ferramentas. Projeto desenvolvido como desafio de bootcamp,
construído etapa por etapa com apoio do agente IBM Bob, mas executado,
testado e versionado na mão.

## Como funciona

Cada tecnologia (JavaScript, Python) tem uma trilha dividida em três níveis
(iniciante, intermediario, avancado). Cada nível tem módulos de conteúdo e um
desafio. Você conclui os desafios em ordem, e quando os três níveis de uma
trilha estão completos, o programa emite o certificado daquela tecnologia. O
progresso fica salvo num arquivo JSON no próprio projeto, sem banco de dados
e sem rede.

Além da CLI, o projeto tem um servidor MCP (Model Context Protocol) que
expõe as mesmas funcionalidades como 7 tools para editores e agentes
compatíveis.

## Requisitos

Node.js 18 ou superior (usa o runner de testes nativo node --test).
Desenvolvido e testado na versão 22.

A CLI usa apenas módulos da biblioteca padrão e não precisa de npm install.
O servidor MCP tem duas dependências (@modelcontextprotocol/server e zod),
então para usá-lo é preciso rodar npm install uma vez.

## Instalação

git clone https://github.com/samuelescoval-tech/geo-explorer.git
cd geo-explorer

Para a CLI, o clone basta. Para o servidor MCP: npm install.

## Uso

node index.js &lt;comando&gt; [argumentos]

### trilha, explorar trilhas

# Listar todas as trilhas disponíveis
node index.js trilha --listar

# Ver módulos e desafio de uma trilha (nível padrão: iniciante)
node index.js trilha JavaScript
node index.js trilha Python intermediario
node index.js trilha JavaScript avancado

### desafio, acompanhar desafios

# Ver enunciado e status de um desafio
node index.js desafio JavaScript iniciante

# Marcar um desafio como concluído (persiste em dados/progresso.json)
node index.js desafio --concluir JavaScript iniciante

# Os níveis só concluem em ordem: este só passa porque iniciante já foi
node index.js desafio --concluir JavaScript intermediario
node index.js desafio --concluir JavaScript avancado

# Tentar pular a ordem é recusado, com mensagem dizendo o que falta:
# node index.js desafio --concluir JavaScript intermediario
# (com iniciante pendente) responde que é preciso concluir iniciante antes

# Ver status de todos os desafios de todas as trilhas
node index.js desafio --status

### certificado, verificar e listar certificados

# Verificar se uma trilha está completa e exibir o certificado
node index.js certificado JavaScript

# Listar o status de certificação de todas as trilhas
node index.js certificado --listar

Um certificado só é emitido quando os três níveis da trilha estão
concluídos. Se faltar algum, o comando lista o que está pendente em vez de
emitir.

## Testes

npm test

Roda os três arquivos de teste (21 testes no total) com o runner nativo.
Cada arquivo de teste usa um arquivo temporário próprio
(dados/progresso.*.test.json) e nunca toca o dados/progresso.json real.

## Servidor MCP

mcp/index.js implementa um servidor MCP sobre stdio com 7 tools:
listar_trilhas, mostrar_trilha, mostrar_desafio, concluir_desafio,
status_desafios, verificar_certificado e listar_certificados. As tools
reutilizam as funções de comandos/, sem lógica duplicada. Precisa de
npm install para rodar, por causa do SDK do MCP.

## Decisões técnicas

Persistência em JSON e não em banco de dados: para o tamanho e o propósito
deste projeto (uma lista de chaves tecnologia:nivel), um banco seria
complexidade sem retorno. Um arquivo JSON é legível, versionável no Git e
zero configuração.

process.exit em caso de erro: a CLI executa um único comando e termina. Se
a entrada é inválida, não faz sentido continuar o processo. Falhar rápido e
com mensagem clara é o comportamento correto para uma ferramenta de linha de
comando.

Caminho do arquivo de progresso via variável de ambiente (PROGRESSO_PATH):
o módulo lê o caminho uma vez, no carregamento. Se a variável existir, usa
ela, senão usa o arquivo real. Isso desbloqueou a isolação dos testes,
explicada abaixo.

Conclusão de níveis em ordem (melhoria da E9): uma trilha de estudo só faz
sentido em sequência, então concluirDesafio agora exige o nível anterior
concluído. A regra usa a ordem do array de níveis no trilhas.json, então
funciona para qualquer quantidade de níveis sem tocar no código.

## O que deu errado e como resolvi

Push recusado pelo GitHub (erro GH007): meus commits usavam um email que eu
mantinha privado na conta, e o GitHub recusou o push. Resolvi configurando o
email noreply da conta no git config. Depois descobri um detalhe pior: eu
estava usando um ID de exemplo no noreply, copiado de uma instrução que eu
segui, e o email real da conta tem outro ID. Commits com o ID errado não
conectam com a conta e não aparecem como meus no GitHub. Só percebi
comparando com um commit feito pelo site, que usava o ID certo. Lição: o ID
numérico do noreply é único da conta, confira o seu antes de configurar.

Commit que subiu quebrado: numa das etapas eu rodei git add, commit e push
depois que o npm test falhou, e o commit com o script de teste errado foi
parar no remoto. A lição virou regra de trabalho: só sobe depois de verde,
teste passando na minha máquina primeiro, push depois.

Testes que passavam sozinhos e falhavam juntos: os arquivos desafio.test.js
e certificado.test.js compartilhavam o mesmo dados/progresso.json no disco,
então o resultado dependia da ordem de execução e de resíduo de testes
anteriores. Resolvi fazendo cada módulo aceitar o caminho do arquivo via
variável de ambiente e cada teste apontar para um arquivo temporário próprio,
apagado ao final. Lição: teste que compartilha estado externo não é teste
independente, e teste que não é independente mente.

## Melhorias

Conclusão de níveis em ordem: antes, dava para marcar avancado direto sem
fazer os níveis anteriores. Agora o programa recusa e diz qual nível falta
antes. Motivo: progresso falso destrói o sentido do certificado. A regra é
genérica (usa a ordem dos níveis no trilhas.json), tem testes próprios e os
testes antigos que marcavam níveis altos foram ajustados para concluir na
ordem, como um usuário real faria.

## Estrutura do projeto

geo-explorer/
├── index.js                  # Entry point, lê argv e despacha para o comando
├── package.json
├── .gitignore                # Ignora node_modules/ e .bob/
├── comandos/
│   ├── trilha.js             # listarTrilhas, mostrarTrilha
│   ├── desafio.js            # mostrarDesafio, concluirDesafio, statusDesafios
│   └── certificado.js        # verificarCertificado, listarCertificados
├── dados/
│   ├── trilhas.json          # Trilhas, módulos e desafios por nível (só leitura)
│   └── progresso.json        # Estado persistente, começa vazio
├── mcp/
│   └── index.js              # Servidor MCP stdio com 7 tools
├── testes/
│   ├── trilha.test.js
│   ├── desafio.test.js
│   └── certificado.test.js
└── docs/

## Trilhas disponíveis

| Tecnologia | Níveis                                |
|------------|---------------------------------------|
| JavaScript | iniciante, intermediario, avancado    |
| Python     | iniciante, intermediario, avancado    |

## Licença

ISC