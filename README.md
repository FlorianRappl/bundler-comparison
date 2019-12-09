# Bundler Comparison

For the comparison we use a super small project consisting of some dependencies:

- TypeScript
- SASS
- React with React DOM

By default all project folders have thus been set up using the following command:

```sh
npm i react react-dom @types/react @types/react-dom typescript sass @types/node
```

We installed all the typings for these dependencies, too. The requirements for the app bundling are:

- We load one component lazy (bundle splitting)
- We have 1 HTML file
- We have 1 CSS file
- We have 1 image (JPG) file

We should obtain 5 files (1 html, 2 js, 1 css, 1 jpg).

Our key metrics are:

- The number of packages have been installed for bundling
- The ease of setup (how many packages had to be installed manually, how large is the configuration)
- The time of the 1st build and subsequent builds
- How hard is a dev mode to establish
- What is the bundle size (minimum for the side-bundle, full for the main bundle)
- How many changes to our original source code (available in `src` have been necessary)

## Parcel

### Installation

The installation only requires a single package.

```sh
npm i parcel-bundler --save-dev
```

This results in about 743 new packages.

```plain
+ parcel-bundler@1.12.4
added 743 packages from 533 contributors and audited 8421 packages in 91.127s
found 0 vulnerabilities
```

### Setup

Nothing had to be changed. Everything could run immediately without any configuration.

### Modifications

The original source code was left unchanged.

### Running

Running is done via one command:

```sh
parcel build src/index.html
```

### Results

The initial build took about 7s and resultd in a 132 kB bundle.

```plain
✨  Built in 5.84s.

dist/app.9baf3188.js.map        271.5 KB    125ms
dist/app.9baf3188.js           132.24 KB    5.81s
dist/smiley.b199c00b.jpg        99.38 KB    666ms
dist/Page.cb038bbe.js            2.04 KB    1.29s
dist/Page.cb038bbe.js.map        1.11 KB      5ms
dist/index.html                    374 B    358ms
dist/style.cb6d7d54.css.map        304 B      5ms
dist/style.cb6d7d54.css            130 B    4.95s

real    0m7.293s
user    0m11.828s
sys     0m4.563s
```

The stylesheet was minified to 130 bytes, the additional bundle came at 2 kB.

Subsequent builds took about 2s.

```plain
✨  Built in 734ms.

dist/app.9baf3188.js.map        271.5 KB    152ms
dist/app.9baf3188.js           132.24 KB    478ms
dist/smiley.b199c00b.jpg        99.38 KB     48ms
dist/Page.cb038bbe.js            2.04 KB     25ms
dist/Page.cb038bbe.js.map        1.11 KB     14ms
dist/index.html                    374 B     16ms
dist/style.cb6d7d54.css.map        304 B     14ms
dist/style.cb6d7d54.css            130 B     21ms

real    0m2.201s
user    0m1.359s
sys     0m1.766s
```

## rollup.js

### Installation

The installation only requires a single package.

```sh
npm i rollup rollup-plugin-typescript2 rollup-plugin-sass @rollup/plugin-html @rollup/plugin-image @rollup/plugin-node-resolve rollup-plugin-commonjs rollup-plugin-terser --save-dev
```

This results in about 3 new packages.

```plain
+ rollup@1.27.9
added 3 packages from 4 contributors and audited 55 packages in 2.679s
found 0 vulnerabilities
```

### Setup

Nothing had to be changed. Everything could run immediately without any configuration.

### Modifications

The original source code was left unchanged.

### Running

Running is done via one command:

```sh
parcel build src/index.html
```

### Results

The initial build took about 7s and resultd in a 132 kB bundle.

```plain
✨  Built in 5.84s.

dist/app.9baf3188.js.map        271.5 KB    125ms
dist/app.9baf3188.js           132.24 KB    5.81s
dist/smiley.b199c00b.jpg        99.38 KB    666ms
dist/Page.cb038bbe.js            2.04 KB    1.29s
dist/Page.cb038bbe.js.map        1.11 KB      5ms
dist/index.html                    374 B    358ms
dist/style.cb6d7d54.css.map        304 B      5ms
dist/style.cb6d7d54.css            130 B    4.95s

real    0m7.293s
user    0m11.828s
sys     0m4.563s
```

The stylesheet was minified to 130 bytes, the additional bundle came at 2 kB.

Subsequent builds took about 2s.

```plain
✨  Built in 734ms.

dist/app.9baf3188.js.map        271.5 KB    152ms
dist/app.9baf3188.js           132.24 KB    478ms
dist/smiley.b199c00b.jpg        99.38 KB     48ms
dist/Page.cb038bbe.js            2.04 KB     25ms
dist/Page.cb038bbe.js.map        1.11 KB     14ms
dist/index.html                    374 B     16ms
dist/style.cb6d7d54.css.map        304 B     14ms
dist/style.cb6d7d54.css            130 B     21ms

real    0m2.201s
user    0m1.359s
sys     0m1.766s
```

