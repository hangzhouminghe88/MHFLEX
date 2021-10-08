export default {
  methods: {
    create(param) {
			let self = this;
			let event = this.createEvent('hybridbucket.action.AddBucket', param.bucketName)
			let isRemote = false;//'hybrid/huawei/oss-bucket'
			if (param.showBucketCreateMethod) {
				isRemote = true;//'hybrid/huawei/oss-bucket/remote'
			}
			return self.dispatchActionWithEvent('hybridHuaweiBucket/create', param, null, event, isRemote);
		},
		updateCount() {
			rpc.query('hybrid/huawei/obs-bucket', {
				replyWithCount: true
			})
			.then((resp) => {
				this.updateWindow({
						availableCount: resp.total
				})
			})
		},
		//设置默认
		attach(uuidList) {
			let self = this,
			 event = self.createEvent('hybridbucket.action.attach', uuidList.length === 1 ? self.dbData.hybridHuaweiBucket[uuidList[0]].bucketName : '', uuidList.length);
			 self.dispatchActionWithEvent('hybridHuaweiBucket/attach', uuidList, null, event);
		},
		//删除
		delete(uuidList, isRemote)  {
			let self = this,
			event = self.createEvent('hybridbucket.action.deleteBucket', uuidList.length === 1 ? self.dbData.hybridHuaweiBucket[uuidList[0]].bucketName : '', uuidList.length);
			return self.dispatchActionWithEvent('hybridHuaweiBucket/delete', uuidList, null, event, isRemote);
		}
  }
}
