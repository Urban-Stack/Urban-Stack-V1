const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --file ${filenames
    .map((f) => path.relative(__dirname, f))
    .join(' --file ')}`;

module.exports = {
  '*.{js,jsx,ts,tsx}': [
    buildEslintCommand,
    'node_modules/.bin/prettier --write --ignore-path .gitignore',
  ],
  '*.{cjs,json,css,scss,htm,html,md,yml,yaml}':
    'node_modules/.bin/prettier --write --ignore-path .gitignore',
  '*.nix': 'sh -c \'{ which alejandra || exit 0 ; } && alejandra "$@"\' -',
};
