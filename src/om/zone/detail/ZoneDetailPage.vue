<template>
  <div style="width: 100%;height: 100%;">
    <detail-template>
      <div slot="header" class="detail-header">
        <span class="detail-title">区域详情</span>
        <span class="create-back detail-header-item"
              @click="$router.push({name:'zone'})"><i class="el-icon-back"></i>
          回到区域列表
        </span>
        <span class="detail-header-item">
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                <a id="common-start" style="padding-top:12px;" @click="!inStates('Enabled') && detailEnable([windowData.dataUuid])" :class="{ 'disabled-text': inStates('Enabled')}">{{ $t("common.start") }}</a>
                <a id="common-stop" @click="!inStates('Disabled') && detailDisable([windowData.dataUuid])" :class="{ 'disabled-text': inStates('Disabled')}">{{ $t("common.stop") }}</a>
                <a id="common-destroy" v-if="!dbData.common.isPlatformAdmin" style="padding-bottom:12px;" @click="detailDelete([windowData.dataUuid])">{{ $t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
        </span>
        <span class="detail-tab">
            <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
              <el-tab-pane :label="$t('common.basicAttributes')"  name="info"></el-tab-pane>
              <el-tab-pane :label="$t('common.cluster')" name="cluster"></el-tab-pane>
              <el-tab-pane :label="$t('common.primaryStorage')" name="primaryStorage"></el-tab-pane>
              <el-tab-pane :label="$t('common.l2network')" name="l2network"></el-tab-pane>
              <el-tab-pane :label="$t('common.backupStorage')" name="backupStorage"></el-tab-pane>
              <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
            </el-tabs>
          </span>
      </div>

        <div  slot="body" v-if="activeName === 'info'"  class="detail-body">
          <div class="left">
            <div class="left-header">
              <base-icon name="zone_detail_big"/>
              <div class="after-icon">
                <detail-info-state outer-class-name="detail-page-state" v-if="updateState" :state="dbData.zone[windowData.dataUuid] && dbData.zone[windowData.dataUuid].state"/>
              </div>
              <detail-name class="name" :param="getNameParam()"></detail-name>
              <detail-description class="description" :param="getDescriptionParam()"/>
            </div>
            <div class="left-body" style="margin-top: 10px;">
              <div class="detail-block-header">
                {{$t('common.overview')}}
              </div>
              <detail-row
                :param="{
                title: 'common.createDate',
                content: dbData.zone[windowData.dataUuid] && formatDatetime(new Date(dbData.zone[windowData.dataUuid].createDate))
              }"/>
              <detail-row :param="{
                  title: 'common.lastOpDate',
                  content: dbData.zone[windowData.dataUuid] && formatDatetime(new Date(dbData.zone[windowData.dataUuid].lastOpDate)),
                }"/>

            </div>
          </div>
          <div class="right">
            <div style="height: 40px"></div>
            <div id="common-moreInformation" class="detail-block-header">
              {{$t('common.moreInformation')}}
            </div>
            <detail-row :param="{
              title:'UUID',
              content:windowData.dataUuid,
              copy: true,
            }"></detail-row>
          </div>
        </div>
        <div  slot="body" v-if="activeName === 'cluster'" class="detail-body">
          <cluster-tabl-list :param="{conditions: [`zone.uuid=${windowData.dataUuid}`, 'hypervisorType=KVM'],  uuid: windowData.dataUuid}"></cluster-tabl-list>
        </div>
        <div  slot="body" v-if="activeName === 'primaryStorage'" class="detail-body">
          <primary-storage-tab-list :param="{conditions: `zone.uuid=${windowData.dataUuid}`,  uuid: windowData.dataUuid}"></primary-storage-tab-list>
        </div>
        <div  slot="body" v-if="activeName === 'log'" class="detail-body">
          <log-list :param="{uuid: windowData.dataUuid }"></log-list>
        </div>
        <div  slot="body" v-if="activeName === 'l2network'" class="detail-body">
          <l2-net-work-tab-list :param="{conditions: `zone.uuid=${windowData.dataUuid}`, uuid:windowData.dataUuid}" @getAttachClusterParam="getAttachClusterParam"/>
        </div>
        <div  slot="body" v-if="activeName === 'backupStorage'" class="detail-body">
          <backup-storage-tab-list :param="{conditions: `zone.uuid=${windowData.dataUuid}`,  ZoneUuid: windowData.dataUuid, uuid:windowData.dataUuid}"/>
        </div>

    </detail-template>
    <vxlan-network-pool-attach-cluster  v-if="showAttachKVMCluster" :param="attachClusterParam" @close="close"></vxlan-network-pool-attach-cluster>
  </div>
