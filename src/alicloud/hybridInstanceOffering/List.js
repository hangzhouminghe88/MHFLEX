import rpc from 'src/utils/rpc';
import _ from 'lodash'

export  default {
  methods: {
    getCondition() {
      let conditionList = [], self = this;
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}=%25`)
      }
      return conditionList;
    },

    queryList() {
      let self = this;
      rpc.query('hybrid/ecs/type', {
        q: this.getCondition(),
        identityZoneUuid: self.getIZoneUuid()
      }).then((resp) => {
        let pageCount = resp.types.length === 0 ? 1 : Math.ceil(resp.types.length / self.windowData.pageSize)
        this.updateWindow({
          availableCount: resp.types.length,
          pageCount: pageCount
        })
        let uuidList = resp.types.map((item, index) => {
          item.uuid = item.typeId + index
          return item.typeId + index
        })
        let list = _.chunk(uuidList, self.windowData.pageSize)
        self.updateDbTable({
          tableName: 'ecsInstanceType',
          list: resp.types
        })
        self.updateWindow({
          uuidList: list[self.windowData.pageIndex - 1],
        }).then( () => {
          self.itemList = self.windowData.uuidList.map((uuid) =>{
            return self.dbData.ecsInstanceType[uuid];
          });
        })
      })
    }
  }
}
