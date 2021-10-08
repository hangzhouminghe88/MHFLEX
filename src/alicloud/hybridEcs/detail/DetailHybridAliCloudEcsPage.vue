<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云Ecs云主机详情</span>
     <span class="detail-header-item create-back" @click="$router.push({name: 'hybridalicloudecs'})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px;">回到阿里云Ecs云主机列表</span>
     </span>
      <span class="detail-header-item">
       <drop-down class="detail-dropdown">
         <span slot="title">
           <span class="text">{{$t('hybridecsinstance.hybridecsinstanceActions')}}</span>
         </span>
         <span slot="content">
           <div class="dropdown-content">
             <a @click="!inStates('Running') && detailEnableOrDisable('Running')" style="padding-top: 12px;" :class="{'disabled-text': inStates('Running')}">{{$t("common.start")}}</a>
             <a @click="!inStates('Stopped') && detailEnableOrDisable('Stopped')" :class="{ 'disabled-text': inStates('Stopped')}">{{ $t("common.stop") }}</a>
             <a @click="!inStates('Stopped') && detailReboot()" :class="{'disabled-text': inStates('Stopped')}">{{$t("common.reboot")}}</a>
             <a @click="inStates('Running') && detailOpenConsole()" :class="{ 'disabled-text': !inStates('Running')}">{{ $t("vm.console") }}</a>
             <a @click="detailSetVmConsolePassword()">{{$t("common.setConsolePassword")}}</a>
             <a @click="detailUpdateEcsRootPassword()">{{$t("hybridecsinstance.updateRootPassword")}}</a>
             <a @click="detailDelete()" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
           </div>
         </span>
       </drop-down>
     </span>
      <el-tabs  class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.volume')" name="disk"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="ecs_vm_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-if="hybridAliCloudEcs && hybridAliCloudEcs.ecsStatus"
                               :state="hybridAliCloudEcs && hybridAliCloudEcs.ecsStatus"/>
            <span class="console" v-if="hybridAliCloudEcs && (hybridAliCloudEcs.ecsStatus).toLowerCase() === 'running'"
                  @click="detailOpenConsole()">
               <span class="console-label">{{$t('common.console')}}</span>
            </span>
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
              title: 'hybridecsinstance.ecsinstanceId',
              content: hybridAliCloudEcs && hybridAliCloudEcs.ecsInstanceId
            }"
          />
          <detail-row
            :param="{
              title:  'common.cpu',
              content: hybridAliCloudEcs && hybridAliCloudEcs.cpuCores
            }"
          />
          <detail-row
            :param="{
              title:  'common.memorySize',
              content: hybridAliCloudEcs && `${hybridAliCloudEcs.memorySize}G`
            }"
          />
          <detail-row
            :param="{
              title:  'common.privateNetworkIP',
              content: hybridAliCloudEcs && hybridAliCloudEcs.privateIpAddress
            }"
          />
          <detail-row
            :param="{
              title:  'common.publicNetworkIP',
              content: hybridAliCloudEcs && hybridAliCloudEcs.publicIpAddress
            }"
          />
          <detail-row
            :param="{
              title:  'hybridecsinstance.ecsBandWidth',
              content: (hybridAliCloudEcs  && hybridAliCloudEcs.publicIpAddress) ? hybridAliCloudEcs.ecsBandWidth === -1 ? $t('common.none') : `${hybridAliCloudEcs.ecsBandWidth}Mbps` : ''
            }"
          />
          <detail-row
            :param="{
              title:  'hybridecsinstance.ecsRootVolumeCategory',
              content: (hybridAliCloudEcs  && hybridAliCloudEcs.ecsRootVolumeCategory) ? hybridAliCloudEcs.ecsRootVolumeCategory.toLowerCase() === 'cloud_efficiency' ? $t('hybridecsinstance.cloud_efficiency') : $t('hybridecsinstance.cloud_ssd') : ''
            }"
          />
          <detail-row
            :param="{
              title:  'hybridecsinstance.paymentInformation',
              content: hybridAliCloudEcs && hybridAliCloudEcs.chargeType ? $t(`hybridecsinstance.${hybridAliCloudEcs.chargeType}`) : $t('hybridecsinstance.afterPayment')
            }"
          />
          <detail-row
            :param="{
              title: 'hybridecsinstance.expireDate',
              content:(hybridAliCloudEcs && hybridAliCloudEcs.chargeType === 'PrePaid') ?  hybridAliCloudEcs && hybridAliCloudEcs.expireDate && formatDatetime(new Date(hybridAliCloudEcs.expireDate)) : $t('hybridecsinstance.notexpire')
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudEcs && hybridAliCloudEcs.createDate && formatDatetime(new Date(hybridAliCloudEcs.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudEcs && hybridAliCloudEcs.lastOpDate && formatDatetime(new Date(hybridAliCloudEcs.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div  class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: hybridAliCloudEcs && hybridAliCloudEcs.uuid,
            copy: true
          }"
        />
        <detail-row
          :param="{
            title: 'common.image',
            content: hybridAliCloudEcs && hybridAliCloudEcs.ecsImageUuid && getEcsImageName(hybridAliCloudEcs.ecsImageUuid),
            handler: () => {
               if(hybridAliCloudEcs && hybridAliCloudEcs.ecsImageUuid){
                 $router.push({name: 'detailHybridAliCloudImage',
                 params: {uuid: hybridAliCloudEcs.ecsImageUuid, currTab: dbData.hybridImage[hybridAliCloudEcs.ecsImageUuid].type}})
               }
            }
          }"
        />
        <detail-row
          :param="{
            title: 'hybrididentityzone.identityzone',
            content: hybridAliCloudEcs && getIdentityZone(windowData.dataUuid),
            handler: () => {
                 if(hybridAliCloudEcs && hybridAliCloudEcs.identityZoneUuid){
                 $router.push({name: 'detailHybridAliCloudIdentityZone',
                 params: {uuid: hybridAliCloudEcs.identityZoneUuid}})
               }
            }
          }"
        />
        <detail-row
          :param="{
            title: 'Vpc',
            content: hybridAliCloudEcs && getEcsVpcName(windowData.dataUuid).replace(/ZStack-/ig,  ''),
            handler: () => {
              if(hybridAliCloudEcs && hybridAliCloudEcs.ecsVpcUuid){
                 $router.push({name: 'detailHybridAliCloudVpc',
                 params: {uuid: hybridAliCloudEcs.ecsVpcUuid}})
               }
            }
          }"
        />
        <detail-row
          :param="{
            title: 'hybridesecuritygroup.securitygroup',
            content: hybridAliCloudEcs && getSecurityGroupName(windowData.dataUuid).replace(/ZStack-/ig,  ''),
            handler: () => {
             if(hybridAliCloudEcs && hybridAliCloudEcs.ecsSecurityGroupUuid){
                 $router.push({name: 'detailHybridAliCloudSecurityGroup',
                 params: {uuid: hybridAliCloudEcs.ecsSecurityGroupUuid}})
               }
            }
          }"
        />
        <detail-row
          :param="{
            title: 'hybridvswitch.vSwitch',
            content: hybridAliCloudEcs && getEcsVSwitchName(windowData.dataUuid).replace(/ZStack-/ig,  ''),
            handler: () => {
              vSwitchParam = { uuid: hybridAliCloudEcs.ecsVSwitchUuid };
              showVSwitch = true;
            }
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'disk'">
       <hybrid-aliyun-disk-tab :param="{ conditions: `ecsInstanceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, identityZoneUuid: dbData.hybridEcsInstance[windowData.dataUuid].identityZoneUuid }" />
    </div>
    <div slot="footer">
      <detail-hybrid-ali-cloud-switch v-if="showVSwitch" :param="vSwitchParam" @close="showVSwitch = false"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';
  import DetailInfoState from "../../../component/DetailInfoState";
  import HybridAliyunDiskTab from "../component/HybridAliyunDiskTab";
  import DetailHybridAliCloudSwitch from "../../hybridVpc/component/DetailHybridAliCloudSwitch";

  export default {
    name: "DetailHybridAliCloudEcsPage",

    components: {DetailHybridAliCloudSwitch, HybridAliyunDiskTab, DetailInfoState, DetailTemplate},

    mixins: [WindowBase, Methods],

    computed: {
      hybridAliCloudEcs: {
        get() {
          let self = this;
          return self.model && self.model;
        },
        set(val) {
          let self = this;
          self.model = val;
        }
      }
    },

    data() {
      return {
        currTab: 'info',
        model: null,
        vSwitchParam: {},
        showVSwitch: false
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
        self.detailQuery()
      })
    },

    methods: {
      //判断能否停用启用等操作
      inStates() {
        let self = this, states = [];
        for(let i in arguments) {
          states.push(arguments[i]);
        }
        if(!self.hybridAliCloudEcs) return false;
        let instate = states.some(state => self.hybridAliCloudEcs.ecsStatus === state);
        return instate;
      },
      //单个查询
      detailQuery() {
        let self = this;
        return rpc.query(`hybrid/aliyun/ecs/${self.windowData.dataUuid}`)
          .then(resp => {
            return self.updateDbRow({
              tableName: 'hybridEcsInstance',
              id: self.windowData.dataUuid,
              data: resp.inventories[0]
            }).then( () => {
              self.hybridAliCloudEcs = self.dbData.hybridEcsInstance[self.windowData.dataUuid];
            })
          })
      },
      //停用启用Ecs
      detailEnableOrDisable(param) {
        let self = this, uuidList = [self.windowData.dataUuid];
        if (param === 'Running') self.action(uuidList, self.detailQuery, 'start');
        if (param === 'Stopped') {
          self.openDialog('ConfirmDlg', {
            title: 'hybridecsinstance.stop',
            description: 'hybridecsinstance.delete',
            icon: 'vm_popupico',
            uuidList,
            getName: (uuid) => {
              return self.dbData.hybridEcsInstance[uuid].name;
            },
            ok: () => {
              self.action(uuidList, self.detailQuery, 'stop');
            }
          })
        }
      },
      //重启Ecs
      detailReboot() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'hybridecsinstance.reboot',
          description: 'hybridecsinstance.rebotHybridEcsInstance',
          icon: 'vm_popupico',
          uuidList: [self.windowData.dataUuid],
          getName: (uuid) => {
            return self.dbData.hybridEcsInstance[uuid].name;
          },
          ok: () => {
            self.action([self.windowData.dataUuid], self.detailQuery, 'reboot');
          }
        })
      },
      //打开控制台
      detailOpenConsole() {
        let self = this;
        self.getEcsInstanceVncUrl([self.windowData.dataUuid]);
      },

      detailSetVmConsolePassword() {
        let self = this;
        let uuid = self.windowData.dataUuid;
        self.openDialog('HybridModifyConsolePassword', {
          ok: (param) => {
            self.updateEcsInstancePassword(uuid, param, 'Console')
              .then(() => self.detailQuery())
          }
        })
      },

      detailUpdateEcsRootPassword() {
        let self = this;
        let uuid = self.windowData.dataUuid;
        self.openDialog('HybridModifyRootPassword', {
          ok: (newPassword) => {
            self.updateEcsInstancePassword(uuid, newPassword, 'Root')
              .then(() => self.detailQuery());
          }
        })
      },
      //删除Ecs
      detailDelete() {
        let self = this, uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'hybridecsinstance.deleteEcsInstance',
          description: 'hybridecsinstance.delete',
          uuidList,
          icon: 'vm_popupico',
          type: 'delete',
          isChecked: true,
          checkBoxText: "hybrid.deleteOrigin",
          ok: (deleteOrigion) => {
            return self.delete(uuidList, deleteOrigion, self.detailQuery);
          },
          getName: (uuid) => {
            return self.dbData.hybridEcsInstance[uuid].name;
          }
        })
      },
      //更新Ecs
      updateResourceParam(param) {
        let self = this;
        return {
          getValue: () => {
            if(self.hybridAliCloudEcs && self.hybridAliCloudEcs[param]){
              return self.hybridAliCloudEcs[param]
            }
          },
          setValue: (newVal) => {
            if(newVal !==  self.hybridAliCloudEcs[param]){
              self.updateEcsInstanceInfo(self.windowData.dataUuid, param, newVal, self.detailQuery)
            }
          },
          canEdit: () => {
            return true;
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
  @import '../../../style/mixins.less';
  .icon{
    .detail-icon('~assets/ecs_vm_ico.svg')
  }

  .after-icon{
    display: flex;
    justify-content: space-between;
  }

  .console{
    width: 30px;
    height: 30px;
    background-image: url('~assets/open_console.svg');
    cursor: pointer;
    background-repeat: no-repeat;
    position: relative;
    flex: 1 1 30%;
    .console-label{
      display: none;
      padding: 10px 20px;
      position: absolute;
      top: 35px;
      left: -25px;
      color: #409EFF;
      border: 1px solid #3c73b9;
      background: #fff;
      text-align: center;
      z-index: 2;
      font-size: 12px;
    }
    &:hover{
      .console-label{
        display: inline-block;
      }
    }
  }
  .detail-page-state{
    flex: 1 1 70%!important;
  }
</style>
