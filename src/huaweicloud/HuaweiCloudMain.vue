<style scoped lang="less">
  @import '../style/ec';
</style>
<template>
  <div :class="`${prefixCls}`">
    <div :class="[`${prefixCls}-path`]">
      <aside-menu :menu-list="huaweiCloudMenuList" :base-path="'main'"></aside-menu>
    </div>
    <div :class="[`${prefixCls}-content`]">
      <transition>
        <router-view/>
      </transition>
    </div>
  </div>
</template>

<script>
  import AsideMenu from '../component/menu/AsideMenu';
  import menuList from '../component/menu/menuList/';
  const prefixCls = 'ecs-main';
  export default {
    name: "HuaweiCloudMain",
    components: {
      AsideMenu
    },
    data() {
      return {
        huaweiCloudMenuList: menuList.huaweiCloudMenuList,
        prefixCls: prefixCls
      }
    }
  }
</script>

<style scoped>

</style>
