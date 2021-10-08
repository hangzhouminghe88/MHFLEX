<template>
  <div class="app-wrapper">
    <div class="app-page-header">
      <div class="app-page-header-top">
        <div class="title">应用中心</div>
        <div class="description">{{$t('appcenter.info.desc')}}</div>
      </div>
      <div class="app-page-header-bottom">
        <ul>
          <li v-for="(app, key) in appList" :index="key">
            <span class="icon" v-if="app.src" :style="{'background-image': `url(${app.src})`}"></span>
            <span class="txt">{{$t(app.txt)}}</span>
          </li>
        </ul>
      </div>
    </div>
      <div class="app-page-body">
        <div class="card-container" ref="cardContainer">
          <div class="card" v-for="(plugin, index) in pluginList" :key="index">
            <div class="card-content">
              <div class="info">
                <span class="name">{{plugin.name}}</span>
                <drop-down class="bts dropdown" v-if="isAdmin">
                  <span slot="arrow"></span>
                  <span slot="title">
                    <span class="text">...</span>
                  </span>
                  <span slot="content">
                    <div class="dropdown-content">
                       <a @click="pageUpdate(plugin.uuid)">{{ $t('appcenter.update') }}</a>
                       <a @click="pageDelete([plugin.uuid])">{{ $t('appcenter.delete') }}</a>
                    </div>
                  </span>
                </drop-down>
              </div>
              <div class="card-main">
                <div class="desc noData" v-if="plugin.description == ''">
                  {{ $t("common.noDescription") }}
                </div>
                <div class="desc" v-else>
                  {{plugin.description}}
                </div>
                <div class="logo" v-if="plugin.recommendApp !== ''">
                  <div v-if="plugin.recommendApp === RECOMMEND_APP.XSKY.value">
                    <img src="../../assets/logo.png" />
                  </div>
                  <div v-if="plugin.recommendApp === RECOMMEND_APP.RANCHER.value">
                    <img src="../../assets/sys_app_rancher.svg" />
                  </div>
                </div>
                <div class="type">
                  <div class="category">
                    <span style="color: #ddd">{{$t('appcenter.category')}}： </span><span>{{$t(`appcenter.info.${plugin.category}`)}}</span>
                  </div>
                  <div class="access">
                    <span style="color: #ddd">{{$t('appcenter.info.access')}}：</span> <span>{{$t(`appcenter.info.${plugin.visibleAccess}`)}}</span>
                  </div>
                  <div class="icon" v-bind:class="plugin.category"></div>
                </div>
              </div>
              <div class="link" v-bind:ref="`link_${plugin.uuid}`">
                <a :href="plugin.url" target="_blank">{{ $t('appcenter.enter') }}</a>
              </div>
            </div>
          </div>
          <div class="card-add" @click="pageAdd()" v-if="isAdmin">
            <div class="card-content">
              <div class="add-wrapper">
                <div class="icon-add"></div>
                <div class="txt">{{$t("appcenter.create")}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
    import ScrollBar from "../../component/vue-scroller-bars/scroll-bar";
    import AppCenterMethods from 'src/om/appcenter/Methods';
    import WindowBase from 'src/windows/Window';
    import { RECOMMEND_APP } from './Constant'
    import Utils from 'src/utils/utils';
    export default {
      name: "AppCenterPage",
      components: {ScrollBar},
      mixins: [AppCenterMethods, WindowBase],
      created: function () {
        this.updateWindow({
          showMoreDropdown: false
        })
        if (window.localStorage.getItem('isAdmin') === 'true') {
          this.isAdmin = true
        }
        this.queryList({visibleAccess: this.visibleAccess})
      },
      computed: {
        visibleAccess: function () {
          return this.isAdmin ? '' : 'ALL'
        }
      },
      data(){
        return{
          RECOMMEND_APP: RECOMMEND_APP,
          isAdmin: false,
          availableCount: 0,
          pluginList: [],
          appList: [
            {src: require('../../assets/sys_app_storage_type.svg'), txt: 'appcenter.info.STORAGE'},
            {src: require('../../assets/sys_app_data_base_type.svg'), txt: 'appcenter.info.DB'},
            {src: require('../../assets/sys_app_safety_type.svg'), txt: 'appcenter.info.SECURITY'},
            {src: require('../../assets/sys_app_iaas_type.svg'), txt: 'appcenter.info.IaaS'},
            {src: require('../../assets/sys_app_paas_type.svg'), txt: 'appcenter.info.PaaS'},
            {src: require('../../assets/sys_app_saas_type.svg'), txt: 'appcenter.info.SaaS'},
            {src: '', txt: '...'}
          ]
        }
      },
      mounted: function () {
        this.handleResize()
        window.addEventListener('resize', this.handleResize)
      },
      destroyed: function () {
        window.removeEventListener('resize', this.handleResize)
      },
      methods: {
       ...Utils,
        handleResize: function () {
          let h = document.documentElement.clientHeight - 450
          this.$refs.cardContainer.style.height = h + 'px'
        },
        pageUpdate: function (uuid) {
          this.openDialog('UpdateAppPluginDlg', {
            uuid: uuid,
            ok: (params) => {
              this.update(params).then(() => this.queryList({visibleAccess: this.visibleAccess}))
            }
          })
        },
        pageDelete (selectedUuidList) {
         let self = this;
          self.openDialog('ConfirmDlg',{
            title: 'appcenter.delete',
            description: 'appcenter.deleteConfirm',
            icon: 'appcenter_n',
            uuidList: selectedUuidList,
            ok: () => {
              this.delete(selectedUuidList).then(() => this.queryList({visibleAccess: this.visibleAccess}))
            },
            getName(uuid){
              return self.dbData.plugin[uuid].name;
            }
          })
        },
        pageAdd(){
         let self = this;
         self.$router.push({name: 'createAppCenter'})
        }
      }
    }
</script>

<style scoped lang="less">
  .app-wrapper{
    width: 100%;
    min-height: 100%;
  }
 .app-page-header{
   height: 320px;
   border-bottom: 1px solid #409EFF;
   background-image: url("~assets/sys_app_bg.png");

   &-top{
     padding-left: 100px;
     padding-top: 60px;
     .title{
       font-size: 48px;
       line-height: 60px;
       letter-spacing: 0;
       color: #fff;
     }
     .description{
       font-size: 20px;
       line-height: 30px;
       letter-spacing: 0;
       color: #fff;
     }
   }

   &-bottom{
     padding-left: 100px;
     padding-top: 75px;
     li{
       display: inline-block;
       border-right: 1px solid #fff;
       height: 40px;
       line-height: 40px;
       color: #fff;
       &:last-child{
         border-right: none;
         margin-left: 20px;
       }
       .txt{
         margin: 0px 20px 0px 0px;
       }
       .icon{
         display: inline-block;
         width: 62px;
         height: 40px;
         margin-left: 20px;
         background-repeat: no-repeat;
       }
     }
   }
 }
  .app-page-body{
    position: relative;
    width: 100%;
    top: 61px;
    .card-container{
      position: relative;
      background-color: #F0F4F9;
      overflow-y: auto;
      width: 100%;
      padding: 30px 100px;
      height: auto;
      .card{
        position: relative;
        display: inline-block;
        width: 15%;
        height: 350px;
        margin: 20px;
        padding: 30px;
        background: #FFFFFF;
        border: 1px solid #FFFFFF;
        box-shadow: 0 1px 6px 0 #EEF5FF;
        border-radius: 4px;
        vertical-align: top;
        .card-content{
          width: 100%;
          height: 100%;
          &:hover .link{
            display: block;
          }
          .link {
            display: none;
            width:100%;
            height:100%;
            position: absolute;
            z-index: 2;
            top: 0;
            left: 0;
            opacity: 0.8;
            background-image: linear-gradient(-170deg, #419DFF 0%, #75B8FF 99%);
            border-radius: 4px;
          }
          .link a {
            display: block;
            width: 80px;
            height: 28px;
            line-height: 350px;
            margin: auto;
            font-size: 20px;
            color: #FFFFFF;
            letter-spacing: 0;
            position: relative;
            cursor: pointer;
          }
          .name{
            display: inline-block;
            width: 90%;
          }
          .bts{
            right: 20px;
            position: absolute;
            z-index: 10;
            cursor: pointer;
            background-image: none;
            .dropdown-content {
              min-width: 0;
              left: -40px;
              top: 30px;
            }
          }
          .card-main{
            .desc{
              margin-top: 20px;
            }
            .logo{
              position: absolute;
              bottom: 110px;
            }
            .icon{
              display: inline-block;
              position: absolute;
              right: -100px;
              top: -20px;
            }
            .type{
              position: absolute;
              bottom: 30px;
            }
            .type .icon {
              display: block;
              float: right;
            }
            .type .SECURITY {
              width: 64px;
              height: 57px;
              background: url('~assets/sys_app_safety_detail.svg');
              display: inline-block;
            }
            .type .STORAGE {
              width: 66px;
              height: 57px;
              background: url('~assets/sys_app_storage_detail.svg');
              display: inline-block;
            }
            .type .DB {
              width: 66px;
              height: 57px;
              background: url('~assets/sys_app_data_base_detail.svg') ;
              display: inline-block;
            }
            .type .IaaS {
              width: 66px;
              height: 57px;
              background: url('~assets/sys_app_iaas_detail.svg');
            }
            .type .PaaS {
              width: 66px;
              height: 57px;
              background: url('~assets/sys_app_paas_detail.svg');
            }
            .type .SaaS {
              width: 66px;
              height: 57px;
              background: url('~assets/sys_app_saas_detail.svg');
            }
          }
        }
      }
      .card-add{
        display: inline-block;
        position: relative;
        width: 15%;
        height: 350px;
        margin: 20px;
        background: #FFFFFF;
        border: 1px solid #FFFFFF;
        box-shadow: 0 1px 6px 0 #EEF5FF;
        border-radius: 4px;
        .card-content{
          background: #fafdff;
          border: 1px dashed #c6d3dc;
          position: relative;
          width: 100%;
          height: 350px;
          padding: 30px;
          box-shadow: 0 1px 6px 0 #eef5ff;
          border-radius: 4px;
          margin: 0 auto;
          .add-wrapper{
            position: relative;
            text-align: center;
            top: 140px;
          }
          .icon-add{
            display: block;
            width: 32px;
            height: 32px;
            background: url('~assets/sys_app_add.svg');
            background-size: contain;
            background-repeat: no-repeat;
            margin: 0 auto;
          }
        }
      }
    }
  }

</style>
