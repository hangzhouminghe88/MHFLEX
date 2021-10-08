<style scoped lang="less">
  @import '../style/ec';
</style>
<template>
  <div :class="`${prefixCls}`">
    <div :class="[`${prefixCls}-path`]">
      <aside-menu :menu-list="securityMenuList" :base-path="'main'"></aside-menu>
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
  const prefixCls ="ecs-main";
  export default {
    name: "SecurityPage",
    components: {
      AsideMenu
    },
    data() {
      return {
        securityMenuList: menuList.securityMenuList,
        prefixCls: prefixCls
      }
    }
  }
</script>

<style scoped>

</style>
