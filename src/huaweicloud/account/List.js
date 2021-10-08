import {accountKeyAssistant } from './assistant/AccountKeyAssistant';
import Utils from "../../utils/utils";
import {mapGetters} from "vuex";
import Methods from './Methods';

export  default {
  name: 'AccountKeyList',
  mixins: [Methods],
  //计算列表数据
  computed: {
    ...mapGetters({
      get:'hybridHuaWeiAccountKey/getList'
    })
  },
  methods: {
    //获得查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList;
    },
    //查询列表
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridHuaWeiAccountKey/basicQuery', {
        limit: self.windowData.pageSize,
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        replyWidthCount: true,
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
        q: self.getCondition()
      }).then( (resp) => {
        self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        }).then( () => {
          self.itemList = self.get(self.windowData.uuidList);
          self.windowData.loading = false;
        })
      }).catch(() => {
        self.windowData.loading = false;
      })
    },
    //绑定
    pageAttach(){
      const that = this;
      if(!that.isSelected || that.selectedList.length <= 0) return
      that.attach(that.selectedList).then(()=>{
         that.queryList()
        if(accountKeyAssistant){
          accountKeyAssistant(that)
        }
      })
    },
    //解绑
    pageDetach(){
      const self = this
      if(!self.isSelected || self.selectedList.length <= 0) return
      self.openDialog('ConfirmDlg', {
        title: 'hybridTencentKey.detachAccessKey',
        description: 'hybridHuaweiyunKey.Detach_Account',
        icon: 'access_key_popupico',
        warning: 'hybridHuaweiyunKey.info.deleteWarning',
        uuidList: self.selectedList,
        getName: (uuid) => {
          return self.dbData.hybridHuaweiyunKeySecret[uuid].name;;
        },
        ok: () => {
          self.detach(self.selectedList)
            .then( () => {
              self.queryList()
              if(accountKeyAssistant)
                accountKeyAssistant(self);
            })
        }
      })
    },
    //删除
    pageDelete(){
      let self = this;
      if(!self.isSelected || self.selectedList.length <= 0) return
      self.openDialog('ConfirmDlg', {
        title: self.$t('hybridHuaweiyunKey.deleteHuaweiAccount') + 'AccountKey',
        description: 'hybridHuaweiyunKey.delete',
        warning: 'hybridTencentKey.info.deleteWarning',
        icon: 'access_key_popupico',
        uuidList: self.selectedList,
        ok: () => {
          self.delete(self.selectedList)
            .then(() => {
              self.queryList();
            });
        },
        getName: (uuid) => {
          return self.dbData.hybridHuaweiyunKeySecret[uuid].name;
        }
      })
    }
  }
}
