const { build } = require('electron-builder');
const path = require('path');

build({
  config: {
    directories: {
      output: path.join(process.cwd(), 'release'),
      app: path.join(process.cwd(), 'dist'),
    },
  },
});

// Se você estiver no Windows, o comando NODE_ENV=development precisa ser ajustado para:
// {
//   "scripts": {
//     "electron:dev": "cross-env NODE_ENV=development tsc -p electron/tsconfig.electron.json && electron .",
//     "electron:build": "cross-env NODE_ENV=production tsc -p electron/tsconfig.electron.json && vite build && electron-builder"
//   }
// }
// E instale a dependência necessária:
// npm install --save-dev cross-env
