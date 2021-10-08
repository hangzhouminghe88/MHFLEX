import rpc from '../rpc'

const strategies = {
  Running (event, longJob) {
    if (this.dbData.common.isAdmin) {
      return rpc.query(`task-progresses/${longJob.apiId}`).then(resp => {
        let data = {}
        if (resp.inventories.length === 0) return
        if (resp.inventories.length !== 0) {
          resp.inventories = resp.inventories.filter(taskProgress => taskProgress.type === 'Progress')
          data.progress = resp.inventories[0].content
        }
        return this.updateDbRow({
          tableName: 'messageProgress',
          id: event.id,
          data: data
        }).then(() => {
          return this.updateResourceOfLongJob(event, this)
        })
      })
    }
    return Promise.resolve()
  },
  Failed (event, longJob) {
    return this.longJobHandler(event, this, longJob)
      .then(() => {
        this.incEventFail(event)
        return Promise.resolve()
      })
  },
  Succeeded (event, longJob) {
    return this.longJobHandler(event, this, longJob)
      .then(() => {
        if (event.action.indexOf('host.action.addByFile') > -1 || event.action.indexOf('baremetal.action.createChassis') > -1) {
          if (this.$store.state.toastManager.toasts[event.id]) this.updateToast(event)
          this._eventFinished(event)
        } else this.incEventSuccess(event)
        return Promise.resolve()
      })
  }
}

export default strategies
