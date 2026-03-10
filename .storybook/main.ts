import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Reuse the same aliases from vite.config.ts
    const { dirname, resolve } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const root = resolve(__dirname, '..');

    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(root, './src'),
      '@components': resolve(root, './src/components'),
      '@features': resolve(root, './src/features'),
      '@services': resolve(root, './src/services'),
      '@stores': resolve(root, './src/stores'),
      '@hooks': resolve(root, './src/hooks'),
      '@utils': resolve(root, './src/utils'),
      '@types': resolve(root, './src/types'),
      '@assets': resolve(root, './src/assets'),
      '@config': resolve(root, './src/config'),
      '@i18n': resolve(root, './src/i18n'),
    };

    return config;
  },
};

export default config;
