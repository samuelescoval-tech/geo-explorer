#!/usr/bin/env node

'use strict';

const { McpServer } = require('@modelcontextprotocol/server');
const { StdioServerTransport } = require('@modelcontextprotocol/server/stdio');
const { z } = require('zod/v4');

const { listarTrilhas, mostrarTrilha } = require('../comandos/trilha');
const { mostrarDesafio, concluirDesafio, statusDesafios } = require('../comandos/desafio');
const { verificarCertificado, listarCertificados } = require('../comandos/certificado');

// ── captura console.log das funções de comandos e devolve como string ─────────

function capturar(fn) {
  const linhas = [];
  const orig = console.log.bind(console);
  console.log = (...args) => linhas.push(args.join(' '));
  try { fn(); } finally { console.log = orig; }
  return linhas.join('\n').trim();
}

// ── servidor ──────────────────────────────────────────────────────────────────

const server = new McpServer({ name: 'geo-explorer', version: '1.0.0' });

// 1. listar_trilhas
server.registerTool(
  'listar_trilhas',
  {
    description: 'Lista todas as trilhas de aprendizado disponíveis com seus níveis.',
    inputSchema: z.object({}),
  },
  async () => ({
    content: [{ type: 'text', text: capturar(() => listarTrilhas()) }],
  })
);

// 2. mostrar_trilha
server.registerTool(
  'mostrar_trilha',
  {
    description: 'Exibe os módulos e o desafio de uma trilha em um nível específico.',
    inputSchema: z.object({
      tecnologia: z.string().describe('Nome da tecnologia, ex: JavaScript, Python'),
      nivel: z.string().default('iniciante').describe('Nível: iniciante, intermediario ou avancado'),
    }),
  },
  async ({ tecnologia, nivel }) => {
    try {
      return { content: [{ type: 'text', text: capturar(() => mostrarTrilha(tecnologia, nivel)) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: String(e.message) }], isError: true };
    }
  }
);

// 3. mostrar_desafio
server.registerTool(
  'mostrar_desafio',
  {
    description: 'Exibe o enunciado e o status de conclusão de um desafio.',
    inputSchema: z.object({
      tecnologia: z.string().describe('Nome da tecnologia'),
      nivel: z.string().default('iniciante').describe('Nível do desafio'),
    }),
  },
  async ({ tecnologia, nivel }) => {
    try {
      return { content: [{ type: 'text', text: capturar(() => mostrarDesafio(tecnologia, nivel)) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: String(e.message) }], isError: true };
    }
  }
);

// 4. concluir_desafio
server.registerTool(
  'concluir_desafio',
  {
    description: 'Marca um desafio como concluído e persiste o progresso em dados/progresso.json.',
    inputSchema: z.object({
      tecnologia: z.string().describe('Nome da tecnologia'),
      nivel: z.string().default('iniciante').describe('Nível do desafio a concluir'),
    }),
  },
  async ({ tecnologia, nivel }) => {
    try {
      return { content: [{ type: 'text', text: capturar(() => concluirDesafio(tecnologia, nivel)) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: String(e.message) }], isError: true };
    }
  }
);

// 5. status_desafios
server.registerTool(
  'status_desafios',
  {
    description: 'Exibe o status de conclusão (✔/○) de todos os desafios de todas as trilhas.',
    inputSchema: z.object({}),
  },
  async () => ({
    content: [{ type: 'text', text: capturar(() => statusDesafios()) }],
  })
);

// 6. verificar_certificado
server.registerTool(
  'verificar_certificado',
  {
    description: 'Verifica se todos os desafios de uma trilha foram concluídos e emite o certificado.',
    inputSchema: z.object({
      tecnologia: z.string().describe('Nome da tecnologia'),
    }),
  },
  async ({ tecnologia }) => {
    try {
      return { content: [{ type: 'text', text: capturar(() => verificarCertificado(tecnologia)) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: String(e.message) }], isError: true };
    }
  }
);

// 7. listar_certificados
server.registerTool(
  'listar_certificados',
  {
    description: 'Lista o status de certificação (disponível / x/n níveis) de todas as trilhas.',
    inputSchema: z.object({}),
  },
  async () => ({
    content: [{ type: 'text', text: capturar(() => listarCertificados()) }],
  })
);

// ── inicialização ─────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('geo-explorer MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
