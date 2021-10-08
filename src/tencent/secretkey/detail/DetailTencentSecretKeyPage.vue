<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">
        腾讯云Secret Key详情
      </span>

      <div class="detail-header-item"
           @click="$router.push({name: 'hybridtencentkeysecret'})">
        <span class="create-back">
          <i class="el-icon-back"></i>
          <span style="font-size: 12px;">
            回到腾讯云Secret Key详情
          </span>
        </span>
      </div>

      <div class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              {{$t('hybridTencentKey.secretKeyActions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
               <a style="padding-top: 12px;"
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
      </div>

      <el-tabs v-model="activeName" class="detail-tab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body"  class="detail-body">
       <div class="left">
         <div class="left-header">
           <div class="icon"></div>
           <div class="after-icon"></div>
           <detail-name class="name" :param="updateResourceParam('name')"/>
           <detail-description class="description" :param="updateResourceParam('description')"/>
         </div>
         <div class="left-body">
           <div class="detail-block-header">{{$t('common.overview')}}</div>
           <detail-row v-for="(item, index) in leftItemGroup"
                       :key="index"
             :param="{
               title: item.title,
               content: item.content
             }"
           />
         </div>
       </div>

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
  import {checkAccessKey} from "../assitant/SecretKeyAssistant";
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import { mapGetters } from 'vuex';
  import Methods from '../Methods';

  export default {
    name: "DetailTencentSecretKeyPage",

    components: {DetailTemplate},

    mixins: [WindowBase, PageBase, Methods],

    computed: {
      ...mapGetters({
        get: 'hybridTencentSecretKey/get'
      }),
      tencentKey() {
        return this.get(this.windowData.dataUuid);
      },
      leftItemGroup() {
        if(!this.tencentKey) return [];
        return [
          {title: 'hybridTencentKey.secretId', content: this.tencentKey.secretId},
          {title: 'hybridTencentKey.secretKey', content: this.tencentKey.secretKey},
          {title: 'common.default', content: this.tencentKey.current === 'true' ? this.$t('common.yes') : this.$t('common.no')},
          {title: 'common.createDate', content: this.tencentKey.createDate ? formatDatetime(new Date(this.tencentKey.createDate)) : ''},
          {title: 'common.lastOpDate', content: this.tencentKey.lastOpDate ? formatDatetime(new Date(this.tencentKey.lastOpDate)) : ''}
        ]
      }
    },

    data() {
      return {
        activeName: 'info'
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
      }).then( () => {
        self.detailQuery();
      })
    },

    methods: {
      detailQuery() {
        let self = this;
        self.dispatchAction('hybridTencentSecretKey/basicQuery', {
          q: `uuid=${self.windowData.dataUuid}`
        });
      },
      //更新名称、描述
      updateResourceParam(param) {
        return {
          getValue: () => {
            return this.tencentKey && this.tencentKey[param];
          },
          setValue: (newVal) => {
            if(this.tencentKey && this.tencentKey[param] === newVal) return;
            let event = this.createEvent(`common.updateInfo${param}`, this.tencentKey.name);
            let realParam = {
              uuid: this.windowData.dataUuid,
              param: {
                [param]: newVal
              }
            }
            this.dispatchActionWithEvent('hybridTencentSecretKey/update', realParam, null, event);
          },
          canEdit: () => true
        }
      },
      //设置默认
      detailAttach () {
        let self = this;
        self.attach([self.windowData.dataUuid])
          .then( () => {
            self.detailQuery()
            if(checkAccessKey)
              checkAccessKey(self);
          })
      },
      //取消默认
      detailDetach() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'hybridTencentKey.detachAccessKey',
          description: 'hybridTencentKey.Detach_AccessKey',
          icon: 'access_key_popupico',
          warning: 'hybridTencentKey.info.deleteWarning',
          uuidList: [self.windowData.dataUuid],
          getName: () => {
            return self.tencentKey.name;
          },
          ok: () => {
            self.detach([self.windowData.dataUuid])
              .then( () => {
                self.detailQuery()
                if(checkAccessKey)
                  checkAccessKey(self);
              })
          }
        })
      },
      //删除secretKey
      detailDelete() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'hybridTencentKey.DeleteSecretKey',
          description: 'hybridTencentKey.delete',
          warning: 'hybridTencentKey.info.deleteWarning',
          icon: 'access_key_popupico',
          uuidList: [self.windowData.dataUuid],
          ok: () => {
            self.delete([self.windowData.dataUuid])
              .then(() => {
                self.$router.push({name: 'hybridtencentkeysecret'})
              });
          },
          getName: () => {
            return self.tencentKey.name;
          }
        })
      },
      //是否默认
      isDefault() {
        return this.tencentKey && this.tencentKey.current === 'true';
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
  .icon{
    .detail-icon('~assets/access_key_ico.svg');
  }
</style>
