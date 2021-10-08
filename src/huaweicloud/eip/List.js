import Utils from 'src/utils/utils';
import {mapGetters} from 'vuex';
import Methods from './Methods';
import rpc from 'src/utils/rpc';
export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      getList: 'hybridHuaweiEip/getList'
    }),
  },
  methods: {
    isAttachEcs() {
      let _this = this;
      if(!_this.isSelected) return false;
      for(let i in _this.selectedList) {
        if(_.has(_this.dbData.hybridHuaweiEip[_this.selectedList[i]], 'allocateResourceUuid'))
        return true;
        else return false;
      }
    },
    getCondition() {
      let _this = this, conditionList = [];
      if(_this.selectVal !== '' || _this.searchStr !== '') {
        conditionList = conditionList.concat(`${_this.selectVal}~=%25${encodeURIComponent(_this.searchStr)}%25`);
      }
      return conditionList;
    },
    queryList() {
      let _this = this;
      _this.windowData.loading = true;
      _this.dispatchAction('hybridHuaweiEip/basicQuery', {
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
      }).then(() => {
        _this.itemList =  _this.getList(_this.windowData.uuidList)
        setTimeout(() => {
          _this.itemList =  _this.getList(_this.windowData.uuidList)
        }, 500);
        _this.windowData.loading = false;
      })
      .catch(() => {
        _this.windowData.loading = false;
      })
    },
    pageDelete() {
       let _this = this, uuidList = [];
       if(!_this.isSelected) return;
       uuidList = _this.selectedList;
       _this.openDialog('ConfirmDlg', {
        title:'hybrideip.delete',
        description: 'hybrideip.deleteEip',
        icon: 'eip_popupico',
        uuidList,
        isChecked: true,
        checkBoxText: '同时删除华为云上资源',
         getName: (uuid) => {
           return _this.dbData.hybridHuaweiEip[uuid].name.replace(/ZStack-/, '');
         },
         ok: (isDeleteOrigin) => {
            _this.delete(uuidList, isDeleteOrigin)
                 .then(() => _this.queryList());
         }
       })
     },
     pageAttach() {
       let _this = this, allocateResourceUuidList = [];
       if (!_this.isSelected || _this.selectedList.length <= 0) return
       let selectedUuidList = _this.selectedList
       rpc.query('hybrid/huawei/eip')
          .then((resp) => {
            allocateResourceUuidList = resp.inventories.map(item => item.allocateResourceUuid);
            _this.updateDbTable({
              tableName: 'hybridHuaweiEip',
              list: resp.inventories
            })
            _this.openDialog('HybridHuaweiEcsInstanceSingleSelect', {
              conditions: [`uuid!?=${allocateResourceUuidList}`],
              select : (vmNicUuid) => _this.attach(vmNicUuid, selectedUuidList).then(() => _this.queryList())
            })
          })
     },
     pageDetach() {
       let _this = this, uuidList = [];
      if (!_this.isSelected || _this.selectedList.length <= 0) return
      _this.selectedList.forEach((uuid) => {
        if (_.has(_this.dbData.hybridHuaweiEip[uuid], 'allocateResourceUuid')) uuidList.push(uuid)
      })
      _this.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title: 'hybrideip.detachEip',
        description: 'hybrideip.detach',
        icon: 'eip_popupico',
        getName: (uuid) => {
          return _this.dbData.hybridHuaweiEip[uuid].name.replace(/zstack/g, '');
        },
        ok: () => _this.detach(uuidList).then(() => _this.queryList())
      })
     }
  }
}
