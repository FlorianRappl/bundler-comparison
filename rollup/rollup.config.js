import typescript from 'rollup-plugin-typescript2';
import sass from 'rollup-plugin-sass';
import image from '@rollup/plugin-image';
import html from '@rollup/plugin-html';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, 'src/index.html'), 'utf8');

export default {
  input: [
    resolve(__dirname, 'src/app.tsx'),
    resolve(__dirname, 'src/style.scss'),
  ],
  output: {
    format: 'amd',
    dir: 'dist',
  },
  plugins: [
    typescript(),
    sass(),
    image(),
    nodeResolve(),
    commonjs({
      include: 'node_modules/**',
      sourceMap: false,
      namedExports: { react: ['createElement', 'Component', 'lazy', 'Fragment', 'useState'], 'react-dom': ['render'] },
      ignore: ['conditional-runtime-dependency'],
    }),
    terser(),
    html({
      fileName: 'index.html',
      template: ({ attributes, bundle, files, publicPath }) => content
        .replace('<link rel="stylesheet" href="style.scss">', `<link rel="stylesheet" href="${publicPath}${bundle.css}">`)
        .replace('<script src="app.tsx"></script>', `<script src="${publicPath}${bundle.js}"></script>`),
    })
  ],
};
