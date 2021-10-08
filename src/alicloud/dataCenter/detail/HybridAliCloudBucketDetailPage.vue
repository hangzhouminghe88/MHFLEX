<template>
  <detail-template  class="bucket-detail__container">
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云Bucket详情</span>
      <span class="detail-header-item" @click="$emit('close')">
        <span class="create-back el-icon-back">
          返回
        </span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{'Bucket'+$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
               <a id="common-setDefault" style="padding-top: 12px;" @click="(hybridAliCloudBucket && hybridAliCloudBucket.current === 'false') && detailAttach(windowData.dataUuid)" :class="{ 'disabled-text': !(hybridAliCloudBucket && hybridAliCloudBucket.current === 'false' )}">{{$t("common.setDefault")}}</a>
              <!--           <a @click="(dbData.hybridBucket[windowData.dataUuid].current === 'true') && pageDetach(windowData.dataUuid)" :class="{ 'disabled-text': !(dbData.hybridBucket[windowData.dataUuid].current === 'true' )}">{{$t("common.cancelDefault")}}</a> -->
               <a id="common-destroy" style="padding-bottom: 12px;" @click="detailDelete(windowData.dataUuid)">{{ $t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs v-model="currTab" tab-position="bottom" class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
       <div class="left">
         <div class="left-header">
           <base-icon name="oss_ico"/>
           <div class="after-icon"></div>
           <detail-name class="name" :param="updateResourceParam('bucketName')">
             <div class="error-text error" v-show="invalidname">{{$t('error.invalid') + $t('common.name')}}</div>
           </detail-name>
           <detail-description class="description" :param="updateResourceParam('description')"/>
         </div>
         <div class="left-body">
           <div class="detail-block-header">
             {{$t('common.overview')}}
           </div>
           <detail-row
             :param="{
               title: 'hybridbucket.region',
               content: hybridAliCloudBucket && hybridAliCloudBucket.regionName
             }"
           />

           <detail-row
             :param="{
               title: 'hybridbucket.regionId',
               content: hybridAliCloudBucket && hybridAliCloudBucket.regionId
             }"
           />

           <detail-row
             :param="{
               title: 'common.default',
               content: (hybridAliCloudBucket && hybridAliCloudBucket.current === 'true') ? $t('hybridKey.currentTrue') : $t('hybridKey.currentFalse')
             }"
           />

           <detail-row
             :param="{
               title: 'common.createDate',
               content: hybridAliCloudBucket && hybridAliCloudBucket.createDate && formatDatetime(new Date(hybridAliCloudBucket.createDate))
             }"
           />

           <detail-row
             :param="{
               title: 'common.lastOpDate',
               content:  hybridAliCloudBucket && hybridAliCloudBucket.lastOpDate && formatDatetime(new Date(hybridAliCloudBucket.lastOpDate))
             }"
           />

           <div class="split-line"></div>
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

         <detail-row
           :param="{
             title: 'hybriddatacenter.region',
             content:  hybridAliCloudBucket && hybridAliCloudBucket.regionName,
             handler: () =>  {
               $emit('close')
             }
           }"
         />
       </div>
    </div>
  </detail-template>
</template>

<script>
  import HybridMethods from 'src/alicloud/hybridBucket/Methods';
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import rpc from 'src/utils/rpc';

  export default {
    name: "HybridAliCloudBucketDetailPage",

    components: {DetailTemplate},

    mixins: [PageBase, WindowBase, HybridMethods],

    props: {
      param: {
        type: Object,
        default: () => {

        }
      }
    },

    data() {
      return {
        currTab: 'info',
        model: {},
        invalidname: false
      }
    },

    created() {
      //初始化
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.query
        }
      }).then( () => {
        self.query();
      })
    },

    computed: {
      hybridAliCloudBucket : {
        get () {
          return this.model && this.model;
        },
        set(val) {
          this.model = val;
        }
      }
    },

    methods: {
      formatDatetime,
      //查询单挑数据
      query() {
        return rpc.query(`hybrid/aliyun/oss-bucket/${this.windowData.dataUuid}`)
          .then(resp => {
            return this.updateDbRow({
              tableName: 'hybridBucket',
              id: this.windowData.dataUuid,
              data: resp.inventories[0]
            })
          }).then( () => {
            this.hybridAliCloudBucket = _.get(this.dbData.hybridBucket, this.windowData.dataUuid);
          })
      },
      //更新名称、描述
      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.hybridAliCloudBucket && this.hybridAliCloudBucket[name];
          },
          setValue: (newVal) => {
            if(this.hybridAliCloudBucket && this.hybridAliCloudBucket[name] === newVal) return;
            if(name === 'name' && (!(/^[a-z\d][a-z\d\-]*[a-z\d]$/.test(name))
              || (name.length <=3 || name.length >= 63))) {
              this.invalidname = true;
              return
            }
            this.updateResource(newVal, name).then(() => this.query());
          },
          canEdit: () => {
            return name === 'description' ? true : false;
          }
        }
      },
      //更新名称、描述
      updateResource(newVal, param) {
        let self = this, event = self.createEvent(`common.updateInfo${param}`, self.hybridAliCloudBucket.bucketName);
        let params = {}; params[param] = newVal;
        return rpc.update('hybrid/aliyun/oss-bucket', self.windowData.dataUuid, {
          "updateOssBucket": params
        }, event).then(() => {
          self.incEventSuccess(event);
        }).catch(() => {
          self.incEventFail(event);
        })
      },

      //删除bucket
      detailDelete: function (uuid) {
        const self = this
        self.openDialog('ConfirmDlg', {
          title: 'hybridbucket.DeleteBucket',
          description: 'hybridbucket.delete',
          icon: 'bucket_popupico',
          uuidList: [uuid],
          isChecked: true,
          checkBoxText: 'hybrid.deleteOrigin',
          ok: (deleteOrigin) => {
            self.delete([uuid], deleteOrigin, self.param.refresh)
              .then(() => self.$emit('close'))
          },
          getName: (uuid) => {
            return self.dbData.hybridBucket[uuid].name;
          }
        })
      },
      //设置默认
      detailAttach (uuid) {
        const self = this
        self.attach([uuid], self.query)
      },
      //取消默认
      detailDetach (uuid) {
        const self = this
        self.detach([uuid], self.query)
      },

    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
  .bucket-detail__container {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;
    z-index: 9;
    background: #fff;
  }
  .icon{
    .detail-icon('~assets/oss_ico.svg')
  }
</style>
