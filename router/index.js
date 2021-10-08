import VueRouter from "vue-router";
import {routes} from "./route";
import Vue from 'vue';
import Utils from '../utils/Utils';

Vue.use(VueRouter);

const utils = new Utils();
window.router = new VueRouter({
  //mode: 'history',
  routes
});
//设置路由跳转
router.beforeEach((to, from , next) => {
  //若sessionUuid存在并且to.name是登录的话跳转到首页
  if(localStorage.getItem('sessionUuid') && to.name === 'login'){
    next({path: '/main/ecs/home'});
    //若sessionUuid不存在并且name等于login的话跳转到login登录页
  }else if(!localStorage.getItem('sessionUuid') && to.name === 'login'){
    next();
    //若sessionUuid不存在并且name不等于login的话证明还没有登录跳转至登录页面
  }else if(!localStorage.getItem('sessionUuid') && to.name !== 'login') {
    next({path: '/login'});
  }else{
    next();
  }
  //设置文档标题
  utils.setDocumentTitle(to);
})
export default router;

