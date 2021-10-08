<script>
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import vCenterMethods from 'src/vcenter/vCenterImage/Methods';
  import PageTemplate from 'src/component/PageTemplate';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "List",
    mixins: [WindowBase, MultiSelectList, vCenterMethods, PageBase],
    components: {PageTemplate},
    data() {
      let self = this;
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value:'uuid'}
        ],
        conditions: {
          'available': 'status!=Deleted',
          'destroyed': 'status=Deleted',
          'mine': 'status!=Deleted',
          'share': 'status!=Deleted'
        },
        changeResourceOwnerDlg: null,
        itemList: [],
        availableResourceUuids: [],
        selectedVCenterUuid: '',
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
                self.$router.push({name: 'detailvCenterImage', params: {uuid: item.uuid, currTab: self.windowData.currTab}});
              },
              className: 'link',
              field: 'name',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('platform', item),
              getHeaderContent: self.$t('common.platform'),
              field: 'platform'
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('common.type'),
              field: 'type'
            },
            {
              getContent: item => self.getField('format', item),
              getHeaderContent: self.$t('common.format'),
              field: 'format'
            },
            {
              getContent: item => self.getField('size', item),
              getHeaderContent: self.$t('common.size'),
              field: 'size'
            },
            {
              getContent: item => self.getField('backupstorage', item),
              getHeaderContent: self.$t('common.backupstorage'),
              field: 'backupstorage'
            },
            {
              getContent: item => self.getField('vCenter', item),
              renderHeader: self.handleRenderHeader,
              field: 'vCenter'
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
              getContent: item => self.getField('owner', item),
              getHeaderContent: self.$t('common.owner'),
              field: 'owner'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        }
      }
    },

    created() {
      let self = this;
      self.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
      let initTab
      if (self.dbData.common.isAdmin) {
        initTab = 'available'
      } else {
        initTab = 'mine'
      }
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        showSearchBox: false,
        currTab: initTab,
        conditions: this.conditions[initTab],
        showMoreDropdown: false,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.updateWindow({conditions: ['format=vmtx', 'status!=Deleted']})
        this.queryList()
      })
      rpc.query('images', {
        count: true,
        q: [this.conditions.destroyed, 'system=false', 'format=vmtx', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`]
      }).then((resp) => {
        this.updateWindow({destroyedCount: resp.total})
      })
    },

    methods: {
      getField(field, item) {
        let self = this;
        if(_.isUndefined(item)) return '';
        let normalFiles = ['name', 'status', 'state', 'format', 'platform'];
        if(_.includes(normalFiles, field)) return item[field];
        if(field === 'size') return self.bytesToSize(item[field]);
        if(field === 'backupstorage') return self.dbData.backupstorage[self.dbData.image[item.uuid].backupStorageRefs[0].backupStorageUuid].name;
        if(field === 'type') return self.dbData.image[item.uuid].mediaType === 'DataVolumeTemplate' ? self.$t('image.volumeImage') : self.$t('image.systemImage');
        if(field === 'vCenter') return self.dbData.imageA[item.uuid]
          && self.dbData.imageA[item.uuid].vCenterUuid
          && self.dbData.vCenters[self.dbData.imageA[item.uuid].vCenterUuid]
          && self.dbData.vCenters[self.dbData.imageA[item.uuid].vCenterUuid].name;
        if(field === 'owner') return self.getResourceOwner(item.uuid);
        if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
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

      selectVCenter(uuid) {
        this.selectedVCenterUuid = uuid
        let selectedBs = []
        if (uuid === 'all') {
          this.selectedVCenterUuid = ''
          this.availableResourceUuids = []
          return this.queryList()
        }
        return rpc.query('backup-storage', {q: 'type=VCenter'}).then(resp => {
          resp.inventories.forEach(bs => {
            if (bs.vCenterUuid === uuid) {
              selectedBs.push(bs.uuid)
            }
          })
        }).then(() => {
          return rpc.query('images', {q: `backupStorage.uuid?=${selectedBs}`}).then(resp => {
            this.availableResourceUuids = resp.inventories.map(image => image.uuid)
          })
        }).then(() => {
          return this.queryList()
        })
      },

      inStates() {
        let self = this, states = [], instate = false;
        if (arguments) {
          for (let arg in arguments) {
            states.push(arguments[arg]);
          }
        }
        instate = self.selectedList.every((uuid) => {
          return states.some(state => self.dbData.image[uuid].state === state);
        })
        return instate;
      },

      pageStartOrStop(param) {
        let uuidList = [], self = this;
        self.selectedList.forEach((uuid) => {
          if (self.dbData.image[uuid].state !== param) uuidList.push(uuid)
        })
        if (uuidList.length > 0) self[param.toLocaleLowerCase()](uuidList, self.queryList)
      },

      pageRecover() {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) this.recover(uuidList, self.queryList)
      },

      pageExpunge() {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'common.expungeImage',
            description: 'image.info.expungeConfirm',
            uuidList,
            icon: 'image_popupico',
            ok: () => {
              self.expunge(uuidList, self.queryList)
            },
            getName: (uuid)=> {
              return self.dbData.image[uuid].name;
            }
          })
        }
      },

      goToCreate(){
        let self = this;
        self.$router.push({name: 'createvCenterImage'})
      },

      hasSharedToAll () {
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },

      hasNotSharedToAll () {
        let list = this.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      },

      getSharedToAllList () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => this.dbData.image[uuid].toPublic)
          return list
        }
        return []
      },

      getNotSharedToAllList () {
        let uuidList = this.selectedList;
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => !this.dbData.image[uuid].toPublic)
          return list
        }
        return []
      },

      pageShareImageToAll() {
        let self = this
        let uuidList = this.getNotSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning: 'instanceOffering.shareToAllText',
            ok: () => {
              this.shareToAll(uuidList).then(() => self.queryList())
            }
          })
        }
      },

      pageRecallImageFromAll () {
        let self = this
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning: 'account.recall',
            ok: () => {
              this.recallFromAll(uuidList).then(() => self.queryList())
            }
          })
        }
      },

      pageChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList)
      },

      pageCanDelete: function () {
        let candelete = false, self = this;
        let uuidList = [];
        uuidList = self.selectedList;
        uuidList.forEach((uuid) => {
          if (this.canDelete(uuid)) {
            candelete = true
          }
        })
        return candelete
      },

      canDelete: async function (uuid) {
        if (this.dbData.common.isAdmin) return true
        let accountName = await this.getAccountName(uuid)
        return accountName === localStorage.getItem('accountName')
      },

      getAccountName (uuid) {
        let accountUuid = this.dbData.scheduler[uuid].jobData.accountUuid
        return _.get(this.dbData, `account[${accountUuid}].name`)
      },

      pageDelete: function () {
        let uuidList = [], self = this;
       uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'image.deleteImage',
            description: 'image.info.deleteConfirm',
            uuidList,
            icon: 'image_popupico',
            ok: () => {
              self.delete(uuidList)
                .then(() => {
                  self.queryList()
                })
            },
            getName: (uuid) => {
              return self.dbData.image[uuid].name;
            }
          })
        }
      },

      handleChangeTab(e){
        let self = this;
        self.itemList = [];
        self.updateWindow({
          pageIndex: 1,
          pageSize: 20,
          currItemUuid: '',
          showSearchBox: false,
          showMoreDropdown: false,
          sortBy: 'createDate',
          currTab: e.name,
          sortDirection: '-',
          selectedUuidList: [],
          loading: false,
          methods: {
            queryList: this.queryList
          }
        }).then(() => {
          this.queryList()
        })
      }
    },

    computed: {
      vcenterList() {
        let list = _.values(this.dbData.vCenters)
        list.sort((a, b) => {
          if (!a.name && b.name) return -1
          if (a.name && !b.name) return 1
          if (!a.name && !b.name) return 0
          return a.name.localeCompare(b.name)
        })
        list.unshift({name: 'operationLog.all', uuid: 'all'})
        return list
      }
    }
  }
</script>
