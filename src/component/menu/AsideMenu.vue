<style scoped lang="less">
  @import '../../style/asideMenu.less';
</style>
<template>
   <el-scrollbar style="height:100%;background: #515a6e" wrapStyle="overflow-x': hidden" :vertical="true">
     <div :class="`${prefixCls}`" v-if="!windowData.isCreate">
      <el-menu mode="vertical" :default-active="defaultActive" unique-opened :collapse="isCollapse"
               class="el-menu-vertical-demo" ref="menu">
        <template v-for="(menu, index) in menuList">
          <el-menu-item v-if="menu.children.length === 0 && menu.type === 'link'" :index="`${menu.path.split('/')[1]}`"
                        @click="getCurrentPath(menu.path)">
            <i  v-if="/^[icon\-]/.test(menu.icon)" :class="menu.icon" class="mh-icon"></i>
            <i v-else-if="/^[el\-icon]/.test(menu.icon)" :class="menu.icon"></i>
            <span slot="title">{{menu.title}}</span>
          </el-menu-item>
          <el-menu-item v-if="menu.children.length === 0 && menu.type === 'button'"
            @click="handleAsyncData">
            <i :class="menu.icon" class="mh-icon"></i>
            <span slot="title">{{menu.title}}</span>
          </el-menu-item>
          <el-submenu :index="`${menu.title}-${index}`" v-if="menu.children.length > 0">
            <template slot="title" v-if="menu.type==='button'">
              <i v-if="/^[icon\-]/.test(menu.icon)" :class="menu.icon" class="mh-icon"></i>
              <i v-else-if="/^[el\-icon]/.test(menu.icon)" :class="menu.icon"></i>
              <span class="title" v-if="!isCollapse">{{menu.title}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item v-for="(l3menu, index) in menu.children" :key="index" :index="`${l3menu.path.split('/')[1]}`"
                            @click="getCurrentPath(l3menu.path)">
                <template slot="title">
                  <i v-if="/^[icon\-]/.test(l3menu.icon)" :class="l3menu.icon" class="mh-icon"></i>
                  <i v-else-if="/^[el\-icon]/.test(l3menu.icon)" :class="l3menu.icon"></i>
                  <span @click="getCurrentPath(l3menu.path)">{{l3menu.title}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </template>
      </el-menu>
      <div :class="`${prefixCls}-collapse`" @click="collapse" ref="collapse">
        <i class="el-icon-d-arrow-right" v-if="isCollapse"></i>
        <i class="el-icon-d-arrow-left" v-if="!isCollapse"></i>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
  const prefixCls = "prefixCls-menu";
  import ScrollBar from '../vue-scroller-bars/'
  import WindowBase from 'src/windows/Window';
  import { aliyunAsync, tencentAsync, huaweiAsync } from 'src/windows/asyncData/asyncData';

  export default {
    name: "AsideMenu",
    mixins: [WindowBase],
    props: {
      menuList: {
        type: Array,
        default: []
      },
      basePath: {
        type: String,
        default: ''
      }
    },
    component: {
      ScrollBar
    },
    data() {
      return {
        prefixCls: prefixCls,
        isCollapse: false
      }
    },
    created() {
      let self = this;
      self.updateWindow({isCreate: false})
    },
    methods: {
      getCurrentPath(path) {
        let self = this;
        self.$router.push(`/main/${path}`);
        event.stopPropagation();
      },
      collapse() {
        let self = this, ecsmainpath =  document.querySelector('.ecs-main-path'),
        ecsmaincontent = document.querySelector('.ecs-main-content');
        self.isCollapse = !self.isCollapse;
        if (self.isCollapse) {
          self.$refs.collapse.style.marginLeft = "33pt";
          ecsmainpath.style.width = '48pt';
          ecsmaincontent.style.width = 'calc(100% - 48pt)';
          ecsmainpath.style.transition = 'width .3s ease-out';
          ecsmaincontent.style.transition = "width .3s ease-out";
          self.$refs.collapse.style.transition = "margin-left .3s ease-out";
        } else {
          self.$refs.collapse.style.marginLeft = "125pt";
          ecsmainpath.style.width = '140pt';
          ecsmaincontent.style.width = 'calc(100% - 140pt)';
          ecsmainpath.style.transition = 'width .2s ease-out';
          ecsmaincontent.style.transition = "width .2s ease-out";
          self.$refs.collapse.style.transition = "margin-left .2s ease-in";
        }
      },

      handleAsyncData () {
       let self = this;
       let aliReg = new RegExp(/alicloud/),
         tencentReg = new RegExp(/tencentcloud/),
         huaweiReg = new RegExp(/huaweicloud/);
       if(aliReg.test(self.$router.currentRoute.path)){
         aliyunAsync(self);
       }
       if(tencentReg.test(self.$router.currentRoute.path)){
         tencentAsync(self);
       }
       if(huaweiReg.test(self.$router.currentRoute.path)) {
         huaweiAsync(self)
       }
      }
    },
    computed: {
      defaultActive() {
        if(this.$route.path === '/main/ecs/home' && this.$refs.menu){
          this.$refs.menu.activeIndex = "";
        }
        return this.$route.name.replace('create','').replace('detail','').toLowerCase();
      },
      _wrapStyle(){
        return {
           'maring-right': '0px!important',
           'background': 'red',
           'overflow-x': 'hidden'
        }
      }
    },
    watch: {
      isCollapse: function (newVal, oldVal) {
        if (newVal !== undefined && newVal !== oldVal)
          return newVal;
      }
    }
  }
</script>

<style scoped lang="less">
.mh-icon{
  color: #fff;
}
</style>
