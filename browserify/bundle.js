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
