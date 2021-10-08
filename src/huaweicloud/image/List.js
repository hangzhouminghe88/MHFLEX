import Utils from "../../utils/utils";
import rpc from "../../utils/rpc";
import {mapGetters} from "vuex";
import Methods from  './Methods';

export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      get: `hybridHuaweiImage/getList`
    })
  },
  methods: {
    //查询条件
    getCondition() {
      let self = this, conditionList =[];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}`);
      }
      return conditionList;
    },
    //查询列表数据
    queryList() {
      let self = this;
      self.updateCount();
      self.dispatchAction(`hybridHuaweiImage/basicQuery`, {
        limit: self.windowData.pageSize,
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
        q: self.getCondition(),
      }).then(resp => {
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          total: resp.total
        }).then(() => {
          self.itemList = self.get(self.windowData.uuidList);
          self.windowData.loading = false;
          self.queryHuaweiUpLoadingImage();
        })
      }).catch((e) => {
        self.queryHuaweiUpLoadingImage();
        self.windowData.loading = false;
      })
    },
    //查询上传数据
    queryHuaweiUpLoadingImage: async function () {
      let self = this;
      let uplodingHuaweiImage = [];
      let uplodingImageUuidList = [];
      self.uploadItemList = [];
      let systemResp = await rpc.query('system-tags', {
        q: ['resourceType=ImageVO', 'tag~=%25imageImporting%25']
      })
      if (systemResp.inventories.length === 0) {
        return this.updateWindow({
          uplodingImageUuidList: [],
          uploadingCount: 0
        })
      }
      systemResp.inventories.forEach((item) => {
        let it = item.tag.split('::')[1].split(',')
        let imageName = item.tag.split('::')[3].split(',')[0]
        if (item.tag.split('::')[0] === 'imageImporting') {
          it.forEach((datacenteruuid, index) => {
            let obj = {
              uuid: item.resourceUuid + datacenteruuid,
              imageUuid: item.resourceUuid,
              dataCenterUuid: datacenteruuid,
              name: imageName,
              progress: 0
            }
            uplodingHuaweiImage.push(obj)
            uplodingImageUuidList.push(obj.uuid)
          })
        }
      })
      this.updateDbTable({
        tableName: 'uplodingHuaweiImage',
        list: uplodingHuaweiImage
      }).then(() => {
        self.uploadItemList = this.windowData.list;
      })
      if (uplodingImageUuidList.length === 0) return this.updateWindow({ uplodingImageUuidList: uplodingImageUuidList, uploadingCount: 0 })
      this.updateWindow({
        uplodingImageUuidList,
        uploadingCount: uplodingImageUuidList.length
      })
      this.refreshEcsImageProcess()
    },
    //刷新云主机上传进度
    refreshEcsImageProcess() {
      if (this.windowData.uplodingImageUuidList && this.windowData.uplodingImageUuidList.length > 0) {
        this.windowData.uplodingImageUuidList.forEach(uuid => this.getEcsImageProcess(uuid))
      }
    },
    //获得云主机上传进度
    getEcsImageProcess(uuid) {
      let imageUuid = this.dbData.uplodingHuaweiImage[uuid].imageUuid
      let dataCenterUuid = this.dbData.uplodingHuaweiImage[uuid].dataCenterUuid
      rpc.query(`hybrid/huawei/image/${dataCenterUuid}/${imageUuid}/progress`, {})
        .then((resp) => {
          let uplodingImage = _.cloneDeep(this.dbData.uplodingHuaweiImage[uuid])
          uplodingImage.progress = resp.progress
          this.updateDbRow({
            tableName: 'uplodingHuaweiImage',
            id: uuid,
            data: uplodingImage
          })
          if (resp.progress == '99%' || Object.keys(resp.progress).length == 0) {
            uplodingImage.progress = '99%'
            this.updateDbRow({
              tableName: 'uplodingHuaweiImage',
              id: uuid,
              data: uplodingImage
            })
            this.queryHuaweiUpLoadingImage()
          }
        })
    },
  },
}
