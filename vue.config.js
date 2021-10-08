const path = require('path');
const resolve = (dir) => {
  return path.join(__dirname, './', dir);
}
const webpack = require('webpack');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const cdn = [
  "https://cdn.bootcss.com/vue/2.6.10/vue.min.js",
  "https://cdn.bootcss.com/vue-router/3.0.2/vue-router.min.js",
  "https://cdn.bootcss.com/vuex/3.0.1/vuex.min.js",
  "https://cdn.bootcss.com/element-ui/2.4.11/index.js",
  "https://cdn.bootcss.com/axios/0.18.0/axios.min.js",
  "https://cdn.bootcss.com/vue-i18n/5.0.3/vue-i18n.min.js",
  "https://cdn.bootcss.com/echarts/4.2.1/echarts.min.js",
]

const externals = {
  'vuex': 'Vuex',
  'vue-router': 'VueRouter',
  'vue-i18n': 'VueI18n',
  'echarts': 'echarts',
  "Vue": 'Vue',
  "element-ui": 'element',
  "axios": 'axios'
}

let plugins = [];
IS_PRODUCTION ? plugins = [
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 10,
    minChunkSize: 1000
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  //new LodashModuleReplacementPlugin(),
] : plugins = [
  //new LodashModuleReplacementPlugin()
];

module.exports = {
  lintOnSave: false,
  devServer: {
    host: 'localhost',
    port: 5555,
    proxy: {
      '/foo': {
        target: '<other_url>'
      }
    }
  },
  // 打包时不生成.map文件 避免看到源码
  productionSourceMap: false,
  configureWebpack: {
    module: {
      // rules:[{
      //   test: /\.(js)$/,
      //   loader: 'babel-loader',
      //   exclude: /node_modules/,
      //   include: [resolve('src')],
      //   options: {plugins: ['lodash']}
      // }]
    },
    resolve: {
      alias: {
        'src': resolve('src'),
        'assets': resolve('src/assets'),
      },
      extensions: ['.js', '.vue', '.css', '.json']
    },
    optimization: {
      usedExports: true,
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        chunks: "all", // 共有三个值可选：initial(初始模块)、async(按需加载模块)和all(全部模块)
        minSize: 30000, // 模块超过30k自动被抽离成公共模块
        minChunks: 1, // 模块被引用>=1次，便分割
        name: true, // 默认由模块名+hash命名，名称相同时多个模块将合并为1个，可以设置为function
        automaticNameDelimiter: '~', // 命名分隔符
        cacheGroups: {
          default: { // 模块缓存规则，设置为false，默认缓存组将禁用
            minChunks: 2, // 模块被引用>=2次，拆分至vendors公共模块
            priority: -20, // 优先级
            reuseExistingChunk: true, // 默认使用已有的模块
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            // minChunks: 1,
            priority: -10,// 确定模块打入的优先级
            reuseExistingChunk: true,// 使用复用已经存在的模块
            enforce: true,
          },
          echarts: {
            test: /[\\/]node_modules[\\/]echarts/,
            name: 'echarts',
            priority: 16,
            reuseExistingChunk: true,
          },
          lodash: {
            test: /[\\/]node_modules[\\/]lodash/,
            name: 'lodash',
            priority: 16,
            reuseExistingChunk: true,
          }
        },
      },
    },
    plugins: plugins
  },
  chainWebpack: config => {
    if (IS_PRODUCTION) {
      config.plugin('html')
        .tap(args => {
          args[0].cdn = cdn;
          return args;
        })
        .end()
      config.externals(externals);
    }
  }
}
