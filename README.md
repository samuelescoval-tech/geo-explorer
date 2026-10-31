# geo-explorer

CLI para explorar trilhas de aprendizado, acompanhar desafios e emitir
certificados de conclusão. Projeto desenvolvido como desafio de bootcamp,
construído etapa por etapa com acompanhamento de agente de IA (IBM Bob),
mas executado, testado e versionado na mão.

## Como funciona

A ideia é simples: cada tecnologia (JavaScript, Python) tem uma trilha
dividida em três níveis (iniciante, intermediario, avancado). Cada nível tem
módulos de conteúdo e um desafio. Você marca os desafios como concluídos
e, quando os três níveis de uma trilha estão completos, o programa emite o
certificado daquela tecnologia. O progresso fica salvo num arquivo JSON no
próprio projeto, sem banco de dados e sem rede.

## Requisitos

Node.js 18 ou superior (usa o runner de testes nativo `node --test`).
Desenvolvido e testado na versão 22.

Sem dependências externas, apenas módulos da biblioteca padrão. Por isso
não existe `npm install`.

## Instalação

git clone https://github.com/samuelescoval-tech/geo-explorer.git
cd geo-explorer

Pronto. Nenhum passo extra.

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
node index.js desafio --concluir Python avancado

# Ver status de todos os desafios de todas as trilhas
node index.js desafio --status

### certificado, verificar e listar certificados

# Verificar se uma trilha está completa e exibir o certificado
node index.js certificado JavaScript

# Listar o status de certificação de todas as trilhas
node index.js certificado --listar

Um certificado só é emitido quando os três níveis da trilha (iniciante,
intermediario, avancado) têm o desafio marcado como concluído. Se faltar
algum, o comando lista o que está pendente em vez de emitir.

## Testes

npm test

Roda os três arquivos de teste (19 testes no total) com o runner nativo.
Cada arquivo de teste usa um arquivo temporário próprio
(dados/progresso.*.test.json) e nunca toca o dados/progresso.json real.

## Decisões técnicas

Persistência em JSON e não em banco de dados: para o tamanho e o propósito
deste projeto (uma lista de chaves tecnologia:nivel), um banco seria
complexidade sem retorno. Um arquivo JSON é legível, versionável no Git e
zero configuração.

process.exit em caso de erro: a CLI executa um único comando e termina.
Se a entrada é inválida (tecnologia ou nível inexistente), não faz sentido
continuar o processo. Falhar rápido e com mensagem clara é o comportamento
correto para uma ferramenta de linha de comando.

Caminho do arquivo de progresso via variável de ambiente (PROGRESSO_PATH):
o módulo lê o caminho do arquivo uma vez, no carregamento. Se a variável
existir, usa ela. Se não, usa o arquivo real. Isso desbloqueou a isolação
dos testes, explicada na seção de aprendizados.

## O que deu errado e como resolvi

Push recusado pelo GitHub (erro GH007): meus commits usavam um email que
eu mantinha privado na conta, e o GitHub recusou o push. Resolvi sem tornar
o email público, configurando o email noreply da própria conta
(1234567+usuario@users.noreply.github.com) no git config. Lição: o autor do
commit e a privacidade da conta são duas coisas separadas, dá pra manter as
duas.

Commit que subiu quebrado: numa das etapas eu rodei git add, commit e push
depois que o npm test falhou. O commit com o script de teste errado foi
parar no remoto. A correção exigiu um commit posterior só para consertar.
A lição virou regra de trabalho: só sobe depois de verde, teste passando
na minha máquina primeiro, push depois.

Testes que passavam sozinhos e falhavam juntos: os arquivos desafio.test.js
e certificado.test.js compartilhavam o mesmo dados/progresso.json no disco.
O certificado.test.js esperava iniciante como pendente, mas o arquivo já
tinha iniciante concluído, gravado por um teste anterior. A falha dependia
da ordem e do resíduo no disco, então era não reproduzível de cara. Resolvi
fazendo cada módulo aceitar o caminho do arquivo de progresso via variável
de ambiente e cada teste apontar para um arquivo temporário próprio, que é
apagado ao final. Lição: teste que compartilha estado externo não é teste
independente, e teste que não é independente mente.

## Melhorias

Em construção (etapa de melhoria pessoal do desafio). Esta seção será
preenchida quando a melhoria estiver implementada e testada.

## Estrutura do projeto

geo-explorer/
├── index.js                  # Entry point, lê argv e despacha para o comando
├── package.json
├── comandos/
│   ├── trilha.js             # listarTrilhas, mostrarTrilha
│   ├── desafio.js            # mostrarDesafio, concluirDesafio, statusDesafios
│   └── certificado.js        # verificarCertificado, listarCertificados
├── dados/
│   ├── trilhas.json          # Trilhas, módulos e desafios por nível (só leitura)
│   └── progresso.json        # Estado persistente de desafios concluídos
├── testes/
│   ├── trilha.test.js
│   ├── desafio.test.js
│   └── certificado.test.js
└── docs/

## Trilhas disponíveis

| Tecnologia | Níveis                                  |
|------------|-----------------------------------------|
| JavaScript | iniciante, intermediario, avancado    |
| Python     | iniciante, intermediario, avancado    |

## Licença

ISC
