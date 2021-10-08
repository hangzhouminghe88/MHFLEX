<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">云盘规格详情</span>
        <span @click="$router.push({name: 'volumeoffering'})" class="create-back detail-header-item"><i
          class="el-icon-back"></i>
        回到云盘规格列表
      </span>
      <span class="detail-header-item">
        <drop-down class="dropdown detail-dropdown">
          <span slot="title">
            <span class="text" v-text="$t('common.volumeOfferingActions')"></span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px" :class="{'disabled-text': !canEnabled()}" @click="canEnabled() && pageOperate('start')">{{$t('common.enable')}}</a>
              <a :class="{'disabled-text': !canDisable()}" @click="canDisable() && pageOperate('stop')">{{$t('common.disable')}}</a>
              <a  v-show="dbData.common.isAdmin" @click="canShareToAll() && pageShareOperate('share')" :class="{ 'disabled-text': !canShareToAll()}">{{$t('common.shareToAll')}}</a>
              <a  v-show="dbData.common.isAdmin" :class="{'disabled-text': canShareToAll()}" @click="!canShareToAll() && pageShareOperate('notShare')">{{$t('common.recallFromAll')}}</a>
              <a style="margin-bottom: 12px" @click="pageDelete()">{{$t('common.destroyed')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
        <el-tabs @tab-click="handleTabChange" style="display: inline-block;height: 100%;" tabPosition="bottom"
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
          <base-icon name="volume_offering_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" :state="model.state" style="background: transparent; border: none"/>
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
              content: model && bytesToSize(model.diskSize)
            }"
          />
          <detail-row
            :param="{
              title: 'common.shareToAll',
              content: (model && model.toPublic) ? $t(`common.${model.toPublic}`) : '否'
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: model && model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: model && model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model && model.uuid,
            copy: true
          }"
        />
        <detail-row v-if="!(model.volumeWriteBandwidth || model.volumeReadBandwidth)"
         :param="{
           title: 'common.volumeTotalBandwidth',
           content: (model && model.volumeTotalBandwidth) ? bytesToSize(model.volumeTotalBandwidth) : $t('common.unlimited')
         }"
        />
        <detail-row v-if="model && model.volumeWriteBandwidth"
         :param="{
           title: 'volume.volumeWriteBandwidth',
           content: model && bytesToSize(model.volumeWriteBandwidth)
         }"
        />
        <detail-row v-if="model && model.volumeReadBandwidth"
         :param="{
          title: 'volume.volumeReadBandwidth',
          content: model && bytesToSize(model.volumeReadBandwidth)
         }"
        />
      </div>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'share'">
      <share-tab-list :param="{conditions: `resourceUuid=${dataUuid}`, uuid: dataUuid, tableName: 'volumeoffering'}"/>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'log'">
      <log-list :param="{uuid: dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import {mapGetters} from 'vuex';
  import DetailInfoState from "../../../component/DetailInfoState";
  import Utils from 'src/utils/utils';
  import LogList from "../../../component/LogList";
  import VolumeOfferingMethods from 'src/ecs/volumeOffering/Methods';
  import ShareTabList from "../../image/component/ShareTabList";

  export default {
    name: "VolumeOfferingDetailPage",
    mixins: [WindowBase, VolumeOfferingMethods],
    components: {ShareTabList, LogList, DetailInfoState, DetailTemplate},
    computed: {
      ...mapGetters({
        getByUuid: 'volumeoffering/get'
      }),
      model() {
        let self = this;
        return self.getByUuid(self.$route.params.uuid)
      }
    },
    data(){
      return {
        dataUuid:"",
        activeName: 'info'
      }
    },
    created(){
      let self = this;
      self.dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        methods: {
          queryList: self.query
        }
      })
        .then(() => {
          return self.query();
        })
    },
    methods: {
      ...Utils,
      query(){
        let self = this;
        self.dispatchAction('volumeoffering/detailQuery', self.$route.params.uuid)
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
      updateName(key, name){
        if(!key) return;
        let param = {};
        param[key] = name;
        this.dispatchActionWithEvent('volumeoffering/update', {
          uuid: this.dataUuid,
          value: param
        })
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
      //切换tab页
      handleTabChange(e){
        let self = this;
        if(e.name === self.activeName) return;
        self.activeName = e.name;
      },
      //是否可全局共享
      canShareToAll(){
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      //得到全局共享列表
      getSharedToAllList () {
        let uuidList = [], self = this;
        uuidList = [self.dataUuid];
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => !self.model.toPublic)
          return list
        }
        return []
      },
      //共享操作
      pageShareOperate(param){
        let shareUuidList = [], notShareUuidList = [], uuidList = [], self = this;
        uuidList = [self.dataUuid];
        if (uuidList.length > 0) {
          shareUuidList = uuidList.filter((uuid) => !self.model.toPublic)
          notShareUuidList = uuidList.filter((uuid) => self.model.toPublic)
        }
        switch (param) {
          case 'share':
            self.openDialog('SharetoAllConfirmDlg',{
              title: 'common.shareToAll',
              warning: 'instanceOffering.shareToAllText',
              ok(){
                self.dispatchActionWithEvent('volumeoffering/shareToPublic', shareUuidList)
                  .then(() => {
                    self.dispatchAction('volumeoffering/query', {q: `uuid?=${shareUuidList.join(',')}`})
                  })
              }
            })
            break;
          case 'notShare':
            self.openDialog('SharetoAllConfirmDlg',{
              title: 'common.recallFromAll',
              warning: 'account.recall',
              ok(){
                self.dispatchActionWithEvent('volumeoffering/revokeSharing', notShareUuidList)
                  .then(() => {
                    self.dispatchAction('volumeoffering/query', {q: `uuid?=${notShareUuidList.join(',')}`})
                  })
              }
            })
            break;
        }
      },
      //是否可以启用
      canEnabled(){
        let self = this;
        return self.model.state !== 'Enabled';
      },
      //是否可以停用
      canDisable(){
        let self = this;
        return self.model.state !== 'Disabled';
      },
      //停用启用操作
      pageOperate(param){
        let self = this, enabledUuidList = [], disabledUuidList = [];
        if(self.model.state !== 'Enabled'){
          enabledUuidList.push(self.dataUuid);
        }
        if(self.model.state !== 'Disabled'){
          disabledUuidList.push(self.dataUuid);
        }
        switch (param) {
          case 'start':
            self.enable(enabledUuidList);
            break;
          case 'stop':
            self.stop(disabledUuidList);
            break;
        }
      },
      //删除
      pageDelete(){
        let self = this, uuidList = [];
        uuidList =[self.dataUuid];
        self.delete(uuidList);
      }
    }
  }
</script>

<style scoped>
 .icon{
   display: inline-block;
   position: absolute;
   width: 62px;
   height: 60px;
   background-repeat: no-repeat;
 }
</style>
