<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{`${$t('common.vm')}${$t('common.colon')}`}}
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t(`common.${windowData.selectedZone}`)}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a @click="changeZone('currZone')">{{$t('home.currentZone')}}</a>
                <a @click="changeZone('allZone')">{{$t('common.allZone')}}</a>
              </div>
            </span>
          </drop-down>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
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
                    <a @click="selectedList && canDetachTag() && openDetachTagPanel()" v-if="getLicenseCapability('LICENSE_BASIC_PAID')" :class="{'disabled-text':!selectedList || !canDetachTag()}">{{ $t("tag.detach") }}</a>
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
                      <a v-permission="['VM.SET_RDP', 'LICENSE_BASIC_PAID']" :class="{'disabled-text': !isSingleSelected}" @click="isSingleSelected && vmSetRdpMode()">{{ $t("identity.VM.RDP-MODE") }}</a>
                      <a v-permission="'LICENSE_BASIC_PAID'" v-show="dbData.common.isAdmin"
                         @click="canSetVmPassword() && vmSetVmPassword()"
                         :class="{ 'disabled-text': !canSetVmPassword()}">{{$t("vm.setVmPassword")}}</a>
                      <a v-permission="['TAG.SYSTEM_TAG.CREATE', 'TAG.SYSTEM_TAG.UPDATE', 'LICENSE_BASIC_PAID']"
                         :class="{ 'disabled-text': !isSingleSelected ||  !canSetConsoleMode()}"
                         @click="isSingleSelected && canSetConsoleMode() && vmSetConsoleModeDlg()">{{ $t("vm.toggleConsoleMode") }}</a>
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
                     <a v-permission="['VM.SET_USB_REDIRECT', 'LICENSE_BASIC_PAID']" :class="{'disabled-text': !isSelected}" @click="isSelected && vmSetUsbRedirect()">{{ $t("identity.VM.USB-REDIRECT") }}</a>
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
                      <a v-permission="'VM.DESTROY'" :class="{'disabled-text': !isSelected}" @click="isSelected && vmDelete()">{{ $t("common.destroy") }}</a>
                     </div>
                     <div class="item-right" style="height: 40px;"></div>
                   </div>
                </div>
              </transition>
            </span>
          </drop-down>
        </el-col>
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
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
        :data="itemList"
        @selection-change="handleSelection">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')">
          <template slot-scope="scope">
            <span class="link">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'CPU'" prop="cpuNum"></el-table-column>
        <el-table-column :label="$t('common.memorySize')">
          <template slot-scope="scope">
            {{bytesToSize(scope.row.memotySize)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.defaultIp')">
          <template slot-scope="scope">
            <table-body-item-list :content="scope.row.defaultL3NetworkIp" copy="true"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" prop="ownerName"></el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
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
      </div>
    </div>
  </div>
</template>

<script>
  import VmList from 'src/ecs/ecsInstance/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import TableBodyItemList from "../../../component/TableBodyItemList";
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import NormalVmInstanceConfirmDlg from "src/dialog/NormalVmInstanceConfirmDlg";
  import DropDown from 'src/component/DropDown';
  import HostSingleDlg from "src/dialog/HostSingleSelectDlg";
  import CreateInstancePage from "src/ecs/ecsInstance/CreateInstancePage";
  import CreateSnapDlg from "src/dialog/CreateSnapDlg";
  import SetVmSshKeyDlg from "src/dialog/SetVmSshKeyDlg";
  import SetHaLevelDlg from "src/dialog/SetHaLevelDlg";
  import SetModeDlg from "src/dialog/SetModeDlg";
  // import CloneVm from "./component/CloneVm";
  // import CreateVmImage from "./component/CreateVmImage";
  import AttachVolumeSelectDlg from "src/dialog/AttachVolumeSelectDlg";
  import NormalConfirmDlg from 'src/dialog/NormalConfirmDlg';
  import IsoImageSingleDlg from "src/dialog/IsoImageSingleDlg";
  import DetachIsoImageDlg from 'src/dialog/DetachIsoImageDlg';
  import SetVmBootOrderDlg from 'src/dialog/SetVmBootOrderDlg';
  import SetConsolePasswordDlg from "src/dialog/setConsolePasswordDlg";
  import ChangeVmImageDlg from "src/dialog/ChangeVmImageDlg";
  import SetVmPasswordDlg from "src/dialog/setVmPasswordDlg";
  import AffinityGroupSingleDlg from "src/dialog/AffinityGroupSingleDlg";
  import InstanceOfferingSingleDlg from "src/dialog/InstanceOfferingSingleDlg";
  import VmResizeRootVolumeDlg from "src/dialog/VmResizeRootVolumeDlg";
  export default {
    name: "VmForZoneTabList",
    components: {
      VmResizeRootVolumeDlg,
      InstanceOfferingSingleDlg,
      AffinityGroupSingleDlg,
      SetVmPasswordDlg,
      ChangeVmImageDlg,
      SetConsolePasswordDlg,
      IsoImageSingleDlg,
      AttachVolumeSelectDlg,
      SetModeDlg,
      SetHaLevelDlg,
      SetVmSshKeyDlg,
      CreateSnapDlg,
      CreateInstancePage,
      HostSingleDlg,
      TableBodyItemState,
      NormalVmInstanceConfirmDlg,
      TableBodyItemList,
      DropDown,
      NormalConfirmDlg,
      DetachIsoImageDlg,
      SetVmBootOrderDlg,
    },
    mixins: [VmList, WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      },
      showCloneVmInstance: Function,
      showCreateVmImageFun: Function
    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        _queryList: null,
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
    computed: {
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectedUuidList.length >= 1;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData && self.windowData.selectedUuidList.length === 1
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectedUuidList;
      }
    },
    created(){
      let self = this;
      self.showCloneVm = self.param.showVm;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        uuid: this.param.uuid,
        selectedUuidList: [],
        selectList: [],
        QGA: {},
        selectedZone: 'currZone',
      })
        .then(() => {
          self.queryList();
        })
      self._queryList = VmList.methods.queryList.bind(this);
    },
    methods: {
      changeZone: function (selectedZone) {
        this.updateWindow({
          selectedZone: selectedZone
        }).then(this.queryList)
      },
      queryList: function () {
        let self = this;
        return rpc.query('accounts/resources/refs', {
          q: [`accountUuid=${this.windowData.uuid}`, 'resourceType=VmInstanceVO']
        }).then(resp => {
          let vmUuidList = []
          if (resp.inventories.length > 0) vmUuidList = _.uniq(resp.inventories.map((item) => item.resourceUuid))
          return self.updateWindow({ vmUuidList: vmUuidList })
        }).then(() => self._queryList())
      },
      getCondition: function () {
        let conditionList = []
        if (this.windowData.selectedZone === 'currZone') conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push(`uuid?=${this.windowData.vmUuidList}`)
        conditionList.push('type=UserVm')
        conditionList.push('hypervisorType=KVM')
        conditionList.push('state!=Destroyed')
        conditionList = conditionList.concat(this.getSearchCondition())
        return conditionList
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      search(){
        let self  = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList();
          })
      },
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList,
          selectList: rows
        })
      },

    },
    watch: {
      'param.showVm': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal)
        self.showCloneVm = newVal;
      },
      'param.showVmImage': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal)
          self.showCreateVmImage = newVal;
      }
    }
  }
</script>

<style scoped>

</style>
