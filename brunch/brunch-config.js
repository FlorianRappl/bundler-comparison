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
