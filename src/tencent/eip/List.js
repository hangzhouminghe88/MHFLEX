import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
import rpc from 'src/utils/rpc';
import Methods from './Methods';

export  default {
   mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridTencentEip/getList'
		}),
		 //是否可以绑定ecs
		 isAttachEip () {
      let self = this
      if (!self.isSelected) return false
      let resp = false
      self.selectedList.forEach((uuid) => {
        if (_.has(self.dbData.hybridTencentEip[uuid], 'allocateResourceUuid')) resp = true
      })
      return resp
    },
  },

  methods: {
    //查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },
    //查询列表
    queryList() {
      let self = this;
      self.windowData.loading = true;
      self.itemList = [];
      return self.dispatchAction('hybridTencentEip/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      }).then(resp => {
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        }).then(() => {
          self.itemList =  self.get(self.windowData.uuidList)
					setTimeout(() => {
						self.itemList =  self.get(self.windowData.uuidList)
					}, 500);
					self.windowData.loading = false;
        })
      }).catch((e) => {
        self.windowData.loading = false;
      })
    },
    //绑定ecs
    pageAttach() {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return
      let selectedUuidList = self.selectedList
      let allocateResourceUuidList = []
      rpc.query('hybrid/tencent/eip')
        .then((resp) => {
          allocateResourceUuidList = resp.inventories.map(item => item.allocateResourceUuid)
          self.updateDbTable({
            tableName: 'hybridTencentEip',
            list: resp.inventories
          })
          self.openDialog('HybridTencentEcsInstanceSingleSelect', {
            conditions: [`uuid!?=${allocateResourceUuidList}`],
            select : (vmNicUuid) => self.attach(vmNicUuid, selectedUuidList).then(() => self.queryList())
          })
        })
    },
    //解绑ecs
    pageDetach() {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return
      let uuidList = []
      self.selectedList.forEach((uuid) => {
        if (_.has(self.dbData.hybridTencentEip[uuid], 'allocateResourceUuid')) uuidList.push(uuid)
      })
      self.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title: 'hybrideip.detachEip',
        description: 'hybrideip.detach',
        icon: 'eip_popupico',
        getName: (uuid) => {
          return this.dbData.hybridTencentEip[uuid].name.replace(/zstack/g, '');
        },
        ok: () => self.detach(uuidList).then(() => self.queryList())
      })
    },
    //删除
    pageDelete() {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return
      let uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        title:'hybrideip.delete',
        description: 'hybrideip.deleteEip',
        icon: 'eip_popupico',
        uuidList,
        isChecked: true,
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
          return this.dbData.hybridTencentEip[uuid].name.replace(/zstack/g, '');
        },
        ok: (isDeleteOrigin) => {
          self.delete(uuidList, isDeleteOrigin).then(() => self.queryList());
        }
      })
    }
  }
}
