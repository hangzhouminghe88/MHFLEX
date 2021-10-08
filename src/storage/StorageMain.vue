<style scoped lang="less">
  @import '../style/ec';
</style>
<template>
  <div :class="`${prefixCls}`">
    <div :class="[`${prefixCls}-path`]">
      <aside-menu :menu-list="storageMenuList" :base-path="'main'"></aside-menu>
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
    name: "StorageMain",
    components: {
      AsideMenu
    },
    data() {
      return {
        storageMenuList: menuList.storageMenuList,
        prefixCls: prefixCls
      }
    }
  }
</script>

<style scoped>

</style>
