import Methods from 'src/tencent/bucket/Methods';
import { mapGetters, mapState } from "vuex";
import Utils from 'src/utils/utils';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridTencentBucket/getList'
    }),
    ...mapState({
      tencentBucket: state => state.hybridTencentBucket
    })
  },

  methods: {
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
      return self.dispatchAction('hybridTencentBucket/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
      }).then((resp) => {
        self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          list: resp.inventories,
          availableCount: resp.total
        }).then( () => {
          self.itemList = self.get(self.windowData.uuidList);
          self.windowData.loading = false;
        }).catch(() => {
          self.windowData.loading = false;
        })
      })
    },

		canAttach() {
			let self = this;
			if(!self.isSingleSelected) return false;
			return self.tencentBucket[self.selectedList[0]].current === 'true';
		},

    pageDelete () {
      let self = this,
        uuidList = self.isSelected ? self.selectedList: [],
        options = {
          title: '删除Bucket',
          description: 'hybridbucket.delete',
          icon: 'zone_popupico',
					uuidList,
					isChecked: true,
					checkBoxText: '确定要删除腾讯云上的资源吗?',
          getName: (uuid) => {
            return self.tencentBucket && self.tencentBucket[uuid].bucketName;
          },
          ok: (isOrigin) => {
            self.delete(uuidList, isOrigin)
              .then( () => self.queryList());
          }
        };
      self.openDialog('ConfirmDlg', options)
		},

		pageAttach() {
			let self = this;
			if (!self.isSingleSelected || self.selectedList.length <= 0) return
			self.attach(self.selectedList)
		}
  }
}
