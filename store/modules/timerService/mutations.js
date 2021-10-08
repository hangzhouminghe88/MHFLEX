import _ from 'lodash'
import util from '../../utils'

export default {
  merge (state, taskMap) {
    _.keys(taskMap).forEach(uuid => {
      taskMap[uuid].fn()
      let interval = 1000
      if (taskMap[uuid].interval) {
        interval = taskMap[uuid].interval
      }
      let timerId = setInterval(taskMap[uuid].fn, interval)
      taskMap[uuid].timerId = timerId
    })
    util.batchMerge(state, taskMap)
  },
  delete (state, uuid) {
    if (state[uuid] && state[uuid].timerId) {
      clearInterval(state[uuid].timerId)
    }
    util.remove(state, uuid)
  }
}
