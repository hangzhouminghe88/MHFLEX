<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">vCenter云主机详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'vcentervminstance'})">
        <i class="el-icon-back"></i>
        <span class="detail-header-text">回到vCenter云主机列表</span>
      </span>

      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{'vCenter' + $t('vm.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top:12px;" @click="!inStates('Running','Paused', 'VolumeMigrating', 'Migrating') && detailStart()" :class="{'disabled-text': inStates('Running','Paused', 'VolumeMigrating', 'Migrating')}">{{$t('common.start')}}</a>
              <a @click="detailNormalOperation('stop')" :class="{'disabled-text': inStates('Stopped')}">{{$t('common.stop')}}</a>
              <a v-permission="'VM.REBOOT'" @click="inStates('Running') && detailNormalOperation('reboot')" :class="{ 'disabled-text': !inStates('Running')}">{{ $t("common.reboot") }}</a>
              <a v-permission="'VM.PAUSE'" @click="!(!inStates('Running') && inStates('Stopped', 'Paused')) && detailNormalOperation('pause')" :class="{ 'disabled-text': !inStates('Running')}">{{ $t("vm.pause") }}</a>
              <a v-permission="'VM.RESUME'" @click="inStates('Paused') && detailNormalOperation('resume')" :class="{ 'disabled-text': !inStates('Paused')}">{{ $t("vm.resume") }}</a>
              <a v-permission="'VM.MIGRATE'" @click="inStates('Running') && detailMigrate()" :class="{ 'disabled-text': !inStates('Running')}">{{ $t("vm.migrate") }}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="model.state && canClone([windowData.dataUuid]) && detailClone()" :class="{ 'disabled-text': model.state && !canClone([windowData.dataUuid])}">{{ $t("vm.clone") }}</a>
              <a @click="inStates('Running', 'Paused') && detailNormalOperation('powerOff')" :class="{ 'disabled-text': !inStates('Running', 'Paused')}">{{ $t("common.forcestop") }}</a>
              <a v-permission="'VM_INSTANCE-OFFERING.CHANGE'" @click="inStates('Stopped') && detailChangeInstanceOffering()" :class="{ 'disabled-text': !inStates('Stopped')}">{{ $t("common.changeConfig") }}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" v-show="dbData.common.isAdmin" @click="inStates('Running', 'Stopped') && detailChangeResourceOwner()" :class="{ 'disabled-text': !inStates('Running', 'Stopped')}">{{ $t("vm.changeOwner") }}</a>
              <a v-permission="'LICENSE_BASIC_PAID'" @click="inStates('Stopped', 'Running') && detailSetHaLevel()" :class="{ 'disabled-text': !inStates('Stopped', 'Running')}">{{ $t("identity.VM.HA-LEVEL") }}</a>
              <a v-permission="'CONSOLE-ACCESS.REQUEST'" @click="inStates('Running') && detailOpenConsole()" :class="{ 'disabled-text': !inStates('Running')}">{{ $t("vm.console") }}</a>
              <a v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.SET']" @click="inStates('Running', 'Stopped') && !consolePasswordIsSet([windowData.dataUuid]) && detailSetVmConsolePassword()" :class="{ 'disabled-text': !(inStates('Running', 'Stopped') || consolePasswordIsSet([windowData.dataUuid]))}">{{ $t("common.setConsolePassword") }}</a>
              <a  v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.DELETE']" @click="inStates('Running', 'Stopped') && consolePasswordIsSet([windowData.dataUuid]) && detailNormalOperation('deleteConsolePassword')" :class="{ 'disabled-text': !(inStates('Running', 'Stopped') && consolePasswordIsSet([windowData.dataUuid]))}">{{ $t("common.deleteConsolePassword") }}</a>
              <a v-permission="'VOLUME_VM.ATTACH'" @click="inStates('Running', 'Stopped') && detailLoadVolume()" :class="{ 'disabled-text': !inStates('Running', 'Stopped')}">{{ $t("vm.volume.attach") }}</a>
              <a v-permission="'VOLUME_VM.DETACH'" @click="enableDetachVolume() && detailUnloadVolume()" :class="{ 'disabled-text': !enableDetachVolume()}">{{ $t("vm.volume.detach") }}</a>
              <a @click="detailNormalOperation('delete')" style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
            </div>
          </span>
        </drop-down>
      </span>

      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('vm.configure')" name="configure"></el-tab-pane>
        <el-tab-pane :label="$t('common.monitor')" name="monitor"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>

    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="vm_large"/>
          <div class="after-icon">
            <detail-info-state v-if="model.state" :state="model.state" outer-class-name="detail-page-state"/>
            <div style="position: relative; color: #005596;" v-if="model.hypervisorType">
              <img style="position: absolute; left: 30px; top: 8px;" src="~assets/kvm.svg"/>
              {{model.hypervisorType}}
            </div>
            <span v-if="inState('Running')" :title="$t('common.console')" class="console" @click="detailOpenConsole()"></span>
          </div>

          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>

        <div class="left-body">
          <div class="detail-block-header" v-text="$t('common.overview')"></div>
          <detail-row
            :param="{
              title: 'CPU',
              content: model && model.cpuNum
            }"
          />

          <detail-row
            :param="{
              title: $t('common.memorySize'),
              content: model && bytesToSize(model.memorySize)
            }"
          />

          <detail-dropdown :param="{
                 getTitle: () => $t('common.platform'),
                  getOptionList: () => {return platformList},
                  getIndex: () =>{
                    return platformList.findIndex(item => {
                      return item === model.platform
                    })
                  },
                  setIndex: index => { updateReource('platform', platformList[index]) },
                  permission: 'LICENSE_BASIC_PAID'
                }"/>

          <detail-dropdown :param="{
                 getTitle: () => $t('common.haLevel'),
                  getOptionList: () => {return haLevelList},
                  getIndex: () =>{
                    return haLevelList.findIndex(item => {
                      return item === model.haLevel
                    })
                  },
                  setIndex: index => { updateHaLevel(model.uuid, haLevelList[index]) },
                  permission: 'LICENSE_BASIC_PAID'
                }"/>

          <detail-row
            :param="{
              title: $t('common.owner'),
              content: model && getResourceOwner(windowData.dataUuid),
              handler(){
                if(!(dbData.resourceOwner[windowData.dataUuid]
                && dbData.resourceOwner[windowData.dataUuid].uuid
                && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid]
                && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid].projectUuid)){
                  $router.push({name: 'detailAccount', params:{uuid: dbData.resourceOwner[windowData.dataUuid].uuid}})
                }
              }
            }"
          />

          <detail-row
            :param="{
              title: $t('common.createDate'),
              content: model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />

          <detail-row
            :param="{
              title: $t('common.lastOpDate'),
              content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
            }"
          />

          <div class="split-line"></div>

          <detail-row-list
            :param="{
              title: 'common.defaultIp',
              contentList: nicVal
            }"
          />

          <detail-row-list v-if="model.vmNics && model.vmNics.length > 0"
            :param="{
              title: 'MAC',
              contentList: macVal
            }"
          />

          <div class="split-line"></div>

          <div class="tag-list">
            <div class="title">{{$t('common.tag') + $t('common.colon')}}</div>
            <span v-for="tag in tagList" class="tag-container">
              <span v-text="tag.tag"></span>
              <span class="el-icon-close"  @click="!inState('Destroyed') && deleteTag(tag)" v-if="!inState('Destroyed')"></span>
            </span>
            <span>
              <span @click.stop="showCreateTag" v-show="showBtn" class="tag-btn">
                <i class="el-icon-plus"></i>
                <span class="link">创建标签</span>
              </span>
              <input type="text" v-show="showEdit" v-model="newTag" ref="tagInput" @blur.stop="createTag(newTag)" class="edit-input"/>
            </span>
          </div>
        </div>
      </div>

      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header" v-text="$t('common.moreInformation')"></div>
        <detail-row
          :param="{
            title: 'common.instanceOffering',
            content:model.instanceOfferingUuid &&  dbData.instanceOffering[model.instanceOfferingUuid] && dbData.instanceOffering[model.instanceOfferingUuid].name
          }"
        />

        <detail-row
        :param="{
            title:'common.image',
            content:  model.imageUuid && dbData.image[model.imageUuid] ? dbData.image[model.imageUuid].name : model.imageUuid
          }"
        />

        <detail-row
          :param="{
            title: 'common.curhost',
            content: model.hostUuid && dbData.host[model.hostUuid] && dbData.host[model.hostUuid].name
          }"
        />

        <detail-row
          :param="{
           title: 'common.lastHost',
           content: model.lastHostUuid && dbData.host[model.lastHostUuid] && dbData.host[model.lastHostUuid].name
          }"
        />

        <detail-row
          :param="{
           title: 'vcenter.resourcePool',
           content: ''
          }"
        />

        <detail-row
          :param="{
            title: 'common.cluster',
            content: model.clusterUuid && dbData.cluster[model.clusterUuid] && dbData.cluster[model.clusterUuid].name
          }"
        />

        <detail-row
          :param="{
            title: 'vCenter',
            content:  dbData.vmA[windowData.dataUuid] && dbData.vmA[windowData.dataUuid].vCenterUuid && dbData.vCenters[dbData.vmA[windowData.dataUuid].vCenterUuid] && dbData.vCenters[dbData.vmA[windowData.dataUuid].vCenterUuid].name,
            handler(){
              $router.push({name: 'detailResource', params: {uuid: dbData.vmA[windowData.dataUuid] && dbData.vmA[windowData.dataUuid].vCenterUuid}})
            }
          }"
        />

        <detail-row
          :param="{
            title: 'UUID',
            content: model && model.uuid,
            copy: true
          }"
        />

        <div class="split-line"></div>

        <div class="detail-block-header" v-text="$t('common.networkService')"></div>

        <detail-row-list
          :param="{
            title: 'common.eip',
            contentList: eipVal,
            handler(item){
              $router.push({name: 'detaileip', params: {uuid: item.eipUuid}})
            }
          }"
        />

        <detail-row-list
          :param="{
            title: 'common.loadBalancer',
            contentList: loadBalancerVal,
            handler(item){
              $router.push({name: 'detailloadbalancer', params: {uuid: item.lbUuid}})
            }
          }"
        />

        <detail-row-list
          :param="{
            title: 'common.portForwarding',
            contentList: portForwardingVal,
            handler(item){
              $router.push({name: 'detailportforwarding', params: {uuid: item.pfUuid}})
            }
          }"
        />

      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'configure'">
      <v-center-vm-configure-tab :param="{
            uuid: windowData.dataUuid,
            createVolume: createVolume
          }"></v-center-vm-configure-tab>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'monitor'">
      <v-center-monitor :param="windowData.dataUuid"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>

    <div slot="footer">
      <vm-clone v-if="showVmClone" :param="vmCloneParam" @close="showVmClone = false;"></vm-clone>
      <v-center-create-volume-page :param="createVolumeParam" v-if="showCreateVolume" @close="showCreateVolume=false"></v-center-create-volume-page>
    </div>
  </detail-template>
</template>

<script>
  import vCenterVmInstanceDetailService from './vCenterVmInstanceDetailService'
  export default vCenterVmInstanceDetailService;
</script>

<style scoped lang="less">
  @import '../../../style/mixins.less';

  .icon {
    .detail-icon('~assets/vm_large.svg');
  }

  .console {
    position: absolute;
    right: 60px;
    top: 15px;
    width: 30px;
    height: 30px;
    background-image: url('~assets/open_console.svg');
    cursor: pointer;
  }
  .edit-input {
    position: relative;
    display: inline-block;
    padding: 5px 10px;
    font-size: 12px;
    line-height: 20px;
    background-color: #00c1de;
    border: none;
    width: auto;
    color: #fff;
    height: 30px;
    margin-top: 5px;
  }
  .el-icon-plus{
    color: #409EFF;
  }
  .tag-container{
    display: inline-flex;
    position: relative;
    border: 1px solid #00c1de;
    background: #00c1de;
    border-radius: 2px;
    padding: 5px 12px;
    flex: 1;
    color: #fff;
    margin: 0 5px;
  }
  .el-icon-close{
    display: inline-block;
    padding-left: 6px;
    vertical-align: middle;
    padding-top: 1px;
  }
</style>
