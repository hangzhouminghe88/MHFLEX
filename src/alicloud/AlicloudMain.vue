<style scoped lang="less">
  @import '../style/ec';
</style>
<template>
  <div :class="`${prefixCls}`">
    <div :class="[`${prefixCls}-path`]">
      <aside-menu :menu-list="aliCloudMenuList" :base-path="'main'"></aside-menu>
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
  import {Menu} from 'element-ui';

  const prefixCls = "ecs-main";
  export default {
    name: "EcsMain",
    data() {
      return {
        aliCloudMenuList: menuList.aliCloudMenuList,
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
