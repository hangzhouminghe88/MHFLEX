<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">账户详情</span>
      <span @click="$router.push({name:'account'})" class="create-back detail-header-item">
        <i class="el-icon-back"></i>
        回到账户列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('account.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="changePassword(windowData.dataUuid)">{{$t("common.changePassword")}}</a>
              <a @click="dbData.common.isAdmin && detailCreateLdapBinding()" :class="{'disabled-text': !dbData.common.isAdmin }">{{$t("common.attachLDAP")}}</a>
              <a @click="canDetachLdap() && pageDeleteLdapBinding(windowData.dataUuid)" :class="{'disabled-text': !canDetachLdap()}">{{$t("common.detachLDAP")}}</a>
              <a v-permission="'ID.DELETE_ACCOUNT'" style="padding-bottom: 12px;" @click="!isAdmin() && deleteAccount()" :class="{'disabled-text': isAdmin()}">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
        <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
           style="display: inline-block;height: 100%;">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
          <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
          <el-tab-pane :label="$t('common.vrouterPerf')" name="vRouter"></el-tab-pane>
          <el-tab-pane :label="$t('common.volume')" name="volume"></el-tab-pane>
          <el-tab-pane :label="'AD/LDAP'" name="adLdap"></el-tab-pane>
          <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left" style="border-right: none;">
        <div class="left-header">
          <base-icon name="account_ico"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="getNameParam()"/>
          <detail-description class="description" :param="getDescriptionParam()"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row
            :param="{
              title: 'common.vm',
              content: model && model.vmNum
            }"
          />
          <detail-row
            :param="{
              title: 'common.volume',
              content: model && model.volumeNum
            }"
          />
          <div class="split-line"></div>
          <detail-row
            :param="{
              title:  'common.createDate',
              content: model && model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
              title:  'common.lastOpDate',
              content: model && model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right" style="border-left: 1px dashed #dae0e6;">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model && model.uuid,
            copy: true
          }"
        />
        <div class="split-line"></div>
        <div class="detail-block-header">
           {{$t('common.iam2projectquota')}}
        </div>
        <detail-input :param="updateResourceNum('vm.totalNum.used', 'vm.totalNum', 'vmtotalNum')"/>
        <detail-input :param="updateResourceNum('vm.num.used', 'vm.num', 'vmnum')"/>
        <detail-input :param="updateResourceNum('vm.cpuNum.used', 'vm.cpuNum', 'vmcpuNum')"/>
        <div class="detail-row editable">
          <div class="detail-title">
            {{$t("account.vmmemorySize")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            <span class="num detail-content" v-show="!editMemorySize">{{model && bytesToSize(model.usages && model.usages['vm.memorySize.used'])}}/{{ model && model.usages && bytesToSize(model.usages['vm.memorySize'])}}</span>
            <span class="edit-icon" v-show="!editMemorySize" @click.stop="editMemorySize = true; newMemorySize = model.usages['vm.memorySize.used'];">
               <i class="el-icon-edit"></i>
            </span>
            <detail-size-editor v-if="editMemorySize" style="margin-right: 70px;"
                                class="editor"
                                :value="model.usages['vm.memorySize']"
                                :size-list="['K', 'M', 'G', 'T']"
                                unit="B"
                                :finish="memorySizeEditEnd"/>
          </div>
        </div>
        <detail-input :param="updateResourceNum('affinitygroup.num.used', 'affinitygroup.num', 'affinitygroupnum')"/>
        <detail-input :param="updateResourceNum('pci.num.used', 'pci.num', 'pcinum')"/>
        <div class="split-line"></div>
        <detail-input :param="updateResourceNum('volume.data.num.used', 'volume.data.num', 'volumedatanum')"/>
        <div class="detail-row editable">
          <div class="detail-title">
            {{$t("account.volumecapacity")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            <span class="num detail-content" v-show="!editVolumeCapacity">{{model.usages && bytesToSize(model.usages['volume.capacity.used'])}}/{{model.usages && bytesToSize(model.usages['volume.capacity'])}}</span>
            <span class="edit-icon" v-show="!editVolumeCapacity" @click.stop="editVolumeCapacity = true; newVolumeCapacity = model.usages['volume.capacity'];">
             <i class="el-icon-edit"></i>
            </span>
            <detail-size-editor v-if="editVolumeCapacity"
                                style="margin-right: 70px;"
                                class="editor"
                                :value="model.usages['volume.capacity']"
                                :size-list="['K', 'M', 'G', 'T']" unit="B"
                                :finish="volumeCapacityEditEnd" />
          </div>
        </div>
        <div class="split-line"></div>
        <detail-input :param="updateResourceNum('image.num.used', 'image.num', 'imagenum')"/>
        <div class="detail-row editable">
          <div class="detail-title">
            {{$t("account.imagesize")}}{{$t("common.colon")}}
          </div>
          <div class="detail-container">
            <span class="num detail-content" v-show="!editImageSize">{{ model.usages && bytesToSize(model.usages['image.size.used'])}}/{{model.usages && bytesToSize(model.usages['image.size'])}}</span>
            <span class="edit-icon" v-show="!editImageSize" @click.stop="editImageSize = true; newImageSize = model.usages['volume.capacity'];">
               <i class="el-icon-edit"></i>
            </span>
            <detail-size-editor v-if="editImageSize" style="margin-right: 70px;" class="editor" :value="model.usages['image.size']" :size-list="['K', 'M', 'G', 'T']" unit="B" :finish="imageSizeEditEnd" />
          </div>
        </div>
        <div class="split-line"></div>
        <detail-input :param="updateResourceNum('vxlan.num.used', 'vxlan.num', 'vxlan-num')"/>
        <detail-input :param="updateResourceNum('l3.num.used', 'l3.num', 'l3-num')"/>
        <detail-input :param="updateResourceNum('securityGroup.num.used', 'securityGroup.num', 'securitygroupnum')"/>
        <detail-input :param="updateResourceNum('portForwarding.num.used', 'portForwarding.num', 'portForwardingNum')"/>
        <detail-input :param="updateResourceNum('loadBalancer.num.used', 'loadBalancer.num', 'loadBalancerNum')"/>
        <detail-input :param="updateResourceNum('listener.num.used', 'listener.num', 'listenernum')"/>
        <detail-input :param="updateResourceNum('eip.num.used', 'eip.num', 'eipnum')"/>
        <detail-input :param="updateResourceNum('vip.num.used', 'vip.num', 'vipnum')"/>
        <div class="split-line"></div>
        <detail-input :param="updateResourceNum('snapshot.volume.num.used', 'snapshot.volume.num', 'snapshotnum')"/>
        <detail-input :param="updateResourceNum('scheduler.num.used', 'scheduler.num', 'schedulernum')"/>
        <detail-input :param="updateResourceNum('scheduler.trigger.num.used', 'scheduler.trigger.num', 'triggerNum')"/>
        <detail-input :param="updateResourceNum('zwatch.event.num.used', 'zwatch.event.num', 'zwatchEventNum')"/>
        <detail-input :param="updateResourceNum('zwatch.alarm.num.used', 'zwatch.alarm.num', 'ZwatchAlarmNum')"/>
        <detail-input :param="updateResourceNum('sns.endpoint.num.used', 'sns.endpoint.num', 'SnsEndPointNum')"/>
        <detail-input :param="updateResourceNum('tag2.tag.num.used',  'tag2.tag.num', 'tagsNum')"/>
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vm'">
      <vm-for-zone-tab-list :param="{uuid: windowData.dataUuid, showVm: showCloneVmIntance, showVmImage: showCreateVmImage}" @showCloneVmInstance="showCloneVmInstance" @showCreateVmImageFun="showCreateVmImageFun"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vRouter'">
      <vrouter-tab-list :param="{uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'volume'">
      <volume-for-zone-tab-list :param="{uuid: windowData.dataUuid, showVolumeCreateImage: showCreateVolumeImage}" @showVolumeCreateImageFun="showVolumeCreateImageFun"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'adLdap'">
       <ad-ldap-tab-list :param="{uuid: windowData.dataUuid, conditions: [`accountUuid=${windowData.dataUuid}`]}" />
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{uuid: windowData.uuid}"/>
    </div>
    <div slot="footer">
      <create-ldap-binding v-if="showCreateLdap" :param="createLdapParam" @close="showCreateLdap = false;"/>
      <clone-vm v-if="showCloneVmIntance" :param="cloneVmMessage" @close="closeCloneVmInstance"/>
      <create-vm-image v-if="showCreateVmImage" :param="createVmImageMessage"
                       @close="closeCreateImage"></create-vm-image>
      <volume-create-image :param="createVolumeMessage" @close="closeVolumeCreateImage"
                           v-if="showCreateVolumeImage"></volume-create-image>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import AccountMethods from 'src/om/account/Methods';
  import rpc from 'src/utils/rpc';
  import {mapGetters, mapState} from 'vuex';
  import CreateLdapBinding from "../component/CreateLdapBinding";
  import VmForZoneTabList from "../component/VmForZoneTabList";
  import CloneVm from "../../../ecs/ecsInstance/component/CloneVm";
  import VmMethods from "../../../ecs/ecsInstance/Methods";
  import CreateVmImage from "../../../ecs/ecsInstance/component/CreateVmImage";
  import VolumeForZoneTabList from "../component/VolumeForZoneTabList";
  import VolumeCreateImage from "src/ecs/volume/component/VolumeCreateImage";
  import VolumeMethods from 'src/ecs/volume/Methods';
  import AdLdapTabList from "../component/AdLdapTabList";
  import LogList from "../../../component/LogList";
  import VRouterTabList from 'src/om/account/component/VRouterTabList';
  export default {
    name: "AccountDetailPage",
    mixins: [WindowBase, AccountMethods],
    components: {
      LogList,
      AdLdapTabList,
      VolumeForZoneTabList, CreateVmImage, CloneVm, VmForZoneTabList, CreateLdapBinding, DetailTemplate, VolumeCreateImage,
      'vrouter-tab-list': VRouterTabList
    },
    data(){
      return {
        activeName: 'info',
        editMemorySize: false,
        newMemorySize: '',
        editVolumeCapacity: false,
        newVolumeCapacity: '',
        editImageSize: false,
        newImageSize: '',
        showCreateLdap: false,
        createLdapParam: {},
        showCloneVmIntance: false,
        cloneVmMessage: {},
        showCreateVmImage: false,
        createVmImageMessage: {},
        createVolumeMessage: {},
        showCreateVolumeImage: false
      }
    },
    computed: {
      ...mapGetters({
        get: 'account/get',
      }),
      ...mapState({
        account: state => state.account
      }),
      model() {
        let self = this;
        return self.get(self.$route.params.uuid)
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        dataUuid: self.$route.params.uuid
      }).then(() => {
        self.detailQuery();
      })
    },
    methods: {
      ...{
        clone: VmMethods.methods.clone,
        createImage: VmMethods.methods.createImage,
        createImageFromVolume: VolumeMethods.methods.createImageFromVolume
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      showCloneVmInstance(param){
        let self = this;
        self.showCloneVmIntance = param.show;
        self.cloneVmMessage = param.cloneVmMessage
      },
      detailCreateLdapBinding(){
        let self = this;
        self.createLdapParam = {
          accountUuid: [self.$route.params.uuid],
          ok: (params) => {
            self.createLdapBinding(params).then(() => self.detailQuery())
          }
        }
        self.showCreateLdap = true;
      },
      detailQuery(){
        let self = this;
        return self.dispatchAction('account/detailQuery', self.windowData.dataUuid);
      },
      canDetachLdap(){

      },
      deleteAccount(){
        let self = this, uuidList = [];
        uuidList =  [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'account.deleteAccount',
          description: 'common.confirmForDeleteOperation',
          icon: 'account_popupico',
          uuidList,
          warning: 'account.deleteTip',
          getName(uuid){
            return self.account[uuid].name;
          },
          ok(){
            self.delete(uuidList)
              .then(() => {
                self.$router.push({name: 'account'})
              })
          }
        })
      },
      isAdmin(){

      },
      memorySizeEditEnd: function (newValue) {
        this.editMemorySize = false
        this.edit('vm.memorySize', newValue)
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
            return 'ACCOUNT.UPDATE'
          },
          setValue: (value) => {
            self.updateAccount('name', value)
          }
        }
      },
      getDescriptionParam(){
        let self = this;
        return {
          getValue: () => {
            if(self.model){
              return self.model.description
            }else {
              return ''
            }
          },
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'ACCOUNT.UPDATE'
          },
          setValue: (value) => {
            self.updateAccount('description', value)
          }
        }
      },
      updateAccount(key, newValue){
        let self = this;
        let oldValue = String(self.model[key]);
        if (oldValue === String(newValue)) return;
        if (key === 'name' && !String(newValue).trim()) return;
        let param = {};
        param[key] = newValue;
        this.dispatchActionWithEvent('account/update', {
          uuid: self.windowData.dataUuid,
          value: param
        })
          .then(() => {
            self.detailQuery();
          })
      },
      updateResourceNum(usedKey, numKey, title){
        let self = this;
        return {
          getValue: () => {
            if(self.model && self.model.usages){
              return `${self.model.usages[usedKey]} / ${self.model.usages[numKey]}`
            }else {
              return ''
            }
          },
          title: `account.${title}`,
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'ACCOUNT.UPDATE'
          },
          setValue: (value) => {
            self.edit(numKey, value)
          },
          getScopeValue(){
            return self.model.usages[numKey]
          },
          type: 'scope',
          fontSize: '14px'
        }
      },
      volumeCapacityEditEnd: function (newValue) {
        this.editVolumeCapacity = false
        this.edit('volume.capacity', newValue)
      },
      imageSizeEditEnd: function (newValue) {
        this.editImageSize = false
        this.edit('image.size', newValue)
      },
      edit: function (item, newValue) {
        let self = this;
        rpc.put(`accounts/quotas/actions`, {
          updateQuota: {
            identityUuid: this.windowData.dataUuid,
            name: item,
            value: newValue
          }
        })
          .then((resp) => {
            self.detailQuery();
          })
      },
      closeCloneVmInstance(param){
        let self = this;
        if (param) {
          let names = [];
          if (param.numbers > 1) {
            for (let i = 0; i < param.numbers; i++) {
              names.push(`${param.name}-${i + 1}`)
            }
          } else {
            names.push(`${param.name}`)
          }
          param.names = names;
          let uuid = param.uuid;
          delete param.name;
          delete param.numbers;
          delete param.uuid;
          self.clone(uuid, param);
        }
        self.showCloneVmIntance = false;
      },
      showCreateVmImageFun(param){
        let self = this;
        self.showCreateVmImage = param.showVmImage;
        self.createVmImageMessage = param.createVmImagMessage;
      },
      closeCreateImage(param){
        let self = this;
        if(param){
          param.vmUuid = self.createVmImageMessage.vmUuid;
          param.volumeUuid = self.dbData.vm[self.createVmImageMessage.vmUuid].rootVolumeUuid;
          this.createImage(param)
        }
        self.showCreateVmImage = false;
      },
      closeVolumeCreateImage(param){
        let self = this;
        if (param) {
          self.createImageFromVolume(param)
        }
        self.showCreateVolumeImage = false;
      },
      showVolumeCreateImageFun(param){
        let self = this;
        self.showCreateVolumeImage = param.showCreateVolumeImage;
        self.createVolumeMessage = param.createVolumeMessage;
      }
    },
  }
</script>

<style scoped>
  .icon{
    position: absolute;
    display: inline-block;
    width: 62px;
    height: 62px;
    background-repeat: no-repeat;
  }
</style>
