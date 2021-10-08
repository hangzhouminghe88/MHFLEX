import rpc from 'src/utils/rpc'

export default {
  query (jobUuid) {
    return rpc.query(`task-progresses/${jobUuid}`)
  }
}
