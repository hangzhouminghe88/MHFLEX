import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import Methods from './Methods';
export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      getList: 'hybridHuaweiBucket/getList'
    })
  },
  methods: {
    getCondition() {
      let _this = this, conditionList = [];
      if(_this.selectVal !== '' && _this.searchStr !== '') {
        conditionList = conditionList.concat(`${_this.selectVal}~=${_this.searchStr}`);
      }
      return conditionList;
    },
    queryList() {
      let _this = this;
      _this.windowData.loading = true;
      _this.dispatchAction('hybridHuaweiBucket/basicQuery', {
        limit: _this.windowData.pageSize,
        start: (_this.windowData.pageIndex - 1) * _this.windowData.pageSize,
        sort: `${_this.windowData.sortDirection}${_this.windowData.sortBy}`,
        q: _this.getCondition()
      }).then((resp) => {
          return _this.updateWindow({
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            uuidList: resp.uuidList,
            availableCount: resp.total
          })
      }).then(() => {
        _this.itemList = _this.getList(_this.windowData.uuidList);
        _this.windowData.loading = false;
      }).catch(() => {
        _this.windowData.loading = false;
      })
    },
    //设为默认
    pageAttach () {
      let _this = this
      if (!_this.isSelected || _this.selectedList.length <= 0) return
      _this.attach(_this.selectedList)
           .then(() => {
             _this.queryList();
           })
    },
    //删除oBs桶
    pageDelete() {
      let _this  = this, uuidList = [];
      if(!_this.isSelected) return;
      uuidList = _this.selectedList;
      _this.openDialog('ConfirmDlg', {
        title: '删除Bucket',
          description: 'hybridbucket.delete',
          icon: 'zone_popupico',
					uuidList,
					isChecked: true,
          checkBoxText: '确定要删除华为云上的资源吗?',
          getName: (uuid) => {
            return _this.dbData.hybridHuaweiBucket[uuid].name;
          },
          ok: (isOrigin) => {
            _this.delete(uuidList, isOrigin)
                 .then(() => {
                   _this.queryList();
                 });
          }
      })
    }
  }
}
