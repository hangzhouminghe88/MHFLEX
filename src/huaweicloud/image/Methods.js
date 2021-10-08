import rpc from "../../utils/rpc";
import { checkBounce } from 'src/utils/utils';

export default {
  methods: {
    updateCount() {
      let self = this,
        searchConditionList = [],
        tasks = [],
        task1 = null,
        task2 = null;
      if (self.selectVal !== "" && self.searchStr !== "") {
        searchConditionList = searchConditionList.concat(
          `${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`
        );
      }
      task1 = rpc
        .query("/hybrid/huawei/image", {
          q: ["type=Private"].concat(searchConditionList),
          count: true
        })
        .then(resp => {
          self.updateWindow({ privateCount: resp.total });
        });
      task2 = rpc
        .query("/hybrid/huawei/image", {
          q: ["type=gold"].concat(searchConditionList),
          count: true
        })
        .then(resp => {
          self.updateWindow({ goldCount: resp.total });
        });
      tasks.push(task1, task2);
      return Promise.all(tasks);
    },
    create(param) {
      let event = this.createEvent("hybridimage.action.add");
      return rpc
        .update("images", `${param.imageUuid}`, {
          updateImage: {
            guestOsType: param.guestOsType
          }
        })
        .then(resp => {
          let obj = {};
          obj.dataCenterUuid = param.dataCenterUuid;
          obj.imageUuid = param.imageUuid;
          obj.name = param.name;
          obj.description = param.description;
          obj.osVersion = param.osVersion;
          return rpc.create("/hybrid/huawei/image", obj, event);
        })
        .then(
          resp => {
            this.incEventSuccess(event);
            let uuidList = this.windowData.uuidList.slice();
            uuidList.unshift(resp.inventory.uuid);
            let row = {};
            row[resp.inventory.uuid] = {};
            row[resp.inventory.uuid].selected = false;
            let table = Object.assign({}, { ...this.windowData.table }, row);
            this.updateWindow({ uuidList, table });
            return this.updateDbRow({
              tableName: "hybridHuaweiImage",
              id: resp.inventory.uuid,
              data: resp.inventory
            });
          },
          () => {
            this.incEventFail(event);
          }
        );
    },
    getHuaweiImageName(uuid){
      let value
      let self = this
      try {
        value = self.dbData.image[self.dbData.hybridHuaweiImage[uuid].localImageUuid].name
      } catch (e) {
        if (checkBounce(`getImageName-${uuid}`)) return ''
        value = ''
        rpc.query(`images/${self.dbData.hybridHuaweiImage[uuid].localImageUuid}`)
          .then((resp) => {
            if (resp.inventories.length > 0) {
              return self.updateDbRow({
                tableName: 'image',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
            } else {
              return rpc.queryResourceNames(self, 'image', self.dbData.hybridHuaweiImage[uuid].localImageUuid)
            }
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },
    getDataCenterName(uuid) {
      let value
      let self = this
      try {
        value = this.dbData.hybridHuaweiyunDataCenter[uuid].regionName
      } catch (e) {
        if (checkBounce(`getDataCenterName-${uuid}`)) return ''
        value = ''
        rpc.query(`brid/data-center/${uuid}`)
          .then((resp) => {
            if (resp.inventories.length > 0)
            return self.updateDbRow({
              tableName: 'hybridHuaweiyunDataCenter',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    }
  }
};