## Webpack

### Installation

The installation requires 9 packages.

```sh
npm install webpack webpack-cli ts-loader sass-loader css-loader html-loader file-loader extract-loader mini-css-extract-plugin --save-dev
```

This results in about 457 new packages.

```plain
+ html-loader@0.5.5
+ extract-loader@3.1.0
+ css-loader@3.2.1
+ mini-css-extract-plugin@0.8.0
+ file-loader@5.0.2
+ sass-loader@8.0.0
+ ts-loader@6.2.1
+ webpack-cli@3.3.10
+ webpack@4.41.2
added 456 packages from 240 contributors and audited 5598 packages in 37.111s
found 0 vulnerabilities
```

### Setup

A new `webpack.config.js` with 40 LOC was required.

```js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: ['./src/app.tsx', './src/index.html', './src/style.scss'],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
      },
      {
        test: /\.html$/,
        use: ['file-loader?name=[name].[ext]', 'extract-loader', 'html-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

```

### Modifications

In order to have the script and sheet correctly referenced we have to change the `index.html` to the *final* names instead of their entry points.

```diff
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Bundler Comparison</title>
-<link rel="stylesheet" href="style.scss">
+<link rel="stylesheet" href="main.css">
</head>
<body>
<h1>Test Page</h1>
<div id="app"></div>
-<script src="app.tsx"></script>
+<script src="index.js"></script>
</body>
</html>
```

### Running

Running is done via one command:

```sh
webpack --mode production
```

### Results

The initial build took about 5s and resultd in a 130 kB bundle.

```plain
Hash: bdd8a76b5baaf9b51608
Version: webpack 4.41.2
Time: 4178ms
Built at: 12/09/2019 4:51:36 AM
                               Asset       Size  Chunks             Chunk Names
                          1.index.js  386 bytes       1  [emitted]
e69134e93d4d91d02d0b6864a4b9f3a3.jpg   99.4 KiB          [emitted]
                          index.html  366 bytes          [emitted]
                            index.js    130 KiB       0  [emitted]  main
                            main.css   83 bytes       0  [emitted]  main
Entrypoint main = main.css index.js
 [3] multi ./src/app.tsx ./src/index.html ./src/style.scss 52 bytes {0} [built]
 [4] ./src/app.tsx 904 bytes {0} [built]
 [9] ./src/smiley.jpg 80 bytes {0} [built]
[10] ./src/index.html 54 bytes {0} [built]
[11] ./src/style.scss 39 bytes {0} [built]
[12] ./src/Page.tsx 358 bytes {1} [built]
    + 8 hidden modules
Child mini-css-extract-plugin node_modules/css-loader/dist/cjs.js!node_modules/sass-loader/dist/cjs.js!src/style.scss:
    Entrypoint mini-css-extract-plugin = *
    [0] ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/style.scss 220 bytes {0} [built]
        + 1 hidden module

real    0m5.825s
user    0m6.000s
sys     0m1.688s
```

The stylesheet was minified to 83 bytes, the additional bundle came at 386 bytes.

Subsequent builds seem to be slightly faster with 4s.

```plain
Hash: bdd8a76b5baaf9b51608
Version: webpack 4.41.2
Time: 2635ms
Built at: 12/09/2019 4:57:20 AM
                               Asset       Size  Chunks             Chunk Names
                          1.index.js  386 bytes       1  [emitted]
e69134e93d4d91d02d0b6864a4b9f3a3.jpg   99.4 KiB          [emitted]
                          index.html  366 bytes          [emitted]
                            index.js    130 KiB       0  [emitted]  main
                            main.css   83 bytes       0  [emitted]  main
Entrypoint main = main.css index.js
 [3] multi ./src/app.tsx ./src/index.html ./src/style.scss 52 bytes {0} [built]
 [4] ./src/app.tsx 904 bytes {0} [built]
 [9] ./src/smiley.jpg 80 bytes {0} [built]
[10] ./src/index.html 54 bytes {0} [built]
[11] ./src/style.scss 39 bytes {0} [built]
[12] ./src/Page.tsx 358 bytes {1} [built]
    + 8 hidden modules
Child mini-css-extract-plugin node_modules/css-loader/dist/cjs.js!node_modules/sass-loader/dist/cjs.js!src/style.scss:
    Entrypoint mini-css-extract-plugin = *
    [0] ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/style.scss 220 bytes {0} [built]
        + 1 hidden module

real    0m4.310s
user    0m4.141s
sys     0m1.594s
```
