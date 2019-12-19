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

## Results

Now before going into details, these are the results.

|                               | Webpack   | Parcel   | Rollup    | Browserify | FuseBox | Brunch  |
|-------------------------------|-----------|----------|-----------|------------|---------|---------|
| Released                      | 2011      | 2017     | 2014      | 2010       | 2016    | 2011    |
| Current Version               | 4\.41\.3  | 1\.12\.4 | 1\.27\.13 | 16\.5\.0   | 3\.7\.1 | 3\.0\.0 |
| GitHub Stars                  | 52300     | 34100    | 17200     | 13000      | 3900    | 6600    |
| Collaborators                 | 573       | 215      | 200       | 182        | 152     | 122     |
| Weekly Downloads              | 8,807,158 | 101,988  | 1,005,643 | 675,444    | 9,303   | 11,048  |
| Open Issues                   | 374       | 810      | 152       | 310        | 54      | 143     |
| Packages Added                | 9         | 1        | 8         | 3          | 3       | 4       |
| Packages Installed            | 457       | 743      | 229       | 272        | 505     | 404     |
| Configuration Size \[LoC\]    | 40        | 0        | 50        | 56         | 23      | 14      |
| Bundle Size \[kB\]            | 130       | 132      | 132       | 130        | 132     | 138     |
| Bundle Splitting              | Yes       | Yes      | Yes       | No         | Yes     | No      |
| Speed / 1\. Run\[s\]          | 5         | 7        | 7         | 7          | 5       | 6       |
| Speed / Subsequent Runs \[s\] | 4         | 2        | 2         | 7          | 4       | 6       |
| Required Changes              | 2         | 0        | 3         | 3          | 3       | 4       |
| Difficulty                    | Average   | Simple   | Difficult | Average    | Average | Average |
| Flexibility                   | High      | Average  | Average   | High       | Mid     | Low     |

**Summary**: Depending on what you want to do there is a bundler for your choice.

## Browserify

### Installation

The installation only requires three packages.

```sh
npm i browserify tsify tinyify --save-dev
```

This results in about 272 new packages.

```plain
+ browserify@16.5.0
+ tsify@4.0.1
+ tinyify@2.5.2
added 272 packages from 242 contributors and audited 1888 packages in 39.221s
found 0 vulnerabilities
```

### Setup

We had to write about a 56 LOC configuration file.

```js
const browserify = require('browserify');
const tsify = require('tsify');
const tinyify = require('tinyify');
const fs = require('fs');
const path = require('path');
const sass = require('sass');

const source = path.resolve(__dirname, 'src');
const target = path.resolve(__dirname, 'dist');

if (!fs.existsSync(target)) {
  fs.mkdirSync(target);
}

function compileCss() {
  const outFile = path.resolve(target, 'style.css');

  sass.render(
    {
      file: path.resolve(source, 'style.scss'),
      outFile,
      outputStyle: 'compressed',
    },
    (err, result) => {
      if (err) {
        console.errror(err);
      } else {
        fs.writeFile(outFile, result.css, err => err && console.error(err));
      }
    },
  );
}

function compileJs() {
  browserify()
    .add(path.resolve(source, 'app.tsx'))
    .plugin(tsify, { noImplicitAny: true })
    .plugin(tinyify, {
      env: {
        NODE_ENV: 'production',
      },
    })
    .bundle()
    .on('error', console.error)
    .pipe(fs.createWriteStream(path.resolve(target, 'app.js')));
}

function copyRest() {
  ['index.html', 'smiley.jpg'].forEach(file => {
    fs.copyFile(path.resolve(source, file), path.resolve(target, file), err => err && console.error(err));
  });
}

compileCss();
compileJs();
copyRest();
```

### Modifications

Since the HTML file could not be used as any kind of entry we had to already prepare it for the output.

```diff
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Bundler Comparison</title>
-<link rel="stylesheet" href="style.scss">
+<link rel="stylesheet" href="style.css">
</head>
<body>
<h1>Test Page</h1>
<div id="app"></div>
-<script src="app.tsx"></script>
+<script src="app.js"></script>
</body>
</html>
```

Additionally, there is right now no package to deal with PNG files. The closest we have is `imgurify`, however, we do not want the image to be base64 encoded in the bundle. We want the image to be standalone (referenced).

```diff
        <p>
-          <img src={require('smiley.jpg')} alt="A classic smiley" />
+          <img src="smiley.jpg" alt="A classic smiley" />
        </p>
```

### Running

Running is done via one command:

```sh
node bundle.js
```

### Results

The initial build took about 7s and resulted in a 130 kB bundle.

```plain
real    0m6.640s
user    0m8.813s
sys     0m1.078s
```

The stylesheet was minified to 83 bytes, the additional bundle was **not created**.

Subsequent runs are exactly the same.

## Brunch

### Installation

The installation only requires four packages.

```sh
npm i brunch typescript-brunch terser-brunch sass-brunch  --save-dev
```

This results in about 404 new packages.

