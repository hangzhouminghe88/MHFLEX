<style lang="less" scoped>
  @import '../style/ec.less';
</style>

<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}-path`]">
      <aside-menu :menu-list="netWorkMenuList" :base-path="'main'"></aside-menu>
    </div>
    <div :class="[`${prefixCls}-content`]">
      <transition>
        <router-view/>
      </transition>
    </div>
  </div>
</template>

<script>
  import menuList from '../component/menu/menuList/';
  import AsideMenu from '../component/menu/AsideMenu';

  const prefixCls = "ecs-main";
  export default {
    name: "NetWorkMain",
    data() {
      return {
        netWorkMenuList: menuList.netWorkMenuList,
        prefixCls: prefixCls
      }
    },
    components: {
      AsideMenu
    }
  }
</script>
