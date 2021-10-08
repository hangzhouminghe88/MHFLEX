import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import Methods from './Methods';
export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      getList: 'hybridHuaweiSecurityGroup/getList'
    })
  },
  methods: {
    //查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' || self.search !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },
    //查询列表数据
    queryList() {
      let self =  this;
      self.dispatchAction(`hybridHuaweiSecurityGroup/basicQuery`, {
        limit: self.windowData.pageIndex,
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
        q: self.getCondition()
      }).then((resp) => {
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        })
      }).then ( () => {
        self.itemList =  self.getList(self.windowData.uuidList)
        self.windowData.loading = false;
      }).catch( (e) => {
        self.windowData.loading = false;
      })
    },
    //删除安全组
    pageDelete() {
      let _this = this, uuidList = [];
      if(!_this.isSelected) return;
      uuidList = _this.windowData.selectedUuidList;
      _this.openDialog('ConfirmDlg', {
        title: 'hybridesecuritygroup.deleteSecurityGroup',
        description: 'hybridesecuritygroup.delete',
        icon: 'sg_popupico',
        uuidList,
        isChecked: true,
        warning: 'hybridSecurityGroupRule.info.deleteWarning',
        checkBoxText: '同时删除华为云上资源',
        getName: (uuid) => {
          return _this.dbData.hybridHuaweiSecurityGroup[uuid].name;
        },
        ok: (isDeleteOrigin) => {
          _this.delete(uuidList, isDeleteOrigin);
        }
      })
    }
  }
}
