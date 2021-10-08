<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">亲和组详情</span>
      <span class="create-back detail-header-item"
            @click="$router.push({name: 'affinitygroup'})"><i
        class="el-icon-back"></i>回到亲和组列表</span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
               <span class="text">{{ $t("common.moreActions") }}</span>
          </span>
          <span slot="content">
             <div class="dropdown-content">
               <a style="margin-top: 12px;" @click="canEnabled() && pageStart()" :class="{'disabled-text': !canEnabled()}">{{$t("common.enable")}}</a>
               <a @click="canDisabled() && pageStop()" :class="{'disabled-text': !canDisabled()}">{{$t('common.disable')}}</a>
               <a v-permission="'AG.ADD_VM_2_AG'" :class="{ 'disabled-text': !canAddVmToAffinityGroup(dataUuid)}" @click="canAddVmToAffinityGroup(dataUuid) && pageAddVmToAffinityGroup(query)" >{{ $t("affinityGroup.addVm") }}</a>
               <a v-permission="'AG.REMOVE_VM_FROM_AG'" @click="canRemoveVmFromAffinityGroup(dataUuid) && pageRemoveVmFromAffinityGroup(query)" :class="{ 'disabled-text': !canRemoveVmFromAffinityGroup(dataUuid)}">{{ $t("affinityGroup.removeVm") }}</a>
               <a v-permission="'LICENSE_BASIC_PAID'" @click="pageChangeResourceOwner()" v-if="dbData.common.isAdmin">{{$t("common.changeResourceOwner")}}</a>
               <a style="margin-bottom: 12px;" v-permission="'AG.DELETE'" @click="pageDelete()">{{ $t("common.destroy") }}</a>
             </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
        <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
         <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
         <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
         <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon class="icon" name="affinity_group_ico"/>
          <div class="after-icon">
            <detail-info-state slot="item" outer-class-name="detail-page-state" v-if="model && model.state" :state="model && model.state" style="background:transparent;border: none"/>
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
             title: 'common.vm',
             content: model && model.vmNums ? model.vmNums : 0
           }"/>
          <detail-row
          :param="{
            title: 'common.strategy',
            content: model && $t(`affinityGroup.${model.policy}`)
          }"/>
          <detail-row
          :param="{
            title: 'common.type',
            content: model && model.type
          }"/>
          <detail-row
          :param="{
            title: 'common.owner',
            content: getResourceOwner(dataUuid),
            handler: () => {
              $router.push({name: `detailAccount`, params: {uuid: dbData.resourceOwner[dataUuid].uuid}})
            }
          }"/>
          <detail-row
          :param="{
           title: 'common.createDate',
           content: model && model.createDate && formatDatetime(new Date(model.createDate))
          }"/>
          <detail-row
          :param="{
           title: 'common.lastOpDate',
           content: model && model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
          }"/>
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
        }"/>
      </div>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'vm'">
      <vm-tab-list :param="{dataUuid: dataUuid, refresh: detailQuery}"/>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'log'">
      <log-list :param="{ uuid:dataUuid }"/>
    </div>
    <div slot="footer"></div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import AffinityGroupMethods from 'src/ecs/affinityGroup/Methods';
  import AffinityGroupList from 'src/ecs/affinityGroup/List';
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner';
  import WindowBase from 'src/windows/Window';
  import IAM2ProjectMethods from 'src/ecs/home/Methods';
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import DetailInfoState from "../../../component/DetailInfoState";
  import rpc from 'src/utils/rpc';
  import VmTabList from "../component/VmTabList";
  import LogList from "../../../component/LogList";

  export default {
    name: "AffinityGroupDetailPage",
    mixins: [WindowBase, AffinityGroupMethods, AffinityGroupList],
    components: {LogList, VmTabList, DetailInfoState, TableBodyItemState, DetailTemplate},
    data() {
      return {
        activeName: 'info',
        dataUuid: '',
        value: {}
      }
    },
    computed: {
      model:{
        get() {
          let self = this;
          return self.value;
        },
        set(val){
          let self = this;
          self.value = val;
        }
      },
      selectedList(){
        return [this.dataUuid]
      }
    },
    created(){
      this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
      this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
      this.init()
    },
    methods: {
      init () {
        let self = this;
        self.dataUuid = self.$route.params.uuid;
        return this.updateWindow({
          methods: {
            query: this.query
          }
        }).then(() => {
          return this.detailQuery()
        }).then(() => {
          return this.$forceUpdate()
        })
      },
      detailQuery () {
        let self = this;
        return this.query(this.dataUuid)
          .then((resp) => {
           self.value = _.assign({}, self.dbData.affinitygroup[self.$route.params.uuid], self.dbData.affinitygroupA[self.$route.params.uuid])
          })
      },
      handleTabChange(e){
        let self = this;
        self.activeName = e.name === self.activeName ? self.activeName : e.name;
      },
      //是否可启用
      canEnabled(){
        let self = this;
        return self.model && self.model.state !== 'Enabled';
      },
      //是否可停用
      canDisabled(){
        let self = this;
        return self.model && self.model.state !== 'Disabled';
      },
      //启用
      pageStart () {
        let self = this;
        return self.start([self.dataUuid]).then(() => {
          self.detailQuery()
        })
      },
      //停用
      pageStop(){
        let self = this;
        return self.stop([self.dataUuid]).then(() => {
          self.detailQuery();
        })
      },
      getNameParam(){
        let self = this;
        return {
          getValue: () => {
            if (self.model) {
              return self.model.name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'AFFINITYGROUP.UPDATE'
          },
          setValue: (value) => {
            self.updateAffinityGroup('name', value)
          }
        }
      },
      getDescription(){
        let self = this;
        return {
          getValue: () => {
            if (self.model) {
              return self.model.description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'AFFINITYGROUP.UPDATE'
          },
          setValue: (value) => {
            self.updateAffinityGroup('description', value)
          }
        }
      },
      updateAffinityGroup(key, newValue){
        let self = this;
        let oldValue = String(self.model[key]);
        if (oldValue === String(newValue)) return;
        if (key === 'name' && !String(newValue).trim()) return;
        let param = {};
        param[key] = newValue;
        let event = self.createEvent('common.updateInfo' + key, newValue);
        rpc.put(`affinity-groups/${self.dataUuid}/actions`, {
          "updateAffinityGroup": param
        }, event).then(() => {
          self.incEventSuccess(event);
          self.detailQuery();
        })
      },
    }
  }
</script>

<style scoped>
  .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 62px!important;
    height: 60px!important;
    background-repeat: no-repeat;
  }
</style>