```plain
+ sass-brunch@2.10.8
+ typescript-brunch@2.3.0
+ terser-brunch@4.0.0
+ brunch@3.0.0
added 404 packages from 260 contributors and audited 1661 packages in 57.415s
found 2 low severity vulnerabilities
```

### Setup

We had to write about a 14 LOC configuration file.

```js
module.exports = {
  paths: {
    public: 'dist',
    watched: ['src'],
  },
  files: {
    javascripts: {
      joinTo: 'app.js',
    },
    stylesheets: {
      joinTo: 'style.css',
    },
  },
};
```

### Modifications

We had to remove the lazy loading as `import` function calls are not supported (not even to "hard-wire" the content).

Furthermore, `require` calls are not picked up. So we can spare this kind of sharade and just reference the file.

```diff
import * as React from 'react';
import { render } from 'react-dom';
+import Page from './Page';

-const Page = React.lazy(() => import('./Page'));

const App = () => {
  const [showPage, setShowPage] = React.useState(false);

  return (
    <React.Suspense fallback={<b>Loading ...</b>}>
      <div className="main-content">
        <h2>Let's talk about smileys</h2>
        <p>More about smileys can be found here ...</p>
        <p>
-          <img src={require('./smiley.jpg')} alt="A classic smiley" />
+          <img src="./smiley.jpg" alt="A classic smiley" />
        </p>
        <p>
          <button onClick={() => setShowPage(!showPage)}>Toggle page</button>
        </p>
      </div>
      {showPage && <Page />}
    </React.Suspense>
  );
};

render(<App />, document.querySelector('#app'));
```

The "static" files `index.html` and `smiley.jpg` had to be moved into a subfolder called "assets", which was automatically used for copying static files into the target.

### Running

Running is done via one command:

```sh
brunch build --production
```

### Results

The initial build took about 6s and resulted in a 138 kB bundle.

```plain

11:33:43 - info: compiling
11:33:43 - info: compiled 16 files into 2 files, copied index.html in 5.2 sec

real    0m5.837s
user    0m6.859s
sys     0m1.000s
```

The stylesheet was minified to 84 bytes, the additional bundle was **not created**.

Subsequent runs are exactly the same.

## FuseBox

### Installation

The installation only requires three packages.

```sh
npm i fuse-box node-sass terser --save-dev
```

This results in about 505 new packages.

```plain
+ node-sass@4.13.0
+ terser@4.4.3
+ fuse-box@3.7.1
added 505 packages from 351 contributors and audited 2018 packages in 42.65s
found 1 low severity vulnerability
```

### Setup

We had to write about a 23 LOC configuration file.

```js
const { FuseBox, SassPlugin, CSSPlugin, WebIndexPlugin, QuantumPlugin, CopyPlugin } = require('fuse-box');

const fuse = FuseBox.init({
  homeDir: 'src',
  target: 'browser',
  output: 'dist/$name.js',
  plugins: [
    WebIndexPlugin({ template: 'src/index.html' }),
    [SassPlugin(), CSSPlugin({ outFile: _ => 'dist/style.css' })],
    CopyPlugin({ files: ['*.jpg'], dest: '' }),
    QuantumPlugin({
      css: true,
      bakeApiIntoBundle: true,
      uglify: true,
    }),
  ],
});

fuse
  .bundle('app')
  .instructions(' > app.tsx');

fuse.run();
```

### Modifications

We had to reference the SASS file in the beginning for our application.

```tsx
import './style.scss';
```

The HTML template was slightly changed.

```diff
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Bundler Comparison</title>
-<link rel="stylesheet" href="style.scss">
+<link rel="stylesheet" href="style.css">
</head>
<body>
<h1>Test Page</h1>
<div id="app"></div>
-<script src="./app.tsx"></script>
+$bundles
</body>
</html>
```

The HTML template had to be referenced in the Fuse loader script.

### Running

Running is done via one command:

```sh
node fuse.js
```

### Results

The initial build took about 5s and resulted in a 132 kB bundle.

```plain
--- FuseBox 3.7.1 ---
  → Typescript config file:  /tsconfig.json
  → Applying automatic alias based on baseUrl in tsconfig.json
  → 
        Page => "~/Page"
        app => "~/app"
  → Typescript script target: ES2015

--------------------------
Bundle "app" 

    Page.jsx
    app.jsx
    smiley.jpg
    style.scss
└──  (4 files,  2 kB) default
└── fuse-box-css 1.3 kB (1 files)
└── object-assign 2.2 kB (1 files)
└── process 3.3 kB (1 files)
└── prop-types 4.4 kB (2 files)
└── react-dom 1 MB (3 files)
└── react 79.9 kB (3 files)
└── scheduler 43.3 kB (6 files)
size: 1.2 MB in 1s 189ms

  -------------- 

Launching quantum core
  → Generating abstraction, this may take a while
  → Abstraction generated
  → Process bundle app
  → Process package default 
  →   Files: 4 
  → Process package fuse-box-css 
  →   Files: 1 
  → Process package object-assign 
  →   Files: 1 
  → Process package process 
  →   Files: 1 
  → Process package prop-types 
  →   Files: 2 
  → Process package react-dom 
  →   Files: 3 
  → Process package react 
  →   Files: 3 
  → Process package scheduler 
  →   Files: 6 
  → Create split bundle 9d21301d with entry point default/Page.jsx
  → QuantumBit: Adding default/Page.jsx to 9d21301d
  → Render bundle app
  → Render bundle 9d21301d
  → Uglifying app...
  → Using terser because the target is greater than ES5 or es6 option is set
  → Done uglifying app
  size:  129.3 kB, 41.2 kB (gzipped)
  → Uglifying 9d21301d...
  → Using terser because the target is greater than ES5 or es6 option is set
  → Done uglifying 9d21301d
  size:  1.6 kB, 844 Bytes (gzipped)

real    0m5.409s
user    0m5.422s
sys     0m1.172s
```

