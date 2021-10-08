import { values, get } from 'lodash'
import rpc from 'src/utils/rpc'

const Callbacks = {
  async schedulerProcess (message) {
    const { resourceUuid } = message
    const { scheduler } = this.$store.state.db
    if (values(scheduler).length === 0) return
    const groupStr = `
query SchedulerJobGroup where uuid in (
  query SchedulerJobGroupJobRef.schedulerJobGroupUuid where schedulerJobUuid in (
    query SchedulerJob.uuid where targetResourceUuid='${resourceUuid}'
  )
)
  `
    const groupResp = await rpc.query('zql', { zql: encodeURIComponent(groupStr) })
    const jobsUuid = get(groupResp, 'results[0].inventories[0].jobsUuid')
    if (!jobsUuid || jobsUuid.length === 0) return
    const jobResp = await rpc.query('scheduler/jobs', {q: `uuid?=${jobsUuid}`})
    const allResourceUuids = jobResp.inventories.map(v => v.targetResourceUuid)
    const conditions = [`targetResourceUuid?=${allResourceUuids}`, `jobName~=%25Backup%25`, 'state=Running']
    const longjobResp = await rpc.query('longjobs', {q: conditions})
    const jobGroupUuid = get(groupResp, 'results[0].inventories[0].uuid')
    const state = scheduler[jobGroupUuid] && scheduler[jobGroupUuid].state
    const data = { status: 'Ready' }
    if (longjobResp.inventories.length > 0 && state !== 'Disabled') {
      data.status = 'backup-running'
    }
    await this.updateDbRow({ tableName: 'scheduler', id: jobGroupUuid, data })
  }
}

export default Callbacks