<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">云盘详情</span>
      <span @click="$router.push({name: 'volume'})" class="create-back detail-header-item"><i
        class="el-icon-back"></i>
        <span style="font-size: 12px">回到云盘列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{ $t("common.moreActions") }}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
               <a :class="{'disabled-text': model && model.state === 'Enabled' || isRoot()}"
                  @click="!isRoot() && model && model.state !== 'Enabled' && pageStart()" id="common-enable"
                  style="padding-top:12px;"
                  v-if="model && model.status !== 'Deleted' && model.type !== 'Root'"
                  v-permission="'VOLUME_STATE.CHANGE'">{{$t("common.enable")}}</a>
               <a :class="{'disabled-text': model && model.state === 'Disabled' || isRoot()}"
                  @click="!isRoot() && model && model.state !== 'Disabled' && pageStop()"
                  v-if="model && model.status !== 'Deleted' && model && model.type !== 'Root'"
                  v-permission="'VOLUME_STATE.CHANGE'">{{$t("common.disable")}}</a>
               <a :class="{'disabled-text': !canAttach()}" @click="canAttach() && attachVolume()"
                  v-if="model && model.status !== 'Deleted' && model.type !== 'Root'"
                  v-permission="'VOLUME_VM.ATTACH'">{{$t("common.attach")}}</a>
               <a :class="{'disabled-text': !canDetach()}" @click="canDetach() && detachVolume()"
                  v-if="model && model.status !== 'Deleted' && model.status !== 'NotInstantiated' && model.type !== 'Root'"
                  v-permission="'VOLUME_VM.DETACH'">{{$t("common.detach")}}</a>
               <a :class="{'disabled-text': !canMigrate()}"
                  @click="canMigrate() && detailMigrateVolume($route.params.uuid)"
                  v-if="model && dbData.primarystorage[model.primaryStorageUuid] && model.status !== 'Deleted' && model.type !== 'Root'">{{$t("common.migrate")}}</a>
              <a @click="openAttachTagPanel()"
                 v-if="getLicenseCapability('LICENSE_BASIC_PAID') && model && model.status !== 'Deleted'">{{ $t("tag.attach") }}</a>
              <a :class="{'disabled-text': !canDetachTag()}"
                 @click="openDetachTagPanel()"
                 v-if="getLicenseCapability('LICENSE_BASIC_PAID') && model && model.status !== 'Deleted'">{{ $t("tag.detach") }}</a>
              <a :class="{'disabled-text': !canCreateImage()}"
                 @click="canCreateImage () && createVolumeImage()"
                 v-if="model && model.status !== 'Deleted' && model.status !== 'NotInstantiated'"
                 v-permission="'IMAGE_DATA-VOLUME-TEMPLATE.CREATE'">{{$t("volume.createImage")}}<help-trigger
                :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                name="createVolumeImage"/></a>
              <a :class="{'disabled-text': !canCreateSnapshot()}"
                 @click="canCreateSnapshot() && createVolumeSnapshotPage()"
                 v-if="model && model.status !== 'Deleted' && model.status !== 'NotInstantiated'"
                 v-permission="'VOLUME_VOLUME-SNAPSHOT.CREATE'">{{$t("common.createSnapshot")}}<help-trigger
                :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                name="createSnapshot"/></a>

              <a :class="{ 'disabled-text': !canSetQos() }"
                 @click="canSetQos() && pageSetVolumeQos()" v-if="model && model.status !== 'Deleted'"
                 v-permission="['VOLUME.SET_VOLUME_QOS', 'LICENSE_BASIC_PAID']">{{ $t("vm.setVolumeQos") }}</a>
              <a :class="{ 'disabled-text': !canRemoveQos() }"
                 @click="canRemoveQos() && pageCancelVolumeQos()" v-if="model && model.status !== 'Deleted'"
                 v-permission="['VOLUME.DELETE_VOLUME_QOS', 'LICENSE_BASIC_PAID']">{{ $t("vm.cancelVolumeQos") }}</a>
              <a :class="{'disabled-text': !canChangeOwner()}"
                 @click="canChangeOwner() && detailChangeResourceOwner()"
                 v-if="dbData.common.isAdmin && model && model.status !== 'Deleted' && model.type !== 'Root' && model.status !== 'NotInstantiated'"
                 v-permission="'LICENSE_BASIC_PAID'">{{$t("common.changeResourceOwner")}}</a>
              <a :class="{'disabled-text': !canResizeVolume()}" @click="canResizeVolume() && detailResizeVolume()"
                 id="volume-resizeVolume"
                 v-if="model && ['Deleted', 'NotInstantiated'].indexOf(model.status) === -1"
                 v-permission="['VOLUME.RESIZE_DATA_VOLUME', 'LICENSE_BASIC_PAID']">{{$t("volume.resizeVolume")}}</a>
              <a :class="{ 'disabled-text': !(canStorageMigrate())}"
                 @click="canStorageMigrate() && openStorageMigrateDataVolumeDlg()" id="common-storageMigrate"
                 v-if="dbData.common.isAdmin && isReady()"
                 v-permission="'LICENSE_BASIC_PAID'">
              {{ $t("common.storageMigrate") }}
                <help-trigger
                  :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                  name="volumeStorageMigrate"
                  triangle="bottom"/>
              </a>
              <a :class="{'disabled-text': !canDelete()}" @click="canDelete() && deleteVolume()"
                 style="padding-bottom:12px;" v-if="model && model.status !== 'Deleted'"
                 v-permission="'VOLUME.DELETE'">{{$t("common.destroy")}}</a>
              <a @click="recoverVolume" style="padding-top:12px;" v-if="canRecover()" v-permission="'VOLUME.RECOVER'">{{$t("common.recover")}}</a>
              <a @click="expungeVolume" style="padding-bottom:12px;" v-if="canExpunge()"
                 v-permission="'VOLUME.EXPUNGE'">{{$t("common.expunge")}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs @tab-click="handleTabChange" tabPosition="bottom"
               v-model="activeName" class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('snapshot.volumeSnapshot')" name="snapshot"
                     v-if="!isDelete()"></el-tab-pane>
        <el-tab-pane :label="$t('common.schedulerTask')" name="scheduler"
                     v-if="!isDelete()"></el-tab-pane>
        <el-tab-pane :label="$t('backupData.title')" name="backupdata"
                     v-if="!isDelete()"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
      <create-snap-dlg :message="createSnapMessage" :model="showCreateSnapDlg" @close="closeCreateSnapDlg"
                       v-if="showCreateSnapDlg"/>
      <set-volume-qos-dlg :message="setVolumeQosMessage" :model="showSetVolumeQosDlg" @close="closeCreateVolumeQosDlg"
                          v-if="showSetVolumeQosDlg"/>
      <normal-volume-confirm-dlg :message="normalMessage" :model="showNormalVolumeConfirmDlg"
                                 @close="closeNormalDlg" v-if="showNormalVolumeConfirmDlg"/>
      <resize-volume-dlg :message="resizeVolumeMessage" :model="showResizeVolumeDlg" @close="closeVolumeDlg"
                         v-if="showResizeVolumeDlg"/>
      <primary-storage-single-dlg :message="primarySingleMessage" :model="showPrimarySingleDlg"
                                  @close="closePrimarySingleDlg" v-if="showPrimarySingleDlg"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
        <div class="left">
          <div class="left-header">
             <base-icon name="volume_large"/>
            <div class="after-icon">
              <detail-info-state :state="model && model.state" outer-class-name="detail-page-state"/>
              <detail-info-state :state="model && model.status" outer-class-name="detail-page-state"/>
            </div>
            <detail-name :param="getNameParam()" class="name"/>
            <detail-description :param="getDescriptionParam()" class="description"/>
            <tag-list-for-detail :param="getMyTagParam()" style="margin-bottom: 14px;"
                                 v-if="getLicenseCapability('LICENSE_BASIC_PAID')"
            >
            </tag-list-for-detail>
            <tag-list-for-detail :param="getOtherTagParam()"
                                 @onAttach="openAttachTagPanel()"
                                 v-if="showOtherTag && getLicenseCapability('LICENSE_BASIC_PAID')">
            </tag-list-for-detail>
          </div>
          <div class="left-body">
            <div class="detail-block-header">
              {{$t("common.overview")}}
            </div>
            <div class="detail-row editable">
              <div class="detail-title">
                {{ $t("common.memory") }}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editVolumeSize">{{ model && bytesToSize(model.size) }}</span>
                <span
                  @click.stop="editVolumeSize = true;
                  newVolumeTotalBandwidth = model.size"
                  class="edit-icon" v-permission="'VOLUME.UPDATE'"
                  v-show="!editVolumeSize && dbData.common.isAdmin && canResizeVolume() && model.installPath && (model.installPath).indexOf('fusionstor:') !== 0">
                  <i class="el-icon-edit"></i>
                </span>
                <detail-size-editor :finish="sizeEditEnd" :sizeList="['K', 'M', 'G', 'T']" :value="model && model.size"
                                    class="editor" style="margin-right: 70px;" unit="B"
                                    v-if="editVolumeSize"/>
              </div>
            </div>
            <div class="detail-row editable">
              <div class="detail-title">
                {{ $t("common.actualSize") }}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content">{{model && bytesToSize(model.actualSize) }}</span>
                <span class="edit-icon" v-show="model && model.status !== 'Deleted'">
                  <i @click="refreshActualSize()" class="el-icon-refresh"></i>
                </span>
              </div>
            </div>
            <detail-row :param="{
                  title: 'common.format',
                  content: model && model.format,
                }"/>
            <detail-row :param="{
                  title: 'common.type',
                  content: model && model.type,
                }"/>
            <detail-row :param="{
                  title: 'common.sharedVolume',
                  content: (model && model.isShareable) ? $t(`common.yes`) : $t(`common.no`)
                }"/>

            <div :class="{editable: model && !model.isShareable}" class="detail-row"
                 id="common-volumeTotalBandwidth" key="volumeTotalBandwidth"
                 v-if="showTotalBandWidth() && !isAliyunEBS()"
                 v-permission="'LICENSE_BASIC_PAID'">
              <div class="detail-title">
                {{$t("volume.volumeTotalBandwidth")}}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" id="common-unlimited"
                      v-if="!editVolumeTotalBandwidth && !dbData.common.isOpensource">{{ model && model.volumeBandwidth === -1 ? $t("common.unlimited") : bytesToSize(model && model.volumeBandwidth, 'B/s')}}</span>
                <span
                  @click.stop="editVolumeTotalBandwidth = true
                  newVolumeTotalBandwidth = model && model.volumeBandwidth;"
                  class="edit-icon"
                  v-if="!editVolumeTotalBandwidth && model && model.status !== 'Deleted' && !dbData.common.isOpensource"
                  v-permission="'LICENSE_BASIC_PAID'">
                  <i class="el-icon-edit"></i>
                </span>
                <detail-size-editor :defaultsize="'M'" :finish="volumeTotalBandwidthEditEnd" :size-list="['M', 'G']"
                                    :value="model && model.volumeBandwidth" class="editor" style="margin-right: 70px;"
                                    unit="B/s" v-if="editVolumeTotalBandwidth"/>
              </div>
            </div>

            <div :class="{editable: model && !model.isShareable}" class="detail-row" key="volumeReadBandwidth"
                 v-if="!showTotalBandWidth() && !isAliyunEBS()" v-permission="'LICENSE_BASIC_PAID'">
              <div class="detail-title">
                {{$t("volume.volumeReadBandwidth")}}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editVolumeReadBandwidth && !dbData.common.isOpensource">{{ model && model.volumeReadBandwidth === -1 ? $t("common.unlimited") : bytesToSize(model && model.volumeReadBandwidth, 'B/s')}}</span>
                <span
                  @click.stop="editVolumeReadBandwidth = true
                  newVolumeReadBandwidth = model && model.volumeReadBandwidth;"
                  class="edit-icon"
                  v-if="!editVolumeReadBandwidth && model && model.status !== 'Deleted' && !dbData.common.isOpensource"
                  v-permission="'LICENSE_BASIC_PAID'">
                  <i class="el-icon-edit"></i>
                </span>
                <detail-size-editor :defaultsize="'M'" :finish="volumeReadBandwidthEditEnd" :size-list="['M', 'G']"
                                    :value="model && model.volumeReadBandwidth" class="editor"
                                    style="margin-right: 70px;"
                                    unit="B/s" v-if="editVolumeReadBandwidth"/>
              </div>
            </div>

            <div :class="{editable: model && !model.isShareable}" class="detail-row" key="volumeWriteBandwidth"
                 v-if="!showTotalBandWidth() && !isAliyunEBS()" v-permission="'LICENSE_BASIC_PAID'">
              <div class="detail-title">
                {{$t("volume.volumeWriteBandwidth")}}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editVolumeWriteBandwidth && !dbData.common.isOpensource">{{ model && model.volumeWriteBandwidth === -1 ? $t("common.unlimited") : bytesToSize(model && model.volumeWriteBandwidth, 'B/s')}}</span>
                <span
                  @click.stop="editVolumeWriteBandwidth = true
                  newVolumeWriteBandwidth = model && model.volumeWriteBandwidth"
                  class="edit-icon"
                  v-if="!editVolumeWriteBandwidth && model && model.status !== 'Deleted' && !dbData.common.isOpensource"
                  v-permission="'LICENSE_BASIC_PAID'">
                   <i class="el-icon-edit"></i>
                </span>
                <detail-size-editor :defaultsize="'M'" :finish="volumeWriteBandwidthEditEnd" :size-list="['M', 'G']"
                                    :value="model && model.volumeWriteBandwidth" class="editor"
                                    style="margin-right: 70px;"
                                    unit="B/s" v-if="editVolumeWriteBandwidth"/>
              </div>
            </div>

            <detail-dropdown :param="{
                 getTitle: () => 'VirtioSCSI',
                  getOptionList: () => virtioSCSIList,
                  getIndex: () => model && model.systemTagsVirtioSCSI ? 0 : 1,
                  setIndex: index => { updateVirtioSCSI([model.uuid], index === 0 ? 'yes' : 'no') },
                  showIcon: model && !model.isShareable,
                  permission: 'LICENSE_BASIC_PAID'
                }"/>
            <detail-row :param="{
                  title: 'common.thinProvision',
                  hide: dbData.common.isOpensource,
                  content: $t(`common.${model && model.thinProvision ? 'yes': 'no'}`)
                }"/>
            <detail-row :param="{
                  title: 'WWN',
                  content: model && model.WWN
                }"/>
            <detail-row :param="{
               title: 'common.owner',
               content: model && model.ownerName,
               handler: () => {
                 $router.push({name: 'detailAccount', params: {uuid: model.ownerUuid}})
               }
             }"/>
            <detail-row :param="{
               title: 'common.createDate',
               content: model && formatDatetime(new Date(model.createDate)),
             }"/>
            <detail-row :param="{
               title: 'common.lastOpDate',
               content: model && formatDatetime(new Date(model.lastOpDate)),
             }"/>
          </div>
        </div>
        <div class="right">
          <div style="height: 40px"></div>
          <div class="detail-block-header" id="common-moreInformation">
            {{$t("common.moreInformation")}}
          </div>
          <detail-row :param="{
                title: 'UUID',
                content: model && model.uuid
              }"/>
          <detail-row :param="{
                title: 'common.installPath',
                copy: true,
                content: model && model.installPath
              }"/>
          <detail-row :param="{
                title: 'common.vm',
                content: model && dbData.vm[model.vmInstanceUuid] && model.vmInstanceName,
                handler: () => {
                  $router.push({name: 'detailVm', params: {uuid: model.vmInstanceUuid}});
                }
              }"
                      v-if="model && !model.isShareable && dbData.vm[model.vmInstanceUuid] && model.vmInstanceUuid"/>
          <detail-row :param="{
                title: 'common.primarystorage',
                content: model && dbData.primarystorage[model.primaryStorageUuid].name ,
                handler: () => {
                   $router.push({name: 'detailprimarystorage', params: {uuid: model.primaryStorageUuid}});
                }
              }" v-if="model && dbData.common.isAdmin && dbData.primarystorage[model.primaryStorageUuid]"/>
          <detail-row :param="{
                title: 'image.volumeImage',
                content: model && dbData.image[model.rootImageUuid] ? dbData.image[model.rootImageUuid].name : model.rootImageUuid  ,
                copy: () => {
                  if(model){
                   return (dbData.image[model.rootImageUuid] && dbData.image[model.rootImageUuid].name) ? false : true;
                  }
                },
                handler: () => {

                }
              }" v-if="model && model.rootImageUuid"/>
        </div>
      </div>
      <div class="detail-body"  slot='body' v-if="activeName === 'snapshot'">
        <volume-snap :param="windowData.dataUuid"
                     :primary-storage-type="dbData.primarystorage[model.primaryStorageUuid].type"
                     type="volume"
                     @open="openVmSnapShot"></volume-snap>
      </div>
      <div class="detail-body"  slot='body' v-if="activeName === 'scheduler'">
        <vm-scheduler
          :param="{conditions:[`targetResourceUuid=${windowData.dataUuid}`], resourceUuid: windowData.dataUuid, resourceType: 'volume'}"/>
      </div>
      <div class="detail-body"  slot='body' v-if="activeName === 'log'">
        <log-list :param="{ uuid: model.uuid }"/>
      </div>
      <div class="detail-body"  slot='body' v-if="activeName === 'backupdata'">
        <backup-data-nomal-tab-list :param="{
            conditions:`volumeUuid=${model.uuid}`,
            refresh: refresh,
            showBDRecover: showBDRecover,
            showDetail: showBackupDataDetail
            }"></backup-data-nomal-tab-list>
      </div>
    <div slot="footer">
      <volume-create-image :param="createImageMessage" @close="closeCreateImagePage" v-if="showCreateImage"/>
      <vm-snap-detail v-if="showVmSnapDetail" :param="vmSnapDetailParam" @close="showVmSnapDetail=false"/>
      <volume-backup-data-recover :param="backupDataParam"
                                  v-if="showBackupDataRecover"
                                  @close="showBackupDataRecover = false"
      ></volume-backup-data-recover>
      <volume-backup-detail :param="backupDetailParam"
                            v-if="showBackupDetail"
                            @close="showBackupDetail = false"
      ></volume-backup-detail>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import DetailInfoState from "../../../component/DetailInfoState";
  import TagPartialForResourceDetail from 'src/om/tag/partials/TagPartialForResourceDetail'
  import VolumeMethods from 'src/ecs/volume/Methods';
  import WindowBase from 'src/windows/Window';
  import strategy from 'src/ecs/volume/strategy'
  import {mapGetters, mapState} from 'vuex';
  import rpc from 'src/utils/rpc';
  import VolumeSnap from "../component/VolumeSnap";
  import VmScheduler from "../../ecsInstance/component/VmScheduler";
  import LogList from "../../../component/LogList";
  import BackupDataNomalTabList from "../../../backupdata/BackupDataNomalTabList";
  import VolumeCreateImage from "../component/VolumeCreateImage";
  import CreateSnapDlg from "../../../dialog/CreateSnapDlg";
  import SetVolumeQosDlg from "../../../dialog/SetVolumeQosDlg";
  import NormalVolumeConfirmDlg from "../../../dialog/NormalVolumeConfirmDlg";
  import ResizeVolumeDlg from "../../../dialog/ResizeVolumeDlg";
  import PrimaryStorageSingleDlg from "../../../dialog/PrimaryStorageSingleDlg";
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner';
  import VmSnapDetail from 'src/ecs/ecsInstance/component/VmSnapDetail';
  import VolumeBackupDataRecover from '../component/VolumeBackupDataRecover';
  import VolumeBackupDetail from '../component/VolumeBackupDetail';

  export default {
    name: "VolumeDetailPage",
    mixins: [VolumeMethods, WindowBase, TagPartialForResourceDetail],
    components: {
      PrimaryStorageSingleDlg,
      ResizeVolumeDlg,
      NormalVolumeConfirmDlg,
      SetVolumeQosDlg,
      CreateSnapDlg,
      VolumeCreateImage,
      BackupDataNomalTabList, LogList, VmScheduler, VolumeSnap, DetailInfoState, DetailTemplate,
      VmSnapDetail,
      VolumeBackupDataRecover,
      VolumeBackupDetail
    },
    data() {
      return {
        activeName: 'info',
        bsListInCurrentZone: '',
        editVolumeSize: false,
        editVolumeTotalBandwidth: false,
        editVolumeReadBandwidth: false,
        editVolumeWriteBandwidth: false,
        showCreateImage: false,
        newVolumeReadBandwidth: '',
        newVolumeTotalBandwidth: '',
        newVolumeWriteBandwidth: '',
        newMemorySize: '',
        virtioSCSIList: [this.$t('common.yes'), this.$t('common.no')],
        createImageMessage: {},
        showCreateSnapDlg: false,
        createSnapMessage: {},
        showSetVolumeQosDlg: false,
        setVolumeQosMessage: {},
        showNormalVolumeConfirmDlg: false,
        normalMessage: {},
        showResizeVolumeDlg: false,
        resizeVolumeMessage: {},
        showPrimarySingleDlg: false,
        primarySingleMessage: {},
        showVmSnapDetail: false,
        vmSnapDetailParam: {},
        backupDataParam: {},
        showBackupDataRecover: false,
        backupDetailParam: {},
        showBackupDetail: false,
      }
    },
    computed: {
      ...mapState({
        volume: state => state.volume
      }),
      ...mapGetters({
        get: 'volume/get'
      }),
      model() {
        let self = this;
        return self.get(self.$route.params.uuid);
      }
    },
    created() {
      let self = this;
      this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
      let dataUuid, refresh;
      dataUuid = this.$route.params ? self.$route.params.uuid : '';
      this.updateWindow({
        dataUuid,
        refresh,
        methods: {
          query: self.detailQuery
        }
      })
        .then(() => {
          return self.refresh()
        })
        .then(() => {
          return self.detailQuery()
        }).then(() => {
        this.$forceUpdate()
      });
      rpc.query('backup-storage', {
        q: `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
      }).then(resp => {
        this.bsListInCurrentZone = resp.inventories
      })
    },
    methods: {
      openVmSnapShot (param) {
        let self = this;
        self.vmSnapDetailParam = param;
        self.showVmSnapDetail = true;
      },

      showBDRecover(param) {
        let self = this;
        self.backupDataParam = param;
        self.showBackupDataRecover = true;
      },

      showBackupDataDetail(param) {
        let self = this;
        self.backupDetailParam = param;
        self.showBackupDetail = true;
      },

      refresh() {
        let self = this;
        return self.dispatchAction('volume/batchQuery', {
          replyWithCount: true
        })
      },
      handleTabChange(e) {
        let self = this;
        if (_.isEqual(e, self.activeName)) true;
        self.activeName = e.name;
      },
      detailQuery() {
        let self = this;
        return self.dispatchAction('volume/query',self.windowData.dataUuid);
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
            return 'VOLUME.UPDATE'
          },
          setValue: (value) => {
            if(value !== this.model.name)
            this.updateVolume('name', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.model) {
              return this.model.description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'VOLUME.UPDATE'
          },
          setValue: (value) => {
            if(value !== this.model.description)
            this.updateVolume('description', value)
          }
        }
      },
      updateVolume(key, val) {
        let value = {};
        if (key) {
          value[key] = val;
        }
        this.dispatchActionWithEvent('volume/update', {
          uuid: this.windowData.dataUuid,
          value
        })
      },
      //能否改变容量
      canResizeVolume() {
        return strategy.canResize(this.model, this.dbData.vm, this.dbData.primarystorage)
      },
      //扩容回调
      sizeEditEnd(newSize) {
        const self = this;
        self.editVolumeSize = false;
        let uuid = self.windowData.dataUuid;
        let volume = self.dbData.volume[uuid];
        if (_.isEqual(newSize, volume.size)) return;
        if (volume.type === 'Root') {
          return self.resizeRootVolume(uuid, newSize).then(() => {
            return self.detailQuery()
          })
        } else {
          return self.resizeVolume(uuid, newSize).then(() => {
            return self.detailQuery()
          })
        }
      },
      //刷新真实容量
      refreshActualSize() {
        let self = this;
        this.dispatchActionWithEvent('volume/refreshActualSize', this.windowData.dataUuid)
      },
      //是否展示磁盘宽带
      showTotalBandWidth() {
        return this.model && !(this.model.volumeReadBandwidth > 0 || this.model.volumeWriteBandwidth > 0)
      },
      isAliyunEBS() {
        const self = this;
        let primaryStorage = self.model && self.model.primaryStorageUuid && self.dbData.primarystorage[self.model.primaryStorageUuid];
        if (primaryStorage && primaryStorage.type === 'AliyunEBS') return true;
        return false
      },
      //更新云盘总速率
      volumeTotalBandwidthEditEnd(newValue) {
        this.editVolumeTotalBandwidth = false;
        if (_.isNaN(newValue)) newValue = -1;
        if (_.isEqual(newValue, this.model.volumeBandwidth) || (newValue < 1 && this.model.volumeBandwidth < 1)) return;
        if (newValue < 1) {
          this.cancelVolumeQos([this.windowData.dataUuid], 'all').then(() => {
            this.detailQuery()
          })
        } else {
          this.setVolumeQos({volumeBandwidth: newValue, mode: 'total'}, [this.windowData.dataUuid]).then(() => {
            this.detailQuery()
          })
        }
      },
      //更新云盘读入苏率
      volumeReadBandwidthEditEnd(newValue, mode) {
        this.editVolumeReadBandwidth = false;
        if (_.isNaN(newValue)) newValue = -1;
        if (_.isEqual(newValue, this.model.volumeReadBandwidth) || (newValue < 1 && this.model.volumeReadBandwidth < 1)) return;
        if (newValue < 1) {
          this.cancelVolumeQos([this.windowData.dataUuid], 'read').then(() => {
            this.detailQuery()
          })
        } else {
          this.setVolumeQos({volumeBandwidth: newValue, mode: 'read'}, [this.windowData.dataUuid]).then(() => {
            this.detailQuery()
          })
        }
      },
      //更新云盘写入速率
      volumeWriteBandwidthEditEnd(newValue, mode) {
        this.editVolumeWriteBandwidth = false;
        if (_.isNaN(newValue)) newValue = -1;
        if (_.isEqual(newValue, this.model.volumeWriteBandwidth) || (newValue < 1 && this.model.volumeWriteBandwidth < 1)) return;
        if (newValue < 1) {
          this.cancelVolumeQos([this.windowData.dataUuid], 'write').then(() => {
            this.detailQuery()
          })
        } else {
          this.setVolumeQos({volumeBandwidth: newValue, mode: 'write'}, [this.windowData.dataUuid]).then(() => {
            this.detailQuery()
          })
        }
      },
      //更新VirtioSCSI
      updateVirtioSCSI(uuidList, param) {
        let self = this;
        if (param === "yes") {
          self.dispatchActionWithEvent('volume/setVirtioSCSI', uuidList)
        }
        if (param === "no") {
          self.dispatchActionWithEvent('volume/removeVirtioSCSI', uuidList);
        }
      },
      //判断是否已删除
      isDelete() {
        let self = this;
        return self.volume && self.volume[self.$route.params.uuid] && self.volume[self.$route.params.uuid].status === 'Deleted';
      },
      //判断是否是跟云盘
      isRoot() {
        let self = this;
        return self.volume && self.volume[self.$route.params.uuid] && self.volume[self.$route.params.uuid].type === 'Root';
      },
      //是否可以绑定
      canAttach() {
        let self = this;
        return self.volume && self.volume[self.$route.params.uuid] && !self.volume[self.$route.params.uuid].vmInstanceUuid;
      },
      //解绑云主机
      canDetach() {
        let self = this;
        return self.volume && self.volume[self.$route.params.uuid] && self.volume[self.$route.params.uuid].vmInstanceUuid;
      },
      //是否可以迁移
      canMigrate: function () {
        let self = this;
        return self.model && strategy.canMigrate(self.model)
      },
      //是否可以创建镜像
      canCreateImage() {
        let self = this;
        return self.model && strategy.canCreateImage(self.model, self.dbData.primarystorage, self.dbData.vm, self.bsListInCurrentZone)
      },
      //是否可以创建快照
      canCreateSnapshot() {
        let self = this;
        return self.model && strategy.canCreateSnapshot(self.model, self.dbData.primarystorage)
      },
      //是否可以设置Qos
      canSetQos() {
        let self = this;
        return self.model && strategy.canSetQos(self.model, self.dbData.primarystorage)
      },
      //是否可以删除Qos
      canRemoveQos() {
        let self = this;
        return self.model && strategy.canRemoveQos(self.model, self.dbData.vm, self.dbData.common.isAdmin)
      },
      //是否可以改变所有者
      canChangeOwner() {
        return strategy.canChangeOwner(this.model)
      },
      //是否可以云盘扩容
      canResizeVolume() {
        let self = this;
        return self.model && strategy.canResize(self.model, self.dbData.vm, self.dbData.primarystorage)
      },
      //是否可以迁移主存储
      canStorageMigrate: function () {
        let self = this;
        return self.model && strategy.canStorageMigrate(self.model, self.dbData.vm, self.dbData.primarystorage)
      },
      //是否可以删除
      canDelete() {
        let self = this;
        return self.model && strategy.canDelete(self.model, self.dbData.vm)
      },
      //是否可以恢复
      canRecover() {
        let self = this;
        return self.model && strategy.canRecover(self.model)
      },
      //彻底删除
      canExpunge() {
        let self = this;
        return self.model && strategy.canExpunge(self.model)
      },
      //启动
      pageStart: function () {
        this.dispatchActionWithEvent('volume/enable', this.windowData.dataUuid)
        // this.start([this.windowData.dataUuid])
      },
      //停止
      pageStop: function () {
        this.dispatchActionWithEvent('volume/disable', this.windowData.dataUuid)
        // this.stop([this.windowData.dataUuid])
      },
      //绑定云主机
      attachVolume() {
        let self = this;
        let volumeUuid = this.windowData.dataUuid;
        rpc.query(`volumes/${volumeUuid}/candidate-vm-instances`)
          .then((resp) => {
            let attachableVmUuidList = resp.inventories.map((item) => item.uuid);
            if (self.dbData.volume[volumeUuid].isShareable) {
              self.openDialog('VmInstanceMultiSelectListDlg', {
                conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM'],
                ok: (uuidList) => {
                  let notInstantiatedVolume = self.dbData.volume[volumeUuid].status === 'NotInstantiated';
                  self.attachToVm(volumeUuid, uuidList).then(() => {
                    if (notInstantiatedVolume && self.refresh) {
                      self.refresh()
                    }
                    self.detailQuery()
                  })
                }
              })
            } else {
              self.openDialog('VmSingleSelectListDlg', {
                conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM'],
                ok: (uuid) => {
                  let notInstantiatedVolume = self.dbData.volume[volumeUuid].status === 'NotInstantiated';
                  self.attachToVm(volumeUuid, [uuid]).then(() => {
                    if (notInstantiatedVolume && self.refresh) {
                      self.refresh()
                    }
                    self.detailQuery()
                  })
                }
              })
            }
          })
      },
      //解绑云主机
      detachVolume() {
        let self = this;
        if (self.volume[self.$route.params.uuid].isShareable) {
          let selectedUuidList = [self.$route.params.uuid];
          let vmUuidList = [];
          if (this.volume[selectedUuidList[0]].vmInstanceUuid) {
            vmUuidList = [this.volume[selectedUuidList[0]].vmInstanceUuid]
          } else if (this.volume[selectedUuidList[0]].vmInstanceUuidList) {
            vmUuidList = this.volume[selectedUuidList[0]].vmInstanceUuidList
          }
          this.openDialog('VmInstanceMultiSelectListDlg', {
            conditions: [`uuid?=${vmUuidList.join(',')}`],
            ok: (uuidList) => {
              this.detachSharebelVolume(selectedUuidList[0], uuidList).then(() => {
                for (let volumeUuid of selectedUuidList) {
                  this.updateVolumeVms(volumeUuid, uuidList)
                }
                this.detailQuery()
              })
            }
          })
        } else {
          let uuidList = [self.$route.params.uuid];
          if (uuidList.length > 0) {
            this.openDialog('ConfirmDlg', {
              title: 'vm.volume.detach',
              description: 'volume.detachVolume',
              uuidList: uuidList,
              icon: 'volume_popupico',
              ok: () => {
                this.detach(uuidList).then(() => {
                  this.refresh();
                  this.detailQuery();
                })
              },
              getName: (uuid) => {
                return this.dbData.volume[uuid].name
              }
            })
          }
        }
      },
      //迁移
      detailMigrateVolume() {

      },
      //更改所有者
      detailChangeResourceOwner() {
        const self = this
        self.changeResourceOwnerDlg([self.windowData.dataUuid], self.changeResourceToAccountOrProject, self.query, true)
      },
      //创建镜像
      createVolumeImage() {
        const self = this;
        let volume = _.get(self.dbData.volume, `${self.windowData.dataUuid}`);
        let volumeType = _.get(self.dbData.volume, `${self.windowData.dataUuid}.type`);
        let primaryStorageType = _.get(self.dbData.primarystorage, `${volume.primaryStorageUuid}.type`);
        if (_.includes(['Ceph'], primaryStorageType)) {
          let availableBackupStorageUuidList = [];
          let zql = "query BackupStorage where uuid in (query BackupStorage.uuid where type='ImageStoreBackupStorage') or uuid in (query CephBackupStorage.uuid where type='Ceph' and fsid in (query CephPrimaryStorage.fsid where uuid='" + `${volume.primaryStorageUuid}` + "'))";
          let tasks = [];
          let p = rpc.query('/zql', {
            zql: encodeURIComponent(zql)
          }).then((resp) => {
            if (resp.results && resp.results.length > 0) {
              availableBackupStorageUuidList = _.map(resp.results[0].inventories, (item) => item.uuid)
            }
          });
          tasks.push(p);
          return Promise.all(tasks).then(() => {
            self.createImageMessage = {
              volumeType,
              availableBackupStorageUuidList: availableBackupStorageUuidList,
              primaryStorageType,
              volumeUuid: self.$route.params.uuid,
            };
            self.showCreateImage = true;
          })
        } else {
          self.createImageMessage = {
            volumeType,
            primaryStorageType,
            volumeUuid: self.$route.params.uuid,
          };
          self.showCreateImage = true;
        }
      },
      //创建云盘快照
      createVolumeSnapshotPage() {
        let self = this;
        self.createSnapMessage = {
          vmInstanceUuid: self.$route.params.uuid
        };
        self.showCreateSnapDlg = true;
      },
      //关闭创建镜像回调
      closeCreateImagePage(param) {
        let self = this;
        if (param) {
          self.createImageFromVolume(param);
        }
        self.showCreateImage = false;
      },
      //关闭云盘快照回调
      closeCreateSnapDlg(param) {
        let self = this;
        if (param) {
          self.createVolumeSnapshot(param, self.$route.params.uuid);
        }
        self.showCreateSnapDlg = false;
      },
      pageSetVolumeQos() {
        let self = this;
        let uuidList = [self.$route.params.uuid];
        if (uuidList.length > 0) {
          self.setVolumeQosMessage = {
            uuidList
          };
          self.showSetVolumeQosDlg = true;
        }
      },
      //关闭设置Qos回调
      closeCreateVolumeQosDlg(param) {
        let self = this;
        if (param) {
          param.msg.forEach((item) => {
            self.setVolumeQos(item, [self.$route.params.uuid]).then(() => {
              self.detailQuery();
              self.$forceUpdate()
            })
          })
        }
        self.showSetVolumeQosDlg = false;
      },
      //取消QOS
      pageCancelVolumeQos() {
        const self = this;
        let uuidList = [self.$route.params.uuid];
        if (uuidList.length > 0) {
          let self = this;
          self.normalMessage = {
            confirmType: 'cancelQos',
            uuidList: uuidList,
          };
          self.showNormalVolumeConfirmDlg = true;
        }
      },
      closeNormalDlg(param) {
        let self = this;
        if (param) {
          switch (param.type) {
            case 'cancelQos':
              self.cancelVolumeQos(param.uuidList).then(() => {
                self.$forceUpdate()
              });
          }
        }
      },
      detailResizeVolume() {
        let self = this;
        let uuid = self.$route.params.uuid;
        let volume = this.dbData.volume[uuid];
        self.resizeVolumeMessage = {
          volume
        };
        self.showResizeVolumeDlg = true;
      },
      openStorageMigrateDataVolumeDlg() {
        const self = this;
        let volumeUuid = self.windowData.dataUuid;
        let volume = self.dbData.volume[volumeUuid];
        if (!volume) return false;
        const {isShareable, type: volumeType, vmInstanceUuid, primaryStorageUuid, vmInstanceUuidList} = volume;
        const {type: psType} = self.dbData.primarystorage[primaryStorageUuid];
        let isDataVolumeWithVmAttached = !isShareable && vmInstanceUuid && volumeType === 'Data';
        let isShareableVolumeWithVmAttached = isShareable && vmInstanceUuidList && vmInstanceUuidList.length > 0;
        const psTypeTable = {
          SharedBlock: isShareableVolumeWithVmAttached,
          NFS: isDataVolumeWithVmAttached || isShareableVolumeWithVmAttached,
          Ceph: isDataVolumeWithVmAttached || isShareableVolumeWithVmAttached
        };
        if (psTypeTable[psType]) return self.openDialog('RemindMigrateVolumeConfirmDlg', {});
        let candidatePrimaryStorageUuids;
        return rpc.query(`primary-storage/volumes/${volumeUuid}/migration-candidates`).then(resp => {
          candidatePrimaryStorageUuids = resp.inventories.map(item => item.uuid)
        }, () => {
          candidatePrimaryStorageUuids = []
        }).then(() => {
          this.primarySingleMessage = {
            action: 'storageMigrate',
            conditions: `uuid?=${candidatePrimaryStorageUuids}`
          };
          this.updateWindow({
            volumeUuid: volumeUuid
          });
          this.showPrimarySingleDlg = true
          // return self.openSideWindow('PrimaryStorageListSingleSelectConfirmDlg', {
          //   action: 'storageMigrate',
          //   conditions: `uuid?=${candidatePrimaryStorageUuids}`,
          //   select: primaryStorageUuids => self.storageMigrateDataVolume(primaryStorageUuids[0], volumeUuid).then(self.detailQuery)
          // })
        })
      },
      //云盘扩容回调
      closeVolumeDlg(param) {
        let self = this;
        if (param) {
          let volume = self.volume[param.uuid];
          if (volume.type === 'Root') {
            return self.resizeRootVolume(uuid, size).then(() => {
              return self.detailQuery()
            })
          } else {
            return self.resizeVolume(param.uuid, param.size).then(() => {
              return self.detailQuery()
            })
          }
        }
        self.showResizeVolumeDlg = false;
      },
      //迁移主存储回调
      closePrimarySingleDlg() {
        let self = this;
        if (param) {
          self.storageMigrateDataVolume(param.uuid, self.windowData.volumeUuid).then(self.detailQuery())
        }
        self.showPrimarySingleDlg = false;
      },
      //是否处于就绪状态
      isReady() {
        let self = this, volume;
        volume = self.model;
        return volume && ['NotInstantiated', 'Deleted'].indexOf(volume.status) === -1
      },
      //删除云盘t
      deleteVolume() {
        let self = this;
        let uuidList = [self.$route.params.uuid];
        let expungeUuids = uuidList.filter(uuid => _.get(this.volume, `[${uuid}].status`) === 'NotInstantiated');
        this.openDialog('ConfirmDlg', {
          title: 'volume.delete',
          description: 'volume.info.deleteConfirm',
          uuidList: uuidList,
          icon: 'image_n',
          getName: uuid => self.dbData.volume[uuid].name,
          ok: () => {
            this.dispatchActionWithEvent('volume/delete', uuidList).then(() => {
              if (expungeUuids.length > 0) {
                return this.dispatchAction('volume/expunge', {param: expungeUuids})
              } else {
                return Promise.resolve()
              }
            }).then(() => {
              this.refresh();
              return this.detailQuery()
            })
          }
        })
      },
      recoverVolume() {
        let self = this;
        this.openDialog('ConfirmDlg', {
          title: 'volume.recover',
          description: 'volume.info.recoverConfirm',
          uuidList: [self.$route.params.uuid],
          icon: 'image_n',
          getName: uuid => self.dbData.volume[uuid].name,
          ok: () => {
            self.recover([self.$route.params.uuid]).then(() => {
              if (self.refresh) self.refresh(self.$route.params.uuid)
            })
          }
        })
      },
      expungeVolume() {
        let self = this;
        let uuidList = [self.$route.params.uuid];
        if (uuidList.length > 0) {
          return this.openDialog('ConfirmDlg', {
            title: 'volume.expunge',
            description: 'volume.info.expungeConfirm',
            uuidList: uuidList,
            icon: 'volume_popupico',
            getName: (uuid) => {
              return self.volume[uuid].name
            },
            ok: () => {
              self.expunge(uuidList).then(() => {
                if (self.refresh) self.refresh(self.$route.params.uuid);
                self.$router.push({name: 'volume'})
              })
            }
          })
        }
      }
    }
  }
</script>

<style scoped>
  .icon {
    width: 60px;
    height: 60px;
    position: absolute;
    background-repeat: no-repeat;
    display: inline-block;
  }
</style>
