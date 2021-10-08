<template>
    <detail-template>
      <div slot="header" class="detail-header">
        <div class="detail-header-item">
          <div class="detail-title">华为云可用区详情</div>
        </div>
        <div class="detail-header-item" @click="close()">
          <span class="create-back el-icon-back">
            回到华为云可用区列表
          </span>
        </div>
        <div class="detail-header-item">
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">
                {{$t('hybrididentityzone.identityzoneActions')}}
              </span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding: 12px 0px" @click="detailDelete()">{{$t('common.destroy')}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <el-tabs   class="detail-tab" v-model="currTab">
          <el-tab-pane name="info" :label="$t('common.basicAttributes')"></el-tab-pane>
          <el-tab-pane></el-tab-pane>
        </el-tabs>
      </div>
      <div slot="body" class="detail-body" v-if="currTab === 'info'">
         <div class="left">
           <div class="left-header">
             <div class="icon"></div>
             <div class="after-icon"></div>
             <detail-name class="name" :param="updateResourceParam('zoneName')"/>
             <detail-description class="description" :param="updateResourceParam('description')"></detail-description>
           </div>
           <div class="detail-block-header">
             {{$t('common.overview')}}
           </div>
           <div class="left-body">
             <!--可用区ID-->
             <detail-row :param="{
               title: '可用区ID',
               content: hybridHuaweiIdentity && hybridHuaweiIdentity.zoneId
             }"/>
             <!--创建日期-->
             <detail-row :param="{
               title: 'common.createDate',
               content:  hybridHuaweiIdentity && hybridHuaweiIdentity.createDate && formatDatetime(new Date(hybridHuaweiIdentity.createDate))
             }"/>
             <!--最后操作日期-->
             <detail-row :param="{
               title: 'common.lastOpDate',
               content: hybridHuaweiIdentity && hybridHuaweiIdentity.lastOpDate && formatDatetime(new Date(hybridHuaweiIdentity.lastOpDate))
             }"/>
           </div>
         </div>
        <div class="split-line"></div>
         <div class="right">
           <div style="height: 40px"></div>
           <div class="detail-block-header">
             {{$t('common.moreInformation')}}
           </div>
           <!--可用区UUID-->
           <detail-row :param="{
             title: 'UUID',
             content: windowData.dataUuid
           }"/>
         </div>
        <div class="split-line"></div>
      </div>
    </detail-template>
</template>

<script>
  //详情模板
  import DetailTemplate from "../../../component/DetailTemplate";
  //公共状态
  import WindowBase from 'src/windows/Window';
  //格式化日期格式
  import {formatDatetime} from "src/utils/utils";
  //计算方法
  import { mapGetters } from 'vuex';
  import Methods from '../Methods';
  export default {
    name: "DetailHybridHuaweiIdentityZonePage",
    components: {DetailTemplate},
    mixins: [WindowBase, Methods],
    computed: {
      ...mapGetters({
        get: 'hybridHuaweiIdentityZone/getList'
      }),
      hybridHuaweiIdentity() {
        return this.get(this.windowData.dataUuid);
      }
    },
    data() {
      return {
        currTab: 'info'
      }
    },
    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.detailQuery
        }
      }).then(() => {
        self.detailQuery()
      })
    },
    methods: {
      //格式化日期格式
      formatDatetime,
      //查询详情
      detailQuery() {
        let self = this;
        self.dispatchAction('hybridHuaweiIdentityZone/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
      //更新资源参数
      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.hybridHuaweiIdentity && this.hybridHuaweiIdentity[name] && this.hybridHuaweiIdentity[name];
          },
          canEdit: () => {
            return false;
          }
        }
      },
      //回到华为云可用区列表
      close() {
        this.$router.push({name: 'hybridhuaweiidentityzone'})
      },
      //删除可用区
      detailDelete() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'hybrididentityzone.Deleteidentityzone',
          description: 'hybrididentityzone.delete',
          icon: 'izone_popupico',
          uuidList: [self.windowData.dataUuid],
          getName: () => {
            return self.hybridHuaweiIdentity && self.hybridHuaweiIdentity.zoneName;
          },
          ok: () => {
            self.delete([self.windowData.dataUuid])
              .then( () => {
                self.close();
              });
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
  .icon{
    .detail-icon('~assets/izone_ico.svg')
  }
</style>
