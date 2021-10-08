export default {
  methods: {
    //创建子网
    create(param) {
			let _this = this,
			event = _this.createEvent('hybridvswitch.action.create', param.name);
			return _this.dispatchActionWithEvent('hybridHuaweiSubNet/create',  param, null, event);
    },
    //删除子网
    delete(uuidList, isDeleteOrigin) {
      let _this = this, event=null;
      event = _this.createEvent('hybridHuaweiSubNets.action.delete', uuidList.length === 1 ? _this.dbData.hybridHuaweiSubNets[uuidList[0]].name : '', uuidList.length);
      url = null;
      if (isDeleteOrigin) {
        url = '/hybrid/huawei/subnet/remote'
      } else {
        url = '/hybrid/huawei/subnet/'
			}
			let realParam = uuidList.map(uuid => {
				return{
					uuid,
					url
				}
			})
			return self.dispatchActionWithEvent('hybridHuaweiSubNet/delete',  realParam, null, event);
    }
  }
}
