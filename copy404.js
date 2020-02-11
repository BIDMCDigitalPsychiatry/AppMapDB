const fs = require('fs-extra');

// This script copies the index.html file to the 404.html file as a workaround for hosting on gh-pages

fs.copy('./build/index.html', './build/404.html')
  .then(() => console.log('copy ./build/index.html -> ./build/404.html'))
  .catch(err => console.error(err));
