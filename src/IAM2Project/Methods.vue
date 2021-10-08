<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  export default {
    methods: {
      getProjectIAM2VirtualIDGroupNum: function (projectUuidList) {
        const self = this
        return rpc.query('iam2/projects/groups', {
          q: `projectUuid?=${projectUuidList}`
        }).then((resp) => {
          let obj = {}
          for (let j = projectUuidList.length - 1; j >= 0; j--) {
            obj.iAM2VirtualIDGroupNum = 0
            for (let i = resp.inventories.length - 1; i >= 0; i--) {
              if (projectUuidList[j] === resp.inventories[i].projectUuid) {
                obj.iAM2VirtualIDGroupNum += 1
              }
            }
            self.updateDbRow({
              tableName: 'iam2projectA',
              id: projectUuidList[j],
              data: obj
            })
          }
        })
      },
      getProjectRetirePolicy: function (projectUuidList) {
        const self = this
        let project = ''
        if (projectUuidList.length) {
          projectUuidList.forEach(function (projectUuid) {
            ((projectUuid) => {
              let obj = {}
              obj.projectCycle = 'unlimited'
              obj.deadline = ''
              obj.ecoveryStrategy = ''
              obj.retirePolicyUuid = ''
              obj.projectStatus = 'Normal'
              project = _.cloneDeep(self.dbData.iam2project[projectUuid])
              if (project.attributes && project.attributes.length > 0) {
                for (let i = project.attributes.length - 1; i >= 0; i--) {
                  if (project.attributes[i].name === '__RetirePolicy__') {
                    obj.projectCycle = 'timingRecovery'
                    obj.ecoveryStrategy = project.attributes[i].value.split(' ')[0]
                    obj.deadline = project.attributes[i].value.split(' ').slice(2).join(' ')
                    obj.retirePolicyUuid = project.attributes[i].uuid
                    obj.projectStatus = window.___currServerTimeMillionDvalue + Date.now() - (new Date(obj.deadline).getTime()) >= 0 ? 'Expired' : 'Normal'
                  }
                }
              }
              return self.updateDbRow({
                tableName: 'iam2projectA',
                id: projectUuid,
                data: obj
              }).then(() => self.$nextTick(self.$forceUpdate))
            })(projectUuid)
          })
        }
      },
      getProjectRelatedZone: function (projectUuidList) {
        const self = this
        let tasks = []
        let p = null
        if (projectUuidList.length) {
          projectUuidList.forEach(function (projectUuid) {
            ((projectUuid) => {
              p = rpc.query('iam2/projects/attributes', {
                q: [`projectUuid=${projectUuid}`, 'name=__ProjectRelatedZone__']
              }).then((resp) => {
                let obj = {}
                obj.zoneUuidList = []
                obj.zoneUuidList = obj.zoneUuidList.concat(resp.inventories.map(it => it.value))
                return self.updateDbRow({
                  tableName: 'iam2projectA',
                  id: projectUuid,
                  data: obj
                }).then(() => self.$nextTick(self.$forceUpdate))
              })
              tasks.push(p)
            })(projectUuid)
          })
        }
        return Promise.all(tasks)
      },
      getProjectTicketProcess: function (projectUuidList) {
        const self = this
        let tasks = []
        let p = null
        if (projectUuidList.length > 0) {
          projectUuidList.forEach(function (projectUuid) {
            ((projectUuid) => {
              let queryStr = `query iam2ticketflowcollection where projectUuid = '${projectUuid}'`
              p = rpc.query('zql', {
                zql: encodeURIComponent(queryStr)
              }).then(resp => {
                let inventories = resp.results[0].inventories
                let project = _.cloneDeep(self.dbData.iam2projectA[projectUuid]) || {}
                if (inventories.length > 0) {
                  let process = inventories[0]
                  project.processName = process.name
                  project.processUuid = process.uuid
                } else {
                  delete project.processName
                  delete project.processUuid
                }
                return self.forceUpdateDbRow({
                  tableName: 'iam2projectA',
                  id: projectUuid,
                  data: project
                })
              })
              tasks.push(p)
            })(projectUuid)
          })
        }
        return Promise.all(tasks)
      },
      getProjectIAM2VirtualIDNum: function (projectUuidList) {
        const self = this
        let tasks = []
        let p = null
        if (projectUuidList.length > 0) {
          projectUuidList.forEach(function (projectUuid) {
            ((projectUuid) => {
              p = rpc.query('iam2/virtual-ids', {
                q: `projects.uuid=${projectUuid}`,
                count: true
              }).then((resp) => {
                let obj = {}
                obj.iAM2VirtualIDNum = resp.total
                return self.updateDbRow({
                  tableName: 'iam2projectA',
                  id: projectUuid,
                  data: obj
                })
              })
              tasks.push(p)
            })(projectUuid)
          })
        }
        return Promise.all(tasks)
      },
      getProjectAdmin: function (projectUuidList) {
        const self = this
        let tasks = []
        let p = null
        if (projectUuidList.length > 0) {
          projectUuidList.forEach(function (projectUuid) {
            ((projectUuid) => {
              p = rpc.query('iam2/virtual-ids', {
                q: [`projects.uuid=${projectUuid}`, 'attributes.name=__ProjectAdmin__', `attributes.value=${projectUuid}`],
                fields: 'name'
              }).then((resp) => {
                let obj = {}
                obj.projectAdmin = '-'
                if (resp.inventories.length > 0) {
                  obj.projectAdmin = resp.inventories[0].name
                }
                return self.updateDbRow({
                  tableName: 'iam2projectA',
                  id: projectUuid,
                  data: obj
                })
              })
              tasks.push(p)
            })(projectUuid)
          })
        }
        return Promise.all(tasks)
      },
      canDisabledIAM2Project: function (projectUuid) {
        const self = this
        return self.dbData.iam2project[projectUuid].state === 'Enabled'
      },
      canEnabledIAM2Project: function (projectUuid) {
        const self = this
        return self.dbData.iam2project[projectUuid].state === 'Disabled'
      },
      canRecoverRetiredIAM2Project: function (projectUuid) {
        const self = this
        return self.dbData.iam2project[projectUuid] && self.dbData.iam2project[projectUuid].state === 'Retired'
      },
      delete (uuidList, fn) {
        const self = this
        let event = self.createEvent('iam2project.action.delete', uuidList.length === 1 ? self.dbData.iam2project[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`iam2/projects/${uuid}`, null, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      expungeProject: function (uuidList, fn) {
        const self = this
        let event = self.createEvent('iam2project.action.expunge', uuidList.length === 1 ? self.dbData.iam2project[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('iam2/projects', uuid, {
              expungeIAM2Project: {}
            }, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      recoverProject: function (param, fn) {
        const self = this
        let event = self.createEvent('iam2project.action.recover', param.name)
        let taskList = []
        let q = null
        let tasks = []
        let p = null
        p = rpc.update('iam2/projects', param.projectUuid, {
          recoverIAM2Project: {}
        }, event)
          .then((resp) => {
            if (param.projectAdminUuid) {
              // add project admin
              q = self.addProjectAdminToIAM2VirtualID(param.projectUuid, param.projectAdminUuid)
              taskList.push(q)
              let obj = {}
              obj.virtualIDUuids = [param.projectAdminUuid]
              obj.projectUuid = param.projectUuid
              // add project admin to project
              q = self.addIAM2VirtualIDsToProject(obj)
              taskList.push(q)
            }
            if (param.retirePolicyUuid && param.projectCycle === 'timingRecovery') {
              q = self.removeAndAddAttributesToIAM2Project(param)
              taskList.push(q)
            } else if (param.retirePolicyUuid && param.projectCycle === 'unlimited') {
              q = self.removeAttributesFromIAM2Project(param.projectUuid, param.retirePolicyUuid)
              taskList.push(q)
            } else if (!param.retirePolicyUuid && param.projectCycle === 'timingRecovery') {
              q = self.addAttributesToIAM2Project(param)
              taskList.push(q)
            }
            if (fn) fn()
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          return Promise.all(taskList)
        })
      },
      recoverRetiredProject: function (param) {
        const self = this
        let event = self.createEvent('iam2project.action.recover', param.name)
        let tasks = []
        let q = null
        let taskList = []
        let p = null
        if (param.retirePolicyUuidList.length > 0) {
          p = rpc._delete(`iam2/projects/${param.projectUuid}/attributes`, {
            attributeUuids: param.retirePolicyUuidList
          }, event).then(() => {
            self.incEventSuccess(event)
            return rpc.update('iam2/projects', param.projectUuid, {
              'changeIAM2ProjectState': {
                'stateEvent': 'enable'
              }
            }).then(() => {
              if (param.projectCycle === 'timingRecovery') {
                q = self.addAttributesToIAM2Project(param)
                taskList.push(q)
              }
            })
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        } else {
          p = rpc.update('iam2/projects', param.projectUuid, {
            'changeIAM2ProjectState': {
              'stateEvent': 'enable'
            }
          }, event).then(() => {
            if (param.projectCycle === 'timingRecovery') {
              q = self.addAttributesToIAM2Project(param)
              taskList.push(q)
            }
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
          tasks.push(p)
        }
        return Promise.all(tasks).then(() => {
          return Promise.all(taskList)
        })
      },
      addRolesToIAM2VirtualID: function (IAM2VirtualIDUuidList, roleUuidList) {
        const self = this
        if (!(roleUuidList && roleUuidList.length > 0)) return new Promise((resolve, reject) => { resolve() })
        let event = self.createEvent('role.action.addrolestoVirtualID', self.dbData.iam2virtualid[IAM2VirtualIDUuidList[0]] === undefined ? '' : self.dbData.iam2virtualid[IAM2VirtualIDUuidList[0]].name, IAM2VirtualIDUuidList.length)
        let tasks = []
        let p = null
        if (IAM2VirtualIDUuidList.length > 0) {
          IAM2VirtualIDUuidList.forEach(function (virtualIDUuid) {
            ((virtualIDUuid) => {
              p = rpc.create(`iam2/projects/virtual-ids/${virtualIDUuid}/roles`, {
                roleUuids: roleUuidList
              }, event)
                .then((resp) => {
                  self.incEventSuccess(event)
                }, () => {
                  self.incEventFail(event)
                })
              tasks.push(p)
            })(virtualIDUuid)
          })
        }
        return Promise.all(tasks)
      },
      create: async function (param, fn) {
        const self = this
        let event = self.createEvent('iam2project.action.create', param.name)
        let resp
        try {
          if (!param.resourceQuota && param.templateUuid) {
            resp = await rpc.create(`iam2/projects/from/templates/${param.templateUuid}`, param, event)
          } else {
            resp = await rpc.create('iam2/projects', param, event)
          }
        } catch (e) {
          self.incEventFail(event)
          return
        }
        self.incEventSuccess(event)
        let obj = {}
        obj.virtualIDUuids = param.virtualIDUuids
        // get current project's roles
        let roleUuids = await self.getProjectAllRoleList(resp.inventory.uuid, self, resp.inventory.linkedAccountUuid)
        obj.roleUuids = roleUuids
        obj.projectUuid = resp.inventory.uuid
        try {
          await self.addIAM2VirtualIDsToProject(obj)
        } catch (e) {
          self.incEventFail(event)
          rpc._delete(`iam2/projects/${resp.inventory.uuid}`)
          return
        }
        // await self.addRolesToIAM2VirtualID(param.virtualIDUuids, param.roleUuids)
        try {
          await self.addProjectAdminToIAM2VirtualID(resp.inventory.uuid, param.projectAdminUuid)
        } catch (e) {
          self.incEventFail(event)
          rpc._delete(`iam2/projects/${resp.inventory.uuid}`)
          return
        }
        if (!param.resourceQuota && param.templateUuid && param.attributes) {
          let eventattributes = self.createEvent('iam2project.action.RetirePolicy')
          try {
            await rpc.create(`iam2/projects/${resp.inventory.uuid}/attributes`, {
              attributes: param.attributes
            }, eventattributes)
          } catch (e) {
            self.incEventFail(eventattributes)
          }
          self.incEventSuccess(eventattributes)
        }
        if (fn) fn()
        return new Promise((resolve, reject) => { resolve() })
      },
      addIAM2VirtualIDsToProject: async function (params) {
        const self = this
        let event = self.createEvent('iam2virtualid.action.add', self.dbData.iam2virtualid[params.virtualIDUuids[0]] === undefined ? '' : self.dbData.iam2virtualid[params.virtualIDUuids[0]].name)
        let tasks = []
        let p = rpc.create(`iam2/projects/${params.projectUuid}/virtual-ids`, {
          virtualIDUuids: params.virtualIDUuids
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
        p = self.addRolesToIAM2VirtualID(params.virtualIDUuids, params.roleUuids)
        tasks.push(p)
        // p = self.AddRolesToIAM2VirtualID(params)
        // tasks.push(p)
        return Promise.all(tasks)
      },
      changeIAM2ProjectStateEnabled: function (uuidList) {
        const self = this
        if (!_.isArray(uuidList)) {
          uuidList = [uuidList]
        }
        let event = self.createEvent('iam2project.action.restoreLoginProject', uuidList.length === 1 ? this.dbData.iam2project[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('iam2/projects', uuid, {
              'changeIAM2ProjectState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      changeIAM2ProjectStateDisabled: function (uuidList) {
        const self = this
        if (!_.isArray(uuidList)) {
          uuidList = [uuidList]
        }
        let event = self.createEvent('iam2project.action.prohibitLoginProject', uuidList.length === 1 ? this.dbData.iam2project[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.update('iam2/projects', uuid, {
              'changeIAM2ProjectState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      stopAllResourcesInIAM2Project: function (ProjectUuidList) {
        const self = this
        let event = self.createEvent('iam2project.action.StopAllResourcesInIAM2Project', ProjectUuidList.length === 1 ? self.dbData.iam2project[ProjectUuidList[0]].name : '', ProjectUuidList.length)
        let tasks = []
        let p = null
        if (ProjectUuidList.length > 0) {
          ProjectUuidList.forEach(function (projectUuid) {
            ((projectUuid) => {
              p = rpc.update('iam2/projects', projectUuid, {
                'stopAllResourcesInIAM2Project': {}
              }, event)
                .then(() => {
                  self.incEventSuccess(event)
                }, () => {
                  self.incEventFail(event)
                })
              tasks.push(p)
            })(projectUuid)
          })
        }
        return Promise.all(tasks)
      },
      deleteProjectAdminFromIAM2VirtualID: function (ProjectUuidList) {
        const self = this
        let tasks = []
        let p = null
        let taskList = []
        if (ProjectUuidList.length > 0) {
          ProjectUuidList.forEach(function (projectUuid) {
            ((projectUuid) => {
              p = rpc.query('iam2/virtual-ids/attributes', {
                q: [`value=${projectUuid}`, 'name=__ProjectAdmin__']
              }).then((resp) => {
                let obj = {}
                obj[projectUuid] = {}
                obj[projectUuid].identity = ''
                let q = null
                for (let i = resp.inventories.length - 1; i >= 0; i--) {
                  q = self.removeAttributesFromIAM2VirtualID(resp.inventories[i].virtualIDUuid, resp.inventories[i].uuid).then(() => {
                    self.updateDbRow({
                      tableName: 'iam2virtualidA',
                      id: resp.inventories[i].virtualIDUuid,
                      data: obj
                    })
                  })
                  taskList.push(q)
                }
              })
              tasks.push(p)
            })(projectUuid)
          })
        }
        return Promise.all(tasks).then(() => {
          return Promise.all(taskList)
        })
      },
      removeAttributesFromIAM2VirtualID: function (IAM2VirtualIDUuid, attributeUuids) {
        let tasks = []
        let p = rpc._delete(`iam2/virtual-ids/${IAM2VirtualIDUuid}/attributes`, {
          attributeUuids: attributeUuids
        })
        tasks.push(p)
        return Promise.all(tasks)
      },
      removeAttributesFromIAM2Project: function (IAM2ProjectUuid, attributeUuids) {
        const self = this
        let event = self.createEvent('iam2project.action.updateRetirePolicy', self.dbData.iam2project[IAM2ProjectUuid].name)
        let tasks = []
        let p = rpc._delete(`iam2/projects/${IAM2ProjectUuid}/attributes`, {
          attributeUuids: attributeUuids
        }, event).then(() => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
        tasks.push(p)
        return Promise.all(tasks)
      },
      addAttributesToIAM2Project: function (params) {
        const self = this
        let event = self.createEvent('iam2project.action.updateRetirePolicy', self.dbData.iam2project[params.projectUuid].name)
        let tasks = []
        let p = rpc.create(`iam2/projects/${params.projectUuid}/attributes`, {
          attributes: params.attributes
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
        return Promise.all(tasks)
      },
      removeZoneFromIAM2Project: function (IAM2ProjectUuid, attributeUuids) {
        const self = this
        let event = self.createEvent('iam2project.action.removeZone', self.dbData.iam2project[IAM2ProjectUuid].name)
        let tasks = []
        let p = rpc._delete(`iam2/projects/${IAM2ProjectUuid}/attributes`, {
          attributeUuids: attributeUuids
        }, event).then(() => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
        tasks.push(p)
        return Promise.all(tasks)
      },
      addZoneToIAM2Project: function (params) {
        const self = this
        let event = self.createEvent('iam2project.action.addZone', self.dbData.iam2project[params.projectUuid].name)
        let tasks = []
        let p = rpc.create(`iam2/projects/${params.projectUuid}/attributes`, {
          attributes: params.attributes
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
        return Promise.all(tasks)
      },
      removeAndAddAttributesToIAM2Project: function (params) {
        const self = this
        let event = self.createEvent('iam2project.action.updateRetirePolicy', self.dbData.iam2project[params.projectUuid].name)
        let tasks = []
        let taskList = []
        let p = rpc._delete(`iam2/projects/${params.projectUuid}/attributes`, {
          attributeUuids: params.retirePolicyUuid
        }, event).then(() => {
          let q = rpc.create(`iam2/projects/${params.projectUuid}/attributes`, {
            attributes: params.attributes
          }, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          taskList.push(q)
        }, () => {
          self.incEventFail(event)
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          return Promise.all(taskList)
        })
      },
      // updateIAM2ProjectAttribute: function (params) {
      //   const self = this
      //   let event = self.createEvent('iam2project.action.updateRetirePolicy', self.dbData.iam2project[params.projectUuid].name)
      //   let obj = {}
      //   obj['updateIAM2ProjectAttribute'] = params.retirePolicy
      //   let tasks = []
      //   let p = rpc.put(`iam2/projects/attributes/${params.retirePolicyUuid}/actions`, obj, event)
      //   .then((resp) => {
      //     self.incEventSuccess(event)
      //   }, () => {
      //     self.incEventFail(event)
      //   })
      //   tasks.push(p)
      //   return Promise.all(tasks)
      // },
      addProjectAdminToIAM2VirtualID: function (IAM2ProjectUuid, IAM2VirtualIDUuid) {
        const self = this
        let event = self.createEvent('iam2project.action.changeProjectAdmin', self.dbData.iam2virtualid[IAM2VirtualIDUuid] === undefined ? '' : self.dbData.iam2virtualid[IAM2VirtualIDUuid].name)
        let tasks = []
        let attributes = [{ 'name': '__ProjectAdmin__', 'value': `${IAM2ProjectUuid}` }]
        let p = rpc.create(`iam2/virtual-ids/${IAM2VirtualIDUuid}/attributes`, {
          attributes: attributes
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            let obj = {}
            obj.projectAdmin = '-'
            if (self.dbData.iam2virtualid[IAM2VirtualIDUuid]) {
              obj.projectAdmin = self.dbData.iam2virtualid[IAM2VirtualIDUuid].name
            }
            self.updateDbRow({
              tableName: 'iam2projectA',
              id: IAM2ProjectUuid,
              data: obj
            }).then(() => self.$nextTick(self.$forceUpdate))
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
        return Promise.all(tasks)
      },
      addProjectOperatorToIAM2VirtualID: function (IAM2ProjectUuid, IAM2VirtualIDUuidList) {
        const self = this
        let event = self.createEvent('iam2project.action.addAdministrator', self.dbData.iam2virtualid[IAM2VirtualIDUuidList[0]] === undefined ? '' : self.dbData.iam2virtualid[IAM2VirtualIDUuidList[0]].name, IAM2VirtualIDUuidList.length)
        let tasks = []
        let p = null
        let attributes = [{ 'name': '__ProjectOperator__', 'value': `${IAM2ProjectUuid}` }]
        if (IAM2VirtualIDUuidList.length > 0) {
          IAM2VirtualIDUuidList.forEach(function (IAM2VirtualIDUuid) {
            ((IAM2VirtualIDUuid) => {
              p = rpc.create(`iam2/virtual-ids/${IAM2VirtualIDUuid}/attributes`, {
                attributes: attributes
              }, event)
                .then((resp) => {
                  self.incEventSuccess(event)
                }, () => {
                  self.incEventFail(event)
                })
              tasks.push(p)
            })(IAM2VirtualIDUuid)
          })
        }
        return Promise.all(tasks)
      },
      removeProjectOperatorFromIAM2VirtualID: function (IAM2ProjectUuid, IAM2VirtualIDUuidList) {
        const self = this
        let event = self.createEvent('iam2project.action.cancelAdministrator', self.dbData.iam2virtualid[IAM2VirtualIDUuidList[0]] === undefined ? '' : self.dbData.iam2virtualid[IAM2VirtualIDUuidList[0]].name, IAM2VirtualIDUuidList.length)
        let attributeUuids = []
        let iam2virtualid
        let tasks = []
        let p = null
        IAM2VirtualIDUuidList.forEach(function (uuid) {
          ((uuid) => {
            iam2virtualid = _.cloneDeep(self.dbData.iam2virtualid[uuid])
            for (let i = iam2virtualid.attributes.length - 1; i >= 0; i--) {
              if (iam2virtualid.attributes[i].name === '__ProjectOperator__' && iam2virtualid.attributes[i].value === IAM2ProjectUuid) {
                attributeUuids = []
                attributeUuids.push(iam2virtualid.attributes[i].uuid)
                p = rpc._delete(`iam2/virtual-ids/${uuid}/attributes`, {
                  attributeUuids: attributeUuids
                }, event)
                  .then((resp) => {
                    self.incEventSuccess(event)
                  }, () => {
                    self.incEventFail(event)
                  })
                tasks.push(p)
              }
            }
          })(uuid)
        })
        return Promise.all(tasks)
      },
      createIAM2ProjectTemplateFromProject: function (projectUuid, params) {
        const self = this
        let event = self.createEvent('iam2project.action.generatingProjectTemplate', params.name)
        let tasks = []
        let p = null
        p = rpc.create(`iam2/projects/templates/from/projects/${projectUuid}`, params, event)
          .then(() => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
        tasks.push(p)
        return Promise.all(tasks)
      },
      removeIAM2VirtualIDFromProject: function (projectUuid, virtualIDUuids) {
        const self = this
        let event = self.createEvent('iam2project.action.removeMember', virtualIDUuids.length === 1 ? self.dbData.iam2virtualid[virtualIDUuids[0]].name : '', virtualIDUuids.length)
        let tasks = []
        let p = rpc._delete(`iam2/projects/${projectUuid}/virtual-ids`, {
          virtualIDUuids: virtualIDUuids
        }, event)
          .then((resp) => {
            self.setEventSuccess(event)
          }, () => {
            self.setEventFail(event)
          })
        tasks.push(p)
        return Promise.all(tasks)
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      ...Utils
    }
  }
</script>



// WEBPACK FOOTER //
// Methods.vue?e7451f2e