The stylesheet was *not* minified and remained at 142 bytes, the additional bundle came at 1604 bytes.

Subsequent builds seem to be slightly faster with 4s.

```plain
--- FuseBox 3.7.1 ---

--------------------------
Bundle "app" 

    Page.jsx
    app.jsx
    smiley.jpg
    style.scss
└──  (4 files,  2 kB) default
└── fuse-box-css@0.0.1 1.3 kB (0 files)
└── object-assign@4.1.1 2.2 kB (0 files)
└── process@0.0.0 3.3 kB (0 files)
└── prop-types@15.7.2 4.4 kB (0 files)
└── react-dom@16.12.0 1 MB (0 files)
└── react@16.12.0 79.9 kB (0 files)
└── scheduler@0.18.0 43.3 kB (0 files)
size: 1.2 MB in 117ms

  -------------- 

Launching quantum core
  → Generating abstraction, this may take a while
  → Abstraction generated
  → Process bundle app
  → Process package default 
  →   Files: 4 
  → Process package fuse-box-css 
  →   Files: 1 
  → Process package object-assign 
  →   Files: 1 
  → Process package process 
  →   Files: 1 
  → Process package prop-types 
  →   Files: 2 
  → Process package react-dom 
  →   Files: 3 
  → Process package react 
  →   Files: 3 
  → Process package scheduler 
  →   Files: 6 
  → Create split bundle 9d21301d with entry point default/Page.jsx
  → QuantumBit: Adding default/Page.jsx to 9d21301d
  → Render bundle app
  → Render bundle 9d21301d
  → Uglifying app...
  → Using terser because the target is greater than ES5 or es6 option is set
  → Done uglifying app
  size:  129.3 kB, 41.2 kB (gzipped)
  → Uglifying 9d21301d...
  → Using terser because the target is greater than ES5 or es6 option is set
  → Done uglifying 9d21301d
  size:  1.6 kB, 844 Bytes (gzipped)

real    0m4.350s
user    0m4.469s
sys     0m1.141s
```

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

The initial build took about 7s and resulted in a 132 kB bundle.

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

The installation requires 8 packages.

```sh
npm i rollup rollup-plugin-typescript2 rollup-plugin-scss @rollup/plugin-html @rollup/plugin-image @rollup/plugin-node-resolve rollup-plugin-commonjs rollup-plugin-terser --save-dev
```

This results in about 229 new packages.

```plain
+ rollup-plugin-commonjs@10.1.0
+ rollup-plugin-terser@5.1.2
+ rollup-plugin-scss@1.0.2
+ rollup@1.27.9
+ rollup-plugin-typescript2@0.25.3
+ @rollup/plugin-node-resolve@6.0.0
+ @rollup/plugin-image@2.0.0
+ @rollup/plugin-html@0.1.0
added 229 packages from 161 contributors and audited 657 packages in 13.473s
found 0 vulnerabilities
```

### Setup

We had to write about a 50 LOC configuration file.

```js
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
```

### Modifications

We had to add an additional TypeScript declaration file to import standard images:

```ts
declare module '*.jpg';
```

Furthermore, we are not allowed the mix the classic `require` with `import`. So we had to change the *app.tsx* file.

```diff
import * as React from 'react';
import { render } from 'react-dom';
+import smiley from './smiley.jpg';

const Page = React.lazy(() => import('./Page'));

const App = () => {
  const [showPage, setShowPage] = React.useState(false);

  return (
    <>
      <div className="main-content">
        <h2>Let's talk about smileys</h2>
        <p>More about smileys can be found here ...</p>
        <p>
+          <img src={smiley} alt="A classic smiley" />
-          <img src={require('./smiley.jpg')} alt="A classic smiley" />
        </p>
        <p>
          <button onClick={() => setShowPage(!showPage)}>Toggle page</button>
        </p>
      </div>
      {showPage && <Page />}
    </>
  );
};

render(<App />, document.querySelector('#app'));
```

### Running

Running is done via one command:

```sh
rollup -c rollup.config.js --environment BUILD:production
```

### Results

The initial build took about 7s and resulted in a 132 kB bundle.

```plain

```

The stylesheet was minified to 130 bytes, the additional bundle came at 2 kB.

Subsequent builds took about 2s.

```plain

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

The initial build took about 5s and resulted in a 130 kB bundle.

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
