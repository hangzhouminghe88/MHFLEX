<script>
  import WebStorageMethods from 'src/storage/sanstorage/Methods';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VmInstanceList from 'src/ecs/ecsInstance/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "vCenterVmTabService",
    mixins: [WindowBase, MultiSelectList, VmInstanceList],
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
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: [],
        dataSource:{
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true,
              className: 'link',
              onClick: (item) => {

              }
            },
            {
              getContent: item => self.getField('defaultL3NetworkIp', item),
              getHeaderContent: self.$t('common.defaultIp'),
              field: 'defaultIp'
            },
            {
              getContent: item => self.getField('currNetIp', item),
              getHeaderContent: self.$t('common.currNetIp'),
              field: 'currNetIp'
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => self.getField('ownerName', item),
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
    created(){
      let self = this, dataUuid = '';
      let isSubListOfL3Network = false
      if (self.param) {
        if (self.param.isSubListOfL3Network) isSubListOfL3Network = true
        if (self.param.uuid) dataUuid = self.param.uuid
      }
      self.updateWindow({
        dataUuid,
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        isSubListOfL3Network,
        selectedUuidList: [],
      }).then(() => {
        self.queryList()
      })
    },
    methods: {
      ...Utils,

      ...{
        getCandidateVmForLun: WebStorageMethods.methods.getCandidateVmForLun,
        getParamList: WebStorageMethods.methods.getParamList,
        attachLunToVm: WebStorageMethods.methods.attachVm,
        detachLunFromVm: WebStorageMethods.methods.detachVm
      },

      getField(field, item){
        let self = this;
        if(_.isUndefined(item)) return '';
        let normalField = ['name', 'state', 'ownerName'];
        if(normalField.includes(field)) return item[field];
        if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
        if(field === 'currNetIp') return self.getCurrNetIp(item.uuid);
        if(field === 'defaultL3NetworkIp') return item[field].join(',')
      },

      getCondition() {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        conditionList = conditionList.concat(this.getSearchCondition())
        return conditionList
      },

      getCurrNetIp (uuid) {
        const self = this
        let netUuid = self.windowData.dataUuid
        let ipList = []
        self.dbData.vm[uuid].vmNics.forEach((vmNic) => {
          ipList = ipList.concat(vmNic.usedIps.filter(it => it.l3NetworkUuid === netUuid))
        })
        if (ipList.length > 0) {
          return ipList[0].ip
        }
        return ''
      },

      pageAttachVm() {
        const self = this
        let uuid = self.windowData.dataUuid
        let l2NetworkUuid = self.dbData.l3network[uuid].l2NetworkUuid
        let clusterUuidList = self.dbData.l2network[l2NetworkUuid] ? self.dbData.l2network[l2NetworkUuid].attachedClusterUuids : undefined // APIQueryL2NetworkMsg is admin only
        let uuidList = []
        let tasks = []
        let unableConditions = ['type=UserVm', 'hypervisorType=KVM', `vmNics.usedIp.l3NetworkUuid=${uuid}`]
        if (self.dbData.common.isAdmin && clusterUuidList) {
          unableConditions.push(`rootVolume.primaryStorage.cluster.uuid?=${clusterUuidList}`)
        }
        let p = rpc.query('vm-instances', {
          q: unableConditions
        }).then((resp) => {
          let unableUuidList = resp.inventories.map(it => it.uuid)
          let conditions = ['type=UserVm', 'hypervisorType=KVM', `uuid!?=${unableUuidList}`]
          if (self.dbData.common.isAdmin && clusterUuidList) {
            conditions.push(`rootVolume.primaryStorage.cluster.uuid?=${clusterUuidList}`)
          }
          return rpc.query('vm-instances', {
            q: conditions
          }).then((resp) => {
            uuidList = uuidList.concat(resp.inventories.map(it => it.uuid))
          })
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          return self.openDialog('VmInstanceMultiSelectListDlg', {
            conditions: [`uuid?=${_.uniq(uuidList)}`, 'state?=Running,Stopped'],
            select: (vmUuidList) => {
              return self.attachL3NetworkToVm(vmUuidList).then(() => {
                return self.queryList()
              })
            }
          })
        })
      },

      pageDetachVm () {
        const self = this
        let selectedUuidList = self.selectedList
        let vmNicUuidList = selectedUuidList
          .map(uuid => self.dbData.vm[uuid].vmNics.filter(it => it.l3NetworkUuid === self.windowData.dataUuid)[0].uuid)
        return self.openDialog('ConfirmDlg',{
          title: 'vpcNetwork.detach',
          description: 'vpcNetwork.detachConfirm',
          uuidList: selectedUuidList,
          icon: 'vm_popupico',
          ok: () => {
            return self.detachL3NetworkFromVm(vmNicUuidList).then(() => {
              return self.queryList()
            })
          },
          getName(uuid){
            return self.dbData.vm[uuid].name;
          }
        })
      },

      async pageAttachVmByLun () {
        const self = this
        let lun = JSON.parse(self.param.lun)
        let vmUuids = self.getCandidateVmForLun(lun)
        return self.openDialog('VmInstanceMultiSelectListDlg', {
          conditions: [`uuid?=${vmUuids}`],
          select: vmUuidList => self.attachLunToVm(lun.uuid, vmUuidList).then(self.queryList)
        })
      },

      pageDetachVmByLun () {
        const self = this
        let lun = JSON.parse(self.param.lun)
        let selectedUuidList = self.selectedList
        let lunUuid = lun.uuid
        return self.openDialog('ConfirmDlg', {
          title: 'vpcNetwork.detach',
          description: 'vpcNetwork.detachConfirm',
          uuidList: selectedUuidList,
          icon: 'vm_popupico',
          ok: () => {
            return self.detachLunFromVm(lunUuid, selectedUuidList).then(() => {
              return self.queryList()
            })
          },
          getName(uuid){
            return self.dbData.vm[uuid].name;
          }
        })
      },
    }
  }
</script>

