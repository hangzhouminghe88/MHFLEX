import rpc  from 'src/utils/rpc';
import { checkBounce, genUniqueId } from 'src/utils/utils'
export const aliyunAsync = (self) => {
	let newAssistant = (resourceName, operation) => {
		let id = `assistant-${genUniqueId()}`
		self.createAssistant({
			id,
			title: 'syncDataTitle',
			operation,
			ownerId: self.windowData.id,
			content: `lackOf${resourceName}`,
			handler: () => {
				if(resourceName === 'HybridAliyunKeySecret')
				self.$router.push({name: 'createHybridkeysecret', params: {type: 'aliyun'}})
				if(resourceName === 'HybridIdentityZone')
				self.$router.push({name: 'createHybridAliCloudIdentityZone'})
			}
		})
	}
	rpc.query('/hybrid/hybrid/key', {
		count: true,
		q: 'type!=daho'
	}).then(resp => {
		if (resp.total === 0) {
			newAssistant('HybridAliyunKeySecret', 'add')
		}
	})
	rpc.query('/hybrid/hybrid/key', {
		q: ['current=true', 'type!=daho']
	}).then((resp) => {
		if (resp.inventories.length === 1) {
			rpc.query('system-tags', {
				q: ['resourceType=DataCenterVO', `tag=accesskey::${resp.inventories[0].akey}`]
			}).then((resp) => {
				if (resp.inventories.length === 0) {
					newAssistant('HybridIdentityZone', 'add')
					return
				} else {
					let datacenterUuidList = resp.inventories.map((item) => item.resourceUuid)
					rpc.query('hybrid/identity-zone', {
						q: `dataCenterUuid?=${datacenterUuidList}`
					})
						.then((resp) => {
							if (resp.inventories.length === 0) {
								newAssistant('HybridIdentityZone', 'add')
								return
							}
							let tasks = []
							let q = null
							let event = self.createEvent('common.update', null, datacenterUuidList.length)
							datacenterUuidList.forEach(function (uuid) {
								((uuid) => {
									q = rpc.put(`hybrid/data-center/${uuid}/sync`, null, event)
										.then(() => {
											self.incEventSuccess(event)
											refreshList(self)
										}, () => {
											self.incEventFail(event)
										})
									tasks.push(q)
								})(uuid)
							})
							return Promise.all(tasks)
						})
				}
			})
		}
	})
}

function refreshList(self) {
  let isPromise = (fn) => {
    return fn && typeof fn.then === 'function'
  }
  if (checkBounce(`refreshList`)) return
  if (self.windowData.currItemUuid === '') {
    if (isPromise(self.queryList)) {
      self.queryList().then(() => {
        if (self.queryResourceProgress) self.queryResourceProgress()
      })
    } else {
      self.queryList()
    }
  } else {
    _.forIn(self.$store.state.windowManager.windows, (item) => {
      if (item.methods && item.methods.queryList) item.methods.queryList()
      else if (item.methods && item.methods.query) item.methods.query()
    })
  }
  self.updateWindow({ rotate: true })
  let interval = setInterval(() => {
    if (self.windowData.rotate) {
      self.updateWindow({ rotate: false })
      clearInterval(interval)
    } else self.updateWindow({ rotate: true })
  }, 1000)
}

export const tencentAsync = (self) => {
    let newAssistant = (resourceName, operation) => {
      let id = `assistant-${genUniqueId()}`
      self.createAssistant({
        id,
        title: 'syncDataTitle',
        operation,
        ownerId: self.windowData.id,
        content: `lackOf${resourceName}`,
        handler: () => {
          if(resourceName === 'HybridTencentKeySecret')
            self.$router.push({name: "createHybridTencentKeySecret"})
          if(resourceName === 'HybridTencentIdentityZone')
            self.$router.push({name: 'createHybridTencentIdentityZone'})
        }
      })
    }
    rpc.query('/hybrid/tencent/key', {count: true}).then(resp => {
      if (resp.total === 0) {
        newAssistant('HybridTencentKeySecret', 'add')
      }
    })
    rpc.query('/hybrid/tencent/key', {
      q: 'current=true'
    }).then((resp) => {
      if (resp.inventories.length === 1) {
        rpc.query('system-tags', {
          q: ['resourceType=TencentDataCenterVO', `tag=accesskey::${resp.inventories[0].secretId}`]
        }).then((resp) => {
          if (resp.inventories.length === 0) {
            newAssistant('HybridTencentIdentityZone', 'add')
            return
          } else {
            let datacenterUuidList = resp.inventories.map((item) => item.resourceUuid)
            rpc.query('hybrid/tencent/identity-zone', {
              q: `dataCenterUuid?=${datacenterUuidList}`
            })
              .then((resp) => {
                if (resp.inventories.length === 0) {
                  newAssistant('HybridTencentIdentityZone', 'add')
                  return
                }
                let tasks = []
                let q = null
                let event = self.createEvent('common.update', null, datacenterUuidList.length)
                datacenterUuidList.forEach(function (uuid) {
                  ((uuid) => {
                    q = rpc.put(`hybrid/tencent/data-center/${uuid}/sync`, null, event)
                      .then(() => {
                        self.incEventSuccess(event);
                        refreshList(self);
                      }, () => {
                        self.incEventFail(event)
                      })
                    tasks.push(q)
                  })(uuid)
                })
                return Promise.all(tasks)
              })
          }
        })
      }
    })
}


export const huaweiAsync = (self) => {
  let newAssistant = (resourceName, operation) => {
    let id = `assistant-${self.genUniqueId()}`
    self.createAssistant({
      id,
      title: 'syncDataTitle',
      operation,
      ownerId: self.windowData.id,
      content: `lackOf${resourceName}`,
      handler: () => {
        if(resourceName === 'HybridHuaweiyunKeySecret')
            self.$router.push({name: "createHybridHuaWeiAccountKey"})
          if(resourceName === 'HuaweiIdentityZone')
            self.$router.push({name: 'createHybridHuaweiIdentityZone'})
      }
    })
  }
  rpc.query('/brid/huawei/key', {count: true}).then(resp => {
    if (resp.total === 0) {
      newAssistant('HybridHuaweiyunKeySecret', 'add')
    }
  })
  rpc.query('/brid/huawei/key', {
    q: 'current=true'
  }).then((resp) => {
    if (resp.inventories.length === 1) {
      rpc.query('system-tags', {
        q: ['resourceType=HDataCenterVO', `tag=accesskey::${resp.inventories[0].akey}`]
      }).then((resp) => {
        if (resp.inventories.length === 0) {
          newAssistant('HuaweiIdentityZone', 'add')
          return
        } else {
          let datacenterUuidList = resp.inventories.map((item) => item.resourceUuid)
          rpc.query('brid/identity-zone', {
            q: `dataCenterUuid?=${datacenterUuidList}`
          })
            .then((resp) => {
              if (resp.inventories.length === 0) {
                newAssistant('HuaweiIdentityZone', 'add')
                return
              }
              let tasks = []
              let q = null
              let event = self.createEvent('common.update', null, datacenterUuidList.length)
              datacenterUuidList.forEach(function (uuid) {
                ((uuid) => {
                  q = rpc.put(`brid/data-center/${uuid}/sync`, null, event)
                    .then(() => {
                      self.incEventSuccess(event)
                    }, () => {
                      self.incEventFail(event)
                    })
                  tasks.push(q)
                })(uuid)
              })
              return Promise.all(tasks)
            })
        }
      })
    }
  })
}
