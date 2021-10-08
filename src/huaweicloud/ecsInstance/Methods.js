import rpc from 'src/utils/rpc';

export  default {
  methods: {
    //华为云停用、启用、重启等操作
    action(uuidList, state) {
      const self = this
      let event = self.createEvent(`vm.action.${state}`, uuidList.length === 1 ? self.dbData.hybridHuaweiEcsInstance[uuidList[0]].name : '', uuidList.length)
      let action = {};
      action[`${state}EcsInstance`] = {};
      let paramList = uuidList.map(( uuid ) => {
        return {
          uuid,
          action
        }
      })
      return self.dispatchActionWithEvent(`hybridHuaweiEcsInstance/${state}`, paramList, null, event);
    },
    //获得控制台url并打开
    getHuaweiEcsInstanceVncUrl(uuidList) {
      let self = this, event, p = null, task = []
      event = self.createEvent('hybridHuaweiInstance.action.openConsole', uuidList.length === 1 ? self.dbData.hybridHuaweiEcsInstance[uuidList[0]].name : '', uuidList.length)
      uuidList.forEach(uuid=>{
        (uuid=>{
          p = rpc.get(`/hybrid/huawei/ecs-vnc/${uuid}`,null,event)
            .then((resp)=>{
              window.open(resp.vncUrl)
              self.incEventSuccess(event)
            },()=>{
              self.incEventFail(event)
            })
          task.push(p)
        })(uuid)
      })
      return Promise.all(task)
    },
    //修改密码
    updateEcsInstancePassword(uuid, password, type) {
      const self = this
      let event = self.createEvent(`hybridecsinstance.action.update${type}Password`, self.dbData.hybridTencentEcsInstance[uuid].name);
      let url = `hybrid/huawei/${uuid}/ecs-vnc`;
      switch (type) {
        case 'Console':
          url = `hybrid/huawei/${uuid}/ecs-vnc`;
          break;
        case 'Root':
          url = `hybrid/huawei/${uuid}/ecs`;
          break;
      }
      let paramList  = {
        url,
        param: {
          password: password
        }
      }
      return self.dispatchActionWithEvent('hybridHuaweiEcsInstance/updateEcsInstancePassword', paramList,null, event)
    },

    //删除云主机
    delete(uuidList, isDeleteRemote) {
      const self = this
      let event = self.createEvent(`vm.action.delete`, uuidList.length === 1 ? self.dbData.hybridHuaweiEcsInstance[uuidList[0]].name : '', uuidList.length)
      return self.dispatchActionWithEvent(`hybridHuaweiEcsInstance/delete`, uuidList, null, event, isDeleteRemote);
    },
  }
}
