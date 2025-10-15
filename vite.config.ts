import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Adiciona uma configuração de proxy para o desenvolvimento local.
        // Isso faz com que as chamadas para /api no servidor de dev
        // sejam redirecionadas para a porta onde a função serverless está rodando.
        // Para Vercel, o `vercel dev` lida com isso automaticamente.
        // Isso é uma boa prática para ambientes de desenvolvimento genéricos.
        proxy: {
          '/api': {
            target: 'http://localhost:5328', // Porta padrão para Vercel dev
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      // A chave de API foi REMOVIDA daqui para garantir a segurança.
      // A propriedade 'define' foi completamente removida.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
