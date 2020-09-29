module.exports = {
  lintOnSave: false,
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devtool: 'source-map',
    devServer: {
      open: true
    }
  }
};
