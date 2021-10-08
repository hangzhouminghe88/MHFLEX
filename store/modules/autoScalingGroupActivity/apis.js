import rpc from 'src/utils/rpc'

export default {
  async query (param) {
    return await rpc.query('autoscaling/groups/activities', param)
  },
  async queryByUuid (uuid) {
    let resp = await rpc.query(`autoscaling/groups/activities/${uuid}`)
    return resp.inventories[0]
  }
}
