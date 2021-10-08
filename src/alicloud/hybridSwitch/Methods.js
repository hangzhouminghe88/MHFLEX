import {checkBounce, genUniqueId} from "src/utils/utils";
import rpc from 'src/utils/rpc';
import _ from 'lodash'

export default {
  methods: {
    getIdentityZoneName(uuid) {
      let value = '', self = this;
      try {
        value = self.dbData.hybridIdentityZone[uuid].zoneName;
      }catch (e) {
        value = '';
        if(checkBounce(`getHybridIdentity-${genUniqueId()}`)) return '';
        rpc.query(`hybrid/identity-zone/${uuid}`)
          .then( (resp) => {
            return self.updateDbRow({
              id: uuid,
              tableName: 'hybridIdentityZone',
              data: resp.inventories[0]
            })
          }).then( () => {
            self.$forceUpdate();
        })
      }
      return value;
    },

    getVpcName(uuid) {
      let self = this, value = '';
      try {
        value = self.dbData.hybridVirtualPrivateCloud[uuid].name;
      }catch (e) {
        value = '';
        if(checkBounce(`getHybridVirtualPrivateCloud-${genUniqueId()}`)) return '';
        rpc.query(`hybrid/aliyun/vpc/${uuid}`)
          .then( (resp) => {
            return self.updateDbRow({
              id: uuid,
              tableName: 'hybridVirtualPrivateCloud',
              data: resp.inventories[0]
            })
          }).then( () => {
          self.$forceUpdate();
        })
      }
      return value;
    },

    delete (uuidList, deleteOrigin, fn) {
      const self = this
      let event = self.createEvent('hybridvswitch.action.delete', uuidList.length === 1 ? self.dbData.hybridVSwitch[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      let url = null
      if (deleteOrigin) {
        url = 'hybrid/aliyun/vswitch/remote'
      } else {
        url = 'hybrid/aliyun/vswitch'
      }
      uuidList.forEach(uuid => {
        let p = rpc._delete(`${url}/${uuid}`, null, event).then(resp => {
          if (fn) fn()
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
        tasks.push(p)
      })
      return Promise.all(tasks)
    },

    create(param) {
      let self = this, event = null;
      event = this.createEvent('hybridvswitch.action.create', param.name)
      return rpc.create('hybrid/aliyun/vswitch', param, event)
        .then( () =>{
          self.incEventSuccess(event);
        }).catch(() => {
          self.incEventFail(event);
      })
    },
  }
}
