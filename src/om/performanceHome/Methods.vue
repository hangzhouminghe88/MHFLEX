
<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    methods: {
      initWindowMetricData: function () {
        let metircData = {}
        let metricDataNames = this.metricNames.metricData ? this.metricNames.metricData : []
        let averageDataNames = this.metricNames.averageData ? this.metricNames.averageData : []
        let currentValueNames = this.metricNames.currentValue ? this.metricNames.currentValue : []
        metricDataNames.forEach((item) => {
          metircData[item.name] = {}
          metircData[item.name].dataList = []
          metircData[item.name].isLoad = false
        })
        averageDataNames.forEach((item) => {
          metircData[item.name] = {}
          metircData[item.name].dataList = []
          metircData[item.name].isLoad = false
        })
        currentValueNames.forEach((item) => {
          metircData[item.name] = {}
          metircData[item.name].dataList = []
          metircData[item.name].isLoad = false
        })
        for (let coupleName in this.multiAverageDataCouples) {
          metircData[coupleName] = {}
          metircData[coupleName].dataList = []
          metircData[coupleName].isLoad = false
        }
        for (let coupleName in this.multiNicAverageDataCouples) {
          metircData[coupleName] = {}
          metircData[coupleName].dataList = []
          metircData[coupleName].isLoad = false
        }
        this.updateWindow({ metircData })
      },
      queryTotalData: function (metricNames, uuidName, dbTableName, resourceName, param, time, self) {
        // let nicMap = {
        //   NetworkOutPackets: 'NetworkInPackets',
        //   NetworkInPackets: 'NetworkOutPackets',
        //   NetworkOutErrors: 'NetworkInErrors',
        //   NetworkInErrors: 'NetworkOutErrors',
        //   NetworkOutBytes: 'NetworkInBytes',
        //   NetworkInBytes: 'NetworkOutBytes'
        // }
        let vipMap = {
          VIPInBoundTrafficInBytes: 'VIPOutBoundTrafficInBytes',
          VIPOutBoundTrafficInBytes: 'VIPInBoundTrafficInBytes'
        }
        let metircData = {}
        let metricDataNames = metricNames.metricData ? metricNames.metricData : []
        let averageDataNames = metricNames.averageData ? metricNames.averageData : []
        let currentValueNames = metricNames.currentValue ? metricNames.currentValue : []
        let multiAverageDataNames = metricNames.multiAverageData ? metricNames.multiAverageData : []
        let multiNicAverageDataNames = metricNames.multiNicAverageData ? metricNames.multiNicAverageData : []
        let tasks = []
        let p = null
        let zwatchScriptList = []
        let zwatchScript = ''
        metricDataNames.forEach((item) => {
          zwatchScript = `zwatch{resultName='${item.name}',metricName='${item.name}',offsetAheadOfCurrentTime=${time.value},period=${time.period},functions='average(groupBy="${uuidName}")',functions='top(num=5)'}`
          zwatchScriptList.push(zwatchScript)
        })
        averageDataNames.forEach((item) => {
          let metricName = vipMap[item.name] ? vipMap[item.name] : item.name
          zwatchScript = `zwatch{resultName='${item.name}',metricName='${metricName}',period=${time.period},offsetAheadOfCurrentTime=${time.value},functions='average(groupBy="${uuidName}")',functions='top(num=5)'}`
          zwatchScriptList.push(zwatchScript)
        })
        currentValueNames.forEach((item) => {
          zwatchScript = `zwatch{resultName='${item.name}',metricName='${item.name}',period=${time.period},offsetAheadOfCurrentTime=${time.value},functions='average(groupBy="${uuidName}")',functions='top(num=5)'}`
          zwatchScriptList.push(zwatchScript)
        })
        multiAverageDataNames.forEach((item) => {
          zwatchScript = `zwatch{resultName='${item.name}',metricName='${item.name}',period=${time.period},offsetAheadOfCurrentTime=${time.value},functions='average(groupBy="${uuidName}")',functions='top(num=5)'}`
          zwatchScriptList.push(zwatchScript)
        })
        multiNicAverageDataNames.forEach((item) => {
          let metricName = item.name
          zwatchScript = `zwatch{resultName='${item.name}',metricName='${metricName}',period=${time.period},offsetAheadOfCurrentTime=${time.value},functions='average(groupBy="${uuidName},NetworkDeviceLetter")',functions='top(num=5)'}`
          zwatchScriptList.push(zwatchScript)
        })
        zwatchScript = zwatchScriptList.join(',')
        let script = `query ${resourceName}.uuid,name where ${param} return with (${zwatchScript})`
        return rpc.query('zql', {
          zql: encodeURIComponent(script)
        })
          .then((resp) => {
            if (resp.results[0].inventories.length === 0) return resp
            let zwatchScriptList = []
            let zwatchScript = ''
            for (let coupleName in this.multiAverageDataCouples) {
              let listA = resp.results[0].returnWith[this.multiAverageDataCouples[coupleName][0]].map(item => item.labels[uuidName])
              let listB = resp.results[0].returnWith[this.multiAverageDataCouples[coupleName][1]].map(item => item.labels[uuidName])
              let listANoRepeat = listA.filter(uuid => !_.includes(listB, uuid))
              let listBNoRepeat = listB.filter(uuid => !_.includes(listA, uuid))
              listANoRepeat.forEach((uuid) => {
                zwatchScript = `query ${resourceName}.uuid where uuid='${uuid}' return with (zwatch{resultName='${this.multiAverageDataCouples[coupleName][1]}',metricName='${this.multiAverageDataCouples[coupleName][1]}',offsetAheadOfCurrentTime=${time.value},period=${time.period},functions='average(groupBy="${uuidName}")',functions='top(num=5)'})`
                zwatchScriptList.push(zwatchScript)
              })
              listBNoRepeat.forEach((uuid) => {
                zwatchScript = `query ${resourceName}.uuid where uuid='${uuid}' return with (zwatch{resultName='${this.multiAverageDataCouples[coupleName][0]}',metricName='${this.multiAverageDataCouples[coupleName][0]}',offsetAheadOfCurrentTime=${time.value},period=${time.period},functions='average(groupBy="${uuidName}")',functions='top(num=5)'})`
                zwatchScriptList.push(zwatchScript)
              })
            }
            for (let coupleName in this.multiNicAverageDataCouples) {
              let listA = resp.results[0].returnWith[this.multiNicAverageDataCouples[coupleName][0]].map(item => item.labels)
              let listB = resp.results[0].returnWith[this.multiNicAverageDataCouples[coupleName][1]].map(item => item.labels)
              let listANoRepeat = []
              let listBNoRepeat = []
              for (let labels of listA) {
                let isRepeat = false
                listB.forEach((item) => {
                  if (item.NetworkDeviceLetter === labels.NetworkDeviceLetter && item[uuidName] === labels[uuidName]) isRepeat = true
                })
                if (isRepeat === false) listANoRepeat.push(labels)
              }
              for (let labels of listB) {
                let isRepeat = false
                listA.forEach((item) => {
                  if (item.NetworkDeviceLetter === labels.NetworkDeviceLetter && item[uuidName] === labels[uuidName]) isRepeat = true
                })
                if (isRepeat === false) listBNoRepeat.push(labels)
              }
              listANoRepeat.forEach((labels) => {
                let metricName = this.multiNicAverageDataCouples[coupleName][1]
                // metricName = nicMap[metricName] ? nicMap[metricName] : metricName
                zwatchScript = `query ${resourceName}.uuid where uuid='${labels[uuidName]}' return with (zwatch{resultName='${this.multiNicAverageDataCouples[coupleName][1]}',metricName='${metricName}',offsetAheadOfCurrentTime=${time.value},labels='NetworkDeviceLetter=${labels.NetworkDeviceLetter}',period=${time.period},functions='average(groupBy="${uuidName},NetworkDeviceLetter")',functions='top(num=5)'})`
                zwatchScriptList.push(zwatchScript)
              })
              listBNoRepeat.forEach((labels) => {
                let metricName = this.multiNicAverageDataCouples[coupleName][0]
                // metricName = nicMap[metricName] ? nicMap[metricName] : metricName
                zwatchScript = `query ${resourceName}.uuid where uuid='${labels[uuidName]}' return with (zwatch{resultName='${this.multiNicAverageDataCouples[coupleName][0]}',metricName='${metricName}',offsetAheadOfCurrentTime=${time.value},labels='NetworkDeviceLetter=${labels.NetworkDeviceLetter}',period=${time.period},functions='average(groupBy="${uuidName},NetworkDeviceLetter")',functions='top(num=5)'})`
                zwatchScriptList.push(zwatchScript)
              })
            }
            let script = zwatchScriptList.join(';')
            if (zwatchScriptList.length > 0) {
              return rpc.query('zql', {
                zql: encodeURIComponent(script)
              })
                .then((response) => {
                  response.results.forEach((item) => {
                    for (let key in item.returnWith) {
                      resp.results[0].returnWith[key] = resp.results[0].returnWith[key].concat(item.returnWith[key])
                    }
                  })
                  return resp
                })
            } else {
              return resp
            }
          })
          .then((resp) => {
            if (resp.results[0].inventories.length === 0) {
              metricDataNames.forEach((item) => {
                metircData[item.name] = {}
                metircData[item.name].dataList = []
                metircData[item.name].isLoad = true
              })
              averageDataNames.forEach((item) => {
                metircData[item.name] = {}
                metircData[item.name].dataList = []
                metircData[item.name].isLoad = true
              })
              currentValueNames.forEach((item) => {
                metircData[item.name] = {}
                metircData[item.name].dataList = []
                metircData[item.name].isLoad = true
              })
              for (let coupleName in this.multiAverageDataCouples) {
                metircData[coupleName] = {}
                metircData[coupleName].dataList = []
                metircData[coupleName].isLoad = true
              }
              for (let coupleName in this.multiNicAverageDataCouples) {
                metircData[coupleName] = {}
                metircData[coupleName].dataList = []
                metircData[coupleName].isLoad = true
              }
              return this.updateWindow({ metircData })
            }
            metricDataNames.forEach((item) => {
              metircData[item.name] = {}
              let topUuidList = resp.results[0].returnWith[item.name].map((item) => item.labels[uuidName])
              p = rpc.query('zwatch/metrics', {
                namespace: item.namespace,
                metricName: item.name,
                period: time.period,
                offsetAheadOfCurrentTime: time.value,
                labels: [`${uuidName}=~${topUuidList.join('%7C')}`]
              })
                .then((resp) => {
                  metircData[item.name] = {}
                  let dataList = this.getTopMetricData(resp.data, uuidName)
                  if (dataList.length < 5 && dataList.length !== 0) {
                    let length = dataList.length
                    for (let i = 0; i < 5 - length; i++) {
                      dataList.push({isnull: true})
                    }
                  }
                  metircData[item.name].dataList = this.initMetricData(dataList, time.value, time.period)
                  metircData[item.name].isLoad = true
                })
              tasks.push(p)
            })
            averageDataNames.forEach((item) => {
              metircData[item.name] = {}
              let dataList = this.getTopValue(resp.results[0].returnWith[item.name], uuidName)
              if (dataList.length < 5 && dataList.length !== 0) {
                let length = dataList.length
                for (let i = 0; i < 5 - length; i++) {
                  dataList.push({isnull: true})
                }
              }
              metircData[item.name][resourceName] = dataList
              metircData[item.name].dataList = dataList.length === 0 ? [] : [dataList]
              metircData[item.name].isLoad = true
            })
            currentValueNames.forEach((item) => {
              metircData[item.name] = {}
              let dataList = this.getTopValue(resp.results[0].returnWith[item.name], uuidName)
              if (dataList.length < 5 && dataList.length !== 0) {
                let length = dataList.length
                for (let i = 0; i < 5 - length; i++) {
                  dataList.push({isnull: true})
                }
              }
              metircData[item.name][resourceName] = dataList
              metircData[item.name].dataList = dataList.length === 0 ? [] : [dataList]
              metircData[item.name].isLoad = true
            })
            for (let coupleName in this.multiAverageDataCouples) {
              metircData[coupleName] = {}
              let dataListA = this.getMulitiTopValue(resp.results[0].returnWith[this.multiAverageDataCouples[coupleName][0]], resp.results[0].returnWith[this.multiAverageDataCouples[coupleName][1]], uuidName)
              let uuidListA = dataListA.map((item) => item.uuid)
              if (dataListA.length < 5 && dataListA.length !== 0) {
                let length = dataListA.length
                for (let i = 0; i < 5 - length; i++) {
                  dataListA.push({isnull: true})
                }
              }
              let dataListB = this.getMulitiTopValue(resp.results[0].returnWith[this.multiAverageDataCouples[coupleName][1]], resp.results[0].returnWith[this.multiAverageDataCouples[coupleName][0]], uuidName)
              let uuidListB = dataListB.map((item) => item.uuid)
              if (dataListB.length < 5 && dataListB.length !== 0) {
                let length = dataListB.length
                for (let i = 0; i < 5 - length; i++) {
                  dataListB.push({isnull: true})
                }
              }
              let uuidList = _.uniq(_.concat(uuidListA, uuidListB))
              if (uuidList.length > 0) {
                metircData[coupleName].dataList = [dataListA, dataListB]
                metircData[coupleName].isLoad = true
              } else {
                metircData[coupleName].dataList = [dataListA, dataListB]
                metircData[coupleName].isLoad = true
              }
            }
            for (let coupleName in this.multiNicAverageDataCouples) {
              metircData[coupleName] = {}
              let dataListA = this.getMulitiNicTopValue(resp.results[0].returnWith[this.multiNicAverageDataCouples[coupleName][0]], resp.results[0].returnWith[this.multiNicAverageDataCouples[coupleName][1]], uuidName, 'NetworkDeviceLetter')
              let uuidListA = dataListA.map((item) => item.uuid)
              if (dataListA.length < 5 && dataListA.length !== 0) {
                let length = dataListA.length
                for (let i = 0; i < 5 - length; i++) {
                  dataListA.push({isnull: true})
                }
              }
              let dataListB = this.getMulitiNicTopValue(resp.results[0].returnWith[this.multiNicAverageDataCouples[coupleName][1]], resp.results[0].returnWith[this.multiNicAverageDataCouples[coupleName][0]], uuidName, 'NetworkDeviceLetter')
              let uuidListB = dataListB.map((item) => item.uuid)
              if (dataListB.length < 5 && dataListB.length !== 0) {
                let length = dataListB.length
                for (let i = 0; i < 5 - length; i++) {
                  dataListB.push({isnull: true})
                }
              }
              let uuidList = _.uniq(_.concat(uuidListA, uuidListB))
              if (uuidList.length > 0) {
                metircData[coupleName].dataList = [dataListA, dataListB]
                metircData[coupleName].isLoad = true
              } else {
                metircData[coupleName].dataList = [dataListA, dataListB]
                metircData[coupleName].isLoad = true
              }
            }
            return Promise.all(tasks)
              .then(() => {
                return self.updateDbTable({
                  tableName: dbTableName,
                  list: resp.results[0].inventories
                })
              })
              .then(() => {
                return self.updateWindow({ metircData })
              })
          })
      },
      // queryTotalData: function (metricNames, uuidName, uuidList, resourceName, time, self) {
      //   let metircData = {}
      //   let metricDataNames = metricNames.metricData ? metricNames.metricData : []
      //   let averageDataNames = metricNames.averageData ? metricNames.averageData : []
      //   let currentValueNames = metricNames.currentValue ? metricNames.currentValue : []
      //   let multiAverageDataNames = metricNames.multiAverageData ? metricNames.multiAverageData : []
      //   let multiNicAverageDataNames = metricNames.multiNicAverageData ? metricNames.multiNicAverageData : []
      //   let topUuidList = []
      //   let tasks = []
      //   let p = null
      //   let script = ''
      //   p = rpc.queryResourceNames(self, resourceName, uuidList)
      //   tasks.push(p)
      //   metricDataNames.forEach((item) => {
      //     // script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "functions": ["average(groupBy=\\\\"${uuidName}\\\\")", "top(num=5)"]}')
      //     //   put("metricData", tmp.result)
      //     // `
      //     // p = rpc.query('batch-queries', {
      //     //   script: encodeURIComponent(script)
      //     // })
      //     p = rpc.query('zwatch/metrics', {
      //       namespace: item.namespace,
      //       metricName: item.name,
      //       period: time.period,
      //       offsetAheadOfCurrentTime: time.value,
      //       labels: [`${uuidName}=~${uuidList.join('%7C')}`],
      //       functions: [`average(groupBy=%22${uuidName}%22)`, `top(num=5)`]
      //     })
      //     .then((resp) => {
      //       topUuidList = resp.data.map((item) => item.labels[uuidName])
      //     })
      //     tasks.push(p)
      //   })
      //   return Promise.all(tasks)
      //   .then(() => {
      //     script = ''
      //     metricDataNames.forEach((item) => {
      //       script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${topUuidList.join('|')}"]}')
      //         put("${item.name}", tmp.result)
      //       `
      //     })
      //     averageDataNames.forEach((item) => {
      //       script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "functions": ["average(groupBy=\\\\"${uuidName}\\\\")", "top(num=5)"]}')
      //         put("${item.name}", tmp.result)
      //       `
      //     })
      //     currentValueNames.forEach((item) => {
      //       script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "functions": ["average(groupBy=\\\\"${uuidName}\\\\")", "top(num=5)"]}')
      //         put("${item.name}", tmp.result)
      //       `
      //     })
      //     multiAverageDataNames.forEach((item) => {
      //       script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "functions": ["average(groupBy=\\\\"${uuidName}\\\\")"]}')
      //         put("${item.name}", tmp.result)
      //       `
      //     })
      //     multiNicAverageDataNames.forEach((item) => {
      //       script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "offsetAheadOfCurrentTime": ${time.value}, "functions": ["average(groupBy=\\\\"${uuidName}\\\\,NetworkDeviceLetter\\\\")"]}')
      //         put("${item.name}", tmp.result)
      //       `
      //     })
      //     return rpc.query('batch-queries', {
      //       script: encodeURIComponent(script)
      //     })
      //     .then((resp) => {
      //
      //       metricDataNames.forEach((item) => {
      //         metircData[item.name] = {}
      //         let dataList = this.getTopMetricData(resp.result[item.name].data, uuidName)
      //         if (dataList.length < 5) {
      //           let length = dataList.length
      //           for (let i = 0; i < 5 - length; i++) {
      //             dataList.push({isnull: true})
      //           }
      //         }
      //         metircData[item.name].dataList = this.initMetricData(dataList, time.value, time.period)
      //         metircData[item.name].isLoad = true
      //       })
      //       averageDataNames.forEach((item) => {
      //         metircData[item.name] = {}
      //         let dataList = this.getTopValue(resp.result[item.name].data, uuidName)
      //         if (dataList.length < 5) {
      //           let length = dataList.length
      //           for (let i = 0; i < 5 - length; i++) {
      //             dataList.push({isnull: true})
      //           }
      //         }
      //         metircData[item.name][resourceName] = dataList
      //         metircData[item.name].dataList = [dataList]
      //         metircData[item.name].isLoad = true
      //       })
      //       currentValueNames.forEach((item) => {
      //         metircData[item.name] = {}
      //         let dataList = this.getTopValue(resp.result[item.name].data, uuidName)
      //         if (dataList.length < 5) {
      //           let length = dataList.length
      //           for (let i = 0; i < 5 - length; i++) {
      //             dataList.push({isnull: true})
      //           }
      //         }
      //         metircData[item.name][resourceName] = dataList
      //         metircData[item.name].dataList = [dataList]
      //         metircData[item.name].isLoad = true
      //       })
      //       for (let coupleName in this.multiAverageDataCouples) {
      //         metircData[coupleName] = {}
      //         let dataListA = this.getMulitiTopValue(resp.result[this.multiAverageDataCouples[coupleName][0]].data, resp.result[this.multiAverageDataCouples[coupleName][1]].data, uuidName)
      //         let uuidListA = dataListA.map((item) => item.uuid)
      //         if (dataListA.length < 5) {
      //           let length = dataListA.length
      //           for (let i = 0; i < 5 - length; i++) {
      //             dataListA.push({isnull: true})
      //           }
      //         }
      //         let dataListB = this.getMulitiTopValue(resp.result[this.multiAverageDataCouples[coupleName][1]].data, resp.result[this.multiAverageDataCouples[coupleName][0]].data, uuidName)
      //         let uuidListB = dataListB.map((item) => item.uuid)
      //         if (dataListB.length < 5) {
      //           let length = dataListB.length
      //           for (let i = 0; i < 5 - length; i++) {
      //             dataListB.push({isnull: true})
      //           }
      //         }
      //         let uuidList = _.uniq(_.concat(uuidListA, uuidListB))
      //         if (uuidList.length > 0) {
      //           metircData[coupleName].dataList = [dataListA, dataListB]
      //           metircData[coupleName].isLoad = true
      //         } else {
      //           metircData[coupleName].dataList = [dataListA, dataListB]
      //           metircData[coupleName].isLoad = true
      //         }
      //       }
      //       for (let coupleName in this.multiNicAverageDataCouples) {
      //         metircData[coupleName] = {}
      //         let dataListA = this.getMulitiNicTopValue(resp.result[this.multiNicAverageDataCouples[coupleName][0]].data, resp.result[this.multiNicAverageDataCouples[coupleName][1]].data, uuidName, 'NetworkDeviceLetter')
      //         let uuidListA = dataListA.map((item) => item.uuid)
      //         if (dataListA.length < 5) {
      //           let length = dataListA.length
      //           for (let i = 0; i < 5 - length; i++) {
      //             dataListA.push({isnull: true})
      //           }
      //         }
      //         let dataListB = this.getMulitiNicTopValue(resp.result[this.multiNicAverageDataCouples[coupleName][1]].data, resp.result[this.multiNicAverageDataCouples[coupleName][0]].data, uuidName, 'NetworkDeviceLetter')
      //         let uuidListB = dataListB.map((item) => item.uuid)
      //         if (dataListB.length < 5) {
      //           let length = dataListB.length
      //           for (let i = 0; i < 5 - length; i++) {
      //             dataListB.push({isnull: true})
      //           }
      //         }
      //         let uuidList = _.uniq(_.concat(uuidListA, uuidListB))
      //         if (uuidList.length > 0) {
      //           metircData[coupleName].dataList = [dataListA, dataListB]
      //           metircData[coupleName].isLoad = true
      //         } else {
      //           metircData[coupleName].dataList = [dataListA, dataListB]
      //           metircData[coupleName].isLoad = true
      //         }
      //       }
      //       return self.updateWindow({ metircData })
      //     })
      //   })
      // },
      getResourceNames: function (tableName, uuid) {
        let value
        try {
          value = this.dbData[tableName][uuid].name
        } catch (e) {
          if (this.checkBounce(`getResourceName-${uuid}`)) return ''
          value = ''
          rpc.queryResourceNames(this, tableName, [uuid])
            .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
      queryMetricData: function (metricList, uuidName, uuidList, resourceName, time, self) {
        if (uuidList.length === 0) {
          self.isLoad = true
          self.dataList = []
          return []
        }
        let script = ''
        metricList.forEach((item) => {
          script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "period": ${time.period}, "functions": ["average(groupBy=\\\\"${uuidName}\\\\")", "top(num=5)"]}')
          put("metricData", tmp.result)
        `
          return rpc.query('batch-queries', {
            script: encodeURIComponent(script)
          })
            .then((resp) => {
              let topUuidList = resp.result.metricData.data.map((item) => item.labels[uuidName])
              script = `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${topUuidList.join('|')}"]}')
            put("metricData", tmp.result)
          `
              return rpc.query('batch-queries', {
                script: encodeURIComponent(script)
              })
            })
            .then(resp => {
              let dataList = this.getTopMetricData(resp.result.metricData.data, uuidName)
              if (dataList.length < 5) {
                let length = dataList.length
                for (let i = 0; i < 5 - length; i++) {
                  dataList.push({isnull: true})
                }
              }
              self.dataList = this.initMetricData(dataList, time.value, time.period)
              self.isLoad = true
            })
          //   script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "startTime": ${this.currTime - time.value}, "endTime": ${this.currTime}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"] }')
          // put("metricData", tmp.result)
          // `
          // })
          // rpc.query('batch-queries', {
          //   script: encodeURIComponent(script)
          // })
        })
      },
      queryMulitiMetricData: function (metricList, uuidName, uuidList, resourceName, time, self) {
        if (uuidList.length === 0) {
          self.isLoad = true
          self.dataList = []
          return []
        }
        let script = ''
        metricList.forEach((item) => {
          script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"]}')
      put("metricData", tmp.result)
      `
        })
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let dataList = this.getTopValue(resp.result.metricData.data, uuidName)
          this[resourceName] = dataList
          self.dataList = dataList
          self.isLoad = true
        })
      },
      queryMulitiAverageData: function (metricList, uuidName, uuidList, resourceName, time, self) {
        if (uuidList.length === 0) {
          self.isLoad = true
          self.dataList = []
          return []
        }
        // let nicMap = {
        //   NetworkOutPackets: 'NetworkInPackets',
        //   NetworkInPackets: 'NetworkOutPackets',
        //   NetworkOutErrors: 'NetworkInErrors',
        //   NetworkInErrors: 'NetworkOutErrors',
        //   NetworkOutBytes: 'NetworkInBytes',
        //   NetworkInBytes: 'NetworkOutBytes'
        // }
        let vipMap = {
          VIPInBoundTrafficInBytes: 'VIPInBoundTrafficInBytes',
          VIPOutBoundTrafficInBytes: 'VIPOutBoundTrafficInBytes'
        }
        let script = ''
        metricList.forEach((item) => {
          let metricName = item.name
          metricName = vipMap[item.name] ? vipMap[item.name] : item.name
          script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${metricName}", "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "period": ${time.period}, "functions": ["average(groupBy=\\\\"${uuidName}\\\\")"]}')
      put("${item.name}", tmp.result)
      `
        })
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let dataListA = this.getMulitiTopValue(resp.result[metricList[0].name].data, resp.result[metricList[1].name].data, uuidName)
          let uuidListA = dataListA.map((item) => item.uuid)
          if (dataListA.length < 5) {
            let length = dataListA.length
            for (let i = 0; i < 5 - length; i++) {
              dataListA.push({isnull: true})
            }
          }

          let dataListB = this.getMulitiTopValue(resp.result[metricList[1].name].data, resp.result[metricList[0].name].data, uuidName)
          let uuidListB = dataListB.map((item) => item.uuid)
          if (dataListB.length < 5) {
            let length = dataListB.length
            for (let i = 0; i < 5 - length; i++) {
              dataListB.push({isnull: true})
            }
          }
          let uuidList = _.uniq(_.concat(uuidListA, uuidListB))
          if (uuidList.length > 0) {
            rpc.queryResourceNames(self, resourceName, uuidList)
              .then(() => {
                self.dataList = [dataListA, dataListB]
                self.isLoad = true
              })
          } else {
            self.dataList = [dataListA, dataListB]
            self.isLoad = true
          }
        })
      },
      queryAverageValue: function (metricList, uuidName, uuidList, resourceName, time, self) {
        if (uuidList.length === 0) {
          self.isLoad = true
          self.dataList = []
          return []
        }
        let script = ''
        metricList.forEach((item) => {
          script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "period": ${time.period}, "functions": ["average(groupBy=\\\\"${uuidName}\\\\")", "top(num=5)"]}')
      put("metricData", tmp.result)
      `
        })
        rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let dataList = this.getTopValue(resp.result.metricData.data, uuidName)
          if (dataList.length < 5) {
            let length = dataList.length
            for (let i = 0; i < 5 - length; i++) {
              dataList.push({isnull: true})
            }
          }
          this[resourceName] = dataList
          rpc.queryResourceNames(self, resourceName, uuidList)
            .then(() => {
              self.dataList = [dataList]
              self.isLoad = true
            })
        })
      },
      queryMulitiNicAverageData: function (metricList, uuidName, uuidList, resourceName, time, self) {
        if (uuidList.length === 0) {
          self.isLoad = true
          self.dataList = []
          return []
        }
        // let nicMap = {
        //   // NetworkOutPackets: 'NetworkInPackets',
        //   // NetworkInPackets: 'NetworkOutPackets',
        //   // NetworkOutErrors: 'NetworkInErrors',
        //   // NetworkInErrors: 'NetworkOutErrors',
        //   // NetworkOutBytes: 'NetworkInBytes',
        //   // NetworkInBytes: 'NetworkOutBytes'
        // }
        let script = ''
        metricList.forEach((item) => {
          let metricName = item.name
          script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${metricName}", "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "offsetAheadOfCurrentTime": ${time.value}, "period": ${time.period}, "functions": ["average(groupBy=\\\\"${uuidName}\\\\,NetworkDeviceLetter\\\\")"]}')
      put("${item.name}", tmp.result)
      `
        })
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let dataListA = this.getMulitiNicTopValue(resp.result[metricList[0].name].data, resp.result[metricList[1].name].data, uuidName, 'NetworkDeviceLetter')
          let uuidListA = dataListA.map((item) => item.uuid)
          if (dataListA.length < 5) {
            let length = dataListA.length
            for (let i = 0; i < 5 - length; i++) {
              dataListA.push({isnull: true})
            }
          }

          let dataListB = this.getMulitiNicTopValue(resp.result[metricList[1].name].data, resp.result[metricList[0].name].data, uuidName, 'NetworkDeviceLetter')
          let uuidListB = dataListB.map((item) => item.uuid)
          if (dataListB.length < 5) {
            let length = dataListB.length
            for (let i = 0; i < 5 - length; i++) {
              dataListB.push({isnull: true})
            }
          }
          let uuidList = _.uniq(_.concat(uuidListA, uuidListB))
          if (uuidList.length > 0) {
            rpc.queryResourceNames(self, resourceName, uuidList)
              .then(() => {
                self.dataList = [dataListA, dataListB]
                self.isLoad = true
              })
          } else {
            self.dataList = [dataListA, dataListB]
            self.isLoad = true
          }
        })
      },
      queryNicAverageValue: function (metricList, uuidName, uuidList, resourceName, time, self) {
        if (uuidList.length === 0) {
          self.isLoad = true
          self.dataList = []
          return []
        }
        // let nicMap = {
        //   NetworkOutPackets: 'NetworkInPackets',
        //   NetworkInPackets: 'NetworkOutPackets',
        //   NetworkOutErrors: 'NetworkInErrors',
        //   NetworkInErrors: 'NetworkOutErrors',
        //   NetworkOutBytes: 'NetworkInBytes',
        //   NetworkInBytes: 'NetworkOutBytes'
        // }
        let script = ''
        metricList.forEach((item) => {
          let metricName = item.name
          script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${metricName}", "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "period": ${time.period}, "functions": ["average(groupBy=\\\\"${uuidName}\\\\\\\\,NetworkDeviceLetter\\\\")", "top(num=5)"]}')
      put("metricData", tmp.result)
      `
        })
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let dataList = this.getTopValue(resp.result.metricData.data, uuidName)
          if (dataList.length < 5) {
            let length = dataList.length
            for (let i = 0; i < 5 - length; i++) {
              dataList.push({isnull: true})
            }
          }
          this[resourceName] = dataList
          rpc.queryResourceNames(self, resourceName, uuidList)
            .then(() => {
              self.dataList = [dataList]
              self.isLoad = true
            })
        })
      },
      queryCurrentValue: function (metricList, uuidName, uuidList, resourceName, time, self) {
        if (uuidList.length === 0) {
          self.isLoad = true
          self.dataList = []
          return []
        }
        let script = ''
        metricList.forEach((item) => {
          script += `tmp = call("org.zstack.zwatch.api.APIGetMetricDataMsg", '{"namespace": "${item.namespace}", "metricName": "${item.name}", "period": ${time.period}, "offsetAheadOfCurrentTime": ${time.value}, "labels": ["${uuidName}=~ ${uuidList.join('|')}"], "functions": ["average(groupBy=\\\\"${uuidName}\\\\")", "top(num=5)"]}')
      put("metricData", tmp.result)
      `
        })
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let dataList = this.getTopValue(resp.result.metricData.data, uuidName)
          if (dataList.length < 5) {
            let length = dataList.length
            for (let i = 0; i < 5 - length; i++) {
              dataList.push({isnull: true})
            }
          }
          this[resourceName] = dataList
          rpc.queryResourceNames(self, resourceName, uuidList)
            .then(() => {
              self.dataList = [dataList]
              self.isLoad = true
            })
        })
      },
      getTopMetricData: function (dataList, uuidName) {
        if (dataList.length === 0) return []
        dataList.forEach((item) => {
          item.uuid = item.labels[uuidName]
        })
        let _dataList = _.groupBy(dataList, 'uuid')
        let valueList = []
        for (let key in _dataList) {
          let value = _.sumBy(_dataList[key], (o) => o.value) / _dataList[key].length
          valueList.push({value, uuid: _dataList[key][0].labels[uuidName]})
          _dataList[key].averageValue = value
        }
        valueList = _.reverse(_.sortBy(valueList, 'value'))
        if (valueList.length > 5) valueList = valueList.slice(0, 5)
        let uuidList = valueList.map((item) => item.uuid)
        let _valueList = []
        uuidList.forEach((uuid, index) => {
          let obj = {}
          obj = {
            valueList: _dataList[uuid],
            uuid: uuid,
            averageValue: _dataList[uuid].averageValue
          }
          _valueList.push(obj)
        })
        return _valueList
      },
      getMulitiNicTopValue: function (dataList, dataListA, uuidName, nicName) {
        let valueList = this.getNicTopValue(dataList, uuidName, nicName)
        let uuidList = valueList.map((item) => item.uuid)
        dataListA.forEach((item) => {
          item.uuid = item.labels[uuidName]
          item.nicName = item.labels[nicName]
        })
        let _dataListA = _.groupBy(dataListA, 'uuid')
        uuidList.forEach((uuid, index) => {
          _dataListA[uuid].forEach((p) => {
            if (p.labels[nicName] === valueList[index].nicName) valueList[index].valueA = p.value
          })
        })
        return valueList
      },
      getMulitiTopValue: function (dataList, dataListA, uuidName) {
        let valueList = this.getTopValue(dataList, uuidName)
        let uuidList = valueList.map((item) => item.uuid)
        dataListA.forEach((item) => {
          item.uuid = item.labels[uuidName]
        })
        let _dataListA = _.groupBy(dataListA, 'uuid')
        uuidList.forEach((uuid, index) => {
          let valueA = _.sumBy(_dataListA[uuid], (o) => o.value) / _dataListA[uuid].length
          valueList[index].valueA = valueA
        })
        return valueList
      },
      getNicTopValue: function (dataList, uuidName, nicName) {
        if (dataList.length === 0) return []
        dataList.forEach((item) => {
          item.uuid = item.labels[uuidName]
        })
        let _dataList = _.sortBy(dataList, 'value')
        _dataList.forEach((item) => {
          item.uuid = item.labels[uuidName]
          item.nicName = item.labels[nicName]
        })
        return _.reverse(_dataList).slice(0, 5)
      },
      getTopValue: function (dataList, uuidName, nicName) {
        if (dataList.length === 0) return []
        dataList.forEach((item) => {
          item.uuid = item.labels[uuidName]
        })
        let _dataList = _.groupBy(dataList, 'uuid')
        let valueList = []
        for (let key in _dataList) {
          let value = _.sumBy(_dataList[key], (o) => o.value) / _dataList[key].length
          let obj = {value, uuid: _dataList[key][0].labels[uuidName]}
          if (nicName) obj.nicName = _dataList[key][0].labels[nicName]
          valueList.push(obj)
        }
        return _.reverse(_.sortBy(valueList, 'value')).slice(0, 5)
      },
      initMetricData: function (dataList, value, period) {
        let length = value / period
        dataList.forEach((item) => {
          if (!item.isnull) {
            let value = item.valueList
            let valueLenth = value.length
            if (valueLenth >= length) return value
            let currentTime = (Date.now() + window.___currServerTimeMillionDvalue) / 1000
            let startTime = valueLenth > 0 ? value[0].time : currentTime
            let endTime = valueLenth > 0 ? value[valueLenth - 1].time : currentTime
            let _value = []
            if (endTime < currentTime) {
              for (let i = 1; i <= Math.round((currentTime - endTime) / period); i++) {
                let obj = {}
                obj.time = endTime + i * period
                obj.value = 0
                obj.uuid = item.uuid
                value.push(obj)
              }
            }
            valueLenth = value.length
            for (let i = 0; i < valueLenth; i++) {
              _value.push(value[i])
              if ((i + 1) < value.length && value[i + 1].time - value[i].time > period) {
                let num = Math.round((value[i + 1].time - value[i].time) / period)
                for (let n = 1; n < num; n++) {
                  let obj = {}
                  obj.time = value[i].time + period * n
                  obj.value = 0
                  obj.uuid = item.uuid
                  value.push(obj)
                }
              }
            }
            let _length = _value.length
            for (let i = 1; i <= (length - _length); i++) {
              let obj = {}
              obj.time = startTime - i * period
              obj.value = 0
              obj.uuid = item.uuid
              _value.unshift(obj)
            }
            item.valueList = _value
          }
        })
        return dataList
      },
      formateValue: function (unit) {
        let obj = {
          count: this.formatCount,
          percent: this.formatPercent,
          bytes: this.formatBytes,
          ops: this.formatOps,
          pps: this.formatPps
        }
        return obj[unit]
      },
      formatCount: function (value) {
        let str = value.toString()
        if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) value = value.toFixed(2)
        if (value > 1000) {
          let _value = value / 1000
          let _valueStr = _value + ''
          _value = (_valueStr.indexOf('.') > -1 && _valueStr.split('.')[1].length > 2) ? _value.toFixed(2) : _value
          return _value + 'K'
        } else return value
      },
      formatPercent: function (value) {
        let str = value.toString()
        if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) return value.toFixed(2) + '%'
        else return value + '%'
      },
      formatBytes: function (value) {
        if (value < 1.0) value = 0
        return this.bytesToSize(value) + '/s'
      },
      formatOps: function (value) {
        let str = value.toString()
        if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) value = value.toFixed(2)
        if (value > 1000) {
          let _value = value / 1000
          let _valueStr = _value + ''
          _value = (_valueStr.indexOf('.') > -1 && _valueStr.split('.')[1].length > 2) ? _value.toFixed(2) : _value
          return _value + 'K ops/s'
        } else return value + ' ops/s'
      },
      formatPps: function (value) {
        let str = value.toString()
        if (str.indexOf('.') > -1 && str.split('.')[1].length > 2) value = value.toFixed(2)
        return value + ' pps'
      },
      getMAxValue: function (value) {
        return Math.floor(value / 4) * 4 + 4
      },
      getColor: function (value) {
        if (value > 80) return ' #E8474F'
        else if (value > 60) return '#FFB412'
        else return '#1AA6FF '
      },
      getColorOpposite: function (value) {
        if (value < 20) return ' #FF5F67'
        else if (value < 40) return '#FFB412'
        else return '#007FDF'
      },
      resizeValue: function (value, length) {
        let str = value.toString()
        let _str = str.replace(/[\u0391-\uFFE5]/g, 'aa')
        let _length = str === _str ? str.length : _str.length
        if (!length) length = 12
        if (_length > length) {
          if (str === _str) str = str.slice(0, length - 2)
          else {
            str = str.slice(0, length - 2)
            _str = str.replace(/[\u0391-\uFFE5]/g, 'aa')
            while (_str.length > length) {
              str = str.slice(0, str.length - 1)
              _str = str.replace(/[\u0391-\uFFE5]/g, 'aa')
            }
          }
          return str + '...'
        } else return str
      },
      ...Utils
    }
  }
</script>
