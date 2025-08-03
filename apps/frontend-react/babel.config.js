/* eslint-env node */
module.exports = {
  presets: [
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    ['@locator/babel-jsx', {}]
  ]
} 