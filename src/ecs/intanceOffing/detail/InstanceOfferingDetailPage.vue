<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">计算规格详情</span>
       <span @click="$router.push({name: 'instanceoffering'})" class="create-back detail-header-item"
           ><i
         class="el-icon-back"></i>
        回到计算规格列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t("common.moreActions")}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" @click="canEnabled() && start([model && model.uuid])" :class="{'disabled-text': !canEnabled()}">{{$t('common.enable')}}</a>
              <a @click="canDisabled() && stop([model && model.uuid])" :class="{'disabled-text': !canDisabled()}">{{$t('common.disable')}}</a>
              <a @click="canShareToAll() && pageShareInstanceOfferingToAll()" :class="{'disabled-text': !canShareToAll()}">{{$t("common.shareToAll")}}</a>
              <a @click="canNotShareToAll() && pageRecallInstanceOfferingFromAll()" :class="{'disabled-text': !canNotShareToAll()}">{{$t("common.recallFromAll")}}</a>
              <a style="margin-bottom: 12px" @click="pageDelete()">{{$t('common.destroyed')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
        <el-tabs @tab-click="handleTabChange" tabPosition="bottom"
                 v-model="activeName">
         <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
          <el-tab-pane :label="$t('common.share')" name="share"></el-tab-pane>
         <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
           <base-icon name="instance_offering_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-if="model && model.state" :state="model && model.state" style="background: transparent; border: none;"/>
          </div>
          <detail-name class="name" :param="getNameParam()"/>
          <detail-description class="description" :param="getDescription()"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row
            :param="{
              title: 'common.memory',
              content: model && bytesToSize(model.memorySize)
            }"/>
          <detail-row
            :param="{
             title: 'CPU',
             content: model && model.cpuNum
            }"
          />
          <detail-row v-if="!dbData.common.isOpensource" class="editable"
           :param="{
             title: 'instanceOffering.allocatorStrategy',
             content: $t(`instanceOffering.${model.allocatorStrategy}`),
             editable: dbData.common.isAdmin && !dbData.common.isOpensource,
             copy: false,
             handler(){
               openUpdateStrategy(model.uuid)
             }
           }"
          />
          <detail-row v-if="!dbData.common.isOpensource && model.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy'" class="editable"
                      :param="{
             title: 'instanceOffering.allocatorStrategy',
             content: model.maxInstancePerHost,
           }"
          />
          <detail-row v-if="dbData.common.isAdmin && (model.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy' || model.allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy')"
            :param="{
              title: 'instanceOffering.strategyPattern',
              content: getContent()
            }"
          />
          <detail-row
            :param="{
              title: 'common.shareToAll',
              content: $t(`common.${model.toPublic}`)
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content:  model && model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
             title: 'common.lastOpDate',
             content: model && model.createDate && formatDatetime(new Date(model.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px;"></div>
        <div class="detail-block-header">
           {{$t("common.moreInformation")}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            copy: true,
            content: model && model.uuid
          }"
        />
        <detail-row
          :param="{
            title: 'volume.volumeReadBandwidth',
            content: model && bytesToSize(model.volumeReadBandwidth, 'B/s')
          }"
        />
        <detail-row
          :param="{
            title: 'volume.volumeWriteBandwidth',
            content: model && bytesToSize(model.volumeWriteBandwidth, 'B/s')
          }"
        />
        <detail-row
          :param="{
           title: 'common.volumeTotalBandwidth',
           content: getTotalBandwidth()
          }"
        />
        <detail-row
         :param="{
          title: 'common.networkOutboundBandwidth',
          content: getNetWorkOutBoundBandWidth()
         }"
        />
        <detail-row
          :param="{
            title: 'common.networkInboundBandwidth',
            content: getNetWorkInBoundBandWidth()
          }"
        />
      </div>
    </div >
    <div class="detail-body" slot="body" v-if="activeName === 'share'">
      <share-tab-list :param="{conditions: `resourceUuid=${dataUuid}`, uuid: dataUuid, tableName: 'instanceOffering'}"/>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'log'">
      <log-list :param="{uuid: dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import InstanceOfferingMethods from 'src/ecs/intanceOffing/Methods';
  import {mapGetters} from 'vuex';
  import DetailInfoState from "../../../component/DetailInfoState";
  import {bytesToSize} from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import ShareTabList from "../../image/component/ShareTabList";
  import LogList from "../../../component/LogList";

  export default {
    name: "InstanceOfferingDetailPage",
    mixins:[WindowBase, InstanceOfferingMethods],
    components: {LogList, ShareTabList, DetailInfoState, DetailTemplate},
    data() {
      return {
        activeName: 'info',
        editStrategyPattern: false,
      }
    },
    computed: {
      ...mapGetters({
        getByUuid: 'instanceOffering/get'
      }),
      model() {
        let self = this;
        return self.getByUuid(self.$route.params.uuid)
      }
    },
    created(){
      let self = this;
      self.dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        methods: {
          query: this.query
        }
      })
        .then(() => {
          return self.query()
        })
        .then(() => {
          self.$forceUpdate()
        })
    },
    methods: {
      query () {
        let self = this;
        self.dispatchAction('instanceOffering/query', self.dataUuid)
      },
      handleTabChange(){

      },
      canEnabled(){
        let self = this;
        return self.model && self.model.state !== 'Enabled';
      },
      canDisabled(){
        let self = this;
        return self.model && self.model.state !== 'Disabled';
      },
      canShareToAll(){
        let self = this;
        if(!self.model.toPublic) return true;
        else return false;
      },
      canNotShareToAll(){
        let self = this;
        if(!self.model.toPublic) return false;
        else return true;
      },
      pageShareInstanceOfferingToAll () {
        let uuidList = [], self = this;
        uuidList = [self.model && self.model.uuid];
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              // this.shareInstanceOfferingToAll(uuidList)
              this.dispatchActionWithEvent('instanceOffering/shareToPublic', uuidList)
            }
          })
        }
      },
      pageRecallInstanceOfferingFromAll () {
        let uuidList = [], self = this;
        uuidList = [self.model && self.model.uuid];
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.recallFromAll',
            warning: 'account.recall',
            ok: () => {
              // this.shareInstanceOfferingToAll(uuidList)
              this.dispatchActionWithEvent('instanceOffering/revokeSharing', uuidList)
            }
          })
        }
      },
      pageDelete(){
        let uuidList = [], self = this;
        uuidList = [self.$route.params.uuid]
        self.openDialog('ConfirmDlg',{
          title: 'common.destroyInstanceOffering',
          description: 'instanceOffering.delete',
          icon: 'instance_offering_popupico',
          uuidList,
          ok: () => {
            self.dispatchActionWithEvent('instanceOffering/delete', uuidList)
              .then(() => {
                this.queryList()
              })
          },
          getName: (uuid) => {
            return self.model.name;
          }
        })
      },
      getNameParam(){
        return {
          getValue: () => {
            return this.model.name
          },
          setValue: (value) => {
            if(value !== this.model.name)
            this.updateName('name',value)
          }
        }
      },
      getDescription(){
        return {
          getValue: () => {
            return this.model.description
          },
          setValue: (value) => {
            if(value !== this.model.description)
            this.updateName('description',value)
          }
        }
      },
      updateName(key, value){
        let param = {};
        if(!key) return;
        param[key]= value;
        this.dispatchActionWithEvent('instanceOffering/update', {
          uuid: this.dataUuid,
           value: param
        })
      },
      getContent(){
          let self = this;
          if(self.model && !self.editStrategyPattern && self.model.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy')
            return  self.model.minimumCPUUsageHostAllocatorStrategyMode ? self.$t(`instanceOffering.${self.model.minimumCPUUsageHostAllocatorStrategyMode}`) : self.$t('instanceOffering.soft')
          else
            return  self.model.minimumMemoryUsageHostAllocatorStrategyMode ? self.$t(`instanceOffering.${self.model.minimumMemoryUsageHostAllocatorStrategyMode}`) :self.$t('instanceOffering.soft')
      },
      getTotalBandwidth () {
        if (this.model.volumeTotalBandwidth !== undefined) {
          return bytesToSize(parseInt(this.model.volumeTotalBandwidth), 'B/s')
        }
        return this.$t('common.unlimited')
      },
      getNetWorkOutBoundBandWidth(){
        if (this.model.networkOutboundBandwidth !== undefined) {
          return bytesToSize(parseInt(this.model.networkOutboundBandwidth), 'bps')
        }
        return this.$t('common.unlimited')
      },
      getNetWorkInBoundBandWidth(){
        if (this.model.networkInboundBandwidth !== undefined) {
          return bytesToSize(parseInt(this.model.networkInboundBandwidth), 'bps')
        }
        return this.$t('common.unlimited')
      },
      openUpdateStrategy(uuid){
        let self = this;
        let obj = {
          allocatorStrategy: self.model.allocatorStrategy,
          maxInstancePerHost: self.model.maxInstancePerHost
        }
        if (self.model.allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy') obj.minimumMemoryUsageHostAllocatorStrategyMode = self.model.minimumMemoryUsageHostAllocatorStrategyMode
        else if (self.model.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy') obj.minimumCPUUsageHostAllocatorStrategyMode = self.model.minimumCPUUsageHostAllocatorStrategyMode
        self.openDialog('UpdateStrategyForHostDlg',{
          ...obj,
          uuid: this.dataUuid,
          ok: (param) => {
            self.updateAllocatorStrategy(uuid, param.allocatorStrategy)
              .then(() => {
                self.query()
              })
            if (param.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy') {
              self.updateMaxInstancePerHost(uuid, param.maxInstancePerHost)
                .then(() => {
                  self.query()
                })
            }
            if (param.allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy') {
              self.updateCPUOrMemoryUsageHostAllocatorStrategyMode(self.dataUuid, param.minimumMemoryUsageHostAllocatorStrategyMode)
                .then(() => self.query())
            }
            if (param.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy') {
              self.updateCPUOrMemoryUsageHostAllocatorStrategyMode(self.dataUuid, param.minimumCPUUsageHostAllocatorStrategyMode)
                .then(() => self.query())
            }
          }
        })
      },
      updateMaxInstancePerHost (uuid, maxInstancePerHost) {
        const self = this
        return rpc.query('system-tags', {
          q: [`resourceUuid=${uuid}`, 'resourceType=InstanceOfferingVO', 'tag~=maxInstancePerHost::%25']
        }).then((resp) => {
          if (resp.inventories.length > 0) {
            let item = resp.inventories[0]
            rpc.update('system-tags', `${item.uuid}`, {
              updateSystemTag: {
                tag: `maxInstancePerHost::${maxInstancePerHost}`
              }
            }).then(() => {
              item.maxInstancePerHost = maxInstancePerHost
              self.updateDbRow({
                tableName: 'systemtags',
                id: item.uuid,
                data: item
              })
            })
          } else {
            rpc.create('system-tags', {
              resourceType: 'InstanceOfferingVO',
              resourceUuid: uuid,
              tag: `maxInstancePerHost::${maxInstancePerHost}`
            }).then((tagResp) => {
              self.updateWindow({ maxInstancePerHostUuid: tagResp.inventory.uuid })
              self.updateDbRow({
                tableName: 'systemtags',
                id: tagResp.inventory.uuid,
                data: tagResp.inventory
              })
            })
          }
        })
      },
      updateCPUOrMemoryUsageHostAllocatorStrategyMode (uuid, mode) {
        const self = this
        return rpc.query('system-tags', {
          q: [`resourceUuid=${uuid}`, 'resourceType=InstanceOfferingVO', 'tag~=%25AllocatorStrategyMode::%25']
        }).then((resp) => {
          let tag = ''
          if (self.model.allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy') {
            tag = `minimumMemoryUsageHostAllocatorStrategyMode::${mode}`
          } else if (self.model.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy') {
            tag = `minimumCPUUsageHostAllocatorStrategyMode::${mode}`
          } else {
            return
          }
          let event = self.createEvent('instanceOffering.action.updatestrategyPattern')
          if (resp.inventories.length > 0) {
            let item = resp.inventories[0]
            rpc.update('system-tags', `${item.uuid}`, {
              updateSystemTag: {
                tag: tag
              }
            }, event).then(() => {
              self.query()
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          } else {
            rpc.create('system-tags', {
              resourceType: 'InstanceOfferingVO',
              resourceUuid: uuid,
              tag: tag
            }, event).then((tagResp) => {
              self.query()
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          }
        })
      },
    }
  }
</script>

<style scoped>
 .icon{
   display: inline-block;
   position: absolute;
   width: 60px;
   height: 62px;
   background-repeat: no-repeat;
 }
</style>
