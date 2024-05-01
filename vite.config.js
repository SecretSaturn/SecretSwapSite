import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          '@babel/plugin-transform-react-jsx',
          ['@babel/plugin-transform-typescript', { allowDeclareFields: true }]
        ],
        presets: ['@babel/preset-typescript'],
      }
    })
  ]
});
