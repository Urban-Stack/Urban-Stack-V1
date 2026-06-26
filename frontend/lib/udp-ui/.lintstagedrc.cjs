module.exports = {
  '*.{js,jsx,ts,tsx}': ['pnpm run format:fix', 'pnpm run lint:fix'],
  '*.{cjs,json,css,scss,htm,html,md,yml,yaml}': 'pnpm run format:fix',
};
