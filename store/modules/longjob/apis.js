import rpc from 'src/utils/rpc'
// import util from 'src/store/utils'

// NOTICE (xiang.gao): you should put the action name to EventController
export default {
  call (jobName, msg, progressCb, jobUuid) {
    return rpc.create('longjobs', {
      jobName,
      jobData: JSON.stringify(msg)
    }, progressCb, jobUuid)
  }
}
