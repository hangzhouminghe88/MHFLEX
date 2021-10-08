import rpc from 'src/utils/rpc'

export default {
  getCondition: function (self) {
    let conditionList = []
    // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
    if (self.windowData.searchConditionList && self.windowData.searchConditionList.length > 0) {
      conditionList = conditionList.concat(self.windowData.searchConditionList)
    }
    return conditionList
  },
  updateCount: function (self) {
    return rpc.query('zones', {
      replyWithCount: true
    })
      .then((resp) => {
        return self.updateWindow({
          availableCount: resp.total
        })
      })
  }
}
