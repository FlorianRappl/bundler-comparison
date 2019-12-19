const { FuseBox, SassPlugin, CSSPlugin, WebIndexPlugin, CopyPlugin, QuantumPlugin } = require('fuse-box');

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
