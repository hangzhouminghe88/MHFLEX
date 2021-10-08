import {checkAccessKey} from "./assitant/SecretKeyAssistant";
import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get:'hybridTencentSecretKey/getList'
    })
  },

  methods: {
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList;
    },
    //查询列表数据
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridTencentSecretKey/basicQuery', {
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
    //判断是否默认
    isDefault() {
      let self = this;
      if(!self.isSelected) return false;
      return self.dbData.hybridTencentSecretKey[self.selectedList[0]].current === 'true';
    },
    //设置默认
    pageAttach () {
      let self = this;
      if (!self.isSelected) return;
      self.attach(self.selectedList)
        .then( () => {
          self.queryList()
          if(checkAccessKey)
            checkAccessKey(self);
        })
    },
    //取消默认
    pageDetach() {
      let self = this;
      if (!self.isSelected) return;
      self.openDialog('ConfirmDlg', {
        title: 'hybridTencentKey.detachAccessKey',
        description: 'hybridTencentKey.Detach_AccessKey',
        icon: 'access_key_popupico',
        warning: 'hybridTencentKey.info.deleteWarning',
        uuidList: self.selectedList,
        getName: (uuid) => {
          return self.dbData.hybridTencentSecretKey[uuid].name;
        },
        ok: () => {
          self.detach(self.selectedList, self.queryList)
            .then( () => {
              self.queryList()
              if(checkAccessKey)
              checkAccessKey(self);
            })
        }
      })
    },
    //删除secretKey
    pageDelete() {
      let self = this;
      if(!self.isSelected) return;
      self.openDialog('ConfirmDlg', {
        title: 'hybridTencentKey.DeleteSecretKey',
        description: 'hybridTencentKey.delete',
        warning: 'hybridTencentKey.info.deleteWarning',
        icon: 'access_key_popupico',
        uuidList: self.selectedList,
        ok: () => {
          self.delete(self.selectedList)
            .then(() => {
              self.queryList();
              if(checkAccessKey)
                checkAccessKey(self);
            });
        },
        getName: (uuid) => {
          return self.dbData.hybridTencentSecretKey[uuid].name;
        }
      })
    }
  }
}
