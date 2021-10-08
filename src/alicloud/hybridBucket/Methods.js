import rpc from 'src/utils/rpc';
import _ from 'lodash'

export  default {
  methods: {
    create: async function (param) {
      let self = this;
      let event = self.createEvent('hybridbucket.action.CreateBucket', param.bucketName)
      let resp
      try {
        resp = await rpc.create('hybrid/aliyun/oss-bucket/remote', param, event)
        self.incEventSuccess(event);
        self.queryList();
      } catch (e) {
        self.incEventFail(event)
        return
      }
      this.updateCount()
      return resp;
    },

    updateCount () {
      rpc.query('hybrid/aliyun/oss-bucket', {
        replyWithCount: true
      })
        .then((resp) => {
          this.updateWindow({
            availableCount: resp.total
          })
        })
    },
    //设置地域添加bucket请求
    dataCenterAddBucket(param) {
      let event = this.createEvent('hybridbucket.action.AddBucket', param.bucketName)
      let api = 'hybrid/aliyun/oss-bucket'
      if (param.showBucketCreateMethod) {
        api = 'hybrid/aliyun/oss-bucket/remote'
      }
      return rpc.create(api, param, event).then(resp => {
        this.incEventSuccess(event)
        let uuidList = []
        let table = {}
        if (this.windowData.uuidList) {
          uuidList = this.windowData.uuidList.slice()
          uuidList.unshift(resp.inventory.uuid)
          let row = {}
          row[resp.inventory.uuid] = {}
          row[resp.inventory.uuid].selected = false
          table = Object.assign({}, { ...this.windowData.table }, row)
        }
        return this.updateDbRow({
          tableName: 'hybridBucket',
          id: resp.inventory.uuid,
          data: resp.inventory
        }).then(() => {
          return this.updateWindow({ uuidList, table }).then(() => this.getData())
        }).then(() => {
          if (param.setDefault) return this.attach([resp.inventory.uuid])
          else return new Promise((resolve, reject) => { resolve() })
        })
      }, () => {
        this.incEventFail(event)
        return new Promise((resolve, reject) => { reject() })
      })
    },
    //设置默认请求
    detach(uuidList, fn) {
      const self = this
      let event = self.createEvent('hybridbucket.action.attach', uuidList.length === 1 ? self.dbData.hybridBucket[uuidList[0]].bucketName : '', uuidList.length)
      let tasks = []
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          let p = rpc.put(`hybrid/aliyun/oss-bucket/${uuid}/attach`, null, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })(uuid)
      })
      return Promise.all(tasks).then( () => {  if (fn) fn()})
    },

    delete(uuidList, isOrigion, fn) {
      let self = this, p = null, tasks = [],
        event = self.createEvent('hybridbucket.action.deleteBucket', uuidList.length === 1 ? self.dbData.hybridBucket[uuidList[0]].bucketName : '', uuidList.length),
        url = '';
      if (isOrigion) {
        url = 'hybrid/aliyun/oss-bucket/remote'
      } else {
        url = 'hybrid/aliyun/oss-bucket'
      }
      for(let i in uuidList) {
        ((uuid) => {
          p = rpc._delete(`${url}/${uuid}`, null, event)
            .then(() => {
              self.incEventSuccess(event);
            }).catch(() => {
              self.incEventFail(event);
            });
          tasks.push(p);
        })(uuidList[i])
      }
      return Promise.all(tasks).then( () => {
        if(fn) fn();
      })
    },

    //设置默认
    attach (uuidList, fn) {
      const self = this
      let event = self.createEvent('hybridbucket.action.attach', uuidList.length === 1 ? self.dbData.hybridBucket[uuidList[0]].bucketName : '', uuidList.length)
      let tasks = []
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          let p = rpc.put(`hybrid/aliyun/oss-bucket/${uuid}/attach`, null, event)
            .then((resp) => {
              if (fn) fn()
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })(uuid)
      })
      return Promise.all(tasks)
    },
  }
}
