<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <!--详情页标题-->
      <span class="detail-title detail-header-item">AccountKey详情</span>
      <!--返回到列表页-->
      <span class="detail-header-item create-back" @click="close()">
         <i class="el-icon-back"></i>
        回到AccountKey列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              AccountKey操作
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px"
                 :class="{'disabled-text': isDefault()}"
                 @click="!isDefault() && detailAttach()">
                {{$t('common.setDefault')}}
              </a>
              <a :class="{'disabled-text': !isDefault()}"
                 @click="isDefault() && detailDetach()">
                {{$t('common.cancelDefault')}}
              </a>
              <a style="padding-bottom: 12px;"
                 @click="detailDelete()">
                {{$t('common.destroy')}}
              </a>
            </div>
          </span>
        </drop-down>
      </span>
      <!--tab切换页-->
      <span class="detail-tab">
        <el-tabs tab-position="bottom" v-model="currTab">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body" class="detail-body">
      <!--左侧-->
      <div class="left">
        <!--左侧头部-->
        <div class="left-header">
          <div class="icon"></div>
          <div class="after-icon"></div>
          <detail-name :param="updateResourceParam('name')" class="name"/>
          <detail-description :param="updateResourceParam('description')" class="description"/>
        </div>
        <!--左侧主体部分-->
        <div class="detail-block-header">
          {{$t('common.overview')}}
        </div>
        <detail-row
          :param="{
            title: 'hybridHuaweiyunKey.userId',
            content: huaWeiKey && huaWeiKey.userId
          }"
        />
        <detail-row
          :param="{
            title: 'hybridHuaweiyunKey.accountId',
            content:  huaWeiKey && huaWeiKey.accountId
          }"
        />
        <detail-row
          :param="{
            title: 'hybridHuaweiyunKey.userName',
            content: huaWeiKey && huaWeiKey.hybridUserName
          }"
        />
        <detail-row
        :param="{
            title: 'common.default',
            content: huaWeiKey && huaWeiKey.current === 'true' ? $t('hybridKey.currentTrue') : $t('hybridKey.currentFalse')
          }"
        />
        <detail-row
          :param="{
            title: 'common.createDate',
            content: huaWeiKey && huaWeiKey.createDate && formatDatetime( new Date(huaWeiKey.createDate))
          }"
        />
        <detail-row
          :param="{
            title: 'common.lastOpDate',
            content:  huaWeiKey && huaWeiKey.lastOpDate && formatDatetime( new Date(huaWeiKey.lastOpDate))
          }"
        />

      </div>
      <!--右侧-->
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'common.uuid',
            content: windowData.dataUuid,
            copy: true
          }"
        />
      </div>
    </div>
  </detail-template>
</template>

<script>
  import {accountKeyAssistant } from '../assistant/AccountKeyAssistant';
  import DetailTemplate from "src/component/DetailTemplate";
  import  { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import {mapGetters} from 'vuex';
  import Methods from '../Methods';

  export default {
    name: "DetailHuaweiCloudAccountPage",
    mixins: [WindowBase, Methods],
    components: {
      DetailTemplate
    },
    computed: {
      ...mapGetters({
        get: 'hybridHuaWeiAccountKey/get'
      }),
      huaWeiKey() {
        return this.get(this.windowData.dataUuid);
      },
    },
    data() {
      return {
        currTab: 'info', //当前选中的Tab页
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
        self.detailQuery();
      })
    },
    methods: {
      formatDatetime,
      //查询详情信息
      detailQuery() {
        let self = this;
        self.dispatchAction('hybridHuaWeiAccountKey/basicQuery', {
          q: `uuid=${self.windowData.dataUuid}`
        });
      },
      //更新名称、描述
      updateResourceParam(param) {
         return {
           getValue: () => {
             return this.huaWeiKey && this.huaWeiKey[param] && this.huaWeiKey[param];
           },
           setValue: (newVal) => {
             if(this.huaWeiKey && this.huaWeiKey[param] === newVal) return;
             let event = this.createEvent(`common.updateInfo${param}`, this.huaWeiKey.name);
             let realParam = {
               uuid: this.windowData.dataUuid,
               param: {
                 [param]: newVal
               }
             }
             this.dispatchActionWithEvent('hybridHuaWeiAccountKey/update', realParam, null, event);
           },
           canEdit: () => {
             return true;
           }
         }
      },
      //是否默认
      isDefault() {
        return this.huaWeiKey && this.huaWeiKey.current === 'true';
      },
      //设置默认
      detailAttach() {
        let self = this;
        self.attach([self.windowData.dataUuid])
          .then( () => {
            self.detailQuery()
            if(accountKeyAssistant)
              accountKeyAssistant(self);
          })
      },
      //取消默认
      detailDetach() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'hybridTencentKey.detachAccessKey',
          description: 'hybridHuaweiyunKey.Detach_Account',
          icon: 'access_key_popupico',
          warning: 'hybridHuaweiyunKey.info.deleteWarning',
          uuidList: [self.windowData.dataUuid],
          getName: () => {
            return self.huaWeiKey.name;
          },
          ok: () => {
            self.detach([self.windowData.dataUuid])
              .then( () => {
                self.detailQuery()
                if(accountKeyAssistant)
                  accountKeyAssistant(self);
              })
          }
        })
      },
      //删除secretKey
      detailDelete() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: self.$t('hybridHuaweiyunKey.deleteHuaweiAccount') + 'AccountKey',
          description: 'hybridHuaweiyunKey.delete',
          warning: 'hybridTencentKey.info.deleteWarning',
          icon: 'access_key_popupico',
          uuidList: [self.windowData.dataUuid],
          ok: () => {
            self.delete([self.windowData.dataUuid])
              .then(() => {
                self.$router.push({name: 'hybridhuaweiaccountkey'})
              });
          },
          getName: () => {
            return self.huaWeiKey.name;
          }
        })
      },
      //回到AccountKey列表
      close() {
        this.$router.push({name: 'hybridhuaweiaccountkey'})
      }
    }
  }
</script>

<style scoped lang="less">
 @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/access_key_ico.svg');
  }
</style>
