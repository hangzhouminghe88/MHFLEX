<style scoped lang="less">
  @import '../style/ec';
</style>
<template>
  <div :class="`${prefixCls}`">
    <div :class="[`${prefixCls}-path`]">
      <aside-menu :menu-list="ecsMenuList" :base-path="'main'"></aside-menu>
    </div>
    <div :class="[`${prefixCls}-content`]">
      <transition>
        <router-view/>
      </transition>
    </div>
  </div>
</template>

<script>
  //菜单列表
  import menuList from '../component/menu/menuList/';
  //左侧侧边栏
  import AsideMenu from '../component/menu/AsideMenu';
  import {Menu} from 'element-ui';

  const prefixCls = "ecs-main";
  export default {
    name: "EcsMain",
    data() {
      return {
        ecsMenuList: menuList.ecsMenuList,
        prefixCls: prefixCls
      }
    },
    components: {
      AsideMenu
    }
  }
</script>

<style scoped>

</style>
