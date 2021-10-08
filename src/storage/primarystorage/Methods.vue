<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      create: function (param) {
        let event = this.createEvent('primaryStorage.action.add', param.name);
        let pathType = param.type;
        if (param.type === 'SharedBlock') {
          pathType = 'sharedblockgroup'
        } else if (param.type === 'AliyunNAS') {
          pathType = 'aliyun/nas'
        } else if (param.type === 'AliyunEBS') {
          pathType = 'aliyun/ebs'
        }
        return rpc.create(`primary-storage/${pathType}`, param, event).then(resp => {
          this.incEventSuccess(event);
          return this.updateDbRow({
            tableName: 'primarystorage',
            id: resp.inventory.uuid,
            data: resp.inventory
          }).then(() => {
            // updateCount only been invoked when creating Resource in List Page
            if (param.clusterUuid && this.attach) {
              return this.attach(resp.inventory.uuid, [param.clusterUuid]).then(() => {
                let psUuid = resp.inventory.uuid;
                return rpc.query('primary-storage', {
                  q: `uuid=${psUuid}`
                }).then((resp) => {

                  return this.updateDbRow({
                    tableName: 'primarystorage',
                    id: psUuid,
                    data: resp.inventories[0]
                  })
                })
              })
            } else {
              return Promise.resolve()
            }
          })
        }, () => {
          this.incEventFail(event)
        })
      },
      delete: function (uuidList) {
        const self = this;
        let event = self.createEvent('primaryStorage.action.delete', uuidList.length === 1 ? self.dbData.primarystorage[uuidList[0]].name : '', uuidList.length);
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            console.log(rpc);
            rpc._delete(`primary-storage/${uuid}`, null, event)
              .then((resp) => {
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid);
                let newTable = _.cloneDeep(self.windowData.table);
                delete newTable[uuid];
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                });
                self.incEventSuccess(event);
                self.updateCount();
                self.queryList()
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      enable: function (uuidList, fn) {
        const self = this;
        let event = self.createEvent('primaryStorage.action.enable', uuidList.length === 1 ? self.dbData.primarystorage[uuidList[0]].name : '', uuidList.length);
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('primary-storage', uuid, {
              'changePrimaryStorageState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event);
               if(fn) fn();

                /*
                self.updateDbRow({
                  tableName: 'primarystorage',
                  id: uuid,
                  data: resp.inventory
                })*/
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      disable: function (uuidList, fn) {
        const self = this;
        let event = self.createEvent('primaryStorage.action.disable', uuidList.length === 1 ? self.dbData.primarystorage[uuidList[0]].name : '', uuidList.length);
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc.update('primary-storage', uuid, {
              'changePrimaryStorageState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event);
                if(fn) fn();

                /*
                self.updateDbRow({
                  tableName: 'primarystorage',
                  id: uuid,
                  data: resp.inventory
                })*/


              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      maintain: function (uuidList) {
        const self = this;
        let event = self.createEvent('primaryStorage.action.maintain', uuidList.length === 1 ? self.dbData.primarystorage[uuidList[0]].name : '', uuidList.length);
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            if (self.dbData.primarystorage[uuid].status === 'Disconnected') return;
            rpc.update('primary-storage', uuid, {
              'changePrimaryStorageState': {
                'stateEvent': 'maintain'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event);
                self.updateDbRow({
                  tableName: 'primarystorage',
                  id: uuid,
                  data: resp.inventory
                });
                self.queryList();
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      attach: function (primarystorageUuid, clusterList) {
        const self = this;

        let event = this.createEvent('primaryStorage.action.attach', clusterList.length > 1 ? '' : this.dbData.primarystorage[primarystorageUuid].name, clusterList.length);
        let tasks = [];
        let p = null;
        clusterList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.create(`clusters/${uuid}/primary-storage/${primarystorageUuid}`, {}, event)
              .then((resp) => {
                self.incEventSuccess(event);
                self.updateDbRow({
                  tableName: 'primarystorage',
                  id: primarystorageUuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              });
            tasks.push(p)
          })(uuid)
        });
        return Promise.all(tasks)
      },
      detach: function (primarystorageUuid, clusterList) {
        const self = this;
        let event = this.createEvent('primaryStorage.action.detach', clusterList.length > 1 ? '' : self.dbData.primarystorage[primarystorageUuid].name, clusterList.length);
        let tasks = [];
        let p = null;
        clusterList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`clusters/${uuid}/primary-storage/${primarystorageUuid}`, {}, event)
              .then((resp) => {
                self.incEventSuccess(event);
                self.updateDbRow({
                  tableName: 'primarystorage',
                  id: primarystorageUuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              });
            tasks.push(p)
          })(uuid)
        });
        return Promise.all(tasks)
      },
      detailDelete: function (uuid) {
        let uuidList = [];
        uuidList.push(uuid);
        let self = this
        let hasCluster=false;
        uuidList.forEach((uuid) => {
          if (this.dbData.primarystorage[uuid].attachedClusterUuids && this.dbData.primarystorage[uuid].attachedClusterUuids.length>0) {
            hasCluster = true;
          }
        });
        self.openDialog('ConfirmDlg',{
          title: 'common.destroyPrimaryStorage',
          description: 'primaryStorage.deletePS',
          uuidList: uuidList,
          icon: 'storage_popupico',
          warning: hasCluster ?'primaryStorage.deleteWarningThree':'primaryStorage.deleteWarning',
          ok: () => {
            if(!hasCluster)
              self.delete(uuidList);
          },
          getName: (uuid) => {
            return self.dbData.primarystorage[uuid].name;
          }
        })
      },
      pageCreateVolume: function () {
        let psUuid = this.selectedList[0];
        this.detailCreateVolume(psUuid)
      },
      createVolume: async function (param) {
        let self = this;
        let event = self.createEvent('volume.action.add', param.name);
        let msg = {
          name: param.name,
          description: param.description
        };
        let createPath;
        msg.systemTags = [];
        if (param.VirtioSCSI) {
          msg.systemTags.push('capability::virtio-scsi');
          if (param.shareable) {
            msg.systemTags.push('ephemeral::shareable')
          }
        }
        let ps;
        if (param.primaryStorageUuid) {
          msg.primaryStorageUuid = param.primaryStorageUuid;
          ps = self.dbData.primarystorage[param.primaryStorageUuid]
        }
        if (ps && ps.type === 'Ceph' && param.poolName) {
          msg.systemTags.push('ceph::pool::' + param.poolName)
        }
        // create volume by volumeOffering
        if (param.diskOfferingUuid) {
          msg.diskOfferingUuid = param.diskOfferingUuid;
          createPath = 'volumes/data';
          if (ps && ps.type === 'LocalStorage') {
            msg.systemTags.push('localStorage::hostUuid::' + param.hostUuid + '')
          }
        }
        // create volume by volumeImage
        if (param.volumeImageUuid) {
          createPath = `volumes/data/from/data-volume-templates/${param.volumeImageUuid}`;
          if (param.hostUuid) {
            msg.hostUuid = param.hostUuid
          }
        }
        let tagUuidList;
        if (param.tagUuidList) {
          tagUuidList = param.tagUuidList;
          delete param.tagUuidList
        }
        let resp;
        try {
          resp = await rpc.create(createPath, msg, event);
          self.incEventSuccess(event);
          let volumeUuid = resp.inventory.uuid;
          let paramList = tagUuidList.map(tagUuid => {
            return {
              tagUuid,
              resourceUuidList: [volumeUuid]
            }
          });
          self.dispatchActionWithEvent('tag/attach', paramList)
        } catch (e) {
          self.incEventFail(event);
          return
        }
        let dataVolumeUuid = resp.inventory.uuid;
        if (param.vmInstanceUuid) {
          let attachVolumeToVm = self.createEvent('volume.action.attachToVm', param.name);
          rpc.create(`volumes/${dataVolumeUuid}/vm-instances/${param.vmInstanceUuid}`, '', attachVolumeToVm)
            .then(resp => {
              self.incEventSuccess(attachVolumeToVm);
              self.updateDbRow({
                tableName: 'volume',
                id: resp.inventory.uuid,
                data: resp.inventory
              })
            }, () => {
              self.incEventFail(attachVolumeToVm);
              rpc.query('volumes', {
                q: `uuid=${resp.inventory.uuid}`
              }).then(resp => {
                self.updateDbRow({
                  tableName: 'volume',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
              })
            })
        } else {
          self.updateDbRow({
            tableName: 'volume',
            id: resp.inventory.uuid,
            data: resp.inventory
          })
        }
      },
      detailMaintain: function (uuid) {
        let uuidList = [];
        uuidList.push(uuid);
        let self = this;
        this.openDialog('ConfirmDlg', {
          uuidList: uuidList,
          title: 'common.intoMaintain',
          description: 'primaryStorage.maintainPs',
          icon: 'storage_popupico',
          warning:'primaryStorage.maintainPsWarning',
          ok: () => {
            self.maintain(uuidList).then(() => {
              self.query()
            })
          },
          getName: (uuid) => {
            return self.dbData.primarystorage[uuid].name;
          }
        })
      },
      pageDelete: function () {
        let self = this
        let uuidList = self.selectedList;
        let hasCluster=false;

        uuidList.forEach((uuid) => {
              if (this.dbData.primarystorage[uuid].attachedClusterUuids && this.dbData.primarystorage[uuid].attachedClusterUuids.length>0) {
                hasCluster = true;
              }
        });

        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'common.destroyPrimaryStorage',
            description: 'primaryStorage.deletePS',
            uuidList: uuidList,
            icon: 'storage_popupico',
            warning:hasCluster?'primaryStorage.deleteWarningThree':'primaryStorage.deleteWarning',
            ok: () => {
              if(!hasCluster)
                self.delete(uuidList);
            },
            getName: (uuid) => {
              return self.dbData.primarystorage[uuid].name;
            }
          })
        }

      },
      pageEnable: function () {
        let uuidList = this.selectedList;
        if (uuidList.length > 0) {
          this.enable(uuidList, this.queryList)
        }
      },
      pageDisable: function () {

        let self = this;
        let uuidList = self.selectedList;

        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'primaryStorage.disable',
            description: 'primaryStorage.disablePS',
            uuidList: uuidList,
            icon: 'storage_popupico',
            ok: () => {
              self.disable(uuidList, this.queryList);
            },
            getName: (uuid) => {
              return self.dbData.primarystorage[uuid].name;
            }
          })
        }
      },
      attachDataClustertoPrimaryStorage: function (clusterUuidList, primarystorageUuid) {
        let event = this.createEvent('primaryStorage.action.attach', clusterUuidList.length > 1 ? '' : this.dbData.primarystorage[primarystorageUuid].name, clusterUuidList.length);
        const self = this;
        let tasks = [];
        let p = null;
        clusterUuidList.forEach((uuid) => {
          p = rpc.create(`clusters/${uuid}/primary-storage/${primarystorageUuid}`, {}, event)
            .then((resp) => {
              self.incEventSuccess(event);
              self.updateDbRow({
                tableName: 'primarystorage',
                id: primarystorageUuid,
                data: resp.inventory
              })
            }, () => {
              self.incEventFail(event)
            });
          tasks.push(p)
        });
        self.closeDialog(this.windowData.dialogList[0]);
        return Promise.all(tasks)
      },
      detachDataClustertoPrimaryStorage: function (clusterList, primarystorageUuid) {
        const self = this;
        let event = self.createEvent('primaryStorage.action.detach', clusterList.length > 1 ? '' : self.dbData.primarystorage[primarystorageUuid].name, clusterList.length);
        let tasks = [];
        let p = null;
        clusterList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`clusters/${uuid}/primary-storage/${primarystorageUuid}`, {}, event)
              .then((resp) => {
                self.incEventSuccess(event);
                self.updateDbRow({
                  tableName: 'primarystorage',
                  id: primarystorageUuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              });
            tasks.push(p)
          })(uuid)
        });
        return Promise.all(tasks)
      },
      detailCreateVolume: function (psUuid) {
        const self = this;
        self.$router.push({
          name: 'createvolume',
          params: {
            primaryStorageUuid: psUuid
          }
        })
      },
      detailStart: function (uuid) {
        let uuidlist = [];
        uuidlist.push(uuid);
        this.enable(uuidlist, this.query)
      },
      detailStop: function (uuid) {
        let uuidList = [];
        uuidList.push(uuid);
        let self = this
        self.openDialog('ConfirmDlg', {
          title: 'primaryStorage.disable',
          description: 'primaryStorage.disablePS',
          icon: 'storage_popupico',
          uuidList,
          ok: () => {
            self.disable(uuidList, self.query)
          },
          getName: (uuid) => {
            return self.dbData.primarystorage[uuid].name;
          }
        })
      },
      reconnect (uuidList) {
        const self = this;
        let event = self.createEvent('primaryStorage.action.reconnect', uuidList.length === 1 ? self.dbData.primarystorage[uuidList[0]].name : '', uuidList.length);
        let tasks = [];
        let p = null;
        uuidList.forEach(uuid => {
          let psInventory = _.cloneDeep(self.dbData.primarystorage[uuid]);
          psInventory.status = 'Connecting';
          self.updateDbRow({
            tableName: 'primarystorage',
            id: uuid,
            data: psInventory
          });
          p = rpc.update('primary-storage', uuid, {
            'reconnectPrimaryStorage': {}
          }, event).then(() => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          });
          tasks.push(p)
        });
        return Promise.all(tasks)
      },
      getPrimaryStorageGatewayCidr: function (uuid) {
        const self = this;
        let value;
        try {
          value = self.dbData.primarystorage[uuid].primaryStorageGatewayCidr;
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (self.checkBounce(`getPrimaryStorageGatewayCidr-${uuid}`)) return '';
          value = '';
          return rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=primaryStorage::gateway::cidr::%25']
          })
            .then((resp) => {
              let primarystorage = _.cloneDeep(self.dbData.primarystorage[uuid]);
              if (resp.inventories.length > 0) {
                primarystorage.primaryStorageGatewayCidr = resp.inventories[0].tag.split('::')[3];
                return self.updateDbRow({
                  tableName: 'primarystorage',
                  id: uuid,
                  data: primarystorage
                })
              } else {
                return ''
              }
            })
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getRootVolumePoolName: function (uuid) {
        let value;
        const self = this;
        try {
          value = self.dbData.primarystorage[uuid].rootVolumePoolName;
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (this.checkBounce(`getRootVolumePoolName-${uuid}`)) return '';
          value = '';
          return rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=ceph::default::rootVolumePoolName::%25']
          })
            .then((resp) => {
              let primarystorage = _.cloneDeep(self.dbData.primarystorage[uuid]);
              if (resp.inventories.length > 0) {
                primarystorage.rootVolumePoolName = resp.inventories[0].tag.split('::')[3];
                return this.updateDbRow({
                  tableName: 'primarystorage',
                  id: uuid,
                  data: primarystorage
                })
              } else {
                return ''
              }
            }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getDataVolumePoolName: function (uuid) {
        let value;
        const self = this;
        try {
          value = self.dbData.primarystorage[uuid].dataVolumePoolName;
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (this.checkBounce(`getDataVolumePoolName-${uuid}`)) return '';
          value = '';
          return rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=ceph::default::dataVolumePoolName::%25']
          })
            .then((resp) => {
              let primarystorage = _.cloneDeep(self.dbData.primarystorage[uuid]);
              if (resp.inventories.length > 0) {
                primarystorage.dataVolumePoolName = resp.inventories[0].tag.split('::')[3];
                return this.updateDbRow({
                  tableName: 'primarystorage',
                  id: uuid,
                  data: primarystorage
                })
              } else {
                return ''
              }
            }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      getImageCachePoolName: function (uuid) {
        let value;
        const self = this;
        try {
          value = self.dbData.primarystorage[uuid].imageCachePoolName;
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (this.checkBounce(`getImageCachePoolName-${uuid}`)) return '';
          value = '';
          return rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=PrimaryStorageVO', 'tag~=ceph::default::imageCachePoolName::%25']
          })
            .then((resp) => {
              let primarystorage = _.cloneDeep(self.dbData.primarystorage[uuid]);
              if (resp.inventories.length > 0) {
                primarystorage.imageCachePoolName = resp.inventories[0].tag.split('::')[3];
                return this.updateDbRow({
                  tableName: 'primarystorage',
                  id: uuid,
                  data: primarystorage
                })
              } else {
                return ''
              }
            }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      pageMaintain: function () {
        let self = this;
        let uuidList = self.selectedList;

        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'common.intoMaintain',
            description: 'primaryStorage.maintainPs',
            uuidList: uuidList,
            icon: 'storage_popupico',
            ok: () => {
              self.maintain(uuidList);
            },
            getName: (uuid) => {
              return self.dbData.primarystorage[uuid].name;
            }
          })

        }
      },
      openCreatePrimaryStorage: function (curSelectZoneUuid) {
        this.$router.push({name:'createprimarystorage', params:{zoneUuid: curSelectZoneUuid}});

        /*
        this.openFullMainWindow('CreatePrimaryStorageDlg', {
          ok: (param) => {
            this.create(param).then(() => {
              if (this.queryList) {
                this.queryList()
              }
            })
          },
          ZoneUuid: curSelectZoneUuid })*/
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        });
        this.queryList()
      },
      updateCount: function () {
        rpc.query('primary-storage', {
          replyWithCount: true,
          q: [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      ...Utils
    }
  }
</script>
