import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import Utils from 'src/utils/utils';
import rpc from 'src/utils/rpc';
import Methods from './Methods';

export default {
  components: {PageTemplate},
  mixins: [MultiSelectList, WindowBase, Methods, PageBase],
  data(){
    let self = this;
    return{
      selectVal: 'name',
      searchStr: '',
      conditionNameList: [
        {name: 'common.name', value: 'name'},
        {name: 'common.uuid', value: 'uuid'}
      ],
      currTab: 'available',
      itemList: [],
      dataSource: {
        getItemList: () => self.itemList,
        handleSelection: self.handleSelect,
        handleSort: self.handleSort,
        type: 'selection',
        fields: [
          {
            getContent: item => self.getField('name', item),
            getHeaderContent: self.$t('common.name'),
            onClick: (item) => {
              self.$router.push({name: 'detailvCenterVolume', params:{uuid: item.uuid}})
            },
            className: 'link',
            sortable: true,
            field: 'name',
            tooltip: true
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
            getContent: item => self.getField('sharedVolume', item),
            getHeaderContent: self.$t('common.sharedVolume'),
            field: 'sharedVolume'
          },
          {
            getContent: item => self.getField('vm', item),
            getHeaderContent: self.$t('common.vm'),
            field: 'vm',
            sortable: true
          },
          {
            getContent: item => self.getField('primarystorage', item),
            getHeaderContent: self.$t('common.primarystorage'),
            field: 'primarystorage'
          },
          {
            getContent: item => self.getField('vCenter', item),
            field: 'vCenter',
            renderHeader: self.handleRenderHeader
          },
          {
            getContent: item => self.getField('state', item),
            getHeaderContent: self.$t('common.state'),
            field: 'state'
          },
          {
            getContent: item => self.getField('status',  item),
            getHeaderContent: self.$t('common.status'),
            field: 'status'
          },
          {
            getContent: item => self.getField('owner',  item),
            getHeaderContent: self.$t('common.owner'),
            field: 'owner'
          },
          {
            getContent: item => self.getField('createDate',  item),
            getHeaderContent: self.$t('common.createDate'),
            field: 'createDate',
            sortable: true
          }
        ]
      },
      selectedVCenterUuid: '',
      availableResourceUuids: [],
    }
  },

  created(){
    let self = this;
    self.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(self);
    self.updateWindow({
      pageIndex: 1,
      pageSize: 10,
      sortBy: 'createDate',
      sortDirection: '-',
      selectedUuidList: [],
      searchConditionList: [`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`],
      loading: false,
      methods: {
        queryList: self.queryList
      }
    }).then(() => {
      self.queryList();
    })
  },

  methods: {
    ...Utils,

    getField(field, item) {
      let self = this;
      if (_.isUndefined(item)) return '';
      let normalFiled = ['name', 'type', 'state', 'state', 'status'];
      if(normalFiled.includes(field)) return item[field];
      if(field === 'size') return self.bytesToSize(item[field]);
      if(field === 'sharedVolume') return !!self.dbData.volume[item.uuid].isShareable ? self.$t('common.true') : self.$t('common.no');
      if(field === 'vm') return self.getAttachedVmName(item.uuid);
      if(field === 'primarystorage') return self.getPsName(item.uuid);
      if(field === 'vCenter') return self.dbData.volumeA[item.uuid]
        && self.dbData.volumeA[item.uuid].vCenterUuid
        && self.dbData.vCenters[self.dbData.volumeA[item.uuid].vCenterUuid]
        && self.dbData.vCenters[self.dbData.volumeA[item.uuid].vCenterUuid].name;
      if(field === 'owner') return self.getResourceOwner(item.uuid);
      if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
    },

    getAttachedVmName(uuid) {
      let volume = this.dbData.volume[uuid]
      if (volume.vmInstanceUuid) {
        return volume.isShareable ? this.getVmInstanceName(volume.vmInstanceUuid[0]) : this.getVmInstanceName(volume.vmInstanceUuid)
      } else return this.$t('common.noAttach')
    },

    handleRenderHeader(h, {column, $index}) {
      let self = this;
      return h('el-dropdown',
        {
          on: {
            'command': self.selectVCenter
          }
        },
        [
          h('span', [
              [self.$t(`common.vCenter`)],
              h('i', {
                staticClass: 'el-icon-caret-bottom'
              })
            ]
          ),
          h('el-dropdown-menu', {
              attrs: {
                trigger: "hover",
                placement: 'bottom',
                slot: "dropdown"
              },
            },
            [
              self.vcenterList.map((item) => {
                return (
                  h('el-dropdown-item', {
                    attrs: {
                      command: item.uuid
                    }
                  }, [self.$t(item.name)])
                )
              })
            ])
        ])
    },

    selectVCenter (uuid) {
      this.selectedVCenterUuid = uuid
      let selectedPs = []
      if (uuid === 'all') {
        this.selectedVCenterUuid = ''
        this.availableResourceUuids = []
        return this.queryList()
      }
      return rpc.query('primary-storage', {q: 'type=VCenter'}).then(resp => {
        resp.inventories.forEach(ps => {
          if (ps.vCenterUuid === uuid) {
            selectedPs.push(ps.uuid)
          }
        })
      }).then(() => {
        return rpc.query('volumes', {q: `primaryStorageUuid?=${selectedPs}`}).then(resp => {
          this.availableResourceUuids = resp.inventories.map(volume => volume.uuid)
        })
      }).then(() => {
        return this.queryList()
      })
    },

    handleChangeTab(e){
      let self = this;
      self.itemList = [];
      self.currTab = e.name;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        searchConditionList: [`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`],
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.queryList();
      })
    },

    inStates(){
      let statesList = [], self = this;
      if(arguments){
        for(let arg in arguments){
          statesList.push(arguments[arg]);
        }
      }
      let instate = self.selectedList.every((uuid) => {
        return statesList.some((state) => self.dbData.volume[uuid].state === state);
      })
      return instate;
    },

    pageStartOrStop (param) {
      let uuidList = []
      this.selectedList.forEach((uuid) => {
        if ((this.dbData.volume[uuid].state).toLocaleLowerCase() !== param) uuidList.push(uuid)
      })
      if (uuidList.length > 0) this[param](uuidList, this.queryList)
    },

    canAttach() {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return false
      for (let i = self.selectedList.length - 1; i >= 0; i--) {
        let volume = self.dbData.volume[self.selectedList[i]]
        if (!volume.isShareable && volume.vmInstanceUuid) return false
        if (volume.state !== 'Enabled' || ['Ready', 'NotInstantiated'].indexOf(volume.status) === -1) return false
      }
      return true
    },

    canDetach() {
      if (!this.isSingleSelected) return
      let volume = this.dbData.volume[this.selectedList[0]]
      if (volume && !this.dbData.volume[this.selectedList[0]].vmInstanceUuid) return false
      return true
    },

    pageAttachToVm: async function () {
      let uuidList = []
      this.selectedList.forEach(uuid => {
          uuidList.push(uuid)
      })
      let self = this
      if (uuidList.length === 1) {
        let volumeUuid = uuidList[0]
        return rpc.query(`volumes/${volumeUuid}/candidate-vm-instances`)
          .then((resp) => {
            let attachableVmUuidList = resp.inventories.map((item) => item.uuid)
            if (self.dbData.volume[volumeUuid].isShareable) {
              self.openDialog('VmInstanceMultiSelectListDlg', {
                conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=ESX'],
                select: (uuidList) => self.attachToVm(volumeUuid, uuidList).then(() => self.queryList())
              })
            } else {
              self.openDialog('VmSingleSelectListDlg', {
                conditions: [`uuid?=${attachableVmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=ESX'],
                ok: (uuid) => self.attachToVm(volumeUuid, [uuid]).then(() => self.queryList())
              })
            }
          })
      } else {
        let attachableVmUuidList = []
        let VmUuidList = []
        let tasks = []
        let p = null
        uuidList.forEach((uuid, index) => {
          attachableVmUuidList[index] = []
          p = rpc.query(`volumes/${uuid}/candidate-vm-instances`)
            .then((resp) => {
              attachableVmUuidList[index] = resp.inventories.map((item) => item.uuid)
            })
          tasks.push(p)
        })
        return Promise.all(tasks).then(() => {
          VmUuidList = attachableVmUuidList[attachableVmUuidList.length - 1]
          for (let i = attachableVmUuidList.length - 2; i >= 0; i--) {
            VmUuidList = _.intersection(attachableVmUuidList[i], VmUuidList)
          }
          self.openDialog('VmSingleSelectListDlg', {
            conditions: [`uuid?=${VmUuidList}`, 'type=UserVm', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'hypervisorType=ESX'],
            ok: (uuid) => self.multipleAttachToVm(uuidList, uuid).then(() => self.queryList())
          })
        })
      }
    },

    pageDetach: function () {
      if (this.isSingleSelected && this.dbData.volume[this.selectedList[0]].isShareable) {
        let selectedUuidList = this.selectedList
        this.openDialog('VmInstanceMultiSelectListDlg', {
          conditions: [`uuid?=${this.dbData.volume[selectedUuidList[0]].vmInstanceUuid}`],
          ok: (uuidList) => {
            this.detachSharebelVolume(selectedUuidList[0], uuidList).then(() => this.queryList())
          }
        })
      } else {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.volume[uuid].vmInstanceUuid && !this.dbData.volume[uuid].isShareable) {
            uuidList.push(uuid)
          }
        })
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg',{
            title: 'vm.volume.detach',
            description: 'volume.detachVolume',
            uuidList: uuidList,
            icon: 'volume_popupico',
            ok: () => {
              this.detach(uuidList).then(() => this.queryList())
            },
            getName: (uuid) =>{
              return this.dbData.volume[uuid].name;
            }
          })
        }
      }
    },

    pageChangeResourceOwner: async function () {
      const self = this
      if (!self.selectedList || self.selectedList.length <= 0) return
      self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList)
    },

    pageDelete(){
      let uuidList = []
      this.selectedList.forEach((uuid) => {
        uuidList.push(uuid)
      })
      let self = this
      if (uuidList.length > 0) {
        this.openDialog('ConfirmDlg', {
          title: 'volume.delete',
          description: 'volume.info.deleteConfirm',
          icon: 'volume_popupico',
          warning: 'volume.deleteWarning',
          uuidList,
          ok: () => {
            self.delete(uuidList)
              .then(() => {
                self.queryList()
              })
          },
          getName: (uuid) => {
            return self.dbData.volume[uuid].name;
          }
        })
      }
    },

    pageExpunge: function () {
      let uuidList = []
      this.selectedList.forEach((uuid) => {
        uuidList.push(uuid)
      })
      let self = this
      if (uuidList.length > 0) {
        this.openDialog('ConfirmDlg', {
          title: 'volume.delete',
          description: 'volume.info.deleteConfirm',
          icon: 'volume_popupico',
          warning: 'volume.deleteWarning',
          uuidList,
          ok: () => {
            self.expunge(uuidList)
              .then(() =>{
                self.queryList();
              })
          },
          getName: (uuid) => {
            return self.dbData.volume[uuid].name;
          }
        })
      }
    },

    pageRecover() {
      let uuidList = []
      this.selectedList.forEach((uuid) => {
         uuidList.push(uuid)
      })
      if (uuidList.length > 0) this.recover(uuidList).then(() =>{
        this.queryList();
      })
    },

    goToCreate(){
      let self = this;
      self.$router.push({name: 'createvCenterVolume'})
    }
  },

  computed: {
    vcenterList () {
      let list = _.values(this.dbData.vCenters)
      list.sort((a, b) => {
        if (!a.name && b.name) return -1
        if (a.name && !b.name) return 1
        if (!a.name && !b.name) return 0
        return a.name.localeCompare(b.name)
      })
      list.unshift({name: 'operationLog.all', uuid: 'all'})
      return list
    },
    total(){
      let self = this, total = 0;
      switch (self.currTab) {
        case 'available':
        total = self.windowData.availableCount ? self.windowData.availableCount : 0;
        break;
        case 'destroyed':
        total = self.windowData.destroyedCount ? self.windowData.destroyedCount : 0;
        break;
        case 'NotInstantiated':
        total = self.windowData.notInstantiatedCount ? self.windowData.notInstantiatedCount : 0;
        break;
      }
      return total;
    }
  }
}
