<template>
  <div class="volume-backup-container">
    <detail-template>
      <div slot="header" class="detail-header">
        <span class="detail-title">备份数据详情</span>
        <div class="detail-header-item create-back" @click="$emit('close')">
          <i class="el-icon-back"></i>
          <span style="font-size: 12px">
            回到备份数据列表
          </span>
        </div>
        <div class="detail-header-item">
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('backupData.actions')}}</span>
            </span>
            <span slot="content">
             <div class="dropdown-content">
              <a style="padding-top: 12px;"  @click="pageRecovery()">{{ $t("backupData.recovery") }}</a>
              <a :class="{ 'disabled-text': !isRemoteData() }" @click="canSync() && pageSync()">{{$t("backupData.sync")}}</a>
              <a style="padding-bottom:12px;"  @click="pageDelete()">{{$t("common.destroy")}}</a>
             </div>
            </span>
          </drop-down>
        </div>
        <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
          <el-tab-pane name="info" :label="$t('common.basicAttributes')"></el-tab-pane>
        </el-tabs>
      </div>

      <div slot="body" class="detail-body">
        <div class="left">
          <div class="left-header">
            <div class="icon"></div>
            <div class="after-icon">
              <detail-info-state outer-class-name="detail-page-state" :state="backupData.state"/>
            </div>
            <detail-name class="name" :param="updateResourceParam()"></detail-name>
          </div>
          <div class="left-body">
            <div class="detail-block-header">
              {{$t('common.overview')}}
            </div>
            <detail-row
              :param="{
                title: 'backupData.fileSize',
                content: backupData && bytesToSize(backupData.size)
              }"
            />
            <detail-row
              :param="{
                title: 'backupTask.resourceType',
                content: $t(`common.${backupData.type === 'Root' ? 'vm' : 'volume'}`)
              }"
            />
            <detail-row
              :param="{
                title: 'backupServer.title',
                content: getBackupStorageName(windowData.dataUuid),
                handler: isAdmin && openBsWindow
              }"
            />
            <detail-row v-if="backupData.type === 'Root'" :param="{
                  title: 'backupData.vmBackup',
                  content: $t(`common.${backupData.metadata.dataVolumeUuids ? 'yes': 'no'}`)
                }"/>
            <detail-row :param="{
                  title: 'backupData.sync',
                  content: $t(`common.${isSyncToRemote ? 'yes': 'no'}`)
                }"/>
            <detail-row :param="{
                  title: 'common.createDate',
                  content: formatDatetime(new Date(backupData.createDate))
                }"/>
            <detail-row :param="{
                  title: 'common.lastOpDate',
                  content: formatDatetime(new Date(backupData.lastOpDate))
                }"/>
            <detail-row :param="{
                  title: 'common.uuid',
                  content: backupData.uuid,
                  copy: true
                }"/>
          </div>
        </div>
        <div class="right">
          <div style="height: 40px"></div>
          <div class="detail-block-header">
            {{$t("backupData.resourceDetail")}}
          </div>
          <detail-row :param="{
                  title: 'common.name',
                  content: backupData.metadata.name,
                  handler: isVolumeDeleted && openVolumeDetail
                }"/>
          <detail-row :param="{
                title: 'common.description',
                content: backupData.metadata.description
              }"/>
          <detail-row v-if="!isRoot" :param="{
                title: 'common.size',
                content: bytesToSize(backupData.metadata.size)
              }"/>
          <detail-row v-if="!isRoot" :param="{
                title: 'common.actualSize',
                content: bytesToSize(backupData.metadata.actualSize)
              }"/>
          <detail-row v-if="!isRoot" :param="{
                title: 'common.format',
                content: backupData.metadata.format
              }"/>
          <detail-row v-if="!isRoot" :param="{
                title: 'common.sharedVolume',
                content: $t(`common.${backupData.metadata.isShareable ? 'yes' : 'no'}`)
              }"/>
          <detail-row v-if="!isRoot" :param="{
                title: 'common.volumeTotalBandwidth',
                content: volumeBandWidth
              }"/>
          <detail-row v-if="!isRoot" :param="{
                title: 'VirtioSCSI',
                content: $t(`common.${isVirtioSCSI ? 'yes' : 'no'}`)
              }"/>
          <detail-row v-if="!isRoot" :param="{
                title: 'WWN',
                content: getWWN()
              }"/>
          <detail-row :param="{
                title: 'common.vm',
                content: dbData.vm[backupData.metadata.vmInstanceUuid] ? dbData.vm[backupData.metadata.vmInstanceUuid].name : '',
                handler: () => { $router.push({name: 'detailVm', params: {uuid: backupData.metadata.vmInstanceUuid}}) }
              }"/>
          <detail-row v-if="isRoot" :param="{
                title: 'common.platform',
                content: backupData.metadata.platform
              }"/>
          <detail-row v-if="isRoot" :param="{
                title: 'common.cpuNum',
                content: backupData.metadata.cpuNum
              }"/>
          <detail-row v-if="isRoot" :param="{
                title: 'common.memory',
                content: bytesToSize(backupData.metadata.memorySize)
              }"/>
          <detail-row v-if="dbData.common.isAdmin && isRoot" :param="{
                title: 'common.cluster',
                content: dbData.cluster[backupData.metadata.clusterUuid] ? dbData.cluster[backupData.metadata.clusterUuid].name : '',
                handler: () => { $router.push({name: 'detailCluster', params: {uuid: backupData.metadata.clusterUuid}}) }
              }"/>
          <detail-row v-if="dbData.common.isAdmin && !isRoot" :param="{
                title: 'common.primaryStorage',
                content: dbData.primarystorage[backupData.metadata.primaryStorageUuid] ? dbData.primarystorage[backupData.metadata.primaryStorageUuid].name : '',
                handler: () => { $router.push({name: 'detailprimarystorage', params: {uuid: backupData.metadata.primaryStorageUuid}})}
              }"/>
          <detail-row v-if="isRoot" :param="{
                title: 'common.instanceOffering',
                content: dbData.instanceOffering[backupData.metadata.instanceOfferingUuid] ? dbData.instanceOffering[backupData.metadata.instanceOfferingUuid].name : '',
                handler: isAdmin && openInstanceOfferingWindow
              }"/>
        </div>
      </div>

      <div slot="footer" class="detail-footer"></div>
    </detail-template>
    <volume-backup-data-recover :param="backupDataParam"
                                v-if="showBackupDataRecover"
                                @close="showBackupDataRecover = false"
    ></volume-backup-data-recover>
  </div>
