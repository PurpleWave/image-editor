const babel = require('rollup-plugin-babel');
const changeCase = require('change-case');
const createBanner = require('create-banner');
const pkg = require('./package');

pkg.name = pkg.name.replace('js', '');

const name = changeCase.pascalCase(pkg.name);
const banner = createBanner({
  data: {
    name: `${name}`,
    year: '2019-present'
  }
});

module.exports = {
  input: 'src/index.js',
  output: [{
    banner,
    name,
    file: `dist/${name}.js`,
    format: 'umd'
  }, {
    banner,
    file: `dist/${name}.common.js`,
    format: 'cjs'
  }, {
    banner,
    file: `dist/${name}.esm.js`,
    format: 'esm'
  }, {
    banner,
    name,
    file: `docs/js/${name}.js`,
    format: 'umd'
  }],
  plugins: [
    babel()
  ]
};