import typescript from 'rollup-plugin-typescript2';
import scss from 'rollup-plugin-scss';
import image from '@rollup/plugin-image';
import html from '@rollup/plugin-html';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, 'src/index.html'), 'utf8');
const cssName = 'main.css';
const dist = 'dist';

export default {
  input: [resolve(__dirname, 'src/app.tsx'), resolve(__dirname, 'src/style.scss')],
  output: {
    format: 'amd',
    dir: dist,
  },
  plugins: [
    nodeResolve(),
    typescript({
      objectHashIgnoreUnknownHack: true,
    }),
    image({
      dom: true,
    }),
    scss({
      output: `${dist}/${cssName}`,
    }),
    commonjs({
      sourceMap: false,
      namedExports: { react: ['createElement', 'Component', 'lazy', 'Fragment', 'useState'], 'react-dom': ['render'] },
    }),
    terser(),
    html({
      fileName: 'index.html',
      template: ({ files, publicPath }) => {
        const { js = [{ fileName: 'missing.js' }] } = files;
        return content
          .replace(
            '<link rel="stylesheet" href="style.scss">',
            `<link rel="stylesheet" href="${publicPath}${cssName}">`,
          )
          .replace('<script src="app.tsx"></script>', `<script src="${publicPath}${js[0].fileName}"></script>`);
      },
    }),
  ],
};
