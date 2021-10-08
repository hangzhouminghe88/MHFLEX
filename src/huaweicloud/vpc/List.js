import Utils from 'src/utils/utils';
import {mapGetters} from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      getList: `hybridHuaweiVpc/getList`
    })
  },
  methods: {
    //查询条件
    getCondition() {
      let _this = this, conditionList = [];
      if(_this.selectVal !== '' && _this.searchStr !== '') {
        //拼接查询参数
        conditionList =  conditionList.concat(`${_this.selectVal}~=%25${_this.searchStr}%25`);
      }
      return conditionList;
    },
    //查询列表
    queryList() {
      let _this = this;
      _this.windowData.loading = true;
      _this.dispatchAction('hybridHuaweiVpc/basicQuery', {
        limit: _this.windowData.pageSize,
        start: (_this.windowData.pageIndex - 1) * _this.windowData.pageSize,
        sort: `${_this.windowData.sortDirection}${_this.windowData.sortBy}`,
        q: _this.getCondition()
      }).then((resp) => {
        return _this.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        })
      }).then ( () => {
        _this.itemList =  _this.getList(_this.windowData.uuidList)
        _this.windowData.loading = false;
      }).catch( (e) => {
        _this.windowData.loading = false;
      })
    },
    //删除vpc
    pageDelete() {
      let _this = this, uuidList = [];
      if(!_this.isSelected) return;
      uuidList = _this.selectedList;
      _this.openDialog('ConfirmDlg', {
        title:  _this.$t('hybridvirtualprivatecloud.DeleteVirtualPrivateCloud'),
        description:  'hybridvirtualprivatecloud.delete',
        icon: 'vpc_popupico',
        uuidList,
        isChecked: true,
        checkBoxText: '同时删除华为云上资源',
        warning: _this.$t('hybridvirtualprivatecloud.info.deleteWarning'),
        getName: (uuid) => {
          return _this.dbData.hybridHuaweiVirtualPrivateCloud[uuid].name;
        },
        ok: (isDeleteOrign) => {
           _this.delete(uuidList, isDeleteOrign)
                .then(() => {
                  _this.queryList();
                });
        }
      })
    }
  }
}
