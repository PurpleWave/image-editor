const babel = require('rollup-plugin-babel-minify');
const changeCase = require('change-case');
const createBanner = require('create-banner');
const pkg = require('./package');

pkg.name = pkg.name.replace('js', '');

const name = changeCase.camelCase(pkg.name);
const banner = createBanner({
  data: {
    name: `${changeCase.pascalCase(pkg.name)}`,
    year: '2019-present'
  }
});

module.exports = {
  input: 'src/index.js',
  output: [{
    banner,
    name,
    file: `dist/${name}.min.js`,
    format: 'umd'
  }, {
    banner,
    file: `dist/${name}.common.min.js`,
    format: 'cjs'
  }, {
    banner,
    file: `dist/${name}.esm.min.js`,
    format: 'esm'
  }, {
    banner,
    name,
    file: `docs/js/${name}.min.js`,
    format: 'umd'
  }],
  plugins: [
    babel()
  ]
};