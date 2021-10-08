<script>
  import { mapActions } from 'vuex'
  import { getServerUrl, browserLocalStorageSetItem, browserLocalStorageGetItem, setEventDataToWindow , getEventDataFromWindow} from 'src/utils/utils';
  import EventController from 'src/windows/Base/EventController'
  import _ from 'lodash';
  export default {
    methods: {
      dispatchAction (action, param) {
        return this.$store.dispatch(action, param)
      },
      dispatchActionWithEvent (action, param, longJobInfo, _event, isDeleteRemote) {
        let self = this
        let paramList = param
        if (!_.isArray(param)) {
          paramList = [param]
        }
        let event = _event || this.buildEvent(action, paramList, longJobInfo)
        let p = this.$store.dispatch(action, {
          param,
          isDeleteRemote,
          progressCb: data => {
            if (data.type === 'request') {
              let apiCall = {
                // req: encodePassword(msgStr)
                req: JSON.stringify(data.msg)
              }
              // don't set event success if it's long job
              // genActionProgresses() will handle this
              if (longJobInfo) {
                browserLocalStorageSetItem(data.msg.jobUuid, JSON.stringify(apiCall))
                let _event = JSON.parse(browserLocalStorageGetItem(event.id))
                _event.apiList.push(data.msg.jobUuid)
                browserLocalStorageSetItem(event.id, JSON.stringify(_event))
              } else {
                setEventDataToWindow(data.msg.jobUuid, JSON.stringify(apiCall))
                let _event = JSON.parse(getEventDataFromWindow(event.id))
                _event.apiList.push(data.msg.jobUuid)
                setEventDataToWindow(event.id, JSON.stringify(_event))
              }
            }
            if (data.type === 'response' && !longJobInfo) {
              // }
              if (data.msg.success === true) {
                self.incEventSuccess(event)
              } else {
                self.incEventFail(event)
              }
            }
          },
          // some api recevie mutiple items in one param, so incEventSuccess will not work.
          // we need forceSetEventSuccess() to set success
          forceSetEventSuccess: () => {
            self.setEventSuccess(event)
          },
          forceSetEventFail: () => {
            self.setEventFail(event)
          },
        })
        if (longJobInfo) {
          // this.triggerLongJobTask()
          return p.then(() => {
            return this.triggerLongJobTask()
          }, () => {
            return this.longJobHandler(event, this)
          })
        }
        return p
      },
      buildEvent (action, paramList, longJobInfo) {
        let actionKey = action.replace(/\//, '.')
        let isCreate = false
        // can collect uuid
        let uuidList = []
        if (_.isString(paramList[0])) {
          uuidList = paramList
        } else if (_.isString(paramList[0].uuid)) {
          uuidList = paramList.map(it => it.uuid)
        } else {
          // just for create
          let actionTokens = action.split('/')
          if (actionTokens[1] === 'create') {
            isCreate = true
          } else {
            return this.createEvent(`action.${actionKey}`, null, paramList.length)
          }
        }

        if (paramList.length === 1) {
          let name = ''
          if (isCreate) {
            name = paramList[0].name
          } else {
            let keyList = _.keys(this.$store.state)
            for (let i in keyList) {
              let key = keyList[i]
              let item = this.$store.state[key][uuidList[0]]
              if (item) {
                name = item.name
                break
              }
            }
          }
          return this.createEvent(`action.${actionKey}`, name, 1, undefined, undefined, longJobInfo)
        } else {
          return this.createEvent(`action.${actionKey}`, null, paramList.length, undefined, undefined, longJobInfo)
        }
      },
      createEvent: function (action, name, count, content, subType, resourceInfos) {
        return EventController.createEvent(action, name, count, content, subType, resourceInfos, this)
      },
      _eventFinished: function (_event) {
        return EventController._eventFinished(_event, this)
      },
      incEventSuccess: function (event) {
        return EventController.incEventSuccess(event, this)
      },
      setEventSuccess: function (event, content) {
        return EventController.setEventSuccess(event, content, this)
      },
      incEventFail: function (event) {
        return EventController.incEventFail(event, this)
      },
      setEventFail: function (event, content) {
        return EventController.setEventFail(event, content, this)
      },
      setEventFinished: function (event) {
        return EventController.setEventFinished(event, this)
      },
      deleteCurrAssistant (owner) {
        Object.keys(this.$store.state.assistantManager.assistants).forEach(id => {
          if (this.$store.state.assistantManager.assistants[id].data.ownerId === owner) {
            this.deleteAssistant(id)
          }
        })
      },
      deleteGlobalAssistant (restriction) {
        let idToDelete = ''
        Object.keys(this.$store.state.assistantManager.assistants).forEach(id => {
          if (this.$store.state.assistantManager.assistants[id].data.restriction === restriction) {
            idToDelete = id
          }
        })
        return this.deleteAssistant(idToDelete)
      },
      newGlobalAssistant (params, restriction) {
        if (params.data) {
          params.data.restriction = restriction
        } else {
          params.restriction = restriction
        }
        this.createAssistant(params)
      },
      deleteAllAssistant () {
        let assistants = this.$store.state.assistantManager.assistants
        Object.keys(assistants).forEach(id => {
          if (!assistants[id].data.restriction) this.deleteAssistant(id)
        })
      },
      deleteAssistant: function (id, $event) {
        if ($event) $event.stopPropagation()
        return this.destroyAssistant(id)
      },
      createAssistant (params) {
        const self = this
        if (_.has(params, 'data')) {
          self._createAssistant(params)
        } else {
          let obj = {
            controller: {},
            data: {}
          }
          _.keys(params).forEach(key => {
            if (_.includes(['operation', 'handler'], key)) {
              if (key === 'operation' && params[key] !== 'noResource') {
                obj.controller.name = params[key]
              } else if (key === 'handler') {
                obj.controller.handler = params[key]
              } else if (key === 'operation' && params[key] === 'noResource') {
                obj.data.hideButton = true
              }
            } else {
              if (_.includes(['title', 'content'], key)) {
                if (key === 'title') {
                  obj.data.getTitle = () => { return self.$t(`assistant.${params[key]}`) }
                } else {
                  obj.data.getContent = () => { return self.$t(`assistant.${params[key]}`) }
                }
              } else {
                if (key === 'hide' && params.hide) {
                  obj.data.hideButton = true
                }
                obj.data[key] = params[key]
              }
            }
          })
          this._createAssistant(obj)
        }
      },
      getProductInfo: function () {
        const self = this
        return window.fetch(`${getServerUrl()}/productInfo`)
          .then(response => {
            var link = document.querySelector("link[rel*='icon']") || document.createElement('link')
            link.type = 'image/x-icon'
            link.rel = 'shortcut icon'
            link.href = `${getServerUrl()}/favicon?rev${new Date().getTime()}`
            document.getElementsByTagName('head')[0].appendChild(link)

            return response.json()
              .then(reply => {
                if (reply) {
                  document.title = reply.title
                  return self.updateDbObject({
                    name: 'productInfo',
                    data: reply
                  })
                } else {
                  return new Promise((resolve, reject) => { reject() })
                }
              })
          })
      },
      addTimerTask: function (param) {
        this.addTimerTask(param)
      },
      updateTimerTask: function (param) {
        this.updateTimerTask(param)
      },
      removeTimerTask: function (taskId) {
        this.removeTimerTask(taskId)
      },
      addAssistantItem (obj) {
        return this.createAssistant(obj)
      },
      deleteAssistantItem (content) {
        let id = ''
        Object.values(this.$store.state.assistantManager.assistants).forEach(item => {
          if (item.data.getContent(item) === content) {
            id = item.data.id
          }
        })
        this.destroyAssistant(id)
      },
      ...mapActions({
        _createWindow: 'createWindow',
        _updateWindow: 'updateWindow',
        _openDialog: 'openDialog',
        _createAssistant: 'createAssistant',
        _updateDialog: 'updateDialog',
        _destroyPanel: 'destroyPanel'
      }),
      ...mapActions([
        'destroyWindow',
        'closeDialog',
        'openDesktopWindow',
        'updateDesktopWindow',
        'closeDesktopWindow',
        'setActiveWindowId',
        'setActionType',
        'updateDbTable',
        'updateDbRow',
        'forceUpdateDbRow',
        'forceUpdateDbTable',
        'updateDbObject',
        'createToast',
        'updateToast',
        'destroyToast',
        'updateAssistant',
        'destroyAssistant',
        'deleteDbRow',
        'addTimerTask',
        'updateTimerTask',
        'removeTimerTask',
        'createPanel',
        'updatePanel',
        'destroyPanel'
      ])
    },
    computed: {
      dbData: function () {
        return this.$store.state.db
        // return _.assign({}, ...this.$store.state.db)
      },
      isDesktop: function () {
        if (this.$store.state.route.path === '/desktop') {
          return true
        }
        return false
      }
    }
  }
</script>
