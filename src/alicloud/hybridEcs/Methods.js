import Utils from 'src/utils/utils';
import rpc from 'src/utils/rpc';
import _ from 'lodash'

export default {
  methods: {
    ...Utils,

    getEcsVpcName(uuid) {
      let value = '', self = this;
      try {
        value = self.dbData.hybridVirtualPrivateCloud[self.dbData.hybridEcsInstance[uuid].ecsVpcUuid].name;
      } catch (e) {
        if (self.checkBounce(`getEcsVpcName-${uuid}`)) return '';
        value = ''
        rpc.query(`hybrid/aliyun/vswitch/${self.dbData.hybridEcsInstance[uuid].ecsVSwitchUuid}`, {
          fields: 'ecsVpcUuid'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let hybridEcsInstance = _.cloneDeep(self.dbData.hybridEcsInstance[uuid])
              hybridEcsInstance.ecsVpcUuid = resp.inventories[0].ecsVpcUuid
              return self.updateDbRow({
                tableName: 'hybridEcsInstance',
                id: uuid,
                data: hybridEcsInstance
              }).then(() => {
                return rpc.query(`hybrid/aliyun/vpc/${self.dbData.hybridEcsInstance[uuid].ecsVpcUuid}`)
                  .then((resp) => {
                    return self.updateDbRow({
                      tableName: 'hybridVirtualPrivateCloud',
                      id: resp.inventories[0].uuid,
                      data: resp.inventories[0]
                    })
                  })
              })
            } else {
              return ''
            }
          })
          .then(() => self.$nextTick(self.$forceUpdate))
      }
      return value;
    },

    getIdentityZone(uuid) {
      let self = this, value = '';
      try {
        value = self.dbData.hybridIdentityZone[self.dbData.hybridEcsInstance[uuid].identityZoneUuid].zoneName;
      } catch (e) {
        if (self.checkBounce(`getEcsIdentityZoneName-${uuid}`)) return '';
        value = ''
        rpc.query(`hybrid/identity-zone/${self.dbData.hybridEcsInstance[uuid].identityZoneUuid}`)
          .then((resp) => {
            return self.updateDbRow({
              tableName: 'hybridIdentityZone',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
          })
      }
      return value;
    },

    getEcsImageName(uuid) {
      let value
      try {
        value = this.dbData.hybridImage[uuid].name
      } catch (e) {
        if (this.checkBounce(`getHybridImageName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/aliyun/image/${uuid}`)
          .then((resp) => {
            return this.updateDbRow({
              tableName: 'hybridImage',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },

    getSecurityGroupName(uuid) {
      let value
      try {
        value = this.dbData.hybridSecurityGroup[this.dbData.hybridEcsInstance[uuid].ecsSecurityGroupUuid].name
      } catch (e) {
        if (this.checkBounce(`getSecurityGroupName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/aliyun/security-group/${this.dbData.hybridEcsInstance[uuid].ecsSecurityGroupUuid}`)
          .then((resp) => {
            return this.updateDbRow({
              tableName: 'hybridSecurityGroup',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },

    getEcsVSwitchName (uuid) {
      let value
      try {
        value = this.dbData.hybridVSwitch[this.dbData.hybridEcsInstance[uuid].ecsVSwitchUuid].name
      } catch (e) {
        if (this.checkBounce(`getEcsVSwitchName-${uuid}`)) return ''
        value = ''
        rpc.query(`hybrid/aliyun/vswitch/${this.dbData.hybridEcsInstance[uuid].ecsVSwitchUuid}`)
          .then((resp) => {
            return this.updateDbRow({
              tableName: 'hybridVSwitch',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
    },
    //停用启用重启控制台
    action(uuidList, fn, state) {
      const self = this
      let event = self.createEvent(`vm.action.${state}`, uuidList.length === 1 ? self.dbData.hybridEcsInstance[uuidList[0]].name : '', uuidList.length)
      let tasks = [], action = {};
      action[`${state}EcsInstance`] = {};
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          let vmInventory = _.cloneDeep(self.dbData.hybridEcsInstance[uuid])
          vmInventory.ecsStatus = state.replace(/\b^[\w]/, (it) => {
            return it.toUpperCase()
          }).replace(/$/, 'ing')
          self.updateDbRow({
            tableName: 'hybridEcsInstance',
            id: uuid,
            data: vmInventory
          })
          let p = rpc.update('hybrid/aliyun/ecs', uuid, action, event)
            .then(resp => {
              self.incEventSuccess(event)
              self.updateDbRow({
                tableName: 'hybridEcsInstance',
                id: uuid,
                data: vmInventory
              })
            }, () => {
              self.incEventFail(event)
              rpc.query(`hybrid/aliyun/ecs`, {
                q: `uuid=${uuid}`,
                fields: 'ecsStatus'
              }).then((respFail) => {
                if (respFail.inventories.length > 0) {
                  let vmInventories = respFail.inventories[0]
                  self.updateDbRow({
                    tableName: 'hybridEcsInstance',
                    id: uuid,
                    data: vmInventories
                  })
                }
              })
            })
          tasks.push(p)
        })(uuid)
      })
      return Promise.all(tasks).then(() => {
        if (fn) fn();
      })
    },
    //打开控制台
    getEcsInstanceVncUrl(uuidList) {
      const self = this
      let event = self.createEvent('hybridecsinstance.action.openConsole', uuidList.length === 1 ? self.dbData.hybridEcsInstance[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      let p = null
      uuidList.forEach((uuid) => {
        ((uuid) => {
          p = rpc.query(`hybrid/aliyun/ecs-vnc/${uuid}`, null, event)
            .then((resp) => {
              window.open(resp.vncUrl)
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })(uuid)
      })
      return Promise.all(tasks)
    },

    delete(uuidList, deleteOrigion, fn) {
      let self = this, tasks = [],
        p = null,
        event = self.createEvent('hybridecsinstance.action.delete', uuidList.length === 1 ? self.dbData.hybridEcsInstance[uuidList[0]].name : '', uuidList.length),
        url = '';
      uuidList.forEach((uuid) => {
        ((uuid) => {
          if (deleteOrigion) {
            url = `hybrid/aliyun/ecs/${uuid}/remote`;
          } else {
            url = `hybrid/aliyun/ecs/${uuid}`;
          }
          p = rpc._delete(`${url}`, null, event)
            .then(() => {
              self.incEventSuccess(event)
            }).catch(() => {
              self.incEventFail(event);
            });
          tasks.push(p);
        })(uuid)
      });
      return Promise.race(tasks).then(() => {
        if (fn) fn()
      });
    },

    create(param, number) {
      let event = this.createEvent('hybridecsinstance.action.create', param.name, number)
      let channel = 10000
      let index = 0
      let self = this

      function _create() {
        if (index >= number) return
        let p = _.cloneDeep(param)
        if (!p.allocatePublicIp) delete p.ecsBandWidth
        index++
        if (number > 1) p.name = `${param.name}-${index}`
        return new Promise((resolve, reject) => {
          return rpc.create('hybrid/aliyun/ecs', p, event)
            .then(resp => {
              self.incEventSuccess(event);
              self.$nextTick(_create)
              resolve();
            }, () => {
              self.incEventFail(event)
              self.$nextTick(_create)
              reject();
            })
        })
      }

      for (let i = 0; i < channel; i++) {
        return _create()
      }
    },
    //修改密码
    updateEcsInstancePassword(uuid, password, type) {
      const self = this
      let event = self.createEvent(`hybridecsinstance.action.update${type}Password`, self.dbData.hybridEcsInstance[uuid].name);
      let url = `hybrid/aliyun/${uuid}/ecs-vnc`;
      switch (type) {
        case 'Console':
          url = `hybrid/aliyun/${uuid}/ecs-vnc`;
          break;
        case 'Root':
          url = `hybrid/aliyun/${uuid}/ecs`;
          break;
      }
      return rpc.create(url, {password: password}, event)
        .then((resp) => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
    },
    //更新Ecs
    updateEcsInstanceInfo: function (uuid, type, value, fn) {
      const self = this
      let event = self.createEvent('common.updateInfo' + type, value)
      let msg = {}
      msg[type] = value
      rpc.create(`hybrid/aliyun/${uuid}/ecs`, msg, event)
        .then((resp) => {
          self.updateDbRow({
            tableName: 'hybridEcsInstance',
            id: uuid,
            data: resp.inventory
          })
          self.incEventSuccess(event);
          if(fn) fn();
        }, () => {
          self.incEventFail(event)
        })
    },
  }
}
