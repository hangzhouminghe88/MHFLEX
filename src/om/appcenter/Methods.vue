<script>
  import Utils from 'src/utils/utils'
  import ApiService from './ApiService'

  export default {
    methods: {
      queryList: async function (params) {
        let self = this;
        let resp = await ApiService.queryPlugins(params)
        this.updateDbTable({
          tableName: 'plugin',
          list: resp.data
        })
        self.pluginList = resp.data
        self.availableCount = resp.data.length
        return
      },
      create: function (params) {
        let self = this
        let event = self.createEvent('appcenter.action.create', params.name, undefined, '', 'NotApiCall')
        return ApiService.addPlugin(params)
          .then((resp) => {
            resp.success && self.incEventSuccess(event)
            return resp
          }, () => {
            self.incEventFail(event)
          })
      },
      update: function (params) {
        let self = this
        let event = self.createEvent('appcenter.action.update', params.name, undefined, '', 'NotApiCall')
        return ApiService.updatePlugin(params)
          .then((resp) => {
            resp.success && self.incEventSuccess(event)
            return resp
          }, () => {
            self.incEventFail(event)
          })
      },
      delete: function (uuidList) {
        if (!Array.isArray(uuidList)) return
        const self = this
        let event = self.createEvent(`appcenter.action.delete`, uuidList.length === 1 ? self.dbData.plugin[uuidList[0]].name : '', uuidList.length, '', 'NotApiCall')
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = ApiService.deletePlugin(uuid)
              .then((resp) => {
                resp.success && self.incEventSuccess(event)
                return resp
              }, (e) => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      ...Utils
    }
  }
</script>

