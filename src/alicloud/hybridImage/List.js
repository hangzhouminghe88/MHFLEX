import {mapGetters, mapState} from 'vuex';
import WindowBase from 'src/windows/Window';
import Utils from 'src/utils/utils';
import rpc from 'src/utils/rpc';
import Methods from './Methods';


export default {
  mixins: [WindowBase, Methods],

  computed: {
    ...mapGetters({
      get: `hybridAliCloudImage/getList`
    })
  },

  methods: {
    //查询条件
    getCondition() {
      let conditionList = [], self = this;
      if (self.selectVal !== '' && self.searchStr != '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}25%`);
      }
      return conditionList;
    },
    //查询镜像
    queryList() {
      let self = this;
      self.updateCount();
      self.windowData.loading = true;
      return self.dispatchAction('hybridAliCloudImage/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      }).then(resp => {
        self.windowData.loading = false;
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          total: resp.total
        }).then(() => {
          self.itemList = self.get(self.windowData.uuidList);
          self.queryUpLoadingImage();
        })
      }).catch((e) => {
        self.windowData.loading = false;
        self.queryUpLoadingImage();
      })
    },
    //查询上传镜像
    queryUpLoadingImage: async function () {
      let imageUuidList = []
      let self = this;
      let uplodingImage = []
      let uplodingImageUuidList = []
      self.upLoadItemList  = [];
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
        it.forEach((datacenteruuid, index) => {
          let obj = {
            uuid: item.resourceUuid + datacenteruuid,
            imageUuid: item.resourceUuid,
            dataCenterUuid: datacenteruuid,
            name: imageName,
            progress: 0
          }
          uplodingImage.push(obj)
          uplodingImageUuidList.push(obj.uuid)
        })
      })
      this.updateDbTable({
        tableName: 'uplodingImage',
        list: uplodingImage
      })
      if (uplodingImageUuidList.length === 0) return this.updateWindow({ uplodingImageUuidList: uplodingImageUuidList, uploadingCount: 0 })
      this.updateWindow({
        uplodingImageUuidList,
        uploadingCount: uplodingImageUuidList.length
      })

      this.refreshEcsImageProcess()
    },
    //刷新上传进度
    refreshEcsImageProcess: function () {
      if (this.windowData.uplodingImageUuidList.length > 0) {
        this.windowData.uplodingImageUuidList.forEach(uuid => this.getEcsImageProcess(uuid))
      }
    },
    //获得上传进度
    getEcsImageProcess: function (uuid) {
      const self = this
      self.upLoadItemList = [];
      let imageUuid = self.dbData.uplodingImage[uuid].imageUuid
      let dataCenterUuid = self.dbData.uplodingImage[uuid].dataCenterUuid
      rpc.query(`hybrid/aliyun/image/${dataCenterUuid}/${imageUuid}/progress`, {})
        .then((resp) => {
          let uplodingImage = _.cloneDeep(self.dbData.uplodingImage[uuid])
          uplodingImage.progress = resp.progress;
          if(!resp.progress) {
            self.upLoadItemList  = [];
            if(this.refreshProgress){
              clearInterval(this.refreshProgress);
              this.refreshProgress = null;
            }
            return;
          }
          self.updateDbRow({
            tableName: 'uplodingImage',
            id: uuid,
            data: uplodingImage
          }).then(() => {
            self.upLoadItemList = self.windowData.uplodingImageUuidList.map((uuid) =>{
              return self.dbData.uplodingImage[uuid];
            })
          })
        }, (error) => {
          if (error && error.body && error.body.indexOf('SYS.1003')) {
            if (self.windowData.uplodingImageUuidList.length > 0 && self.windowData.uplodingImageUuidList.indexOf(uuid) > -1) {
              self.windowData.uplodingImageUuidList.splice(self.windowData.uplodingImageUuidList.indexOf(uuid), 1)
            }
            self.updateWindow({ uplodingImageUuidList: self.windowData.uplodingImageUuidList, uploadingCount: self.windowData.uplodingImageUuidList.length })
            self.refreshEcsImageProcess()
          }
        })
    },
    //删除镜像
    pageDelete() {
      let self = this, uuidList = [];
      if (!self.isSelected) return;
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        uuidList,
        title: 'image.deleteImage',
        description: 'image.info.deleteConfirm',
        icon: 'image_popupico',
        checkBoxText: 'hybrid.deleteOrigin',
        isChecked: !self.isAllSystemImage(),
        warning: !self.isAllSystemImage() ? 'hybrid.info.deleteImage' : '',
        getName: (uuid) => {
         return self.dbData.hybridImage[uuid].name;
        },
        ok: (isChecked) => {
          self.delete(isChecked, uuidList)
            .then(() => {
              self.queryList();
            })

        },
      })
    },

    isAllSystemImage() {
      let self = this;
      return self.selectedList.every((uuid) => self.dbData.hybridImage[uuid].type === 'system')
    },
    //创建镜像
    goToCreate() {
      let self = this;
      self.$router.push({name: 'createHybridAliCloudImage'})
    },
    //更新镜像数目
    updateCount: function () {
      let searchConditionList = [], self = this;
      if (self.selectVal !== '' && self.searchStr != '') {
        searchConditionList = searchConditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}25%`);
      }
      rpc.query('hybrid/aliyun/image', {
        replyWithCount: true,
        q: ['type=system'].concat(searchConditionList)
      })
        .then((resp) => {
          this.updateWindow({
            systemCount: resp.total
          })
        })

      rpc.query('hybrid/aliyun/image', {
        replyWithCount: true,
        q: ['type=self'].concat(searchConditionList)
      })
        .then((resp) => {
          this.updateWindow({
            selfCount: resp.total
          })
        })
    },
  }
}
