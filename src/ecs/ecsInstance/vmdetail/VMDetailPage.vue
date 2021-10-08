<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">云主机详情</span>
      <span class="detail-header-item create-back"
            @click="$router.push({name: 'vm'})"><i
        class="el-icon-back"></i>回到云主机列表</span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content" v-if="inStates('Destroyed')">
                  <a v-permission="'VM.RECOVER'" @click="vmRecover()" style="padding-top: 12px;"
                     :class="{ 'disabled-text': !inStates('Destroyed')}">{{$t('common.recover')}}</a>
                  <a v-permission="'VM.EXPUNGE'" @click="vmExpunge()"
                     :class="{ 'disabled-text': !inStates('Destroyed')}">{{$t('common.expunge')}}</a>
                </div>
                <div class="dropdown-content" style="padding: 4px 20px;" v-else>
                  <div class="dropdown-row">
                   <div class="title">{{$t('common.power')}}</div>
                   <div class="item-left">
                     <a v-permission="'VM.START'" @click="canStart() && vmStart()"
                        :class="{ 'disabled-text': !canStart()}">{{ $t("vm.start") }}</a>
                     <a v-permission="'VM.REBOOT'" @click="canReboot() && vmReboot()"
                        :class="{ 'disabled-text': !canReboot() }">{{ $t("common.reboot") }}</a>
                     <a v-permission="'VM.PAUSE'" @click.stop="canPause() && vmPause()"
                        :class="{ 'disabled-text': !canPause()}">{{ $t("vm.pause") }}</a>
                    </div>
                   <div class="item-right">
                     <a v-permission="'VM.STOP'" @click="canStop() && vmStop()"
                        :class="{ 'disabled-text': !canStop() }">{{ $t("vm.stop") }}</a>
                     <a v-permission="'VM.RESUME'" @click="canResume() && vmResume()"
                        :class="{ 'disabled-text': !canResume()}">{{ $t("vm.resume") }}</a>
                     <a v-permission="'VM.STOP'" @click="canForceStop() && vmPowerOff()"
                        :class="{ 'disabled-text': !canForceStop() }">{{ $t("common.forcestop") }}</a>
                   </div>
                 </div>
                   <div class="dropdown-row">
                     <div class="title">
                       {{ $t("common.operation") }}
                     </div>
                     <div class="item-left">
                       <a v-permission="'CONSOLE-ACCESS.REQUEST'" @click="canOpenConsole() && vmOpenConsole()"
                          :class="{ 'disabled-text': !canOpenConsole()}">{{ $t("vm.console") }}</a>
                       <a v-permission="'VM.MIGRATE'" @click="canMigrate() && vmMigrate()"
                          :class="{ 'disabled-text': !canMigrate()}">{{ $t("vm.migrate") }}</a>
                       <a v-permission="'VOLUME_VOLUME-SNAPSHOT.CREATE'"
                          @click="canCreateSnapshot() && vmCreateSnapshot()"
                          :class="{ 'disabled-text': !canCreateSnapshot()}">{{ $t("timer.createVmSnapshot") }}</a>
                       <a :class="{'disabled-text': !canDetachTag()}" @click="canDetachTag() && openDetachTagPanel()">{{ $t("tag.detach") }}</a>
                     </div>
                     <div class="item-right">
                       <a v-permission="['VM.CLONE', 'LICENSE_BASIC_PAID']" @click="canClone() && vmClonePanel()"
                          :class="{ 'disabled-text': !canClone()}">{{ $t("vm.clone") }}</a>
                       <a v-permission="'IMAGE_ROOT-VOLUME-TEMPLATE.CREATE'"
                          @click="canCreateImage() && vmCreateImage()" :class="{ 'disabled-text': !canCreateImage()}">{{ $t("vm.image.create") }}</a>
                       <a v-if="getLicenseCapability('LICENSE_BASIC_PAID')" @click="openAttachTagPanel()">{{ $t("tag.attach") }}</a>
                     </div>
                   </div>
                   <div class="dropdown-row">
                      <div class="title">
                        {{ $t("common.config") }}
                      </div>
                     <div class="item-left">
                      <a v-permission="'VOLUME_VM.ATTACH'" @click="canAttachVolume() && vmloadVolume()"
                         :class="{ 'disabled-text': !canAttachVolume()}">{{ $t("vm.volume.attach") }}</a>
                      <a v-permission="'VM_ISO.ATTACH'" @click="canAttachIso() && vmloadISO()"
                         :class="{ 'disabled-text': !canAttachIso()}">{{ $t("vm.iso.attach") }}</a>
                      <a v-permission="['LICENSE_BASIC_PAID', 'VM_SSH-KEY.SET']"
                         @click="canSetSshKey()&& vmSetVmSshKey()" :class="{ 'disabled-text': !canSetSshKey()}">{{ $t("vm.sshKey.add") }}</a>
                     </div>
                     <div class="item-right">
                       <a v-permission="'VOLUME_VM.DETACH'" @click="canDetachVolume() && vmUnloadVolume()"
                          :class="{ 'disabled-text': !canDetachVolume()}">{{ $t("vm.volume.detach") }}</a>
                       <a v-permission="'VM_ISO.DETACH'" @click="canDetachIso() && vmUnloadISO()"
                          :class="{ 'disabled-text': !canDetachIso() }">{{ $t("vm.iso.detach") }}</a>
                       <a v-permission="['LICENSE_BASIC_PAID', 'VM_SSH-KEY.DELETE']"
                          @click="canDeleteSshKey() && vmDeleteVmSshKey()"
                          :class="{ 'disabled-text': !canDeleteSshKey()}">{{ $t("vm.sshKey.destroy") }}</a>
                     </div>
                   </div>
                   <div class="dropdown-row">
                     <div class="title">
                {{ $t("common.advanced") }}
              </div>
              <div class="item-left">
                <a v-permission="['LICENSE_BASIC_PAID', 'HA.SET', 'HA.DELETE']"
                   @click="canSetHa() && vmSetHaLevelDlg($route.params.uuid)"
                   :class="{ 'disabled-text': !canSetHa()}">{{ $t("identity.VM.HA-LEVEL") }}</a>
                <a v-permission="'VM_BOOT-ORDER.SET'" @click="canSetBootOrder() && model && setVmBootOrder(model)"
                   :class="{ 'disabled-text': !canSetBootOrder()}">{{ $t("identity.VM.BOOT-ORDER.SET") }}</a>
                <a v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.SET']"
                   @click="canSetConsolePassword() && vmSetConsolePassword()"
                   :class="{ 'disabled-text': !canSetConsolePassword()}">{{ $t("common.setConsolePassword") }}</a>
                <a v-permission="'VM.REIMAGE'" @click="inStates('Stopped') && canReimage() && vmReimage()"
                   :class="{ 'disabled-text': !inStates('Stopped') || !canReimage()}">{{ $t("vm.reimageVm") }}</a>
                <a v-permission="['VM.SET_RDP', 'LICENSE_BASIC_PAID']" @click="vmSetRdpMode()">{{ $t("identity.VM.RDP-MODE") }}</a>
                <a v-permission="'LICENSE_BASIC_PAID'" v-show="dbData.common.isAdmin"
                   @click="canSetVmPassword() && vmSetVmPassword()" :class="{ 'disabled-text': !canSetVmPassword()}">{{$t("vm.setVmPassword")}}</a>
                <a v-permission="['TAG.SYSTEM_TAG.CREATE', 'TAG.SYSTEM_TAG.UPDATE', 'LICENSE_BASIC_PAID']"
                   @click="vmSetConsoleModeDlg()">{{ $t("vm.toggleConsoleMode") }}</a>
                <a v-permission="['AG.ADD_VM_2_AG', 'LICENSE_BASIC_PAID']"
                   @click="canJoinAffinityGroup() && vmJoinAffinityGroup()"
                   :class="{ 'disabled-text': !canJoinAffinityGroup()}">{{ $t("vm.joinAffinityGroup") }}</a>
                <a v-permission="['VM.CHANGE_IMAGE', 'LICENSE_BASIC_PAID']"
                   @click="canChangeVmImage() && detailChangeVmImage()" :class="{ 'disabled-text': !canChangeVmImage()}">{{$t("vm.changeVmImage")}}</a>
              </div>
              <div class="item-right">
                <a v-permission="'VM_INSTANCE-OFFERING.CHANGE'"
                   @click="canChangeConfig() && vmChangeInstanceOffering()"
                   :class="{ 'disabled-text': !canChangeConfig()}">{{ $t("common.changeConfig") }}</a>
                <a @click="canStartFromHost() && vmStartVmFromHost()"
                   :class="{ 'disabled-text': !(canStartFromHost())}">{{ $t("common.startFromHost") }}</a>
                <a v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.DELETE']"
                   @click="canDeleteVmConsolePassword() && vmDeleteVmConsolePassword()"
                   :class="{ 'disabled-text': !canDeleteVmConsolePassword()}">{{ $t("common.deleteConsolePassword") }}</a>
                <a v-permission="'LICENSE_BASIC_PAID'" v-show="dbData.common.isAdmin"
                   @click="canChangeResourceOwner() && detailChangeResouceOwner()"
                   :class="{ 'disabled-text': !canChangeResourceOwner()}">{{ $t("vm.changeOwner") }}</a>
                <a v-permission="['VM.CHANGE_PASSWORD', 'LICENSE_BASIC_PAID']" v-show="!dbData.common.isAdmin"
                   @click="canSetVmPassword() && pageSetVmPassword()" :class="{ 'disabled-text': !canSetVmPassword()}">{{$t("vm.setVmPassword")}}</a>
                <a v-permission="['VM.SET_USB_REDIRECT', 'LICENSE_BASIC_PAID']" @click="vmSetUsbRedirect()">{{ $t("identity.VM.USB-REDIRECT") }}</a>
                <a v-permission="['VOLUME.RESIZE_ROOT_VOLUME', 'LICENSE_BASIC_PAID']"
                   @click="canResizeRootVolume() && vmResizeRootVolume()"
                   :class="{ 'disabled-text': !canResizeRootVolume()}">{{ $t("vm.resizeRootVolume") }}</a>
                <a v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin"
                   @click="canStorageMigrate() && detailOpenStorageMigrateDlg()"
                   :class="{ 'disabled-text': !canStorageMigrate()}">
                {{ $t("common.storageMigrate") }}
                <help-trigger name="vmStorageMigrate"
                              :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                              triangle="bottom"/>
                </a>
                <a v-permission="['AG.REMOVE_VM_FROM_AG', 'LICENSE_BASIC_PAID']"
                   @click="canLeaveAffinityGroup() && vmLeaveAffinityGroup()"
                   :class="{ 'disabled-text': !canLeaveAffinityGroup()}">{{ $t("vm.leaveAffinityGroup") }}</a>
              </div>
                   </div>
                   <div class="dropdown-row">
                     <div id="common-destroy" class="title">
                       {{ $t("common.destroy") }}
                     </div>
                     <div class="item-left">
                      <a v-permission="'VM.DESTROY'" @click="vmDelete()">{{ $t("common.destroy") }}</a>
                     </div>
                     <div class="item-right" style="height: 40px;"></div>
                   </div>
                </div>
          </span>
          </drop-down>
        </span>
      <span class="detail-tab">
         <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
         <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
         <el-tab-pane :label="$t('vm.vmSnapshot')" name="snapshot" v-if="isDestroyed()"></el-tab-pane>
         <el-tab-pane :label="$t('vm.configure')" name="configure" v-if="isDestroyed()"></el-tab-pane>
         <el-tab-pane :label="$t('common.schedulerTask')" name="scheduler" v-if="isDestroyed()"></el-tab-pane>
         <el-tab-pane :label="$t('backupData.title')" name="backupdata" v-if="isDestroyed()"></el-tab-pane>
         <el-tab-pane :label="$t('vm.monitor')" name="monitor" v-if="isDestroyed()"></el-tab-pane>
         <el-tab-pane :label="$t('vm.monitoralarm')" name="monitoralarm" v-if="isDestroyed()"></el-tab-pane>
         <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>

      <normal-vm-instance-confirm-dlg v-if="showNormalVmInstanceDlg" :model="showNormalVmInstanceDlg"
                                      :message="normalVmInstanceMessage"
                                      @close="closeNormalVmIntanceDlg"></normal-vm-instance-confirm-dlg>
      <host-single-dlg v-if="showHostSingleDlg" :model="showHostSingleDlg" :message="hostMessage"
                       @close="closeHostSingleDlg"></host-single-dlg>
      <create-snap-dlg v-if="showCreateSnapDlg" :model="showCreateSnapDlg" :message="createSnapMessage"
                       @close="closeCreateSnapDlg"></create-snap-dlg>
      <attach-volume-select-dlg v-if="showAttachVolumeDlg" :model="showAttachVolumeDlg" :message="attachVolumeMessage"
                                @close="closeAttachVolumeDlg"></attach-volume-select-dlg>
      <iso-image-single-dlg v-if="showIsoImageSingleDlg" :model="showIsoImageSingleDlg" :message="isoImageMessage"
                            @close="closeIsoImageSingleDlg"></iso-image-single-dlg>
      <detach-iso-image-dlg v-if="showDetachIsoImageDlg" :model="showDetachIsoImageDlg" :message="detachIsoImageMessage"
                            @close="closeDetachIsoImageDlg"></detach-iso-image-dlg>
      <set-vm-ssh-key-dlg v-if="showVmSSHKeyDlg" :model="showVmSSHKeyDlg" :message="vmSSHKeyMessage"
                          @close="closeVmSSHKeyDlg"></set-vm-ssh-key-dlg>
      <set-ha-level-dlg v-if="showHaLevelDlg" :model="showHaLevelDlg" :message="haLevelMessage"
                        @close="closeHaLevelDlg"></set-ha-level-dlg>
      <set-vm-boot-order-dlg v-if="showVmBootOrderDlg" :model="showVmBootOrderDlg" :message="vmBootOrderMessage"
                             @close="closeVmBootOrderDlg"></set-vm-boot-order-dlg>
      <set-console-password-dlg v-if="showSetConsolePasswordDlg" :model="showSetConsolePasswordDlg"
                                :message="setConsolePasswordMessage"
                                @close="closeSetConsolePasswordDlg"></set-console-password-dlg>
      <set-mode-dlg v-if="showSetModeDlg" :model="showSetModeDlg" :message="setModeMessage"
                    @close="closeSetModelDlg"></set-mode-dlg>
      <set-vm-password-dlg v-if="showSetVmPasswordDlg" :model="showSetVmPasswordDlg" :message="setVmPasswordMessage"
                           @close="closeSetVmPasswordDlg"></set-vm-password-dlg>
      <affinity-group-single-dlg v-if="showAffinitySingleDlg" :model="showAffinitySingleDlg" :message="affinityMessage"
                                 @close="closeAffinitySingleDlg"></affinity-group-single-dlg>
      <instance-offering-single-dlg v-if="showInstanceOfferingSingleDlg" :model="showInstanceOfferingSingleDlg"
                                    :message="instanceOfferingMessage"
                                    @close="closeInstanceOfferingSingleDlg"></instance-offering-single-dlg>
      <vm-resize-root-volume-dlg v-if="showVmResizeRVDlg" :model="showVmResizeRVDlg" :message="vmResizeRVMessage"
                                 @close="closeVmResizeRVDlg"></vm-resize-root-volume-dlg>
    </div>
    <div slot="body" v-if="activeName === 'info'" class="detail-body">
      <div class="left">
        <div class="left-header">
          <base-icon name="vm_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" :state="model && model.state"></detail-info-state>
            <div style="position: relative; color: #005596;">
              <img style="position: absolute; left: 30px; top: 8px;" src="~assets/kvm.svg"/>
              {{model && model.hypervisorType}}
            </div>
            <span :class="{'console': canOpenConsole(), 'console-stopped-vm': !canOpenConsole()}"
                  v-permission="'CONSOLE-ACCESS.REQUEST'" @click="canOpenConsole() && vmOpenConsole()">
               <span class="console-label">{{$t('common.console')}}</span>
             </span>
          </div>
          <detail-name class="name" :param="getNameParam()"></detail-name>
          <detail-description class="description" :param="getDescriptionParam()"></detail-description>
          <tag-list-for-detail class="tag" v-if="getLicenseCapability('LICENSE_BASIC_PAID')"
                               style="margin-bottom: 14px;" :param="getMyTagParam()">
          </tag-list-for-detail>
          <tag-list-for-detail v-if="showOtherTag && getLicenseCapability('LICENSE_BASIC_PAID')" id="common-otherTag"
                               :param="getOtherTagParam()">
          </tag-list-for-detail>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <div class="detail-row editable">
            <div class="detail-title">
              {{$t("common.CPUNum")}}
            </div>
            <div class="detail-container">
              <span v-show="!editCpuNum" class="detail-content">{{model &&  model.cpuNum }}</span>
              <span v-show="!editCpuNum && !inStates('Destroyed') && !inStates('Unknown') && !inStates('Paused')"
                    class="edit-icon" v-permission="'VM.UPDATE'"
                    @click="editCpuNum = true
                      newCpuNum = model.cpuNum; $nextTick(() => { $refs.cpuNumInput.focus() })"><i
                class="el-icon-edit"></i></span>
              <input class="editor" ref="cpuNumInput" v-show="editCpuNum" type="text" v-model="newCpuNum"
                     @blur="editCpuNum = false
                       updateVmInstance('cpuNum', newCpuNum);"
                     @keydown.enter="editCpuNum = false
                        updateVmInstance('cpuNum', newCpuNum);"
                     @keydown.esc="editCpuNum = false"/>
            </div>
          </div>
          <div class="detail-row editable">
            <div class="detail-title">
              {{ $t("common.memory") }}{{$t("common.colon")}}
            </div>
            <div class="detail-container">
              <span v-if="!editMemorySize" class="detail-content">{{ model && bytesToSize(model.memorySize) }}</span>
              <span v-show="!editMemorySize && !inStates('Destroyed') && !inStates('Unknown') && !inStates('Paused')"
                    class="edit-icon" v-permission="'VM.UPDATE'"
                    @click="editMemorySize = true
                       newMemorySize = model.memorySize; $nextTick(() => { $refs.memoryInput.focus() })"
                    ref="memoryInput">
                  <i class="el-icon-edit"></i>
                </span>
              <detail-size-editor v-if="editMemorySize" style="margin-right: 70px;" class="editor"
                                  :value="model && model.memorySize" :sizeList="['K', 'M', 'G', 'T']" unit="B"
                                  :finish="memorySizeEditEnd"/>
            </div>
          </div>
          <detail-dropdown :param="{
                  getTitle: () => $t('common.platform'),
                  getOptionList: () => platformList,
                  getIndex: () => platformList.findIndex(
                     platform => model ? platform === model.platform : ''
                    ),
                  setIndex: index => { setVmInstancePlatform(platformList[index]) },
                  showIcon: !inStates('Destroyed', 'Paused'),
                  permission: 'VM.UPDATE'
                }"/>
          <detail-dropdown :param="{
                  getTitle: () => $t('common.haLevel'),
                  getOptionList: () => haLevelList,
                  doc: 'haLevel',
                  getIndex: () => haLevelList.findIndex(ha => {
                    return (dbData.common.haEnabled && model)? ha === model.ha : ha === 'None'
                  }),
                  setIndex: index => { updateHaLevel([model.uuid], haLevelList[index]) },
                  showIcon: !inStates('Destroyed', 'Paused') && !dbData.common.isOpensource && dbData.common.haEnabled,
                  permission: 'LICENSE_BASIC_PAID'
                }"/>
          <detail-dropdown :param="{
                  getTitle: () => $t('vm.consoleMode'),
                  getOptionList: () => consoleModeList,
                  getIndex: () => consoleModeList.findIndex(consoleMode =>
                    model ? consoleMode === model.vmConsoleMode : ''),
                  doc: 'consoleMode',
                  setIndex: index => { toggleConsoleMode([model.uuid], consoleModeList[index]) },
                  showIcon: !inStates('Destroyed', 'Paused') && !dbData.common.isOpensource,
                  permission: ['TAG.SYSTEM_TAG.CREATE', 'TAG.SYSTEM_TAG.UPDATE', 'LICENSE_BASIC_PAID']
                }"/>
          <detail-dropdown :param="{
                  getTitle: () => $t('vm.bootMode'),
                  getOptionList: () => bootModeList,
                  getIndex: () => bootModeList.findIndex(bootMode =>
                    model ? bootMode === model.bootMode : ''
                  ),
                  doc: bootModeDetail,
                  setIndex: index => { toggleBootMode([model.uuid], bootModeList[index]) },
                  showIcon: !inStates('Destroyed', 'Paused') && !dbData.common.isOpensource,
                  permission: ['TAG.SYSTEM_TAG.CREATE', 'TAG.SYSTEM_TAG.UPDATE', 'LICENSE_BASIC_PAID', 'VM.SET_VMBOOTMODE']
                }"/>
          <detail-switch :param="{
                  showSwitch: dbData && dbData.common && !dbData.common.isOpensource,
                  getTitle: () => 'QGA',
                  getLeftText: () => $t('common.qemugaOff'),
                  getRightText: () => $t('common.qemugaOn'),
                  getValue: () => model && model.qemuga,
                  setValue: val => { !inStates('Destroyed', 'Paused') && setVmQGA() },
                  permission: ['VM.SET_QGA', 'LICENSE_BASIC_PAID'],
                  doc: 'qga'
                }"/>
          <detail-switch :param="{
                  showSwitch: !dbData.common.isOpensource,
                  getTitle: () => $t('common.rdpMode'),
                  getLeftText: () => $t('common.rdpModeOff'),
                  getRightText: () => $t('common.rdpModeOn'),
                  getValue: () => model &&  model.RDPEnable,
                  setValue: val => { !inStates('Destroyed', 'Paused') && setVmRdpMode() },
                  permission: ['VM.SET_RDP', 'LICENSE_BASIC_PAID'],
                  doc: 'rdp'
                }"/>
          <detail-switch :param="{
                  showSwitch: !dbData.common.isOpensource,
                  getTitle: () => $t('common.usbRedirect'),
                  getLeftText: () => $t('common.usbRedirectOff'),
                  getRightText: () => $t('common.usbRedirectOn'),
                  getValue: () => model && model.usbRedirect,
                  setValue: val => { !inStates('Destroyed', 'Paused') && setVmUsbRedirect() },
                  permission: ['VM.SET_USB_REDIRECT', 'LICENSE_BASIC_PAID'],
                  doc: 'usbRedirect'
                }"/>
          <detail-switch v-if="dbData.common.isAdmin" :param="{
                  showSwitch: !dbData.common.isOpensource,
                  getTitle: () => $t('common.antiSpoofing'),
                  getLeftText: () => $t('common.usbRedirectOff'),
                  getRightText: () => $t('common.usbRedirectOn'),
                  getValue: () => model && model.antiSpoofing,
                  setValue: val => { !inStates('Destroyed', 'Paused') && setVmAntiSpoofing() },
                  permission: 'LICENSE_BASIC_PAID'
                }"/>
          <detail-dropdown :param="{
                  getTitle: () => $t('common.screenNum'),
                  getOptionList: () => screenNumList,
                  getIndex: () => screenNumList.findIndex(num =>
                    model && num === model.VDIMonitorNumber
                  ),
                  doc: 'screenNum',
                  setIndex: index => { setVmInstanceScreenNum(model.uuid, screenNumList[index]) },
                  showIcon: !inStates('Destroyed', 'Paused') && !dbData.common.isOpensource,
                  permission: ['VM.SET_VM_MONITOR_NUM', 'LICENSE_BASIC_PAID']
                }"/>
          <detail-row v-if="!dbData.common.isOpensource && dbData.common.isAdmin" :param="{
                  title: 'common.owner',
                  content: model && model.ownerName,
                  handler: () => {
                    let param = { uuid: model.ownerUuid }
                    if (model && model.ownerType === 'project') {

                    } else {
                      $router.push({name: 'detailAccount', params:param})
                    }
                  }
                }"/>
          <detail-row
            :param="{
                title: 'common.createDate',
                content: model && formatDatetime(new Date(model.createDate))
              }"/>
          <detail-row :param="{
                  title: 'common.lastOpDate',
                  content: model && formatDatetime(new Date(model.lastOpDate)),
                }"/>
          <hr/>
          <detail-row-list :param="{
                  title: 'common.defaultIp',
                  contentList: model && model.defaultL3NetworkIp,
                  copy: true
                }"/>
          <detail-row :param="{
                  title: 'MAC',
                  content: model && model.defaultMac,
                  copy: true
                }"/>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row :param="{
                title: 'vm.remoteConnectionAddress',
                content: model && model.consoleAddress
              }"/>
        <detail-row :param="{
                title: 'common.instanceOffering',
                content: model && getInstanceOfferingName(model.uuid),
                getContentClass(){
                  return {
                   'disabled-text': !canLinkInstanceOffering()
                  }
                },
                handler: () => {
                  if(canLinkInstanceOffering())$router.push({name: 'detailInstanceOffering', params: {uuid: model.instanceOfferingUuid}})
                }
              }"/>
        <detail-row :param="{
                title: 'common.image',
                content: (model && dbData.image[model.imageUuid]) ? dbData.image[model.imageUuid].name : (model && model.imageUuid),
                getContentClass(){
                  return {
                   'disabled-text': !canImageLink()
                  }
                },
                handler: () => {
                  if(canImageLink() && dbData.image[model.imageUuid] && dbData.image[model.imageUuid].status){
                      $router.push({name: 'detailImage',
                      params:{uuid: model.imageUuid}
                    })
                  }
                }
              }"/>
        <detail-row-list
          :param="{
            title: 'common.ISO',
            contentList: model && model.isoUuids,
            canLink(isoUuid) {
             canShowIsoLink(isoUuid);
            },
            getValue: (isoUuid) =>{
              return getIsoName(isoUuid)
            },
            handler: (item) => {
              if(canShowIsoLink()){
                $router.push({name: 'detailImage', params: {uuid: model.isoUuid}})
              }
            },
            canEdit: false,
            copy: false
           }"/>
        <detail-row
          :param="{
              title: 'common.affinityGroup',
              content: (model && dbData.affinitygroup[model.affinityGroupUuid]) ? dbData.affinitygroup[model.affinityGroupUuid].name  : '',
              handler: () => {
                if(model && model.affinityGroupUuid){
                  $router.push({
                    name: 'detailAffinityGroup',
                    params: {
                     uuid: model.affinityGroupUuid
                    }
                  })
                }
              }
            }"/>
        <detail-row v-if="dbData.common.isAdmin"
                    :param="{
             title: 'common.curhost',
             content: getCurrHostName,
             handler: () => {
                $router.push({name: 'detailHost', params: {uuid: model.hostUuid}})
             }
           }"/>
        <detail-row v-if="!dbData.common.isAdmin"
                    :param="{
             title: 'common.curhost',
             content:getCurrHostName,
           }"/>
        <detail-row v-if="dbData.common.isAdmin"
                    :param="{
               title: 'common.lastHost',
               content: getLastHostName,
               handler: () => {
                 $router.push({name: 'detailHost', params: {uuid: model.lastHostUuid}})
               }
             }"/>
        <detail-row v-if="!dbData.common.isAdmin"
                    :param="{
               title: 'common.lastHost',
               content: getLastHostName,
             }"/>
        <detail-row v-if="dbData.common.isAdmin"
                    :param="{
                        title: 'common.cluster',
                        content: model && dbData.cluster[model.clusterUuid] && dbData.cluster[model.clusterUuid].name,
                        handler: () => {
                          $router.push({name: 'detailCluster', params: {uuid: model.clusterUuid}})
                        }
                      }"/>
        <detail-row v-if="!dbData.common.isAdmin"
                    :param="{
                        title: 'common.cluster',
                        content: model && dbData.cluster[model.clusterUuid] && dbData.cluster[model.clusterUuid].name,
                      }"/>
        <detail-row :param="{
                title: 'UUID',
                content: model && model.uuid,
                copy: true
              }"/>
        <detail-row :param="{
                title: 'SSH KEY',
                content: dbData.common.isOpensource ? '' : model && shortSshKey(model.sshkey),
                permission: 'LICENSE_BASIC_PAID'
              }"/>
        <detail-row :param="{
                 title: 'vm.userData',
                 content: dbData.common.isOpensource ? '' : model && userdataWindowBase64(model.userdata),
                permission: 'LICENSE_BASIC_PAID',
                copy: true
          }"/>
        <div class="detail-block-header network-service-icon">
          {{$t("common.networkService")}}
        </div>
        <detail-row v-if="model && model.eipUuidList && model.eipUuidList.length === 0"
                    :param="{
             title: 'common.eip'
            }"/>
        <detail-row-list :param="{
             title: 'common.eip',
            contentList: model && model.eipUuidList,
            getValue: (eipUuid) =>{
              return dbData.eip[eipUuid].vipIp
            },
            handler: () => {
              $router.push({name: 'detailVip', params: {uuid: eipUuid}})
            },
          }"/>
        <detail-row v-if="model && model.securityGroupUuidList && model.securityGroupUuidList.length === 0"
                    :param="{
               title: 'common.securityGroup'
             }"/>
        <detail-row-list :param="{
            title: 'common.securityGroup',
            contentList: model && model.securityGroupUuidList,
            getValue: (sgUuid) =>{
              return dbData.securityGroup[sgUuid].name
            },
            handler: (item) => {
              $router.push({name: 'detailsecuritygroup', params: {uuid: item}})
            }
          }"/>
        <detail-row v-if="model && model.loadBalancerUuidList && model.loadBalancerUuidList.length === 0"
                    :param="{
               title: 'common.loadBalancer'
             }"/>
        <detail-row-list :param="{
            title: 'common.loadBalancer',
            contentList: model && model.loadBalancerUuidList,
            getValue: (lbUuid) =>{
              return dbData.loadBalancer[lbUuid].name
            },
            handler: (item) => {
              $router.push({name: 'detailsecuritygroup', params: {uuid: item}})
            }
          }"/>
        <detail-row v-if="model && model.portForwardingUuidList && model.portForwardingUuidList.length === 0"
                    :param="{
               title: 'common.portForwarding'
             }"/>
        <detail-row-list :param="{
            title: 'common.loadBalancer',
            contentList: model && model.portForwardingUuidList,
            getValue: (pfUuid) =>{
              return dbData.portforwarding[pfUuid].name
            },
            handler: (item) => {
              $router.push({name: '', params: {uuid: item}})
            }
          }"/>
      </div>
    </div>
    <div slot="body" v-if="model && activeName === 'snapshot'" class="detail-body">
      <vm-snap-shot :param="model.rootVolumeUuid" type="vm" :primary-storage-type="getPrimaryStorageType(model.uuid)"
                    @open="openVmSnapShot"></vm-snap-shot>
    </div>
    <div slot="body" v-if="model && activeName === 'log'" class="detail-body">
      <log-list :param="{uuid: model.uuid }"></log-list>
    </div>
    <div slot="body" v-if="model && activeName === 'monitor'" class="detail-body">
      <vm-monitor :param="model.uuid"></vm-monitor>
    </div>
    <div slot="body" v-if="model && activeName === 'scheduler'" class="detail-body">
      <vm-scheduler
        :param="{conditions:[`targetResourceUuid?=${model.uuid},${model.rootVolumeUuid}`], resourceUuid: model.uuid, resourceType: 'vm'}"></vm-scheduler>
    </div>
    <div slot="body" v-if="model && activeName === 'backupdata'" class="detail-body">
      <backup-data-nomal-tab-list :param="{
            conditions:`volumeUuid=${model.rootVolumeUuid}`,
            resourceType: 'vm',
          }"></backup-data-nomal-tab-list>
    </div>
    <div slot="body" v-if="model && activeName === 'configure'" class="detail-body">
      <config-tab-list :param="{
            uuid: model.uuid,
            refresh: detailQuery,
            show: showAddNicPage,
            addNicMessage: nicMessage,
            showCreateIosPage: showCreateIosPage,
            isoMessage: isoMessage,
            showCreateVolumeImage: showCreateVolumeImagePage
        }"></config-tab-list>
    </div>
    <div slot="body" v-if="model && activeName === 'monitoralarm'" class="detail-body">
      <zwatch-alaram-for-resource :param="{ resourceUuid: model.uuid, type: 'vm' }"/>
    </div>

    <div slot="footer">
      <clone-vm v-if="showCloneVm" @close="closeCloneVm" :param="cloneVmMessage"></clone-vm>
      <create-vm-image v-if="showCreateVmImage" :param="createVmImageMessage"
                       @close="closeCreateVmImage"></create-vm-image>
      <create-volume-image v-if="showCreateVolumeImage" :param="createVolumeMessage" @close="closeCreateVolumeImage"/>
      <vm-add-nic v-if="showAddNic" @show="showAddNicPage(param)" :param="addNicCondition" @close="closeAddNicPage"/>
      <vm-create-iso v-if="showCreateIso" @show="showCreateIosPage(param)" :param="isoParam" @close="closeCreateIos"/>
      <vm-snap-detail v-if="showVmSnapDetail" :param="vmSnapDetailParam" @close="showVmSnapDetail=false"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import VmList from 'src/ecs/ecsInstance/List';
  import Root from 'src/windows/Root';
  import DetailInfoState from "../../../component/DetailInfoState";
  import strategy from 'src/ecs/ecsInstance/strategy';
  import TagPartialForResourceDetail from 'src/om/tag/partials/TagPartialForResourceDetail';
  import NormalVmInstanceConfirmDlg from 'src/dialog/NormalVmInstanceConfirmDlg';
  import HostSingleDlg from "../../../dialog/HostSingleSelectDlg";
  import CreateSnapDlg from "../../../dialog/CreateSnapDlg";
  import WindowBase from 'src/windows/Window';
  import CloneVm from "../component/CloneVm";
  import CreateVmImage from '../component/CreateVmImage';
  import rpc from 'src/utils/rpc';
  import AttachVolumeSelectDlg from 'src/dialog/AttachVolumeSelectDlg';
  import IsoImageSingleDlg from 'src/dialog/IsoImageSingleDlg';
  import DetachIsoImageDlg from 'src/dialog/DetachIsoImageDlg';
  import SetVmSshKeyDlg from 'src/dialog/SetVmSshKeyDlg';
  import SetHaLevelDlg from 'src/dialog/SetHaLevelDlg';
  import SetVmBootOrderDlg from 'src/dialog/SetVmBootOrderDlg';
  import setConsolePasswordDlg from "src/dialog/setConsolePasswordDlg";
  import SetModeDlg from 'src/dialog/SetModeDlg';
  import SetVmPasswordDlg from 'src/dialog/setVmPasswordDlg';
  import AffinityGroupSingleDlg from 'src/dialog/AffinityGroupSingleDlg';
  import InstanceOfferingSingleDlg from 'src/dialog/InstanceOfferingSingleDlg';
  import VmResizeRootVolumeDlg from 'src/dialog/VmResizeRootVolumeDlg';
  import VmSnapShot from "../component/VmSnapShot";
  import LogList from "../../../component/LogList";
  import VmMonitor from "../component/VmMonitor";
  import VmScheduler from "../component/VmScheduler";
  import BackupDataNomalTabList from "../../../backupdata/BackupDataNomalTabList";
  import ConfigTabList from "../component/ConfigTabList";
  import VmAddNic from "../component/VmAddNic";
  import VmCreateIso from '../component/VmCreateIso';
  import ZwatchAlaramForResource from "../../../om/zwatchalarm/ZwatchAlaramForResource";
  import CreateVolumeImage from "../component/CreateVolumeImage";
  import VolumeMethods from 'src/ecs/volume/Methods';
  import VmSnapDetail from 'src/ecs/ecsInstance/component/VmSnapDetail';

  export default {
    name: "VMDetailPage",
    components: {
      CreateVolumeImage,
      ZwatchAlaramForResource,
      VmAddNic,
      ConfigTabList,
      BackupDataNomalTabList,
      VmScheduler,
      VmMonitor,
      LogList,
      VmSnapShot,
      HostSingleDlg,
      DetailInfoState,
      DetailTemplate,
      NormalVmInstanceConfirmDlg,
      CreateSnapDlg,
      CloneVm,
      CreateVmImage,
      AttachVolumeSelectDlg,
      IsoImageSingleDlg,
      DetachIsoImageDlg,
      SetVmSshKeyDlg,
      SetHaLevelDlg,
      SetVmBootOrderDlg,
      setConsolePasswordDlg,
      SetModeDlg,
      SetVmPasswordDlg,
      AffinityGroupSingleDlg,
      InstanceOfferingSingleDlg,
      VmResizeRootVolumeDlg,
      VmCreateIso,
      VmSnapDetail
    },
    mixins: [VmList, Root, TagPartialForResourceDetail, WindowBase],
    data() {
      return {
        activeName: 'info',
        isAdmin: false,
        updateVmInstance: null,
        editCpuNum: false,
        newCpuNum: 0,
        editMemorySize: false,
        newMemorySize: '',
        platformList: ['Linux', 'Windows', 'WindowsVirtio', 'Other', 'Paravirtualization'],
        haLevelList: ['None', 'NeverStop'],
        consoleModeList: ['vnc', 'spice'],
        bootModeList: ['Legacy', 'UEFI'],
        screenNumList: ['1', '2', '4'],
        normalVmInstanceMessage: {},
        showNormalVmInstanceDlg: false,
        showHostSingleDlg: false,
        hostMessage: {},
        showCreateSnapDlg: false,
        createSnapMessage: {},
        showCloneVm: false,
        cloneVmMessage: {},
        bsListInCurrentZone: [],
        showCreateVmImage: false,
        createVmImageMessage: {},
        showAttachVolumeDlg: false,
        attachVolumeMessage: {},
        showIsoImageSingleDlg: false,
        isoImageMessage: {},
        showDetachIsoImageDlg: false,
        showVmSSHKeyDlg: false,
        vmSSHKeyMessage: {},
        showHaLevelDlg: false,
        haLevelMessage: {},
        showVmBootOrderDlg: false,
        vmBootOrderMessage: {},
        showSetConsolePasswordDlg: false,
        setConsolePasswordMessage: {},
        showSetModeDlg: false,
        setModeMessage: {},
        showSetVmPasswordDlg: false,
        setVmPasswordMessage: {},
        showAffinitySingleDlg: false,
        affinityMessage: {},
        showInstanceOfferingSingleDlg: false,
        instanceOfferingMessage: {},
        showVmResizeRVDlg: false,
        vmResizeRVMessage: {},
        showAddNic: false,
        nicMessage: {},
        showCreateIso: false,
        isoParam: {},
        isoMessage: {},
        selectVal: '',
        searchStr: '',
        showCreateVolumeImage: false,
        createVolumeMessage: {},
        showVmSnapDetail: false,
        vmSnapDetailParam: {}
      }
    },
    computed: {
      model() {
        return this.get(this.$route.params.uuid)
      },
      bootModeDetail() {
        if (this.dbData.common.isNotSetUEFI === false) {
          return 'bootModeDetail'
        } else {
          return 'isNotSetUEFIbootModeDetail'
        }
      },
      getCurrHostName() {
        if (this.model && this.model.hostUuid)
          return this.getHostName(this.model.hostUuid);
        return '';
      },
      getLastHostName() {
        if (this.model && this.model.lastHostUuid) {
          return this.getHostName(this.model.lastHostUuid);
        }
        return '';
      }
    },
    created() {
      let self = this;
      self.isAdmin = window.localStorage.getItem('isAdmin') === 'true';
      self.updateVmInstance = _.debounce(this._updateVmInstance, 100);
      self.updateWindow({
        currTab: self.model && self.model.state === 'Destroyed' ? 'destroyed' : 'available',
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          query: self.detailQuery
        }
      }).then(() => {
        self.queryList()
          .then(() => {
            self.$forceUpdate(self.detailQuery())
          });
        self.detailQuery()
      }).then(() => {
        // this.queryUuidList()
        this.$forceUpdate()
      })
      rpc.query('backup-storage', {
        q: `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
      }).then(resp => {
        self.bsListInCurrentZone = resp.inventories
      })
      // this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
      // this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
    },
    methods: {
      ...{
        createImageFromVolume: VolumeMethods.methods.createImageFromVolume
      },

      openVmSnapShot(param) {
        let self = this;
        self.vmSnapDetailParam = param;
        self.showVmSnapDetail = true;
      },

      showAddNicPage(param) {
        let self = this;
        self.addNicCondition = param;
        self.showAddNic = true;
      },
      showCreateIosPage(param) {
        let self = this;
        self.isoParam = param;
        self.showCreateIso = true;
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      inStates(...stateList) {
        if (this.model)
          return stateList.some(state => state === this.model.state);
      },
      //查找详情
      detailQuery() {
        this.dispatchAction('vm/query', {q: [`uuid=${this.$route.params.uuid}`]})
          .then((resp) => {
            this.dispatchAction('vm/getExtraData', this.$route.params.uuid)
          })
      },
      //关闭创建网卡页
      closeAddNicPage(param) {
        let self = this;
        if (param) {
          self.nicMessage = param;
        }
        self.showAddNic = false;
      },
      //关闭iso创建页
      closeCreateIos(param) {
        let self = this;
        if (param) {
          self.isoMessage = param;
        }
        self.showCreateIso = false;
      },
      //打开创建云盘镜像
      showCreateVolumeImagePage(param) {
        let self = this;
        self.createVolumeMessage = param;
        self.showCreateVolumeImage = true;
      },
      //关闭创建云盘
      closeCreateVolumeImage(param) {
        let self = this;
        if (param) {
          self.createImageFromVolume(param);
        }
        self.showCreateVolumeImage = false;
      },
      setVmQGA: function () {
        let enable = !this.model.qemuga;
        let eventMsg;
        if (enable) {
          eventMsg = 'action.vm.enableSetQga'
        } else {
          eventMsg = 'action.vm.disableSetQga'
        }
        let event = this.createEvent(eventMsg, this.model.name, 1);
        this.dispatchActionWithEvent('vm/setQga', {
          uuid: this.model.uuid,
          enable
        }, undefined, event)
      },
      setVmRdpMode: function () {
        this.dispatchActionWithEvent('vm/setRdpMode', {
          uuid: this.model.uuid,
          enable: !this.model.RDPEnable
        })
      },
      setVmUsbRedirect: function () {
        this.setUsbRedirect([this.model.uuid], !this.model.usbRedirect)
      },
      setVmAntiSpoofing: function () {
        this.dispatchActionWithEvent('vm/setVmAntiSpoofing', {
          uuid: this.model.uuid,
          enable: !this.model.antiSpoofing
        })
      },
      getInstanceOfferingName() {
        if (this.canLinkInstanceOffering()) {
          return this.instanceOffering[this.model.instanceOfferingUuid].name
        } else {
          return this.model.instanceOfferingUuid
        }
      },
      canLinkInstanceOffering() {
        let self = this;
        if (self.model && this.dbData.common.isAdmin &&
          this.instanceOffering[this.model.instanceOfferingUuid]) {
          return true
        }
        return false
      },
      canShowIsoLink(uuid) {
        return this.dbData.image[uuid] && this.dbData.image[uuid].status
      },
      getIsoName(uuid) {
        if (this.canShowIsoLink(uuid)) {
          return this.dbData.image[uuid].name
        }
        return uuid
      },
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.model) {
              return this.model.name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'VM.UPDATE'
          },
          setValue: (value) => {
            this.updateVmInstance('name', value)
          }
        }
      },
      userdataWindowBase64: function (item) {
        if (item !== undefined) {
          return Utf8Base64.decode(item)
        } else {
          return ''
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            if (this.model)
              return this.model.description
          },
          setValue: (value) => {
            this.updateVmInstance('description', value)
          }
        }
      },
      // getMyTagParam() {
      //   let self = this;
      //   return {
      //     getTagUuidList() {
      //       return self.getMyUserTagUuidList()
      //     },
      //     getIconName() {
      //       return 'detail_tag_admin'
      //     },
      //     getTitle() {
      //       if (self.dbData.common.isAdmin) {
      //         return self.$t('tag.admin')
      //       } else {
      //         return ''
      //       }
      //     },
      //     onAttach: () => {
      //       self.onAttach('my')
      //     },
      //     detachTagUuidList(uuidList) {
      //       if (self.model)
      //         self.detachTag([self.model.uuid], uuidList)
      //           .then(self.refreshForTag);
      //     },
      //     isRemoveDeleteButton() {
      //       if (this.model)
      //         return _.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted';
      //     },
      //     canShowAttach() {
      //       if (this.model)
      //         return !(_.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted');
      //     }
      //   }
      // },
      // getOtherTagParam() {
      //   let self = this;
      //   return {
      //     getTagUuidList() {
      //       return self.getOtherUserTagUuidList()
      //     },
      //     getIconName() {
      //       return 'detail_tag_others'
      //     },
      //     getTitle() {
      //       return self.$t('tag.other')
      //     },
      //     onAttach: () => {
      //       self.onAttach('other')
      //     },
      //     detachTagUuidList(uuidList) {
      //       if (this.model)
      //         self.detachTag([self.model.uuid], uuidList)
      //           .then(self.refreshForTag);
      //     },
      //     isRemoveDeleteButton() {
      //       if (this.model)
      //         return _.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted';
      //     },
      //     canShowAttach() {
      //       if (this.model && (_.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted')) {
      //         return false
      //       }
      //       let currAccountUuid = window.localStorage.getItem('accountUuid');
      //       if (this.model && self.model.ownerUuid !== currAccountUuid) {
      //         return true
      //       }
      //       return false
      //     }
      //   }
      // },
      memorySizeEditEnd(newValue) {
        this.editMemorySize = false;
        this.updateVmInstance('memorySize', newValue)
      },
      canOpenConsole() {
        if (this.model)
          return strategy.canOpenConsole(this.model)
      },
      setVmInstancePlatform: function (platform) {
        this.dispatchActionWithEvent('vm/update', {
          uuid: this.model.uuid,
          param: {
            'platform': platform
          }
        })
      },
      _updateVmInstance(key, newValue) {
        let oldValue = String(this.model[key]);
        if (oldValue === String(newValue)) return;
        if (key === 'name' && !String(newValue).trim()) return;
        let param = {};
        param[key] = newValue;
        if (key === 'memorySize') {
          newValue = this.bytesToSize(newValue)
        }
        if (key === 'cpuNum' && this.model.state === 'Stopped') {
          this.checkCpuPinning(newValue)
        }
        let event = this.createEvent('common.updateInfo' + key, newValue);
        this.dispatchActionWithEvent('vm/update', {
          uuid: this.model.uuid,
          param
        }, undefined, event)
      },
      //恢复云主机操作
      vmRecover() {
        const self = this;
        let uuidList = [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'Reboot';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      vmExpunge() {
        const self = this;
        let uuidList = [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'Expunge';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //创建云主机快照
      vmCreateSnapshot() {
        let self = this, rootVolumeUuid;
        rootVolumeUuid = self.dbData.vm[self.model.uuid] ? self.dbData.vm[self.model.uuid].rootVolumeUuid : '';
        self.createSnapMessage = {
          vmInstanceUuid: rootVolumeUuid
        };
        self.updateWindow({
          rootVolumeUuid: rootVolumeUuid
        });
        self.showCreateSnapDlg = true;
      },
      //绑定亲和组
      async vmJoinAffinityGroup() {
        let self = this;
        let affinityGroupUuids = await self.getCandidateAffinityGroupForVmAttaching([self.model.uuid]);
        self.affinityMessage = {
          conditions: [`uuid?=${affinityGroupUuids}`],
        };
        self.showAffinitySingleDlg = true;
      },
      //启动指定物理机
      vmStartVmFromHost() {
        let self = this;
        let {uuid, pciDeviceUuidList, usbDeviceUuidList} = self.model;
        let hasPciDevice = _.isArray(pciDeviceUuidList) && pciDeviceUuidList.length > 0;
        let hasUsbDevice = _.isArray(usbDeviceUuidList) && usbDeviceUuidList.length > 0;
        // if (hasUsbDevice || hasPciDevice) {
        //   return self.openDialog('MessageboxDlg', {
        //     title: self.$t('common.startFromHost'),
        //     msg: self.$t('vm.remindMigrate2')
        //   })
        // }
        self.hostMessage = {
          uuid: uuid,
          type: 'start'
        };
        self.showHostSingleDlg = true;
      },
      closeNormalVmIntanceDlg(param) {
        let self = this;
        if (param) {
          switch (param.type.toLowerCase()) {
            case 'stop':
              this.stop(param.uuidList, param.stopHa);
              break;
            case 'reboot':
              this.reboot(param.uuidList, param.type)
                .then(() => {
                  self.queryVirtualRouterVm()
                });
              break;
            case 'pause':
              this.pause(param.uuidList, param.type);
              break;
            case 'resume':
              this.resume(param.uuidList, param.type);
              break;
            case 'poweroff':
              this.powerOff(param.uuidList, param.type);
              break;
            case 'deletesshkey':
              this.deleteVmSshKey(param.uuidList[0], param.type);
              break;
            case 'reimage':
              this.reimage(param.uuidList[0], param.type);
              break;
            case 'cancel':
              self.deleteConsolePassword(param.uuidList[0], param.isReboot);
              break;
            case 'leaveaffinity':
              self.leaveAffinityGroup(param.uuidList[0], self.vm[param.uuidList[0]].affinityGroupUuid);
              break;
            case 'expunge':
              self.removeVueStore(self.volume, self.model.rootVolumeUuid);
              self.expunge(param.uuidList);
              break;
            case 'delete':
              self.delete([self.model.uuid], param.isDeleteVolume);
              break;
          }
        }
        this.showNormalVmInstanceDlg = false;
      },
      //迁移云主机回调
      closeHostSingleDlg(param) {
        let self = this;
        if (param) {
          switch (param.type) {
            case 'migrate':
              self.migrate(param.vmUuid, param.uuid);
              break;
            case 'start':
              self.startVmFromHost(param.uuid, self.model.uuid);
              break;
          }
        }
        self.showHostSingleDlg = false;
      },
      //创建云主机快照回调
      closeCreateSnapDlg(param) {
        let self = this;
        if (param) {
          self.createSnapshot(self.windowData.rootVolumeUuid, param)
        }
        self.showCreateSnapDlg = false;
      },
      //克隆云主机回调
      closeCloneVm(param) {
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
        self.showCloneVm = false;
      },
      //创建云盘镜像回调
      closeCreateVmImage(param) {
        let self = this;
        if (param) {
          param.vmUuid = self.model.uuid;
          param.volumeUuid = self.model.rootVolumeUuid;
          this.createImage(param)
        }
        self.showCreateVmImage = false;
      },
      //加载卸载云盘回调
      closeAttachVolumeDlg(param) {
        let self = this;
        if (param && param.volumeUuidList.length > 0) {
          switch (param.type) {
            case 'load':
              self.attachDataVolumeToVm(param.volumeUuidList, self.model.uuid);
              self.showAttachVolumeDlg = false;
              break;
            case 'unload':
              self.detachDataVolumeFromVm(param.volumeUuidList, self.model.uuid);
              self.showAttachVolumeDlg = false;
              break;
          }
        }
        self.showAttachVolumeDlg = false;
      },
      //加载ISO镜像回调
      closeIsoImageSingleDlg(param) {
        let self = this;
        if (param) {
          self.attachISOToVmInstance([param.uuid], self.model.uuid)
        }
        self.showIsoImageSingleDlg = false;
      },
      //卸载ISO镜像回调
      closeDetachIsoImageDlg() {
        let self = this;
        self.showDetachIsoImageDlg = false;
      },
      //设置SSHKey回调
      closeVmSSHKeyDlg(param) {
        let self = this;
        if (param) {
          self.setVmSshKey(self.model.uuid, param.msg)
        }
        self.showVmSSHKeyDlg = false;
      },
      //设置高可用回调
      closeHaLevelDlg(param) {
        let self = this;
        if (param) {
          self.updateHaLevel([self.$route.params.uuid], param.haLevel);
        }
        self.showHaLevelDlg = false;
      },
      //设置启动顺序回调
      closeVmBootOrderDlg(param) {
        let self = this;
        if (param) {
          self.updateVmBootOrder(self.model.uuid, param.bootOrder, param.cdromBootOnce)
        }
        self.showVmBootOrderDlg = false;
      },
      //设置控制台密码回调
      closeSetConsolePasswordDlg(param) {
        let self = this;
        if (param) {
          self.setVmConsolePassword(self.model.uuid, param.newPassword, param.isReboot)
        }
        self.showSetConsolePasswordDlg = false;
      },
      //设置模式相关回调
      closeSetModelDlg(param) {
        let self = this, enable;
        if (param) {
          switch (param.type) {
            case 'RDP-MODE':
              enable = param.value === 'On';
              self.setRdpMode(param.uuidList, enable);
              break;
            case 'USB-REDIRECT':
              enable = param.value === 'On';
              self.setUsbRedirect(param.uuidList, enable);
              break;
            case 'TOGGLE_CONSOLE_MODE':
              self.toggleConsoleMode(param.uuidList, param.value);
              break;
          }
        }
        self.showSetModeDlg = false;
      },
      //设置云主机密码回调
      closeSetVmPasswordDlg(param) {
        let self = this;
        if (param) {
          self.setVmPassword(self.model.uuid, param.account, param.password)
        }
        self.showSetVmPasswordDlg = false;
      },
      //绑定亲和组的回调
      closeAffinitySingleDlg(param) {
        let self = this;
        if (param) {
          self.joinAffinityGroup(self.model.uuid, param);
        }
        self.showAffinitySingleDlg = false;
      },
      //绑定亲和组回调
      closeInstanceOfferingSingleDlg(param) {
        let self = this, uuidList = [];
        if (param) {
          self.changeInstanceOffering([self.model.uuid], param.uuid)
        }
        self.showInstanceOfferingSingleDlg = false;
      },
      //系统扩容回调
      closeVmResizeRVDlg(param) {
        let self = this;
        if (param) {
          self.resizeRootVolume(self.model.uuid, param.uuid, param.size).bind(this).then(() => self.queryList())
        }
        self.showVmResizeRVDlg = false;
      },
      //启动云主机
      vmStart() {
        let self = this;
        this.start([this.model.uuid])
      },
      //重启云主机
      vmReboot() {
        let self = this;
        let uuidList = [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'Reboot';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //暂停云主机
      vmPause() {
        let self = this;
        let uuidList = [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'Pause';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //停止云主机
      vmStop() {
        let self = this;
        let uuidList = [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'Stop';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //恢复云主机
      vmResume() {
        let self = this;
        let uuidList = [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'Resume';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //关闭电源
      vmPowerOff() {
        let self = this;
        let uuidList = [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'PowerOff';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //打开控制台
      vmOpenConsole() {
        let self = this;
        self.openConsole(self.model.uuid, encodeURIComponent(self.model.name))
      },
      //迁移云主机
      vmMigrate() {
        let self = this;
        self._pageMigrate(self.model.uuid)
      },
      //克隆云主机
      async vmClonePanel() {
        let self = this;
        self.openClonePanel(self.$route.params.uuid);
      },
      //创建云主机镜像
      vmCreateImage() {
        let self = this;
        self.createVmImageMessage = {
          primaryStorageType: self.getPrimaryStorageType(self.model.uuid),
          vmUuid: self.model.uuid,
        };
        self.showCreateVmImage = true;
      },
      //加载云盘
      vmloadVolume() {
        let self = this;
        self.attachVolumeMessage = {
          uuid: [self.model.uuid],
          type: 'load'
        };
        self.showAttachVolumeDlg = true;
      },
      //加载ISO
      vmloadISO() {
        let self = this;
        const {uuid: vmInstanceUuid, cdRom, state} = self.model;
        let hasEmptyCDRom = _.filter(_.values(cdRom), it => !it.isoUuid).length > 0;
        self.isoImageMessage = {
          vmInstanceUuid: self.model && vmInstanceUuid
        };
        if (hasEmptyCDRom) return self.showIsoImageSingleDlg = true;
      },
      //设置sshKey
      vmSetVmSshKey() {
        let self = this;
        self.vmSSHKeyMessage = {
          uuidList: self.model && [self.model.uuid]
        };
        self.showVmSSHKeyDlg = true;
      },
      //卸载云盘
      vmUnloadVolume() {
        let self = this;
        let candidateVolumeUuidList = self.model.allVolumes.map(volume => volume.uuid);
        if (self.model.shareableVolumeUuidList) {
          candidateVolumeUuidList = candidateVolumeUuidList.concat(self.model.shareableVolumeUuidList)
        }
        self.attachVolumeMessage = {
          conditions: [`uuid?=${candidateVolumeUuidList}`, 'type=Data'],
          type: 'unload'
        };
        self.showAttachVolumeDlg = true;
      },
      //卸载ISO
      vmUnloadISO() {
        let self = this, uuidList = [];
        self.detachIsoImageMessage = {
          vmInstanceUuid: self.model && self.model.uuid
        };
        self.showDetachIsoImageDlg = true;
      },
      //删除sshKey
      vmDeleteVmSshKey() {
        let self = this, uuidList = [];
        uuidList = self.model && [self.model.uuid];
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'DeleteSshKey';
          self.normalVmInstanceMessage.vmModel = self.model;
          self.showNormalVmInstanceDlg = true;
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //设置高可用
      vmSetHaLevelDlg(uuidList) {
        let self = this;
        if (_.isUndefined(uuidList)) return;
        if (!_.isArray(uuidList)) {
          uuidList = [uuidList]
        }
        let defaultValue = 'None';
        if (uuidList.length === 1) {
          defaultValue = this.vm[uuidList[0]].ha === 'NeverStop' ? this.vm[uuidList[0]].ha : 'None'
        }
        self.haLevelMessage = {
          selectUuidList: uuidList,
          haLevel: defaultValue,
        };
        self.showHaLevelDlg = true;
      },
      //设置控制台密码
      vmSetConsolePassword() {
        let self = this;
        self.setConsolePasswordMessage = {
          state: self.model.state,
        };
        self.showSetConsolePasswordDlg = true;
      },
      //设置RDP模式
      vmSetRdpMode() {
        let self = this, uuidList = [];
        self.setModeMessage = {
          uuidList: self.model && [self.model.uuid],
          title: 'RDP-MODE',
          label: 'rdpMode',
          value: ['On', 'Off'],
          type: 'RDP-MODE',
          defaultVal: 'On'
        };
        self.showSetModeDlg = true;
      },
      //重启云主机镜像
      vmReimage() {
        let self = this;
        self.normalVmInstanceMessage.confirmDlgType = 'Reimage';
        self.normalVmInstanceMessage.uuidList = self.model && [self.model.uuid];
        self.normalVmInstanceMessage.vmModel = self.model;
        self.showNormalVmInstanceDlg = true;
      },
      //设置云主机密码
      vmSetVmPassword() {
        let self = this;
        self.showSetVmPasswordDlg = true;
      },
      //切换控制台模式
      vmSetConsoleModeDlg() {
        let self = this;
        self.setModeMessage = {
          uuidList: [self.model.uuid],
          title: 'TOGGLE_CONSOLE_MODE',
          label: 'consoleMode',
          value: ['vnc', 'spice'],
          type: 'TOGGLE_CONSOLE_MODE',
          defaultVal: self.model.vmConsoleMode === 'vnc' ? 'vnc' : 'spice'
        };
        self.showSetModeDlg = true;
      },
      //修改计算规格
      vmChangeInstanceOffering() {
        const self = this;
        let conditions = ['state!=Disabled', 'type=UserVm'];
        if (self.model.instanceOfferingUuid) {
          conditions.push(`uuid!=${self.model.instanceOfferingUuid}`)
        }
        self.instanceOfferingMessage = {
          conditions: conditions
        };
        self.showInstanceOfferingSingleDlg = true;
      },
      //取消控制台密码
      vmDeleteVmConsolePassword() {
        let self = this;
        self.normalVmInstanceMessage = {
          'confirmDlgType': 'DeleteConsolePassword',
          uuidList: self.model && [self.model.uuid],
          vmModel: self.model
        };
        self.showNormalVmInstanceDlg = true;
      },
      //设置USB重定向
      vmSetUsbRedirect() {
        let self = this;
        self.setModeMessage = {
          uuidList: self.model && [self.model.uuid],
          title: 'USB-REDIRECT',
          label: 'usbRedirect',
          value: ['On', 'Off'],
          type: 'USB-REDIRECT',
          defaultVal: 'On'
        };
        self.showSetModeDlg = true;
      },
      //系统扩容操作
      vmResizeRootVolume() {
        let self = this;
        let rootVolume = self.getRootVolume(self.model);
        self.vmResizeRVMessage = {
          rootVolume
        };
        self.showVmResizeRVDlg = true;
      },
      //解绑亲和组操作
      vmLeaveAffinityGroup() {
        let self = this;
        self.normalVmInstanceMessage = {
          'confirmDlgType': 'LeaveAffinity',
          uuidList: self.model && [self.model.uuid],
          vmModel: self.model
        };
        self.showNormalVmInstanceDlg = true;
      },
      //删除云主机
      vmDelete: function () {
        const self = this;
        self.normalVmInstanceMessage = {
          'confirmDlgType': 'Delete',
          uuidList: self.model && [self.model.uuid],
          vmModel: self.model
        };
        self.showNormalVmInstanceDlg = true;
      },
      canStart() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canStart(self.model)
      },
      canStop() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canStop(this.model);
      },
      canReboot() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canReboot(this.model);
      },
      canPause() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canPause(this.model);
      },
      canResume() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canResume(self.model)
      },
      canForceStop() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canForceStop(this.model)
      },
      canMigrate() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canMigrate(self.model, self.dbData.primarystorage, self.dbData.common.liveMigrate)
      },
      canCreateSnapshot() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canCreateSnapshot(this.model)
      },
      canCreateImage() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canCreateImage(self.model, self.bsListInCurrentZone)
      },
      canClone() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canClone(self.model, self.bsListInCurrentZone);
      },
      canAttachVolume() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canAttachVolume(this.model)
      },
      canAttachIso() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canAttachIso(this.model)
      },
      canSetSshKey() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canSetSshKey(this.model)
      },
      canDeleteSshKey() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canDeleteSshKey(this.model)
      },
      canDetachVolume() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canDetachVolume(this.model)
      },
      canDetachIso() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canDetachIso(this.model)
      },
      canSetHa() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canSetHa(self.model, self.dbData.common.haEnabled)
      },
      canSetBootOrder() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canSetBootOrder(self.model);
      },
      canSetConsolePassword() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canSetConsolePassword(self.model)
      },
      canReimage() {
        let self = this;
        if (self.model && self.model.state)
          return strategy.canReimage(self.model, self.dbData.primarystorage, self.dbData.common.isAdmin)
      },
      canSetVmPassword() {
        let self = this;
        if (self.model)
          return strategy.canSetVmPassword(this.model)
      },
      canJoinAffinityGroup() {
        let self = this;
        if (self.model)
          return strategy.canJoinAffinityGroup(self.model)
      },
      canChangeVmImage() {
         let self = this;
        if (self.model)
        return strategy.canChangeVmImage(self.model)
      },
      canChangeConfig() {
        let self = this;
        if (self.model)
          return strategy.canChangeConfig(self.model, self.dbData.common.numa)
      },
      canStartFromHost() {
        let self = this;
        if (self.model)
          return strategy.canStartFromHost(this.model, this.dbData.primarystorage, this.dbData.common.isAdmin)
      },
      canDeleteVmConsolePassword() {
        let self = this;
        if (self.model)
          return strategy.canDeleteVmConsolePassword(this.model)
      },
      canChangeResourceOwner() {
        let self = this;
        if (self.model)
          return strategy.canChangeResourceOwner(this.model)
      },
      canResizeRootVolume() {
        let self = this;
        if (self.model)
          return strategy.canResizeRootVolume(this.model)
      },
      canStorageMigrate() {
        let self = this;
        if (self.model)
          return strategy.canStorageMigrate(this.model, this.dbData.primarystorage, this.dbData.common.isAdmin)
      },
      canLeaveAffinityGroup() {
        let self = this;
        if (self.model)
          return strategy.canLeaveAffinityGroup(this.model)
      },
      //是否可以解绑标签
      canDetachTag() {
        let self = this;
        return self.model && self._canDetachTag(self.vm[self.model.uuid])
      },
      _canDetachTag(res) {
        if ((res && res.myUserTagUuidList && res.myUserTagUuidList.length > 0) ||
          (res && res.otherUserTagUuidList && res.otherUserTagUuidList.length > 0)) {
          return true
        }
        return false
      },
      isDestroyed() {
        let self = this;
        if (self.dbData.vm[self.$route.params.uuid]) {
          return self.dbData.vm[self.$route.params.uuid].state !== 'Destroyed';
        }
        return true;
      },
      canImageLink() {
        let self = this;
        if (self.model) {
          return (self.dbData.image[self.model.imageUuid] && self.dbData.image[self.model.imageUuid].name) ? true : false;
        }
      },
      detailChangeResouceOwner() {
        let self = this;
        self.changeResourceOwnerDlg([self.$route.params.uuid], self.changeResourceToAccountOrProject, undefined, true)
      },
       //更换系统
      detailChangeVmImage(){
        let _this = this;
        _this.openDialog('VMChangeImageConfirmDlg', {
          ok: () => {
            rpc.query(`vm-instances/${_this.$route.params.uuid}/image-candidates`)
               .then(resp => {
                let imageUuidList = []
                if (resp.inventories && resp.inventories.length > 0) {
                  imageUuidList = resp.inventories.map((item) => item.uuid)
                }
                _this.openDialog('VirtualRouterImageAndImageSingleSelectListDlg', {
                  conditions: [`uuid?=${imageUuidList}`],
                  withTab: true,
                  select: (imageUuid) => {
                     _this.changeVmImage(_this.$route.params.uuid, imageUuid)
                  }
                 })
               })
          }
        })
      },
    },
    watch: {
      activeName: function (newVal, oldVal) {
        if (_.isEqual(newVal, oldVal)) return;
        if (newVal === 'info') {
          this.detailQuery();
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 62px;
    height: 60px;
    //background-image: url('~assets/vm_large.svg');
    background-repeat: no-repeat;
    vertical-align: middle;
  }

  .console {
    position: absolute;
    right: 60px;
    top: 15px;
    width: 30px;
    display: inline-block;
    height: 30px;
    cursor: pointer;
  }

  .console-label {
    display: none;
    font-family: MicrosoftYaHei;
    background: #fafdff;
    border: 1px solid #c6d3dc;
    border-radius: 2px;
    position: absolute;
    font-style: normal;
    font-size: 12px;
    left: -4px;
    width: 60px;
    top: 38px;
    line-height: 20px;
    padding-top: 2.5px;
    height: 28px;
    z-index: 2889;
    color: #5e6978;
    text-align: center;
  }

  .console, .console-stopped-vm {
    position: absolute;
    right: 60px;
    top: 15px;
    width: 30px;
    display: inline-block;
    height: 30px;
    background-image: url('~assets/open_console.svg');
    cursor: pointer;
  }

  .console-stopped-vm {
    background-image: url('~assets/console_disable.svg');
  }

  .console-stopped-vm:hover > .console-label, .console:hover > .console-label {
    display: inline-block;
  }

  .network-service-icon {
    background-image: url('~assets/detail_page_network_service.svg');
  }
</style>
