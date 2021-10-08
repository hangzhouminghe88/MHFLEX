<script>
  import {mapState} from 'vuex';
  import rpc from 'src/utils/rpc';
  export default {
    name: "Methods",
    computed: {
      ...mapState({
        scheduler: state => state.scheduler
      }),
    },
    methods: {
      detachScheduler(triggerUuid, uuidList) {
        if (uuidList.length === 0) return
        let self = this;
        let paramList = uuidList.map((uuid) => {
          return {
            uuid,
            triggerUuid: self.scheduler[uuid].triggersUuid[0]
          }
        })
        return self.dispatchActionWithEvent('scheduler/detach', paramList)
      },
      attach(triggerUuid, uuidList){
        if (uuidList.length === 0) return
        let self = this;
        let paramList = uuidList.map((uuid) => {
          return {
            uuid,
            triggerUuid
          }
        })
        return self.dispatchActionWithEvent('scheduler/attach', paramList)
      },
      jobClassShow(uuid) {
        if(!this.scheduler[uuid]) return;
        let jobClassName = _.cloneDeep(this.scheduler[uuid].jobClassName)
        let jobClassShow = jobClassName.split('.').pop()
        if (jobClassShow === 'StartVmInstanceJob') return 'timer.startVm'
        else if (jobClassShow === 'StopVmInstanceJob') return 'timer.stopVm'
        else if (jobClassShow === 'CreateVolumeBackupJob') return 'backupData.create'
        else if (jobClassShow === 'RebootVmInstanceJob') return 'timer.rebootVm'
        else if (jobClassShow === 'DatbaseBackupScheduler') return 'backupData.databaseCreate'
        else if (jobClassShow === 'CreateVolumeSnapshotJob') {
          let resourceUuid = this.scheduler[uuid].targetResourceUuid
          if (resourceUuid && this.dbData.volume[resourceUuid] && this.dbData.volume[resourceUuid].type === 'Root') return 'timer.createVmSnapshot'
          else return 'timer.createVolumeSnapshot'
        }
      },
      //显示任务策略
      showInterval: function (interval) {
        const hour = 3600
        const day = hour * 24
        // const week = day * 7
        if (interval < day) {
          return (interval / hour + this.$t('common.hour'))
        } else if (interval >= day) {
          if (interval % day === 0) return (interval / day + this.$t('common.day'))
          else return (parseInt(interval / day) + this.$t('common.day')) + ((interval % day) / hour + this.$t('common.hour'))
        }
      },
      //设置时间状态
      timerIsDone(uuid) {
        let self = this
        if (!self.scheduler[uuid].triggersUuid[0]) return 'Unattached'
        if (!!self.dbData.timer[self.scheduler[uuid].triggersUuid[0]] && (new Date(self.dbData.timer[self.scheduler[uuid].triggersUuid[0]].stopTime)).getTime() < (Date.now() + window.___currServerTimeMillionDvalue)) {
          return 'Done'
        } else {
          return 'Running'
        }
      },
      //或得定时器名称
      getTimerName: function (uuid) {
        if (this.scheduler[uuid].triggersUuid.length === 0) return this.$t('scheduler.noAttach')
        else return !!this.dbData.timer[this.scheduler[uuid].triggersUuid[0]] && this.dbData.timer[this.scheduler[uuid].triggersUuid[0]].name
      },
      enable(uuidList){
        let self = this;
        return self.dispatchActionWithEvent('scheduler/enable', uuidList)
      },
      disable(uuidList){
        let self = this;
        return self.dispatchActionWithEvent('scheduler/disable', uuidList)
      },
      create (param) {
        let paramsList = param.paramList
        let triggerUuid = ''
        if (_.has(param, 'triggerUuid') && param.triggerUuid !== '') triggerUuid = param.triggerUuid
        let name = paramsList[0].name
        let number = paramsList.length
        if (number > 1) {
          paramsList.forEach((item, index) => {
            let i = index + 1
            item.name = item.name + '-' + i
          })
        }
        let self = this
        let event = self.createEvent('timer.action.createJob', name, number)
        let event2
        if (triggerUuid) event2 = self.createEvent('timer.action.attachTrigger', name, number)
        let tasks = []
        let p = null
        paramsList.forEach((params) => {
          p = rpc.create('scheduler/jobs', params, event)
            .then((resp) => {
              if (resp.success === true) {
                self.incEventSuccess(event)
                if (triggerUuid) {
                  return rpc.create(`scheduler/jobs/${resp.inventory.uuid}/scheduler/triggers/${triggerUuid}`, null, event2).then((resp) => {
                    self.incEventSuccess(event2)
                  }, () => {
                    self.incEventFail(event2)
                    return rpc._delete(`scheduler/jobs/${resp.inventory.uuid}`)
                  })
                } else return new Promise((resolve, reject) => { resolve() })
              }
            }, () => {
              self.incEventFail(event)
              if (triggerUuid) self.incEventFail(event2)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
          .then(() =>{
            if(self.queryList){
              self.queryList();
            }
          })
      },
      deleteScheduler(uuidList){
        let self = this
        let tasks = []
        let event = self.createEvent('vm.action.deleteScheduler', uuidList.length === 1 ? self.dbData.scheduler[uuidList[0]].name : '', uuidList.length)
        if (uuidList.length > 0) {
          uuidList.forEach((uuid) => {
            let p
            if (this.dbData.scheduler[uuid].triggersUuid.length > 0) {
              this.dbData.scheduler[uuid].triggersUuid.forEach((triggerUuid) => {
                p = rpc._delete(`scheduler/jobs/${uuid}/scheduler/triggers/${triggerUuid}`)
                  .then(() => rpc._delete(`scheduler/jobs/${uuid}`, null, event))
                  .then((resp) => {
                    self.incEventSuccess(event)
                  }, () => {
                    self.incEventFail(event)
                  })
              })
            } else {
              p = rpc._delete(`scheduler/jobs/${uuid}`, null, event)
                .then((resp) => {
                  self.incEventSuccess(event)
                }, () => {
                  self.incEventFail(event)
                })
            }
            tasks.push(p)
          })
          return Promise.all(tasks)
        }
      }
    }
  }
</script>

<style scoped>

</style>
