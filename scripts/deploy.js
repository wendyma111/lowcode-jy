const ghpages = require('gh-pages')

ghpages.publish(
  'build',
  {
    repo: 'https://github.com/wendyma111/lowcode-jy.git'
  },
  function(err) {
    console.log(err)
  }
);
