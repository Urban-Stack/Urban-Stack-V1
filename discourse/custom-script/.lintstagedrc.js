module.exports = {
  'src/*.{js,ts}': ['pnpm run format:fix', 'pnpm run lint:fix'],
  '*.json': 'pnpm run format:fix',
};
