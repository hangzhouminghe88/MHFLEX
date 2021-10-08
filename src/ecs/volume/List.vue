<script>
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import VolumeMethods from './Methods'
  import Utils from 'src/utils/utils'
  // import IAM2ProjectMethods from 'src/windows/IAM2Project/Methods'
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
  import {mapGetters, mapState} from 'vuex'
  import strategy from 'src/ecs/volume/strategy';
  import TagPartialForResourceList from 'src/om/tag/partials/TagPartialForResourceList'
  /* global localStorage:false */

  export default {
    name: 'VolumeList',
    mixins: [VolumeMethods, TagPartialForResourceList],
    data: () => {
      return {
        extraDataUuidList: [],
        bsListInCurrentZone: []
      }
    },
    created: function () {
      rpc.query('backup-storage', {
        q: `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
      }).then(resp => {
        this.bsListInCurrentZone = resp.inventories
      })
    },
    computed: {
      ...mapState({
        volume: state => state.volume
      }),
      ...mapGetters({
        get: 'volume/get'
      }),
      // itemList() {
      //   return this.get(this.windowData.uuidList)
      // }
    },
    methods: {
      ...{
        changeResourceOwnerDlg: ChangeResourceOwnerDlg.changeResourceOwnerDlg
      },
      getCondition() {
        return []
      },
      getSearchCondition() {
        let conditionList = [];
        if (this.selectVal !== '' && this.searchStr !== '') {
          return conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return []
      },
      queryList() {
        this.windowData.loading = true;

        return this.dispatchAction('volume/batchQuery', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then(resp => {
          this.windowData.loading = false;
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            total: resp.total
          }).then(() => {
            this.itemList = this.get(this.windowData.uuidList);
          })
        }, () => {
          this.windowData.loading = false;
        })
          .then(() => {
            return this.isImageStoreInZone()
          })
      },
      pageSetVolumeQos() {
        const self = this;
        let uuidList = self.selectedList;
        if (uuidList.length > 0) {
          self.setVolumeQosMessage = {
            uuidList
          };
          self.showSetVolumeQosDlg = true;
          // self.openDialog('SetTotalBandwidthDlg', {
          //   uuidList,
          //   ok: (params) => {
          //     self.setVolumeQos(params, uuidList).then(() => {
          //       self.$forceUpdate()
          //     })
          //   }
          // })
        }
      },
      pageCancelVolumeQos() {
        const self = this;
        let uuidList = self.selectedList;
        if (uuidList.length > 0) {
          let self = this;
          self.normalMessage = {
            confirmType: 'cancelQos',
            uuidList: uuidList,
          };
          self.showNormalVolumeConfirmDlg = true;
        }
      },
      // leave this function for compatibility
      isSetVolumeQos() {
        return this.canRemoveQos()
      },
      canRemoveQos() {
        if (this.dbData.common.isOpensource) return false;
        if (!this.isSingleSelected) return false;
        let uuid = this.selectedList[0];
        // return this.volume[uuid].volumeBandwidth > 0
        return strategy.canRemoveQos(this.volume[uuid], this.dbData.vm, this.dbData.common.isAdmin)
      },
      canSetQos() {
        if (!this.isSingleSelected) return false;
        let volume = this.volume[this.selectedList[0]];
        // return volume && !volume.isShareable
        return strategy.canSetQos(volume, this.dbData.primarystorage)
      },
      canDetachTag() {
        if (!this.isSingleSelected) return false;
        return this._canDetachTag(this.volume[this.selectedList[0]])
      },
      pageDelete: function () {
        let uuidList = this.selectedList, self = this;
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
              return this.queryList()
            })
          }
        })
      },

      //创建云盘快照回调
      closeCreateSnapDlg(param) {
        let self = this;
        if (param) {
          let msg = {
            "name": param.name,
            "description": param.description
          };
          this.createVolumeSnapshot(msg, param.vmInstanceUuid)
        }
        self.showCreateSnap = false;
      },
      //设置云盘qos
      closeSetVolumeQosDlg(param) {
        let self = this;
        if (param) {
          param.msg.forEach((msg) => {
            self.setVolumeQos(msg, param.uuidList).then(() => {
              self.$forceUpdate()
            })
          })
        }
        self.showSetVolumeQosDlg = false;
      },
      // 设置云盘基本操作回调
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
      //云盘扩容
      closeVolumeDlg(param) {
        let self = this;
        if (param) {
          let volume = self.volume[param.uuid];
          if (volume.type === 'Root') {
            return self.resizeRootVolume(uuid, size).then(() => {
              return self.queryList()
            })
          } else {
            return self.resizeVolume(param.uuid, param.size).then(() => {
              return self.queryList()
            })
          }
        }
        self.showResizeVolumeDlg = false;
      },
      closePrimarySingleDlg(param) {
        let self = this;
        if (param) {
          self.storageMigrateDataVolume(param.uuid, self.windowData.volumeUuid).then(self.queryList)
        }
        self.showPrimarySingleDlg = false;
      },
      createVolumeImage() {
        const self = this;
        let volumeUuid = self.selectedList[0];
        // let volume = self.volume[volumeUuid]
        let volume = _.get(self.volume, `${volumeUuid}`);
        // let volumeType = volume && volume.type
        let volumeType = _.get(self.volume, `${volumeUuid}.type`);
        // let primaryStorage = volume && volume.primaryStorageUuid && self.dbData.primarystorage[volume.primaryStorageUuid]
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
            self.showCreateVolumeImage = true;
            self.createVolumeMessage = {
              volumeType,
              availableBackupStorageUuidList: availableBackupStorageUuidList,
              primaryStorageType,
              volumeUuid,
            }
            self.$emit('showVolumeCreateImageFun', {showCreateVolumeImage:self.showCreateVolumeImage, createVolumeMessage:  self.createVolumeMessage})
          })
        } else {
          self.showCreateVolumeImage = true;
          self.createVolumeMessage = {
            volumeType,
            primaryStorageType,
            volumeUuid,
          }
          self.$emit('showVolumeCreateImageFun', {showCreateVolumeImage:self.showCreateVolumeImage, createVolumeMessage:  self.createVolumeMessage})
        }
      },
      closeCreateImage(param) {
        let self = this;
        if (param) {
          self.createImageFromVolume(param)
        }
        self.showCreateVolumeImage = false;
      },
      canCreateImage() {
        if (!this.isSingleSelected) return false;
        let volume = this.volume[this.selectedList[0]];
        return strategy.canCreateImage(volume, this.dbData.primarystorage, this.dbData.vm, this.bsListInCurrentZone)
      },
      canCreateSnapshot() {
        if (!this.isSingleSelected) return;
        let volume = this.volume[this.selectedList[0]];
        return strategy.canCreateSnapshot(volume, this.dbData.primarystorage)
      },
      canBackupInHybrid() {
        if (!this.isSingleSelected) return false;
        let volume = this.volume[this.selectedList[0]];
        return strategy.canBackupInHybrid(volume, this.dbData.primarystorage, this.dbData.common.hasImageStore)
      },
      canBackup() {
        if (!this.isSingleSelected) return false;
        let volume = this.dbData.volume[this.selectedList[0]];
        return strategy.canBackup(volume, this.dbData.vm)
      },
      canDeleteList() {
        if (!this.isSelected) return false;
        return strategy.canDeleteList(this.selectedList, this.volume, this.dbData.vm)
      },
      pageResizeVolume() {
        const self = this;
        let uuid = this.selectedList[0];
        let volume = this.volume[uuid];
        self.resizeVolumeMessage = {
          volume
        };
        self.showResizeVolumeDlg = true;
        // self.openDialog('VolumeChangeSizeDlg', {
        //   volume,
        //   ok: (uuid, size) => {
        //     if (volume.type === 'Root') {
        //       return self.resizeRootVolume(uuid, size).then(() => {
        //         return self.queryList()
        //       })
        //     } else {
        //       return self.resizeVolume(uuid, size).then(() => {
        //         return self.queryList()
        //       })
        //     }
        //   }
        // })
      },
      canResizeVolume() {
        if (!this.isSingleSelected) return false;
        let volume = this.volume[this.selectedList[0]];
        return strategy.canResize(volume, this.dbData.vm, this.dbData.primarystorage)
      },
      isAttachedVmStopped() {
        let volume = this.volume[this.selectedList[0]];
        let result = false;
        if (volume && volume.vmInstanceUuid) {
          let vm = this.dbData.vm[volume.vmInstanceUuid];
          if (vm && vm.state === 'Stopped') result = true
        } else {
          result = true
        }
        return result
      },
      canAttach: function () {
        if (!this.isSelected) return false;
        return strategy.canAttachList(this.selectedList, this.volume)
      },
      canMigrate: function () {
        if (!this.isSingleSelected) return false;
        return strategy.canMigrate(this.volume[this.selectedList[0]])
      },
      canDetach: function () {
        if (!this.isSingleSelected) return false;
        return strategy.canDetach(this.volume[this.selectedList[0]], this.dbData.vm)
      },
      canDetachList: function () {
        if (!this.isSelected) return false;
        return strategy.canDetachList(this.selectedList, this.volume, this.dbData.vm)
      },
      pageRecover: function () {
        const self = this;
        let uuidList = self.selectedList;
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: "volume.recover",
            description: "volume.info.recoverConfirm",
            icon: 'volume_popupico',
            getName: (uuid) => {
              return self.dbData.volume[uuid].name
            },
            uuidList,
            ok: () => {
              self.recover(uuidList).then(() => self.queryList())
            }
          })
        }
      },
      canStart() {
        let self = this;
        if (!self.isSelected) return false;
        return self.selectedList.some((item) => {
          return self.dbData.volume[item].state === 'Disabled'
        })
      },
      canStop() {
        let self = this;
        if (!self.isSelected) return false;
        return self.selectedList.some((item) => {
          return self.dbData.volume[item].state !== 'Disabled'
        })
      },
      startVolume() {
        let uuidList = [];
        this.selectedList.forEach((uuid) => {
          if (this.volume[uuid].state !== 'Enabled') uuidList.push(uuid)
        });
        if (uuidList.length > 0) this.dispatchActionWithEvent('volume/enable', uuidList).then( () => {this.queryList();})
      },
      stopVolume() {
        let uuidList = [];
        this.selectedList.forEach((uuid) => {
          if (this.volume[uuid].state !== 'Disabled') uuidList.push(uuid)
        });
        if (uuidList.length > 0) this.dispatchActionWithEvent('volume/disable', uuidList).then( () => {this.queryList();})
      },
      openCreateVolumeDlg: function () {
        this.openFullMainWindow('CreateVolumeDlg', {
          ok: (param) => {
            this.create(param)
              .then(() => {
                this.queryList()
              })
          }
        })
      },
      attachToVolume: async function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length === 1) {
          let volumeUuid = uuidList[0];
          return rpc.query(`volumes/${volumeUuid}/candidate-vm-instances`)
            .then((resp) => {
              let attachableVmUuidList = resp.inventories.map((item) => item.uuid);
              if (self.volume[volumeUuid].isShareable) {
                self.openDialog('VmInstanceMultiSelectListDlg', {
                  conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM'],
                  select: (uuidList) => self.attachToVm(volumeUuid, uuidList).then(() => self.queryList())
                })
              } else {
                self.openDialog('VmSingleSelectListDlg', {
                  conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM'],
                  ok: (uuid) => self.attachToVm(volumeUuid, [uuid]).then(() => self.queryList())
                })
              }
            })
        } else {
          let attachableVmUuidList = [];
          let VmUuidList = [];
          let tasks = [];
          let p = null;
          uuidList.forEach((uuid, index) => {
            p = rpc.query(`volumes/${uuid}/candidate-vm-instances`)
              .then((resp) => {
                attachableVmUuidList = attachableVmUuidList.concat(resp.inventories.map((item) => item.uuid))
              });
            tasks.push(p)
          });
          return Promise.all(tasks).then(() => {
            VmUuidList = _.uniq(attachableVmUuidList);
            self.openDialog('VmSingleSelectListDlg', {
              conditions: [`uuid?=${VmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM'],
              ok: (uuid) => self.multipleAttachToVm(uuidList, uuid).then(() => self.queryList())
            })
          })
        }
      },
      pageDetach: function () {
        if (this.isSingleSelected && this.volume[this.selectedUuidList[0]].isShareable) {
          let selectedUuidList = this.selectedUuidList;
          let vmUuidList = [];
          if (this.volume[selectedUuidList[0]].vmInstanceUuid) {
            vmUuidList = [this.volume[selectedUuidList[0]].vmInstanceUuid]
          } else if (this.volume[selectedUuidList[0]].vmInstanceUuidList) {
            vmUuidList = this.volume[selectedUuidList[0]].vmInstanceUuidList
          }
          this.openSideWindow('VmInstanceMultiSelectListDlg', {
            conditions: [`uuid?=${vmUuidList.join(',')}`],
            ok: (uuidList) => {
              this.detachSharebelVolume(selectedUuidList[0], uuidList).then(() => {
                for (let volumeUuid of selectedUuidList) {
                  this.updateVolumeVms(volumeUuid, uuidList)
                }
                this.queryList()
              })
            }
          })
        } else {
          let uuidList = this.selectedUuidList;
          if (uuidList.length > 0) {
            this.openDialog('ConfirmDlg', {
              title: 'vm.volume.detach',
              description: 'volume.detachVolume',
              uuidList: uuidList,
              icon: 'volume_popupico',
              ok: () => {
                this.detach(uuidList).then(() => this.queryList())
              },
              getName: (uuid) => {
                return this.dbData.volume[uuid].name
              }
            })
          }
        }
      },
      pageChangeResourceOwner: async function () {
        const self = this;
        self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList, true)
      },
      getAttachedVmName: function (item) {
        if (item.vmInstanceName) {
          return item.vmInstanceName
        }
        return this.$t('common.noAttach')
      },
      canStorageMigrate: function () {
        if (!this.isSingleSelected) return false;
        let volume = this.volume[this.selectedList[0]];
        if (!volume) return false;
        return strategy.canStorageMigrate(volume, this.dbData.vm, this.dbData.primarystorage)
      },
      getVmInstanceName: function (uuid) {
        let value;
        try {
          value = this.dbData.vm[uuid].name
        } catch (e) {
          if (this.checkBounce(`getVmInstanceName-${uuid}`)) return '';
          value = '';
          rpc.queryResourceNames(this, 'vm', uuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      pageCreateScheduler: function () {
        if (!this.isSingleSelected) return;
        let selectedUuidList = this.selectedList;
        let create = (param) => this.createVolumeScheduler(selectedUuidList[0], param);
        this.openDialog('CreateSchedulerForVolume', {
          dataUuid: selectedUuidList[0],
          ok: create
        })
          .then((dialogUuid) => {
            let dialogList = _.cloneDeep(this.windowData.dialogList);
            dialogList.push(dialogUuid);
            this.updateWindow({dialogList});
            this._updateWindow({
              id: dialogUuid,
              left: this.$el.offsetLeft,
              top: this.$el.offsetTop,
              right: 0,
              bottom: 0
            })
          })
      },
      pageCreateVolumeSnapshot: function () {
        let self = this;
        if (!self.isSingleSelected) return;
        self.createSnapMessage = {
          vmInstanceUuid: self.selectedList[0],
        };
        self.showCreateSnap = true;
      },
      expungeVolume: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          return this.openDialog('ConfirmDlg', {
            title: 'volume.expunge',
            description: 'volume.info.expungeConfirm',
            uuidList: uuidList,
            icon: 'volume_popupico',
            getName: (uuid) => {
              return this.volume[uuid].name
            },
            ok: () => {
              self.expunge(uuidList)
                .then(() => {
                  self.queryList()
                })
            }
          })
        }
      },
      pageSetVolumeTotalBandwidth: function () {
        if (!this.isSingleSelected) return;
        let selectedUuidList = this.selectedList;
        this.openDialog('SetTotalBandwidthDlg', {
          ok: (msg) => this.setVolumeQos(msg, selectedUuidList[0])
        })
      },
      openStorageMigrateDataVolumeDlg() {
        const self = this;
        let volumeUuid = self.selectedList[0];
        let volume = self.volume[volumeUuid];
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
        })
      },
      pageMigrate: async function (volumeUuid) {
        if (this.volume[volumeUuid].vmInstanceUuid) {
          this.openDialog('RemindMigrateVolumeConfirmDlg', {});
          return
        }
        rpc.query(`volumes/${volumeUuid}/migration-target-hosts`)
          .then((resp) => {
            let hostUuidList = resp.inventories.map((item) => item.uuid);
            this.openDialog('HostListMultiSelectDlg', {
              hostUuidList: hostUuidList,
              select: (hostUuid) => this.migrateVolume(volumeUuid, hostUuid).then(() => {
                if (!this.interval) {
                  return this.queryList()
                }
              })
            })
          })
      },
      detailVolume(uuid) {
        let self = this;
        self.$router.push({name: 'detailVolume', params: {uuid}})
      },
      ...Utils
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) {
          this.queryList();
          this.extraDataUuidList = []
        }
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) {
          this.queryList();
          this.extraDataUuidList = []
        }
      },
      // selectedList: function (val, oldVal) {
      //   if (_.isEqual(val, oldVal)) return
      //   if (val.length <= 0) return
      //   this.dispatchAction('volume/getExtraData', val)
      // }
    }
  }
</script>