</template>

<script>
  import ZoneList from 'src/om/zone/List';
  import Root from 'src/windows/Root';
  import WindowBase from 'src/windows/Window';
  import Methods from 'src/om/zone/Methods'
  import DetailTemplate from "../../../component/DetailTemplate";
  import DetailInfoState from "../../../component/DetailInfoState";
  import ClusterTablList from '../components/ClusterTabList'
  import LogList from "../../../component/LogList";
  import PrimaryStorageTabList from '../components/PrimaryStorageTabList'
  import BackupStorageTabList from "../components/BackupStorageTabList";
  import {mapState} from 'vuex';
  import L2NetWorkTabList from "../components/L2NetWorkTabList";
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import VxlanNetworkPoolAttachCluster from "../components/VxlanNetworkPoolAttachCluster";
  import Utils from 'src/utils/utils';

    export default {
      name: "ZoneDetailPage",
      mixins:[Root,WindowBase,ZoneList,Methods],
      components: {
        VxlanNetworkPoolAttachCluster,
        CreateTemplateNoRoute,
        L2NetWorkTabList,
        BackupStorageTabList,
        DetailInfoState,
        DetailTemplate,
        ClusterTablList,
        LogList,
        PrimaryStorageTabList
      },
      computed:{
        ...mapState({
          zone: state => state.zone
        }),
      },
      created(){
        let dataUuid=this.$route.params.uuid
        this.updateWindow({dataUuid})
          .then(()=>{
            this.query()
          }).then(()=>{
            this.$forceUpdate()
        }).then(()=>{
          this.updateState=true
        })
      },
      data(){
        return{
          activeName:'info',
          editName: false,
          newName: '',
          editDescription: false,
          newDescription: '',
          super: {},
          updateState:false,
          showAttachKVMCluster: false,
          attachClusterParam: ''
        }
      },
      methods:{
        ...Utils,
        //请求区域详情数据
        query: function () {
          let self = this;
          self.dispatchAction('zone/detailQuery', self.$route.params.uuid);
        },
        //判断能否在某个状态下操作
        inStates: function () {
          if (!this.dbData.zone[this.windowData.dataUuid]) {
            return false
          }
          let stateList = []
          for (let i = 0; i < arguments.length; i++) {
            stateList.push(arguments[i])
          }
          return !stateList.every((item, index, array) => {
            item !== this.dbData.zone[this.windowData.dataUuid].state
            return item !== this.dbData.zone[this.windowData.dataUuid].state
          })
        },
        //切换tab页
        handleTabChange(tab, event) {
          if (this.activeName === tab.name) return;
          this.activeName = tab.name;
        },
        //获得描述参数以及设置更新描述
        getDescriptionParam() {
          return {
            getValue: () => {
              let self = this;
              if (self.windowData.dataUuid && self.zone[self.windowData.dataUuid])
                return self.zone[self.windowData.dataUuid].description
            },
            setValue: (value) => {
              if(this.zone[this.windowData.dataUuid].description === value) return;
              this.updateResource('zones','updateZone','description','zone', value, this.query)
            }
          }
        },
        //获得名称参数以及设置更新描述
        getNameParam(){
          return{
            getValue:()=>{
              let self = this;
              if(self.windowData.dataUuid && self.zone[self.windowData.dataUuid]){
                return self.zone[self.windowData.dataUuid].name
              }else{
                return ''
              }
            },
            canEdit:()=>{
              return true
            },
            setValue:(value)=>{
              if(this.zone[this.windowData.dataUuid].name === value) return;
              this.updateResource('zones','updateZone','name','zone', value, this.query)
            }
          }
        },
        //绑定集群参数
        getAttachClusterParam(param){
          let self = this;
          self.showAttachKVMCluster = true;
          self.attachClusterParam = {uuid: param};
        },
        close(){

        }
      },
      watch:{
        'params.uuid':function (newValue,oldValue) {
          if(_.isEqual(newValue,oldValue)) return
          this.updateWindow({dataUuid:this.params.uuid})
            .then(()=>{
              this.query()
            })
        }
      }
    }
</script>

<style scoped>

  .editable {
  }

  .editable .single-line {
    display: inline-block;
    font-size: 20px;
    line-height: 26px;
    height: 26px;
    padding: 0 0 0 1px;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .editable.name {
    height: 26px;
    width: 100%;
  }

  .icon {
    position: absolute;
    display: inline-block;
    width: 57px;
    height: 60px;
  }

</style>
