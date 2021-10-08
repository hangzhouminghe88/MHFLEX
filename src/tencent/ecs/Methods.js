import rpc from 'src/utils/rpc';

export default {
	methods: {
		//创建云主机
		create (param, number) {
			let event = this.createEvent('hybridTencentEcsInstance.action.create', param.name, number)
			let channel = 10000
			let index = 0
			let self = this, tasks = [], p = null;
			function _create () {
				if (index >= number) return
				let p = _.cloneDeep(param)
				if (!p.allocatePublicIp) delete p.ecsBandWidth
				index++
				if (number > 1) p.name = `${param.name}-${index}`
				return new Promise((resolve, reject) => {
         rpc.create('hybrid/tencent/ecs', p, event)
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
				tasks.push(_create())
			}
			return Promise.all(tasks);
		},

		//启用、停用、
		action(uuidList, state) {
			const self = this
      let event = self.createEvent(`vm.action.${state}`, uuidList.length === 1 ? self.dbData.hybridTencentEcsInstance[uuidList[0]].name : '', uuidList.length)
      let action = {};
			action[`${state}EcsInstance`] = {};
			let paramList = uuidList.map(( uuid ) => {
				return {
					uuid,
					action
				}
			})
			return self.dispatchActionWithEvent(`hybridTencentEcsInstance/${state}`, paramList, null, event);
		},

		//删除云主机
		delete(uuidList, isDeleteRemote) {
			const self = this
      let event = self.createEvent(`vm.action.delete`, uuidList.length === 1 ? self.dbData.hybridTencentEcsInstance[uuidList[0]].name : '', uuidList.length)
			return self.dispatchActionWithEvent(`hybridTencentEcsInstance/delete`, uuidList, null, event, isDeleteRemote);
		},

		//打开控制台
		getEcsInstanceVncUrl(uuidList) {
      const self = this
      let event = self.createEvent('hybridecsinstance.action.openConsole', uuidList.length === 1 ? self.dbData.hybridTencentEcsInstance[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      let p = null
      uuidList.forEach((uuid) => {
        ((uuid) => {
          p = rpc.query(`hybrid/tencent/ecs-vnc/${uuid}`, null, event)
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

		 //修改密码
		 updateEcsInstancePassword(uuid, password, type) {
      const self = this
      let event = self.createEvent(`hybridecsinstance.action.update${type}Password`, self.dbData.hybridTencentEcsInstance[uuid].name);
      let url = `hybrid/tencent/${uuid}/ecs-vnc`;
      switch (type) {
        case 'Console':
          url = `hybrid/tencent/${uuid}/ecs-vnc`;
          break;
        case 'Root':
          url = `hybrid/tencent/${uuid}/ecs`;
          break;
      }
      let paramList  = {
         url,
         param: {
          password: password
         }
      }
      return self.dispatchActionWithEvent('hybridTencentEcsInstance/updateEcsInstancePassword', paramList,null, event)
    },
	}
}