</template>

<script>
    import DetailTemplate from "../../../component/DetailTemplate";
    import BackupMethods from 'src/backupdata/Methods';
    import WindowBase from 'src/windows/Window';
    import VolumeBackupDataRecover from "./VolumeBackupDataRecover";
    import DetailInfoState from "../../../component/DetailInfoState";

    export default {
      name: "VolumeBackupDetail",

      mixins: [BackupMethods, WindowBase],

      props: {
        param: {
          type: Object,
          default: () => {
            return {}
          }
        }
      },

      components: {DetailInfoState, VolumeBackupDataRecover, DetailTemplate},

      data() {
        return {
          currTab: 'info',
          backupDataParam: {},
          showBackupDataRecover: false
        }
      },

      created() {
        this.isAdmin = localStorage.getItem('isAdmin') === 'true'
        let dataUuid = this.param.uuid
        this.updateWindow({
          dataUuid,
          methods: {
            query: this.detailQuery
          }
        })
          .then(() => {
            return this.detailQuery()
          }).then(() => {
          this.$forceUpdate()
        })
      },

      methods: {
        canSync () {
          let remoteBackupStorageUuids = _.keys(this.dbData.remoteBackupStorage)
          if (remoteBackupStorageUuids.length === 0) return false
          let attachedZoneUuids = this.dbData.remoteBackupStorage[remoteBackupStorageUuids[0]].attachedZoneUuids
          let zoneUuid = window.localStorage.getItem('currZoneUuid')
          if (!_.includes(attachedZoneUuids, zoneUuid)) return false
          return !this.isRemoteSynced(this.windowData.dataUuid)
        },

        detailQuery() {
          let self = this;
          self.query(self.windowData.dataUuid);
        },

        isRemoteData () {
          return this.backupData.backupStorageRefs.length === 1 && this.isRemoteSynced(this.windowData.dataUuid)
        },

        pageSync () {
          return this.sync([this.windowData.dataUuid]).then(() => {
            return this.detailQuery()
          })
        },

        getWWN () {
          let systemTags = _.get(this.backupData, 'metadata.systemTags')
          if (!systemTags) return ''
          let WWN = _.find(systemTags, tag => _.includes(tag.tag, 'kvm::volume::'))
          return WWN.tag.split('::')[2]
        },

        pageRecovery () {
          let uuid = this.windowData.dataUuid
          let backupData = this.dbData.backupData[uuid]
          let type = backupData && backupData.type
          if (type !== 'Data') {
           return;
          }
          this.backupDataParam = {
            uuid,
            ok: (param, policyType, whole) => {
              if (policyType === 'new') {
                if (type !== 'Data') {
                  if (whole) return this.createVmFromVmBackup(param, uuid)
                  return this.newVmByBackup(param, uuid)
                }
                return this.newVolumeByBackup(param, uuid)
              }
              return this.overlap(uuid, whole)
            }
          }
          this.showBackupDataRecover = true;
        },

        pageDelete() {
          let self = this, uuidList = [self.windowData.dataUuid];
          self.openDialog('DeleteBackupDataConfirm', {
            uuidList,
            title: 'backupData.delete',
            description: 'backupData.delteLocalConfirm',
            icon: 'pop_backup_data_n',
            getName: (uuid) => {
              return self.dbData.backupData[uuid].name;
            },
            ok: (remote, whole) => {
              return self.delete(uuidList, null, remote, whole).then(() => {
                return self.detailQuery()
              })
            }
          })
        },

        updateResourceParam() {
          let self = this;
          return {
            getValue: () => {
              return self.backupData.name;
            },
            canEdit: () => {
              return false;
            }
          }
        },

        openBsWindow() {
          let self = this;
          self.$router.push({name: 'detailbackupstorage', params: {uuid:  self.backupData.backupStorageRefs[0].backupStorageUuid}})
        },

        openVolumeDetail() {
          let self = this;
          self.$router.push({name: 'detailVolume', params: {uuid:  this.backupData.volumeUuid}});
          self.$emit('close');
        },

        openInstanceOfferingWindow() {
          let self = this;
          self.$router.push({name: 'detailInstanceOffering', params: {uuid: self.backupData.metadata.instanceOfferingUuid }})
        }

      },

      computed: {
        backupData () {
          return this.dbData.backupData[this.windowData.dataUuid]
        },
        isVirtioSCSI () {
          let backupData = this.dbData.backupData[this.windowData.dataUuid]
          let systemTags = backupData.metadata.systemTags
          return systemTags && systemTags.some(tag => _.includes(tag.tag, 'virtio-scsi'))
        },
        isRoot () {
          let backupData = this.dbData.backupData[this.windowData.dataUuid]
          return backupData.type === 'Root'
        },
        isVolumeDeleted () {
          let backupData = this.dbData.backupData[this.windowData.dataUuid]
          let volume = this.$store.state.volume[backupData.volumeUuid]
          return volume && volume.status !== 'Deleted'
        },
        isSyncToRemote () {
          let backupData = this.dbData.backupData[this.windowData.dataUuid]
          if (!backupData) return false
          let bsUuids = backupData.backupStorageRefs.map(bs => bs.backupStorageUuid)
          let remoteBackupStorageUuids = _.keys(this.dbData.remoteBackupStorage)
          return bsUuids.some(uuid => _.includes(remoteBackupStorageUuids, uuid))
        },
        volumeBandWidth () {
          let backupData = this.dbData.backupData[this.windowData.dataUuid]
          let systemTags = backupData.metadata.systemTags
          if (!systemTags) return this.$t('common.unlimited')
          let volumeBandWidth = _.find(systemTags, tag => _.includes(tag.tag, 'volumeTotalBandwidth'))
          if (!volumeBandWidth || _.includes(volumeBandWidth.tag, '-1')) return this.$t('common.unlimited')
          let value = volumeBandWidth.tag.split('::')[1]
          return this.bytesToSize(Number(value), 'B/S')
        },
        isAdmin:{
          get() {
            return this.dbData.common.isAdmin
          },
          set(val) {
            this.dbData.common.isAdmin = val;
          }
        }
      }
    }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";
  .icon {
    .detail-icon('~assets/detail_backup_data.svg')
  }
.volume-backup-container{
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 999;
}

</style>
