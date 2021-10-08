<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云弹性公网Ip详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'hybridalicloudeip'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到阿里云弹性公网ip列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('hybrideip.Actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a @click="!isAttachEip && detailAttach()" style="padding-top: 12px;" :class="{ 'disabled-text': isAttachEip}">{{$t("hybrideip.attach")}}</a>
              <a @click="isAttachEip && detailDetach(windowData.dataUuid)" :class="{ 'disabled-text': !isAttachEip}">{{$t("hybrideip.detachhybridEip")}}</a>
              <a @click="deleteEip(windowData.dataUuid)" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body">
      <div class="left">
        <div class="left-header">
          <base-icon name="eip_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-show="hybridAliCloudEip.status" :state="hybridAliCloudEip.status"/>
          </div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'common.ip',
              content: hybridAliCloudEip.eipAddress && hybridAliCloudEip.eipAddress
            }"
          />
          <detail-row
            :param="{
              title: 'common.bandwidth',
              content: hybridAliCloudEip.bandWidth && `${hybridAliCloudEip.bandWidth}M`
            }"
          />
          <detail-row
            :param="{
              title: 'eipId',
              content: hybridAliCloudEip.eipId && hybridAliCloudEip.eipId
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudEip.createDate && formatDatetime(new Date(hybridAliCloudEip.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudEip.lastOpDate && formatDatetime(new Date(hybridAliCloudEip.lastOpDate))
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px;"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: windowData.dataUuid,
            copy: true
          }"
        />
        <detail-row
          :param="{
            title: 'common.hybridecsinstance',
            content: hybridAliCloudEip.ecsName && hybridAliCloudEip.ecsName,
            handler: () => {
              $router.push({name: 'detailHybridAliCloudEcs', params: {uuid: hybridAliCloudEip.allocateResourceUuid}})
            }
          }"
        />
        <detail-row
          :param="{
            title: 'common.hybriddatacenter',
            content: hybridAliCloudEip.dataCenterName && hybridAliCloudEip.dataCenterName,
            handler: () => {
             $router.push({name: 'detailHybridAliCloudDataCenter', params: {uuid: hybridAliCloudEip.dataCenterUuid}})
            }
          }"
        />
      </div>
    </div>
  </detail-template>
</template>

<script>
  import DetailInfoState from "src/component/DetailInfoState";
  import DetailTemplate from "src/component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import { mapGetters } from 'vuex';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "DetailHybridAliCloudEipPage",

    mixins: [WindowBase, Methods],

    components: {DetailInfoState, DetailTemplate},

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudEip/get'
      }),
      hybridAliCloudEip() {
        let self = this;
        return self.get([self.windowData.dataUuid]);
      },
      //是否绑定ecs
      isAttachEip() {
        return _.has(this.hybridAliCloudEip, 'allocateResourceUuid')
      },
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
      }).then( () => {
        self.detailQuery();
      })
    },

    methods: {
      ...Utils,
      //更新资源参数
      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.hybridAliCloudEip[name] && this.hybridAliCloudEip[name].replace(/zstack/g, '');
          },
          setValue: (newVal) => {
            if(_.isEqual(newVal, this.hybridAliCloudEip[name])) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.hybridAliCloudEip.name);
            let param = {
              [name]: newVal,
              type: 'aliyun'
            }
            this.dispatchActionWithEvent('hybridAliCloudEip/update', {param, uuid: this.windowData.dataUuid}, null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      },
      //查询详情数据
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridAliCloudEip/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
      //绑定ecs
      detailAttach() {
        let self = this;
        let allocateResourceUuidList = []
        rpc.query('hybrid/eip')
          .then((resp) => {
            allocateResourceUuidList = resp.inventories.map(item => item.allocateResourceUuid)
            self.updateDbTable({
              tableName: 'hybridEip',
              list: resp.inventories
            })
            self.openDialog('HybridAliCloudEcsSingleSelect', {
              conditions: [`uuid!?=${allocateResourceUuidList}`],
              select: (vmNicUuid) => self.attach(vmNicUuid, [self.windowData.dataUuid])
                .then(() => self.detailQuery())
                .then(() => {
                  self.$forceUpdate();
                })
            })
          })
      },
      //解绑ecs
      detailDetach(uuid) {
        let self = this, uuidList = [];
        if (_.has(self.hybridAliCloudEip, 'allocateResourceUuid')) uuidList.push(uuid)
        self.openDialog('ConfirmDlg', {
          uuidList,
          title: 'hybrideip.detachEip',
          description: 'hybrideip.detach',
          icon: 'eip_popupico',
          getName: (uuid) => {
            return this.dbData.hybridEip[uuid].name.replace(/zstack/g, '');
          },
          ok: () => self.detach(uuidList).then(() => {
            self.detailQuery()
          }).then(() => {
            self.$forceUpdate();
          })
        })
      },
      //删除公网Ip
      deleteEip(uuid) {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title:'hybrideip.delete',
          description: 'hybrideip.deleteEip',
          icon: 'eip_popupico',
          uuidList: [uuid],
          isChecked: true,
          checkBoxText: 'hybrid.deleteOrigin',
          getName: (uuid) => {
            return this.dbData.hybridEip[uuid].name.replace(/zstack/g, '');
          },
          ok: (isDeleteOrigin) => {
            self.delete([uuid], isDeleteOrigin).then(() => self.$router.push({name:'hybridalicloudeip'}));
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
  .icon{
    .detail-icon('~assets/eip_ico.svg');
  }
</style>
