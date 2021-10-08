<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  // import strategy from 'src/strategies/volume/strategy'
  /* global localStorage:false */

  export default {
    methods: {
      query (uuid) {
        this.dispatchAction('volume/query', uuid)
      },
      getResourceOwner: function () {
        const self = this;
        let value = '';
        try {
          value = this.model.ownerName;
          if (self.dbData.accountA[this.model.accountUuid].projectName) {
            value = self.dbData.accountA[this.model.accountUuid].projectName
          }
        } catch (e) {
        }
        return value
      },
      cancelVolumeQos (uuidList) {
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            mode: 'all'
          }
        });
        return this.dispatchActionWithEvent('volume/removeQos', paramList)
      },
      setVolumeQos (bandWidth, uuidList) {
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            mode: bandWidth.mode,
            volumeBandwidth: bandWidth.volumeBandwidth
          }
        });
        return this.dispatchActionWithEvent('volume/setQos', paramList)
      },
      getPsName (uuid) {
        let value;
        try {
          value = this.dbData.primarystorage[this.dbData.volume[uuid].primaryStorageUuid].name
        } catch (e) {
          if (this.checkBounce(`getPsName-${uuid}`)) return '';
          value = '';
          rpc.queryResourceNames(this, 'primarystorage', this.dbData.volume[uuid].primaryStorageUuid)
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      createImageFromVolume (param) {
        let jobUuid = this.genUniqueId();
        param.jobUuid = jobUuid;
        param.uuid = param.volumeUuid;
        param.format = 'qcow2';
        if (param.volumeType.toLowerCase() === 'root') {
          param.rootVolumeUuid = _.cloneDeep(param.volumeUuid);
          // delete param.volumeUuid
          param.mediaType = 'RootVolumeTemplate'
        } else {
          param.mediaType = 'DataVolumeTemplate'
        }
        delete param.volumeType;
        return this.dispatchActionWithEvent('volume/createImage', {
          uuid: param.volumeUuid,
          jobUuid,
          param
        }, {tableName: 'image', resourceUuid: jobUuid, jobUuid})
      },
      create: async function (param) {
        let volume = await this.dispatchActionWithEvent('volume/create', param);
        if (!param.vmInstanceUuid) return volume;
        try {
          let msg = await this.dispatchActionWithEvent('volume/attach', {
            uuid: volume.uuid,
            vmUuid: param.vmInstanceUuid
          });
          volume = _.values(msg)[0]
        } catch (e) {
          await this.dispatchActionWithEvent('volume/delete', volume.uuid);
          await this.dispatchActionWithEvent('volume/expunge', volume.uuid);
          return
        }
        this.queryList();
        return volume
      },
      queryResourceProgress () {
        this.interval = setInterval(() => {
          return this.queryAllProgresses('volumeProgress', ['Migrating'], 'status')
        }, 4000)
      },
      delete: function (uuidList) {
        const self = this;
        let event = self.createEvent('volume.action.delete', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length);
        let tasks = [];
        let p = null;
        uuidList.forEach(uuid => {
          let notInstantiated = false;
          if (self.dbData.volume[uuid].status === 'NotInstantiated') {
            notInstantiated = true
          }
          let volumeInventory = _.cloneDeep(self.dbData.volume[uuid]);
          volumeInventory.state = 'Destroying';
          self.updateDbRow({
            tableName: 'volume',
            id: uuid,
            data: volumeInventory
          });
          p = rpc._delete(`volumes/${uuid}`, null, event).then(() => {
            if (notInstantiated) {
              try {
                rpc.update('volumes', uuid, {
                  'expungeDataVolume': {}
                }).then((resp) => {
                  console.log(resp)
                })
              } catch (err) {
                console.log(err)
              }
            }
            self.incEventSuccess(event);
            volumeInventory.vmInstanceUuid = '';
            return this.updateDbRow({
              tableName: 'volume',
              id: uuid,
              data: volumeInventory
            })
          }, () => {
            self.incEventFail(event)
          });
          tasks.push(p)
        });
        return Promise.all(tasks)
      },
      start: function (uuidList) {
        const self = this;
        let event = self.createEvent('volume.action.enable', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length);
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let volumeInventory = _.cloneDeep(self.dbData.volume[uuid]);
            volumeInventory.state = 'Starting';
            self.updateDbRow({
              tableName: 'volume',
              id: uuid,
              data: volumeInventory
            });
            rpc.update('volumes', uuid, {
              'changeVolumeState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event);
                self.updateDbRow({
                  tableName: 'volume',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      stop: function (uuidList) {
        const self = this;
        let event = self.createEvent('volume.action.disable', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length);
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let volumeInventory = _.cloneDeep(self.dbData.volume[uuid]);
            volumeInventory.state = 'Stopping';
            self.updateDbRow({
              tableName: 'volume',
              id: uuid,
              data: volumeInventory
            });
            rpc.update('volumes', uuid, {
              'changeVolumeState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event);
                self.updateDbRow({
                  tableName: 'volume',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      recover: function (uuidList) {
        return this.dispatchActionWithEvent('volume/recover', uuidList)
      },
      attachToVm: function (uuid, vmUuidList) {
        let paramList = vmUuidList.map(vmUuid => {
          return {
            uuid,
            vmUuid
          }
        });
        return this.dispatchActionWithEvent('volume/attach', paramList)
      },
      multipleAttachToVm: function (volumeUuidList, vmUuid) {
        let paramList = volumeUuidList.map(uuid => {
          return {
            uuid,
            vmUuid
          }
        });
        return this.dispatchActionWithEvent('volume/attach', paramList)
      },
      updateVolumeVms: function (volumeUuid, vmUuidList) {
        let self = this;
        let volume = self.dbData.volume[volumeUuid];
        let vmInstanceUuids = volume.vmInstanceUuid;
        if (typeof (vmInstanceUuids) === 'string') {
          if (vmUuidList.indexOf(vmInstanceUuids) > -1) {
            volume.vmInstanceUuid = null
          }
        } else if (Array.isArray(vmInstanceUuids)) {
          vmUuidList.forEach((uuid) => {
            for (let i = vmInstanceUuids.length - 1; i >= 0; i--) {
              if (uuid === vmInstanceUuids[i]) {
                vmInstanceUuids.splice(i, 1)
              }
            }
          });
          if (vmInstanceUuids.length > 0) {
            volume.vmInstanceUuid = vmInstanceUuids
          } else {
            volume.vmInstanceUuid = null
          }
        }
      },
      detachSharebelVolume: function (volume, vm) {
        let vmUuidList = [];
        if (_.isString(vm)) {
          vmUuidList = [vm]
        } else {
          vmUuidList = vm
        }
        let volumeUuidList = [];
        if (_.isString(volume)) {
          volumeUuidList = [volume]
        } else {
          volumeUuidList = volume
        }
        return this.dispatchActionWithEvent('volume/detachShareable', {
            volumeUuidList,
            vmUuidList
          }, undefined,
          this.createEvent('action.volume.detachShareable', '', volumeUuidList.length * vmUuidList.length))
      },
      detach: function (uuidList) {
        return this.dispatchActionWithEvent('volume/detach', uuidList)
      },
      expunge: function (uuidList) {
        return this.dispatchActionWithEvent('volume/expunge', uuidList)
      },
      createVolumeScheduler: function (volumeUuid, param) {
        let scheduler = param.scheduler;
        let event = this.createEvent('volume.action.createScheduler', this.dbData.volume[volumeUuid].name);
        delete param.scheduler;
        return rpc.create(`volumes/${volumeUuid}/schedulers/${scheduler}`, param, event)
          .then((resp) => {
            this.updateDbRow({
              tableName: 'scheduler',
              id: resp.uuid,
              data: resp.inventory
            });
            this.incEventSuccess(event)
          }, () => {
            this.incEventFail(event)
          })
      },
      createVolumeSnapshot: function (param, uuid) {
        return this.dispatchActionWithEvent('volume/createSnapshot', {
          uuid,
          param
        })
      },
      changeResourceOwner: async function (uuidList, accountUuid) {
        uuidList = await this.uniqCurrentAccountResources(uuidList, accountUuid);
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            accountUuid
          }
        });
        return this.dispatchActionWithEvent('volume/changeOwner', paramList)
      },
      changeResourceToAccountOrProject: async function (uuidList, accountUuid) {
        uuidList = await this.uniqCurrentAccountResources(uuidList, accountUuid);
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            accountUuid
          }
        });
        return this.dispatchActionWithEvent('volume/changeOwner', paramList)
      },
      migrateVolume: function (uuid, hostUuid) {
        let jobUuid = this.genUniqueId();
        this.setJobUuid(uuid, 'Migrating', jobUuid);
        if (!this.interval) {
          setTimeout(this.queryResourceProgress, 1000)
        }
        return this.dispatchActionWithEvent('volume/migrate', {
          uuid,
          hostUuid,
          jobUuid
        }).catch(e => {
          this.deleteJobUuid(uuid, jobUuid)
        })
      },
      updateCount: function () {
        rpc.query('volumes', {
          count: true,
          limit: 100000,
          q: ['status!=Deleted', 'status!=NotInstantiated', 'type=Data', `primaryStorage.zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'format!=vmtx']
            .concat(this.windowData.searchConditionList ? this.windowData.searchConditionList : [])
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          });
        rpc.query('volumes', {
          count: true,
          limit: 100000,
          q: ['status=Deleted', 'type=Data', `primaryStorage.zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'format!=vmtx']
            .concat(this.windowData.searchConditionList ? this.windowData.searchConditionList : [])
        })
          .then((resp) => {
            this.updateWindow({
              destroyedCount: resp.total
            })
          });
        rpc.query('volumes', {
          count: true,
          limit: 100000,
          q: ['status=NotInstantiated', 'type=Data']
            .concat(this.windowData.searchConditionList ? this.windowData.searchConditionList : [])
        })
          .then((resp) => {
            this.updateWindow({
              notInstantiatedCount: resp.total
            })
          })
      },
      createSnapshot: function (volumeUuid, param) {
        let event = this.createEvent('volume.action.createSnapshot', param.name);
        rpc.create(`volumes/${volumeUuid}/volume-snapshots`, {
          'name': param.name,
          'description': param.description
        }, event).then((resp) => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        }).then(() => {
          this.query()
        })
      },
      resizeVolume: function (uuid, size) {
        return this.dispatchActionWithEvent('volume/resize', { uuid, size })
      },
      resizeRootVolume: function (uuid, size) {
        return this.dispatchActionWithEvent('volume/resizeRoot', { uuid, size })
      },
      storageMigrateDataVolume: function (primaryStorageUuid, volumeUuid) {
        let jobUuid = this.genUniqueId();
        return this.dispatchActionWithEvent('volume/storageMigrate', {
          // uuid for getting name
          uuid: volumeUuid,
          jobUuid,
          param: {'volumeUuid': volumeUuid, 'dstPrimaryStorageUuid': primaryStorageUuid}
        }, {tableName: 'volume', resourceUuid: volumeUuid, jobUuid})
      },
      getVolumeAttachVmUuid: function (uuid) {
        let value;
        let self = this;
        if (self.dbData.volume[uuid].isShareable) {
          if (self.dbData.volume[uuid].vmInstanceUuid) {
            value = self.dbData.volume[uuid].vmInstanceUuid
          } else {
            if (self.checkBounce(`getVolumeAttachVmUuid-${uuid}`)) return '';
            value = '';
            rpc.query('volumes/vm-instances/refs', {
              q: `volumeUuid=${uuid}`
            })
              .then((resp) => {
                value = resp.inventories.length === 0 ? '' : resp.inventories[0].vmInstanceUuid;
                self.dbData.volume[uuid].vmInstanceUuid = value
              })
              .then(() => this.$nextTick(this.$forceUpdate))
          }
          return value
        } else {
          value = self.dbData.volume[uuid].vmInstanceUuid;
          return value
        }
      },
      backupInHybrid: function (uuidList, param) {
        const self = this;
        // let event = self.createEvent('hybridBackup.action.backupVolume', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length)
        let id = `assistant-${this.genUniqueId()}`;
        self.createAssistant({
          id,
          hide: false,
          operation: 'skipTo',
          title: 'backupTitle',
          ownerId: self.windowData.id,
          content: 'skipToDisasterBackup',
          handler: () => {
            this.$router.push('/main/hybridbackup')
          }
        });
        let paramList = uuidList.map(uuid => {
          return {
            uuid,
            param
          }
        });
        return this.dispatchActionWithEvent('volume/backup', paramList)
          .then(() => {
            setTimeout(() => self.deleteAssistant(id), 3000)
          })
      },
      pageBackupInHybrid: function (uuidList) {
        const self = this;
        self.openFullMainWindow('CreateHybridBackupDlg', {
          ok: (param) => {
            self.backupInHybrid(uuidList, param)
          }
        })
      },
      backup: function (uuidList, param) {
        const self = this;
        let event = self.createEvent('hybridBackup.action.backupVolume', uuidList.length === 1 ? self.dbData.volume[uuidList[0]].name : '', uuidList.length);
        let tasks = [];
        let sync = param.sync;
        delete param.sync;
        uuidList.forEach(uuid => {
          let p = rpc.create(`volumes/${uuid}/volume-backups`, param, event).then(resp => {
            self.incEventSuccess(event);
            if (sync) {
              let backupId = resp.inventory.uuid;
              let localBsId = resp.inventory.backupStorageRefs[0].backupStorageUuid;
              let remoteBsId = _.keys(this.dbData.remoteBackupStorage)[0];
              let name = resp.inventory.name;
              return self.sync(backupId, localBsId, remoteBsId, name)
            }
          }, () => {
            self.incEventFail(event)
          });
          tasks.push(p)
        });
        return Promise.all(tasks)
      },
      sync (uuid, srcBackupStorageUuid, remoteBsUuid, name) {
        let event = this.createEvent('backupData.action.sync', name);
        return rpc.update('volume-backups', uuid, {
          'syncBackupFromImageStoreBackupStorage': {
            srcBackupStorageUuid: srcBackupStorageUuid,
            dstBackupStorageUuid: remoteBsUuid
          }
        }, event).then(() => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        })
      },
      pageBackup (uuidList) {
        const self = this;
        self.openFullPanel('windows/BackupData/components/CreateBackup', {
          ok: (param) => {
            self.backup(uuidList, param).then(() => {
              self.refreshChild(self.backupDataAssignedId)
            })
          }
        })
      },
      canCreateAdditionalCon: function (volume) {
        return strategy.canCreateShareableVolumeImage(volume, this.dbData.primarystorage[volume.primaryStorageUuid])
      },
      ...Utils
    }
  }
</script>

