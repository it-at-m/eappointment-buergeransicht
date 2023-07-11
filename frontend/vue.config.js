import { defineConfig } from '@vue/cli-service'
import WebpackAssetsManifest from 'webpack-assets-manifest'

export default defineConfig({
  transpileDependencies: true,
  publicPath: '/buergeransicht/',
  configureWebpack: config => {
    config.plugins = config.plugins.concat(
        new WebpackAssetsManifest({
          output: 'asset-manifest.json'
        })
    )
  },
  devServer: {
      port: "8082",
      proxy: 'http://localhost:8082/buergeransicht/'
  }
})
