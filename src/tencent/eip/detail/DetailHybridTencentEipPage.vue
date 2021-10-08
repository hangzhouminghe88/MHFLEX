<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">腾讯云弹性公网Ip详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'hybridtencenteip'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到腾讯云弹性公网ip列表</span>
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
          <div class="icon"></div>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-show="hybridTencentEip.status" :state="getState"/>
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
              content: hybridTencentEip.eipAddress && hybridTencentEip.eipAddress
            }"
          />
          <detail-row
            :param="{
              title: 'common.bandwidth',
              content: hybridTencentEip.bandWidth && `${hybridTencentEip.bandWidth}M`
            }"
          />
          <detail-row
            :param="{
              title: 'eipId',
              content: hybridTencentEip.eipId && hybridTencentEip.eipId
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridTencentEip.createDate && formatDatetime(new Date(hybridTencentEip.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridTencentEip.lastOpDate && formatDatetime(new Date(hybridTencentEip.lastOpDate))
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
            content: hybridTencentEip.ecsName && hybridTencentEip.ecsName,
            handler: () => {
              $router.push({name: 'detailHybridTencentEcs', params: {uuid: hybridTencentEip.allocateResourceUuid}})
            }
          }"
        />
        <detail-row
          :param="{
            title: 'common.hybriddatacenter',
            content: hybridTencentEip.dataCenterName && hybridTencentEip.dataCenterName,
            handler: () => {
             $router.push({name: 'detailHybridTencentDataCenter', params: {uuid: hybridTencentEip.dataCenterUuid}})
            }
          }"
        />
				<div class="split-line"></div>
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
    name: "DetailHybridTencentEipPage",

    mixins: [WindowBase, Methods],

    components: {DetailInfoState, DetailTemplate},

    computed: {
      ...mapGetters({
        get: 'hybridTencentEip/get'
      }),
      hybridTencentEip() {
        let self = this;
        return self.get([self.windowData.dataUuid]);
      },
      //是否绑定ecs
      isAttachEip() {
        return _.has(this.hybridTencentEip, 'allocateResourceUuid')
			},
			getState() {
				return this.hybridTencentEip && this.hybridTencentEip.status && this.hybridTencentEip.status.charAt(0) + this.hybridTencentEip.status.toLowerCase().slice(1)
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
            return this.hybridTencentEip[name] && this.hybridTencentEip[name].replace(/zstack/g, '');
          },
          setValue: (newVal) => {
            if(_.isEqual(newVal, this.hybridTencentEip[name])) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.hybridTencentEip.name);
            let param = {
              [name]: newVal,
              type: 'tencent'
            }
            this.dispatchActionWithEvent('hybridTencentEip/update', {param, uuid: this.windowData.dataUuid}, null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      },
      //查询详情数据
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridTencentEip/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
      //绑定ecs
      detailAttach() {
        let self = this;
        let allocateResourceUuidList = []
        rpc.query('hybrid/tencent/eip')
          .then((resp) => {
            allocateResourceUuidList = resp.inventories.map(item => item.allocateResourceUuid)
            self.updateDbTable({
              tableName: 'hybridTencentEip',
              list: resp.inventories
            })
            self.openDialog('HybridTencentEcsInstanceSingleSelect', {
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
        if (_.has(self.hybridTencentEip, 'allocateResourceUuid')) uuidList.push(uuid)
        self.openDialog('ConfirmDlg', {
          uuidList,
          title: 'hybrideip.detachEip',
          description: 'hybrideip.detach',
          icon: 'eip_popupico',
          getName: (uuid) => {
            return this.dbData.hybridTencentEip[uuid].name.replace(/zstack/g, '');
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
          checkBoxText: '同时删除腾讯云上资源',
          getName: (uuid) => {
            return this.dbData.hybridTencentEip[uuid].name.replace(/zstack/g, '');
          },
          ok: (isDeleteOrigin) => {
            self.delete([uuid], isDeleteOrigin).then(() => self.$router.push({name:'hybridtencenteip'}));
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
