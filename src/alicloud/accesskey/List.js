import { checkAccessKey } from  'src/alicloud/accesskey/Assistant/AccessKeyAssistant';
import Root from 'src/windows/Root';
import rpc from 'src/utils/rpc';
import Methods from './Methods';

export default {
  mixins: [Methods, Root],

  methods: {
    getCondition () {
      let conditionList = []
      if (this.windowData.currTab === 'aliyun') {
        conditionList.push('type!=daho')
      } else {
        conditionList.push('type=daho')
      }
      if (this.selectVal !== '' && this.searchStr !== '') {
        conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
      }
      return conditionList
    },

    async queryList () {
      const self = this
      let resp = await rpc.query('hybrid/hybrid/key', {
        count: false,
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        replyWithCount: true,
        q: self.getCondition(),
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
      })
      if (self.windowData.currTab === 'aliyun') {
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          aliyunCount: resp.total
        })
      } else {
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          dahoCount: resp.total
        })
      }

      let uuidList = resp.inventories.map((item) => item.uuid)
      let table = {}
      uuidList.map((uuid) => {
        table[uuid] = {
          selected: false
        }
      })
      self.updateWindow({ uuidList, table })
      self.updateDbTable({
        tableName: 'hybridKeySecret',
        list: resp.inventories
      }).then( () => {
        self.itemList = self.getItemList();
      })
      self.updateCount()
    },

    getItemList () {
      let self = this;
      return self.windowData.uuidList.map( (uuid) => {
        return self.dbData.hybridKeySecret[uuid];
      })
    },

    pageAttach () {
      let self = this;
      if (!self.isSelected) return;
      self.attach(self.selectedList, self.queryList)
        .then( () => {
          checkAccessKey(self.windowData.currTab, self);
        })
    },

    pageDetach () {
      let self = this;
      if (!self.isSelected) return;
      self.openDialog('ConfirmDlg', {
        title: 'hybridKey.detachAccessKey',
        description: 'hybridKey.Detach_AccessKey',
        icon: 'access_key_popupico',
        warning: 'hybridKey.info.deleteWarning',
        uuidList: self.selectedList,
        getName: (uuid) => {
          return self.dbData.hybridKeySecret[uuid].name;
        },
        ok: () => {
          self.detach(self.selectedList, self.queryList)
          .then( () => {
            checkAccessKey(self.windowData.currTab, self);
          })
        }
      })
    },

    pageDelete () {
      let self = this;
      if(!self.isSelected) return;
      self.openDialog('ConfirmDlg', {
        title: 'hybridKey.DeleteAccessKey',
        description: 'hybridKey.delete',
        warning: 'hybridKey.info.deleteWarning',
        icon: 'access_key_popupico',
        uuidList: self.selectedList,
        ok: () => {
          self.delete(self.selectedList, self.queryList);
        },
        getName: (uuid) => {
          return self.dbData.hybridKeySecret[uuid].name;
        }
      })
    }
  }
}
