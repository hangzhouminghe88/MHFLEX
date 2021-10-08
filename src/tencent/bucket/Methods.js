import rpc from 'src/utils/rpc';

export default {
	methods: {
		create(param) {
			let self = this;
			let event = this.createEvent('hybridbucket.action.AddBucket', param.bucketName)
			let isRemote = false;//'hybrid/tencent/oss-bucket'
			if (param.showBucketCreateMethod) {
				isRemote = true;//'hybrid/tencent/oss-bucket/remote'
			}
			return self.dispatchActionWithEvent('hybridTencentBucket/create', param, null, event, isRemote);
		},
		updateCount() {
			rpc.query('hybrid/tencent/oss-bucket', {
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
			 event = self.createEvent('hybridbucket.action.attach', uuidList.length === 1 ? self.dbData.hybridTencentBucket[uuidList[0]].bucketName : '', uuidList.length);
			 self.dispatchActionWithEvent('hybridTencentBucket/attach', uuidList, null, event);
		},
		//删除
		delete(uuidList, isRemote)  {
			let self = this, 
			event = self.createEvent('hybridbucket.action.deleteBucket', uuidList.length === 1 ? self.dbData.hybridTencentBucket[uuidList[0]].bucketName : '', uuidList.length);
			return self.dispatchActionWithEvent('hybridTencentBucket/delete', uuidList, null, event, isRemote);
		}
	}
}