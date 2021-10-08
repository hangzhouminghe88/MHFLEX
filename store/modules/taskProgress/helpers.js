import api from './apis'

export default {
  async query (jobUuid) {
    let resp = await api.query(jobUuid)
    let resultList = resp.inventories.filter(taskProgress => taskProgress.type === 'Progress')
    let progress = -1
    if (resultList && resultList.length > 0) {
      progress = parseInt(resultList[0].content)
    }
    return progress
  }
}
