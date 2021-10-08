import Vue from 'vue';
import VueI18n from 'vue-i18n';
import store from '../store/index.js';
import './assets/font/iconfont.js';
import './assets/font/iconfont.less';
import zhCN from 'element-ui/lib/locale/lang/zh-CN';
import element from './element/index.js';
import zh_cn from './i18n/zh-CN.json'
import helpZhCN from 'src/i18n/help-zh-CN';
import './style/base.less';
import 'whatwg-fetch';
import  router  from '../router/';
const App = () => import(/*webpackChunkName: 'APP'*/'src/App');
//安装elementui
Vue.use(element);
//安装国际化文件
Vue.use(VueI18n);
//国际化配置
var locales = {
  'zh-CN': Object.assign(zhCN, zh_cn, helpZhCN),
}
//初始化vue实例
new Vue({
  el: '#root',
  store,
  router,
  render: h => h(App)
})

Vue.config.lang = window.localStorage.getItem('language')
if (!Vue.config.lang) {
  Vue.config.lang = 'zh-CN'
  window.localStorage.setItem('language', Vue.config.lang)
}

// set locales
Object.keys(locales).forEach(function (lang) {
  Vue.locale(lang, locales[lang])
})
