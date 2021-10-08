<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title" v-text="$t('common.vm')"></span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs @tab-click="setTabVal" v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${availableCount})`" name="available"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.destroyed')}(${destroyedCount})`" name="destroyed"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span class="btn-success" v-permission="'TICKET.CREATE'" @click="createvm" v-if="currTab === 'available'"><i class="el-icon-plus icon"></i>{{$t('vm.create')}}</span>
          <span class="btn-primary" v-permission="'VM.START'" :class="{'disabled': windowData.selectList.length <=0 || inStates('Running', 'Paused', 'VolumeMigrating', 'Migrating')}" @click.stop=" windowData.selectList.length > 0 && !inStates('Running', 'Paused', 'VolumeMigrating', 'Migrating') && startVm()"
                v-if="currTab === 'available'"><i
            class="el-icon-caret-right icon"></i>{{$t('vm.start')}}</span>
          <span class="btn-primary" v-permission="'VM.STOP'" :class="{'disabled': windowData.selectList.length <=0 || inStates('Stopped')}" @click.stop=" windowData.selectList.length > 0 && !inStates('Stopped') && stopVm()"
                v-if="currTab === 'available'"><i
            class="el-icon-remove-outline icon"></i>{{$t('vm.stop')}}
          </span>
          <drop-down class="btn-primary more dropdown" v-if="currTab === 'available'"
                     :class="{'disabled': windowData.selectList.length <=0}" :enabled="windowData.selectList.length >0">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" :class="{'show': windowData.showMoreDropdown}" style="padding: 4px 20px;">
                 <div class="dropdown-row">
                  <div class="title">{{$t('common.power')}}</div>
                  <div class="item-left">
                    <a v-permission="'VM.REBOOT'" @click="canReboot() && vmReboot()"
                       :class="{ 'disabled-text': !canReboot()}">{{$t('vm.reboot')}}</a>
                    <a v-permission="'VM.PAUSE'" @click="canPause() && vmPause()"
                       :class="{ 'disabled-text': !canPause()}">{{$t('vm.pause')}}</a>
                  </div>
                  <div class="item-right">
                    <a v-permission="'VM.RESUME'" @click="canResume() && vmResume()"
                       :class="{ 'disabled-text': !canResume()}">{{$t('vm.resume')}}</a>
                    <a v-permission="'VM.STOP'" @click="canForceStop() && vmPowerOff()"
                       :class="{ 'disabled-text': !canForceStop()}">{{$t('common.forcestop')}}</a>
                  </div>
                </div>
                 <div class="dropdown-row">
                  <div class="title">操作</div>
                  <div class="item-left">
                    <a v-permission="'CONSOLE-ACCESS.REQUEST'" @click="canOpenConsole() && vmOpenConsole()"
                       :class="{ 'disabled-text': !canOpenConsole()}">{{ $t("vm.console") }}</a>
                    <a v-permission="'VM.MIGRATE'" @click="canMigrate() && vmMigrate()"
                       :class="{ 'disabled-text': !canMigrate()}">{{ $t("vm.migrate") }}</a>
                    <a v-permission="'VOLUME_VOLUME-SNAPSHOT.CREATE'" @click="canCreateSnapshot() && vmCreateSnapshot()"
                       :class="{ 'disabled-text': !canCreateSnapshot()}">{{ $t("timer.createVmSnapshot") }}</a>
                    <a @click="openDetachTagPanel()" v-if="getLicenseCapability('LICENSE_BASIC_PAID')" :class="{'disabled-text': !canDetachTag()}">{{ $t("tag.detach") }}</a>
                  </div>
                  <div class="item-right">
                     <a v-permission="['VM.CLONE', 'LICENSE_BASIC_PAID']" @click="canClone() && vmClone()"
                        :class="{ 'disabled-text': !canClone()}">{{ $t("vm.clone") }}</a>
                     <a v-permission="'IMAGE_ROOT-VOLUME-TEMPLATE.CREATE'" @click="canCreateImage() && vmCreateImage()"
                        :class="{ 'disabled-text': !canCreateImage()}">{{ $t("vm.image.create") }}</a>
                     <a v-if="getLicenseCapability('LICENSE_BASIC_PAID')" @click="!!selectedList && openAttachTagPanel()">{{$t("tag.attach") }}</a>
                  </div>
                </div>
                 <div class="dropdown-row">
                  <div class="title">{{ $t("common.config") }}</div>
                  <div class="item-left">
                    <a v-permission="'VOLUME_VM.ATTACH'" @click="canAttachVolume() && vmloadVolume()"
                       :class="{ 'disabled-text': !canAttachVolume()}">{{ $t("vm.volume.attach") }}</a>
                    <a v-permission="'VM_ISO.ATTACH'" @click="canAttachIso() && vmloadISO()"
                       :class="{ 'disabled-text': !canAttachIso()}"> {{ $t("vm.iso.attach") }}</a>
                    <a v-permission="['LICENSE_BASIC_PAID', 'VM_SSH-KEY.SET']"
                       @click="canSetSshKey() && vmsetVmSshKey()" :class="{ 'disabled-text': !canSetSshKey()}">{{ $t("vm.sshKey.add") }}</a>
                  </div>
                  <div class="item-right">
                    <a v-permission="'VOLUME_VM.DETACH'" @click="canDetachVolume() && vmUnloadVolume()"
                       :class="{ 'disabled-text': !canDetachVolume()}">{{ $t("vm.volume.detach") }}</a>
                    <a v-permission="'VM_ISO.DETACH'" @click="canDetachIso() && vmUnloadISO()"
                       :class="{ 'disabled-text': !canDetachIso()}">{{ $t("vm.iso.detach") }}</a>
                    <a v-permission="['LICENSE_BASIC_PAID', 'VM_SSH-KEY.DELETE']"
                       @click="canDeleteSshKey() && vmDeleteVmSshKey()" :class="{ 'disabled-text': !canDeleteSshKey()}">{{ $t("vm.sshKey.destroy") }}</a>
                  </div>
                </div>
                 <div class="dropdown-row">
                    <div class="title"> {{ $t("common.advanced") }}</div>
                    <div class="item-left">
                      <a v-permission="['LICENSE_BASIC_PAID', 'HA.SET', 'HA.DELETE']"
                         @click="canSetHa() && vmSetHaLevel()" :class="{ 'disabled-text': !canSetHa()}">{{ $t("identity.VM.HA-LEVEL") }}</a>
                      <a v-permission="'VM_BOOT-ORDER.SET'"
                         @click="canSetBootOrder() && setVmBootOrder(windowData.selectList[0])"
                         :class="{ 'disabled-text': !canSetBootOrder() }">{{ $t("identity.VM.BOOT-ORDER.SET") }}</a>
                      <a v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.SET']"
                         @click="canSetConsolePassword() && vmSetVmConsolePassword()"
                         :class="{ 'disabled-text': !canSetConsolePassword()}">{{ $t("common.setConsolePassword") }}</a>
                      <a v-permission="'VM.REIMAGE'" @click="canReimage() && vmReimage()"
                         :class="{ 'disabled-text': !canReimage()}">{{ $t("vm.reimageVm") }}</a>
                      <a v-permission="['VM.SET_RDP', 'LICENSE_BASIC_PAID']" @click="vmSetRdpMode()">{{ $t("identity.VM.RDP-MODE") }}</a>
                      <a v-permission="'LICENSE_BASIC_PAID'" v-show="dbData.common.isAdmin"
                         @click="canSetVmPassword() && vmSetVmPassword()"
                         :class="{ 'disabled-text': !canSetVmPassword()}">{{$t("vm.setVmPassword")}}</a>
                      <a v-permission="['TAG.SYSTEM_TAG.CREATE', 'TAG.SYSTEM_TAG.UPDATE', 'LICENSE_BASIC_PAID']"
                         :class="{ 'disabled-text': !canSetConsoleMode()}"
                         @click="canSetConsoleMode() && vmSetConsoleModeDlg()">{{ $t("vm.toggleConsoleMode") }}</a>
                      <a v-permission="['AG.ADD_VM_2_AG', 'LICENSE_BASIC_PAID']"
                         @click="canJoinAffinityGroup() && vmJoinAffinityGroup()"
                         :class="{ 'disabled-text': !canJoinAffinityGroup()}">{{ $t("vm.joinAffinityGroup") }}</a>
                      <a v-permission="['VM.CHANGE_IMAGE', 'LICENSE_BASIC_PAID']"
                         @click="canChangeVmImage() && vmChangeVmImage()"
                         :class="{ 'disabled-text': !canChangeVmImage()}">{{$t("vm.changeVmImage")}}</a>
                    </div>
                    <div class="item-right">
                     <a v-permission="'VM_INSTANCE-OFFERING.CHANGE'"
                        @click="canChangeConfig() && vmChangeInstanceOffering()"
                        :class="{ 'disabled-text': !canChangeConfig()}">{{ $t("common.changeConfig") }}</a>
                     <a @click="canStartFromHost() && vmStartFromHost()"
                        :class="{ 'disabled-text': !canStartFromHost()}">{{ $t("common.startFromHost") }}</a>
                     <a v-permission="['LICENSE_BASIC_PAID', 'VM_CONSOLE-PASSWORD.DELETE']"
                        @click="canDeleteVmConsolePassword() && vmDeleteVmConsolePassword()"
                        :class="{ 'disabled-text': !canDeleteVmConsolePassword()}">{{ $t("common.deleteConsolePassword") }}</a>
                     <a v-show="dbData.common.isAdmin" @click="canChangeResourceOwner() && vmChangeResourceOwner()"
                        :class="{ 'disabled-text': !canChangeResourceOwner()}">{{ $t("vm.changeOwner") }}</a>
                     <a v-permission="['VM.SET_USB_REDIRECT', 'LICENSE_BASIC_PAID']" @click="vmSetUsbRedirect()">{{ $t("identity.VM.USB-REDIRECT") }}</a>
                     <a v-permission="['VOLUME.RESIZE_ROOT_VOLUME', 'LICENSE_BASIC_PAID']"
                        :class="{ 'disabled-text': !canResizeRootVolume()}"
                        @click="canResizeRootVolume() && vmResizeRootVolume()">{{ $t("vm.resizeRootVolume") }}</a>
                     <a v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin" @click="canStorageMigrate() && listOpenStorageMigrateDlg()" :class="{ 'disabled-text': !canStorageMigrate()}">
                      {{ $t("common.storageMigrate") }}
                      <help-trigger name="vmStorageMigrate" :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }" triangle="bottom" />
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
              </transition>
            </span>
          </drop-down>
          <span class="btn-primary" :class="{'disabled': windowData.selectList.length <=0}" @click.stop="recoverVm"
                v-if="currTab === 'destroyed'"><i
            class="el-icon-d-arrow-left icon"></i>{{$t('common.recover')}}
          </span>
          <span class="btn-primary" :class="{'disabled': windowData.selectList.length <=0}" @click.stop="expungeVm"
                v-if="currTab === 'destroyed'"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.expunge')}}
          </span>
          <normal-vm-instance-confirm-dlg v-if="showNormalVmInstanceDlg" :model="showNormalVmInstanceDlg"
                                          :message="normalVmInstanceMessage"
                                          @close="closeNormalVmIntanceDlg"></normal-vm-instance-confirm-dlg>
          <host-single-dlg v-if="showHostSingleDlg" :model="showHostSingleDlg" :message="hostMessage"
                           @close="closeHostSingleDlg"></host-single-dlg>
          <create-snap-dlg v-if="showCreateSnapDlg" :model="showCreateSnapDlg" :message="createSnapMessage"
                           @close="closeCreateSnapDlg"></create-snap-dlg>
          <set-vm-ssh-key-dlg v-if="showVmSSHKeyDlg" :model="showVmSSHKeyDlg" :message="vmSSHKeyMessage"
                              @close="closeVmSSHKeyDlg"></set-vm-ssh-key-dlg>
          <set-ha-level-dlg v-if="showHaLevelDlg" :model="showHaLevelDlg" :message="haLevelMessage"
                            @close="closeHaLevelDlg"></set-ha-level-dlg>
          <set-mode-dlg v-if="showSetModeDlg" :model="showSetModeDlg" :message="setModeMessage"
                        @close="closeSetModelDlg"></set-mode-dlg>
          <attach-volume-select-dlg v-if="showAttachVolumeDlg" :model="showAttachVolumeDlg"
                                    :message="attachVolumeMessage"
                                    @close="closeAttachVolumeDlg"></attach-volume-select-dlg>
          <normal-confirm-dlg v-if="showNormalConfirmDlg" :model="showNormalConfirmDlg" :message="normalConfirmMessage"
                              @close="closeNormalConfirmDlg"></normal-confirm-dlg>
          <iso-image-single-dlg v-if="showIsoImageSingleDlg" :model="showIsoImageSingleDlg" :message="isoImageMessage"
                                @close="closeIsoImageSingleDlg"></iso-image-single-dlg>
          <detach-iso-image-dlg v-if="showDetachIsoImageDlg" :model="showDetachIsoImageDlg"
                                :message="detachIsoImageMessage"
                                @close="closeDetachIsoImageDlg"></detach-iso-image-dlg>
          <set-vm-boot-order-dlg v-if="showVmBootOrderDlg" :model="showVmBootOrderDlg" :message="vmBootOrderMessage"
                                 @close="closeVmBootOrderDlg"></set-vm-boot-order-dlg>
          <set-console-password-dlg v-if="showSetConsolePasswordDlg" :model="showSetConsolePasswordDlg"
                                    :message="setConsolePasswordMessage"
                                    @close="closeSetConsolePasswordDlg"></set-console-password-dlg>
          <change-vm-image-dlg v-if="showChangeVmImageDlg" :model="showChangeVmImageDlg" :message="changeVmImageMessage"
                               @close="closeChangeVmImageDlg"></change-vm-image-dlg>
          <set-vm-password-dlg v-if="showSetVmPasswordDlg" :model="showSetVmPasswordDlg" :message="setVmPasswordMessage"
                               @close="closeSetVmPasswordDlg"></set-vm-password-dlg>
          <affinity-group-single-dlg v-if="showAffinitySingleDlg" :model="showAffinitySingleDlg"
                                     :message="affinityMessage"
                                     @close="closeAffinitySingleDlg"></affinity-group-single-dlg>
          <instance-offering-single-dlg v-if="showInstanceOfferingSingleDlg" :model="showInstanceOfferingSingleDlg"
                                        :message="instanceOfferingMessage"
                                        @close="closeInstanceOfferingSingleDlg"></instance-offering-single-dlg>
          <vm-resize-root-volume-dlg v-if="showVmResizeRVDlg" :model="showVmResizeRVDlg" :message="vmResizeRVMessage"
                                     @close="closeVmResizeRVDlg"></vm-resize-root-volume-dlg>
        </div>
        <div style="flex-shrink: 1; flex-grow: 1; min-width: 0px;">
          <page-toolbar-tag :param="getPageToolbarTagParam()"/>
        </div>
        <div style="text-align: right;flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
          <span class="btn-refresh" @click="(e) => {showDownLoadOption = !showDownLoadOption;}"><i
            class="el-icon-download icon"></i></span>
          <ul class="downloadOption" v-if="showDownLoadOption">
            <li @click="downloadCurrentCsv()">当前页</li>
            <li @click="downloadAllCsv()">全部</li>
          </ul>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
        ref="multipleTable"
        :data="itemList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelection"
        @select-all="handleSelectAll"
        v-loading="windowData.loading"
        @sort-change="handleSort"
        border
      >
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          :label="$t('common.name')"
          width="120"
          prop="name"
          show-tooltip-when-overflow
          sortable>
          <template slot-scope="scope">
            <a @click="$router.push(`detailVm/${scope.row.uuid}`)" class="link">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column width="120">
          <div slot="header" style="height: 37px;">
            <el-dropdown>
              <span>
                {{getTagTypeHeaderParam().getTitle()}}<i class="el-icon-caret-bottom"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in getTagTypeHeaderParam().getItemList()"
                                  :key="index"
                  @click.native="getTagTypeHeaderParam().onSelect(index)">{{$t(item.text)}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <template slot-scope="scope" id="tag-id-for-width-watching">
            <table-body-item-tag :param="getTagParam(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column
          prop="cpuNum"
          label="CPU"
          show-overflow-tooltip
          sortable>
        </el-table-column>
        <el-table-column
          prop="memorySize"
          :label="$t('common.memory')"
          sortable>
          <template slot-scope="scope">
            {{bytesToSize(scope.row.memorySize)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="hostName"
          :label="$t('common.defaultIp')">
          <template slot-scope="scope">
            <table-body-item-list :content="getDefaultL3NetworkIp(scope.row.uuid)"
                                  copy="true"></table-body-item-list>
          </template>
        </el-table-column>
        <el-table-column
          prop="hostName"
          :label="$t('common.hostIp')">
        </el-table-column>
        <el-table-column
          prop="clusterName"
          :label="$t('globalConfig.cluster_name')">
        </el-table-column>
        <el-table-column
          prop="state"
          :label="$t('common.state')"
          sortable>
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column
          prop="ownerName"
          :label="$t('common.owner')">
        </el-table-column>
        <el-table-column
          prop="ha"
          show-tooltip-when-overflow
          :label="$t('common.haLevel')">
          <template slot-scope="scope">
            {{dbData.common.haEnabled ? scope.row.ha : 'None'}}
          </template>
        </el-table-column>
        <el-table-column
          prop="createDate"
          :label="$t('common.createDate')"
          show-tooltip-when-overflow
          sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="windowData.total > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="windowData.total"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex">
      </el-pagination>
      <clone-vm v-if="showCloneVm" :param="cloneVmMessage" @close="closeCloneVm"></clone-vm>
      <create-vm-image v-if="showCreateVmImage" :param="createVmImageMessage"
                       @close="closeCreateImage"></create-vm-image>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import VmList from 'src/ecs/ecsInstance/List';
  import TableBodyItemList from "../../component/TableBodyItemList";
  import NormalVmInstanceConfirmDlg from "../../dialog/NormalVmInstanceConfirmDlg";
  import DropDown from 'src/component/DropDown';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import HostSingleDlg from "../../dialog/HostSingleSelectDlg";
  import CreateInstancePage from "./CreateInstancePage";
  import CreateSnapDlg from "../../dialog/CreateSnapDlg";
  import SetVmSshKeyDlg from "../../dialog/SetVmSshKeyDlg";
  import SetHaLevelDlg from "../../dialog/SetHaLevelDlg";
  import SetModeDlg from "../../dialog/SetModeDlg";
  import CloneVm from "./component/CloneVm";
  import CreateVmImage from "./component/CreateVmImage";
  import AttachVolumeSelectDlg from "../../dialog/AttachVolumeSelectDlg";
  import NormalConfirmDlg from 'src/dialog/NormalConfirmDlg';
  import IsoImageSingleDlg from "../../dialog/IsoImageSingleDlg";
  import DetachIsoImageDlg from 'src/dialog/DetachIsoImageDlg';
  import SetVmBootOrderDlg from 'src/dialog/SetVmBootOrderDlg';
  import SetConsolePasswordDlg from "../../dialog/setConsolePasswordDlg";
  import ChangeVmImageDlg from "../../dialog/ChangeVmImageDlg";
  import SetVmPasswordDlg from "../../dialog/setVmPasswordDlg";
  import AffinityGroupSingleDlg from "../../dialog/AffinityGroupSingleDlg";
  import InstanceOfferingSingleDlg from "../../dialog/InstanceOfferingSingleDlg";
  import VmResizeRootVolumeDlg from "../../dialog/VmResizeRootVolumeDlg";
  import TableBodyItemTag from "../../component/TableBodyItemTag";
  import PageToolbarTag from "../../component/PageToolbarTag";
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "EcsInstancePage",
    mixins: [Root, WindowBase, VmList, PageBase],
    components: {
      PageToolbarTag,
      TableBodyItemTag,
      VmResizeRootVolumeDlg,
      InstanceOfferingSingleDlg,
      AffinityGroupSingleDlg,
      SetVmPasswordDlg,
      ChangeVmImageDlg,
      SetConsolePasswordDlg,
      IsoImageSingleDlg,
      AttachVolumeSelectDlg,
      CreateVmImage,
      CloneVm,
      SetModeDlg,
      SetHaLevelDlg,
      SetVmSshKeyDlg,
      CreateSnapDlg,
      CreateInstancePage,
      HostSingleDlg,
      TableBodyItemState, NormalVmInstanceConfirmDlg, TableBodyItemList, PageTemplate, DropDown,
      NormalConfirmDlg,
      DetachIsoImageDlg,
      SetVmBootOrderDlg,
    },
    data() {
      return {
        searchStr: '',
        selectVal: "name",
        currTab: 'available',
        conditions: {
          'available': 'state!=Destroyed',
          'destroyed': 'state=Destroyed'
        },
        availableCount: 0,
        destroyedCount: 0,
        super: {},
        normalVmInstanceMessage: {},
        showNormalVmInstanceDlg: false,
        showHostSingleDlg: false,
        hostMessage: {},
        showCreateSnapDlg: false,
        createSnapMessage: {},
        showVmSSHKeyDlg: false,
        vmSSHKeyMessage: {},
        showHaLevelDlg: false,
        haLevelMessage: {},
        showSetModeDlg: false,
        setModeMessage: {},
        showCloneVm: false,
        cloneVmMessage: {},
        showCreateVmImage: false,
        createVmImageMessage: {},
        showAttachVolumeDlg: false,
        attachVolumeMessage: {},
        showNormalConfirmDlg: false,
        normalConfirmMessage: {},
        showIsoImageSingleDlg: false,
        isoImageMessage: {},
        showDetachIsoImageDlg: false,
        detachIsoImageMessage: {},
        showVmBootOrderDlg: false,
        vmBootOrderMessage: {},
        showSetConsolePasswordDlg: false,
        setConsolePasswordMessage: {},
        showChangeVmImageDlg: false,
        changeVmImageMessage: {},
        showSetVmPasswordDlg: false,
        setVmPasswordMessage: {},
        showAffinitySingleDlg: false,
        affinityMessage: {},
        showInstanceOfferingSingleDlg: false,
        instanceOfferingMessage: {},
        showVmResizeRVDlg: false,
        vmResizeRVMessage: {},
        showVmChangeROToAProjDlg: false,
        vmChangeROToAProjMessage: {},
        showDownLoadOption: false,
        itemList: []
      }
    },
    created() {
      let self = this;
      self.super.queryList = VmList.methods.queryList.bind(this);
      self.updateWindow({
        showMoreDropdown: false,
        pageIndex: 1,
        pageSize: 10,
        currItemUuid: '',
        currTab: 'available',
        conditions: this.conditions[this.currTab],
        sortBy: 'createDate',
        sortDirection: '-',
        loading: false,
        selectList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList()
        });
      window.addEventListener('click', this.toggleClick, true)
    },

    destroyed() {
      this.deleteAllAssistant()
      window.removeEventListener('click', this.toggleClick, true)
    },
    methods: {
      ...Utils,
      //点击切换
      toggleClick() {
        let self = this;
        self.showDownLoadOption = false;
      },
      //改变页码
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      //改变当前页
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      //处理多选
      handleSelection(val) {
        this.selectList = val;
        this.updateWindow({
          selectList: this.selectList
        })
      },
      //全选
      handleSelectAll(val) {
        this.selectList = [];
        this.selectList = val;
        this.updateWindow({
          selectList: this.selectList
        })
      },
      //查询ecs列表数据
      queryList() {
        return this.super.queryList()
          .then(() => {
            this.updateCount()
          })
      },
      //更新总数
      updateCount() {
        this.dispatchAction('vm/basicQuery', {
          q: this.getAvailableCondition(),
          count: true
        }).then(resp => {
          this.availableCount = resp.total;
        });
        this.dispatchAction('vm/basicQuery', {
          q: this.getDestroyedCondition(),
          count: true
        }).then(resp => {
          this.destroyedCount = resp.total
        })
      },
      //查找
      search() {
        let self = this;
        self.selectList = [];
        self.updateWindow({
          pageIndex: 1,
          searchConditionList: `${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`
        }).then(() => {
          self.super.queryList();
        })
      },
      //刷新
      refresh() {
        let self = this;
        self.selectList = [];
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.super.queryList();
          })
      },
      setTabVal() {
        this.updateWindow({
          pageIndex: 1,
          currTab: this.currTab,
          conditions: [this.conditions[this.currTab], 'hypervisorType=KVM']
        })
          .then(() => {
            this.queryList()
          })
      },
      createvm() {
        this.$router.push('createvm');
      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      downloadVm(itemList) {
        let str = `${this.$t('common.name')},${this.$t('common.tag')}(${this.tagType === 'my' ? this.$t('tag.admin') : this.$t('tag.other')}),${this.$t('common.cpuNum')},${this.$t('common.memorySize')},${this.$t('common.defaultIp')},${this.$t('common.hostIp')},${this.$t('common.cluster')},${this.$t('common.state')},${this.$t('common.owner')},${this.$t('common.haLevel')},${this.$t('common.createDate')}\r\n`;
        if (!this.dbData.common.isAdmin) {
          str = `${this.$t('common.name')},${this.$t('common.cpuNum')},${this.$t('common.memorySize')},${this.$t('common.defaultIp')},${this.$t('common.state')},${this.$t('common.haLevel')},${this.$t('common.createDate')}\r\n`
        }
        itemList.forEach((vm, index) => {
          let state = this.$t(`state.${vm.state}`);
          let tagList = this.tagType === 'my' ? vm.myUserTagUuidList.map(uuid => this.getTag(uuid)) : vm.otherUserTagUuidList.map(uuid => this.getTag(uuid));
          let tagString = tagList.map(tag => tag.name).join(',');
          let vmRow = `${vm.name},"${tagString}",${vm.cpuNum},${this.bytesToSize(vm.memorySize)},${this.getDefaultL3NetworkIp(vm.uuid).join(',')},${vm.hostName ? vm.hostName : ''},${vm.clusterName ? vm.clusterName : ''},${state},${vm.ownerName ? vm.ownerName : ''},${vm.ha},${this.formatDatetime(new Date(vm.createDate))}\r\n`;
          if (!this.dbData.common.isAdmin) {
            vmRow = `${vm.name},${vm.cpuNum},${this.bytesToSize(vm.memorySize)},${vm.defaultL3NetworkIp},${state},${vm.ha},${this.formatDatetime(new Date(vm.createDate))}\r\n`
          }
          str += vmRow
        });
        this.downloadFile('vm.csv', str)
      },
      //导出当前页数据
      downloadCurrentCsv() {
        let self = this;
        self.downloadVm(this.itemList);
        self.showDownLoadOption = false;
      },
      //导出所有数据
      async downloadAllCsv() {
        let self = this;
        let vmArray = await this.queryAllList();
        self.downloadVm(vmArray);
        self.showDownLoadOption = false;
      }
    },
    filters: {
      //格式化时间戳
      dateFormat(val, fmt) { //author: meizz
        let value = new Date(val);
        var o = {
          "M+": value.getMonth() + 1,                 //月份
          "d+": value.getDate(),                    //日
          "h+": value.getHours(),                   //小时
          "m+": value.getMinutes(),                 //分
          "s+": value.getSeconds(),                 //秒
          "q+": Math.floor((value.getMonth() + 3) / 3), //季度
          "S": value.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      }
    },
    computed: {
      tableData() {
        return this.dbData.vm;
      },
      selectedList(){
        let self = this;
        if(self.windowData.selectList){
          return self.windowData.selectList.map(item => {
            return item.uuid;
          });
        }
        return []
      },
      isSingleSelected(){
        let self = this;
        return self.windowData.selectList && self.windowData.selectList.length ===1;
      },
      conditionNameList() {
        let list = [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          },
          {
            name: 'common.ip',
            value: 'vmNics.ip'
          },
          {
            name: 'common.hostIp',
            value: 'host.managementIp'
          },
          {
            name: 'common.eip',
            value: 'vmNics.eip.vipIp'
          },
          {
            name: 'common.instanceOfferingName',
            value: 'instanceOffering.name'
          }
        ];
        if (!this.getLicenseCapability('LICENSE_BASIC_PAID')) {
          list.splice(4, 0, {
            name: 'common.userTags',
            value: '__userTag__'
          })
        }
        if (this.isAdmin && _.get(this.dbData, ['common', 'license', 'licenseType']) !== 'Community') {
          list.push({
            name: 'common.owner',
            value: 'owner.name'
            // createCondition: this.createConditionForOwner
          })
        }
        return list
      }
    },
    watch: {
      'windowData.pageSize': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.queryList();
        }
      },
      'windowData.pageIndex': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.queryList();
        }
      },
    }
  }
</script>

<style scoped lang="less">
  .show {
    display: inline-block;
  }

  .fade-enter {
    transition: border-color .3s, background-color .3s, color .3s;
  }

  .fade-leave {
    transition: border-color .3s, background-color .3s, color .3s;
  }

  .hide {
    display: none !important;
  }

  .downloadOption {
    position: absolute;
    z-index: 5;
    border: 1px solid #ccc;
    text-align: center;
    right: -13px;
    width: 102px;
    background: #fff;
    margin-top: 5px;

    li {
      cursor: pointer;
    }
  }

  .tag-dropdown{
    display: block;
    position: fixed;
    border: 1px solid #eef3f7;
    z-index: 2;
    background: #fff;
    padding: 0px 20px;
    li{
      display: block;
      width: 100%;
      height: 30px;
    }
  }

  .tag-header:hover{
    .dropdown{
      display: block;
    }
  }
</style>
