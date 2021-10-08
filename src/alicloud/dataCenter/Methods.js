import rpc from 'src/utils/rpc';
import _ from 'lodash'

export default {
  methods:  {
    delete (uuidList, fn) {
      let self = this, tasks = [], p = null, event = null;
      event = self.createEvent('hybriddatacenter.action.deleteRegion', uuidList.length === 1 ? self.dbData.hybridDataCenter[uuidList[0]].regionName : '', uuidList.length);
      for(let uuid of uuidList){
        ((uuid) => {
          p = rpc._delete(`hybrid/data-center/${uuid}`, null, event)
            .then( () => {
              self.incEventSuccess(event);
              if(fn) fn();
            }).catch( () => {
              self.incEventFail(event);
            })
        })(uuid)
        tasks.push(p);
      }
      return Promise.race(tasks);
    },

    async create (param) {
      let event = this.createEvent('hybriddatacenter.action.AddRegion', param.regionName)
        let resp
        try {
          resp = await rpc.create('hybrid/data-center', param, event)
          this.incEventSuccess(event)
        } catch (e) {
          this.incEventFail(event)
          return
        }

        if (param.ossBucketUuid) {
          let attachBucket = this.createEvent('hybriddatacenter.action.attach', param.regionName)
          try {
            await rpc.post(`hybrid/aliyun/${resp.inventory.uuid}/oss-bucket/${param.ossBucketUuid}`, null, attachBucket)
            this.incEventSuccess(attachBucket)
          } catch (e) {
            this.incEventFail(attachBucket)
          }
        }
        return this.updateDbTable({
          tableName: 'hybridDataCenter',
          list: [resp.inventory]
        })
    }
  }
}
