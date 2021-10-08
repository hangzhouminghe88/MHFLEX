import  Methods from './Methods';
export default{
  mixins: [Methods],
  methods: {
    //查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },
    queryList() {
      let self = this;
      self.windowData.loading = true;
      self.itemList = [];
      return self.dispatchAction('hybridAliCloudFileSystem/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      }).then(resp => {
        self.windowData.loading = false;
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        }).then(() => {
          self.itemList = self.get(self.windowData.uuidList);
        })
      }).catch((e) => {
        self.windowData.loading = false;
      })
    },
    pageDelete() {
       let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.openDialog('ConfirmDlg', {
          title: 'nasFileSystem.delete',
          description: 'nasFileSystem.deleteConfirm',
          icon: 'pop_file_system_n',
          uuidList: selectedUuidList,
          ok: () => {
            this.delete(selectedUuidList).then(() => this.refresh())
          },
          getName(uuid) {
            return self.dbData.nasFileSystem[uuid].name;
          }
        })
    }
  },
}
