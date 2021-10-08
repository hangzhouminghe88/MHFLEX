import rpc from 'src/utils/rpc';
import _ from 'lodash'

export  default {
  methods: {
    attach (uuidList, fn) {
      const self = this
      let event = self.createEvent('hybridKey.action.Attach', uuidList.length === 1 ? self.dbData.hybridKeySecret[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      let p = null
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          p = rpc.put(`hybrid/hybrid/key/${uuid}/attach`, null, event)
            .then(() => {
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

    detach (uuidList, fn) {
      const self = this
      let event = self.createEvent('hybridKey.action.Detach', uuidList.length === 1 ? self.dbData.hybridKeySecret[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      let p = null
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          p = rpc.put(`hybrid/hybrid/key/${uuid}/detach`, null, event)
            .then(() => {
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

    create (param) {
      const self = this
      let event = self.createEvent('hybridKey.action.addAccessKey', param.name)
      param.accountUuid = window.localStorage.getItem('accountUuid')
      return rpc.create('/hybrid/hybrid/key', param, event).then(resp => {
        self.incEventSuccess(event)
      }, () => {
        self.incEventFail(event)
      })
    },

    delete (uuidList, fn) {
      const self = this
      let event = self.createEvent('hybridKey.action.deleteAccessKey', uuidList.length === 1 ? self.dbData.hybridKeySecret[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          let p = rpc._delete(`hybrid/hybrid/key/${uuid}`, null, event)
            .then(() => {
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

    updateCount () {
      let self = this, tasks = [], p = null;
      p = rpc.query('hybrid/hybrid/key', {
        count: true,
        q: 'type=aliyun'
      }).then((resp) => {
        this.updateWindow({
          aliyunCount: resp.total
        })
      })
      tasks.push(p);
      p = rpc.query('hybrid/hybrid/key', {
        count: true,
        q: 'type=daho'
      }).then((resp) => {
        this.updateWindow({
          dahoCount: resp.total
        })
      })
      tasks.push(p);
      return Promise.race(tasks);
    }
  }
}
