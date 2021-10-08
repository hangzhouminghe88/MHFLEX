<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">AccessKey详情</span>
      <span class="detail-header-item create-back"
            @click="$router.push({name: 'hybridkeysecret', params: {type: $route.params.type}})"
      >
        <i class="el-icon-back"></i>
        回到AccessKey列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('hybridKey.AccessKeyActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
               <a style="padding-top: 12px;" :class="{'disabled-text': isDefault()}"
                  @click="!isDefault() && service.detailAttach()"
               >{{$t('common.setDefault')}}</a>
                <a :class="{'disabled-text': !isDefault()}"
                   @click="isDefault() && service.detailDetach()">{{$t('common.cancelDefault')}}</a>
                <a @click="service.detailDelete(windowData.currTab)" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="access_key_ico"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="service.updateResourceParam('name')"/>
          <detail-description class="description" :param="service.updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header" v-text="$t('common.overview')"></div>
           <detail-row
             :param = "{
               title: 'hybridKey.AccessKeyID',
               content: model && model.akey
             }"
           />

          <detail-row v-if="$route.params.type === 'aliyun'"
            :param = "{
              title: 'hybridKey.hybridAccountId',
              content: model && model.hybridAccountId
            }"
          />

          <detail-row v-if="$route.params.type === 'aliyun'"
            :param = "{
              title: 'hybridKey.hybridUserName',
              content: model && model.hybridUserName
            }"
          />

          <detail-row
            :param = "{
              title: 'common.default',
              content: model && model.current === 'true' ? $t('hybridKey.currentTrue') : $t('hybridKey.currentFalse')
            }"
          />

          <detail-row
            :param = "{
              title: 'common.createDate',
              content: model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />

          <detail-row
            :param = "{
              title: 'common.lastOpDate',
              content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
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
          :param = "{
            title: 'UUID',
            content: model && model.uuid,
            copy: () => {
              return true;
            }
          }"
        />
      </div>
    </div>
  </detail-template>
</template>

<script>
  import DetailHybridKeySecretService from './DetailHybridKeySecretService';
  import DetailTemplate from "src/component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from '../Methods';

  export default {
    name: "DetailHybridkeySecret",

    mixins: [WindowBase, Methods],

    components: {
      DetailTemplate
    },

    created () {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid;
      self.service = new DetailHybridKeySecretService(self);
      self.updateWindow({
        dataUuid,
        type: self.$route.params.type,
        methods: {
          query: self.query
        }
      }).then ( () => {

        self.service.query();
      })
    },

    data () {
      return {
        currTab: 'info',
        service: {},
        hybridKeySecret: {}
      }
    },

    methods: {
      ...Utils,
      isDefault (){
        let self = this;
        return self.model && self.model.current === 'true';
      },
    },

    computed: {
      model: {
        get () {
          let self = this;
          if (self.hybridKeySecret) {
            return self.hybridKeySecret;
          }
        },
        set (val) {
          let self = this;
          self.hybridKeySecret = val;
        }
      }
    },

    destroyed () {
      let self = this;
      self.deleteGlobalAssistant('Hybrid')
    }
  }
</script>

<style scoped lang="less">
  @import '../../../style/mixins';
  .icon{
    .detail-icon('~assets/access_key_ico.svg')
  }
</style>
