<style scoped lang="less">
  @import "../../style/topMenu.less";
</style>
<template>
  <div :class="prefixCls">
    <el-menu :class="[`${prefixCls}-path`]" mode="horizontal" :default-active="defaultActive">
      <el-menu-item v-for="(menu,index) in menuList" :index="`${menu.path.split('/')[1]}`" :key="index" @click="getCurrentPath(menu.path)">
        <template slot="title">
            <div>{{menu.title}}</div>
        </template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
  const prefixCls = "topMenu";
  export default {
    name: "TopMenu",
    props: {
      menuList: {
        type: Array
      }
    },
    data() {
      return {
        prefixCls: prefixCls
      }
    },
    mounted() {
      let self = this;
    },
    computed: {
      defaultActive() {
        let self = this;
        return self.$route.path.split('/')[2];
      }
    },
    methods: {
      getCurrentPath(path){
        let self = this;
        self.$router.push({path: `/main${path}`})
      }
    }
  }
</script>
