<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import VolumeList from 'src/ecs/volume/List';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VolumeTabListService",
    mixins: [MultiSelectList, WindowBase,VolumeList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    data(){
      let self = this;
      return{
        itemList: [],
        volumeList: [],
        dataSource:{
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              onClick: (item) =>{self.$router.push({name: 'detailVolume', params: {uuid: item.uuid}})},
              className: 'link',
              field: 'name'
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('common.type'),
              field: 'type'
            },
            {
              getContent: item => self.getField('size', item),
              getHeaderContent: self.$t('common.size'),
              field: 'size'
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              field: 'status'
            },
            {
              getContent: item => self.getField('isShareable', item),
              getHeaderContent: self.$t('common.sharedVolume'),
              field: 'isShareable'
            },
            {
              getContent: item => self.getField('primaryStorageName', item),
              getHeaderContent: self.$t('common.primaryStorage'),
              field: 'primaryStorageName'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate'
            }
          ]
        }
      }
    },

    created(){
      let self = this, vmInstanceUuid = '';
      vmInstanceUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        vmInstanceUuid,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: []
      }).then(() => {
        self.init();
      })
    },

    methods: {
      ...Utils,
      getField(field , item){
        let self = this;
        if(_.isUndefined(item[field])) return '';
        let normalList = ['name', 'state', 'status', 'type', 'primaryStorageName'];
        if(_.includes(normalList, field)) return item[field];
        if(field === 'size') return self.bytesToSize(item[field]);
        if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
        if(field === 'isShareable') return item.isShareable ? self.$t('common.yes') :  self.$t('common.no');
      },

      getCondition () {
        let conditionList = []
        let volumeUuidList = this.volumeList.map((item) => item.uuid)
        conditionList.push(`uuid?=${volumeUuidList}`)
        return conditionList
      },
      init() {
        let volumeList = []
        let taskList = []
        let p = rpc.query('volumes', {
          q: `vmInstanceUuid=${this.windowData.vmInstanceUuid}`,
          fields: 'uuid'
        }).then((resp) => {
          volumeList = volumeList.concat(resp.inventories)
        })
        taskList.push(p)
        p = rpc.query('volumes/vm-instances/refs', {
          q: `vmInstanceUuid=${this.windowData.vmInstanceUuid}`,
          fields: 'volumeUuid'
        }).then((resp) => {
          resp.inventories.forEach((item) => {
            item.uuid = item.volumeUuid
            delete item.volumeUuid
          })
          volumeList = volumeList.concat(resp.inventories)
        })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          _.uniqBy(volumeList, 'uuid')
          this.volumeList = volumeList
          this.queryList()
        })
      },

      inStates(){
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        let uuid = this.windowData.vmInstanceUuid
        if(!this.dbData.vm[uuid]) return false;
        let resp = false
        if (!stateList.every((item, index, array) => { return item !== this.dbData.vm[uuid].state })) resp = true
        return resp
      },

      //判断选中的云盘是否是root盘
      isRootVolume(){
        let self = this;
        if(self.isSelected && self.windowData.selectedUuidList){
          return self.windowData.selectedUuidList.some((uuid) => this.dbData.volume[uuid].type === 'Root')
        }
        return false;
      },
      //加载云盘
      attach(){
        let self = this
        self.openDialog('VolumeMultiSelectListDlg', {
          uuid: [self.windowData.vmInstanceUuid],
          ok: (volumeUuidList) => self.attachDataVolumeToVm(volumeUuidList, self.windowData.vmInstanceUuid).then(() => {
            self.init()
          })
        })
      },
      //卸载云盘
      detach() {
        let self = this
        if (!self.isSelected) return
        let uuidList = []
        self.selectedList.forEach((uuid) => {
          if (self.dbData.volume[uuid].vmInstanceUuid) {
            uuidList.push(uuid)
          }
        })
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'vm.volume.detach',
            icon: 'volume_popupico',
            uuidList,
            ok: () => {
              self.detachDataVolumeFromVm(uuidList, self.windowData.vmInstanceUuid)
                .then(() => {
                  self.init()
                })
            },
            getName(uuid){
              return self.dbData.volume[uuid].name;
            },
            description: 'volume.detachVolume'
          })
        }
      },

      detachDataVolumeFromVm: function (volumeUuidList, vmInstanceUuid) {
        let event = this.createEvent('vm.action.detachDataVolumeFromVm', this.dbData.volume[volumeUuidList[0]] ? this.dbData.volume[volumeUuidList[0]].name : '', volumeUuidList.length)
        const self = this
        let tasks = []
        volumeUuidList.forEach(function (uuid) {
          let p = rpc._delete(`volumes/${uuid}/vm-instances`, {vmUuid: vmInstanceUuid}, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },

      //创建
      vmCreateVolume() {
        let self = this;
        self.param.createVolume({
          vmUuid: this.windowData.vmInstanceUuid,
          ok: (param) => {
            this.createVolume(this.windowData.vmInstanceUuid,param)
          }
        });
      },
      //创建云盘
      createVolume (vmInstanceUuid, param) {
        const self = this
        let msg = {
          name: param.name,
          description: param.description
        }
        msg.systemTags = []
        let event = self.createEvent('volume.action.create', param.name)
        let createPath
        // create volume by volumeOffering
        if (param.diskOfferingUuid) {
          if (param.VirtioSCSI) {
            msg.systemTags.push('capability::virtio-scsi')
            if (param.shareable) {
              msg.systemTags.push('ephemeral::shareable')
            }
          }
          msg.diskOfferingUuid = param.diskOfferingUuid
          createPath = 'volumes/data'
          if (param.primaryStorageUuid) {
            msg.primaryStorageUuid = param.primaryStorageUuid
            if (self.dbData.primarystorage[msg.primaryStorageUuid].type === 'LocalStorage') {
              msg.systemTags.push('localStorage::hostUuid::' + param.hostUuid + '')
            }
          }
        }
        // create volume by volumeImage
        if (param.volumeImageUuid) {
          createPath = `volumes/data/from/data-volume-templates/${param.volumeImageUuid}`
          msg.primaryStorageUuid = param.primaryStorageUuid
          if (self.dbData.primarystorage[msg.primaryStorageUuid].type === 'LocalStorage') {
            msg.hostUuid = param.hostUuid
          }
        }
        if (param.poolName) {
          msg.systemTags.push(`ceph::pool::${param.poolName}`)
        }
        return rpc.create(createPath, msg, event)
          .then((resp) => {
            self.incEventSuccess(event)
            event = self.createEvent('volume.action.attachToVm', param.name)
            return rpc.create(`volumes/${resp.inventory.uuid}/vm-instances/${vmInstanceUuid}`, '', event)
              .then((resp) => {
                self.incEventSuccess(event)
                let uuidList = self.windowData.uuidList.slice()
                uuidList.unshift(resp.inventory.uuid)
                let row = {}
                row[resp.inventory.uuid] = {}
                row[resp.inventory.uuid].selected = false
                let table = Object.assign({}, { ...self.windowData.table }, row)
                self.updateWindow({ uuidList, table })
                self.updateDbTable({
                  tableName: 'volume',
                  list: [resp.inventory]
                }).then(() => {
                  self.itemList = this.get(this.windowData.uuidList);
                  if (self.dbData.common.isOpensource) return new Promise((resolve, reject) => { resolve() })
                  return rpc.query(`volumes/${resp.inventory.uuid}/qos`).then(qosResp => {
                    return self.updateDbRow({
                      tableName: 'volumesQos',
                      id: resp.inventory.uuid,
                      data: {
                        volumeBandwidth: qosResp.volumeBandwidth
                      }
                    }).then(() => {
                      self.itemList = this.get(this.windowData.uuidList);
                    })
                  })
                })
              }, () => {
                self.incEventFail(event)
              })
          }, () => {
            self.incEventFail(event)
          })
      },
    }
  }
</script>
