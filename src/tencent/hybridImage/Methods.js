
import Utils from 'src/utils/utils'
import rpc from 'src/utils/rpc'
export default {
	name: "HybridTencentImageMethods",
	methods: {
		...Utils,
		getTencentDataCenterName(uuid) {
			let self = this, value = '';
			try {
				value = self.dbData.hybridTencentDataCenter[uuid].regionName;
				if (value === undefined) return new Error('error');
			} catch (e) {
				if (self.checkBounce(`getDataCenterName-${uuid}`)) value = '';
				value = '';
				rpc.query(`/hybrid/tencent/data-center/${uuid}`)
					.then((resp) => {
						if (resp.inventories.length > 0) {
							return self.updateDbRow({
								tableName: 'hybridTencentDataCenter',
								id: resp.inventories[0].uuid,
								data: resp.inventories[0]
							});
						};
					})
					.then(() => this.$nextTick(this.$forceUpdate));
			};
			return value;
		},
		delete(uuidList, isOrigin, fn) {
			let self = this, event = null, p = null, tasks = [], url = '';
			event = self.createEvent('hybridTencentImage.action.delete', uuidList.length === 1 ? self.dbData.hybridTencentImage[uuidList[0]].name : '', uuidList.length);
			uuidList.forEach((uuid) => {
				((uuid) => {
					if (isOrigin && self.dbData.hybridTencentImage[uuid].typ !== 'PUBLIC_IMAGE') {
						url = `/hybrid/tencent/image/remote/${uuid}`
					} else {
						url = `/hybrid/tencent/image/${uuid}`
					};
					p = rpc._delete(url, null, event)
						.then(() => {
							if (fn) fn();
							self.incEventSuccess(event);
						}, () => {
							self.incEventFail(event);
						})
					tasks.push(p);
				})(uuid)
			})
			return Promise.all(tasks);
		},
		async(uuidList, fn) {
			let self = this, event = null, p = null, tasks = [];
			event = self.createEvent('hybridTencentImage.action.async', uuidList.length === 1 ? self.dbData.hybridTencentImage[uuidList[0]].name : '', uuidList.length);
			uuidList.forEach((uuid) => {
				((uuid) => {
					p = rpc.post(`/hybrid/tencent/image/${self.dbData.hybridTencentImage[uuid].dataCenterUuid}/sync`, null, event)
						.then(() => {
							if (fn) fn();
							self.incEventSuccess(event);
						}, () => {
							self.incEventFail(event);
						})
					tasks.push(p);
				})(uuid)
			})
			return Promise.all(tasks);
		},
		async create(param) {
			let self = this, event = null, resp = null, uuidList = [], row = {}, table = {};
			event = self.createEvent('hybridTencentImage.action.create', param.name);
			try {
				resp = await rpc.create('/hybrid/tencent/image', param, event);
				self.incEventSuccess(event);
			} catch (e) {
				self.incEventFail(event);
			};
			self.updateDbTable({
				tableName: 'hybridTencentImage',
				list: [resp.inventory]
			});
			if (self.windowData.uuidList) {
				uuidList = self.windowData.uuidList.slice();
				if (uuidList.indexOf(resp.inventory.uuid) === -1) {
					uuidList.unshift(resp.inventory.uuid);
					row[resp.inventory.uuid] = {};
					row[resp.inventory.uuid].selected = false;
				};
				table = Object.assign({}, { ...self.windowData.table }, row);
				self.updateWindow({ table, uuidList });
				self.updateCount();
			}
		},
		updateCount() {
			let self = this, searchConditionList = [], tasks = [], task1 = null, task2 = null;
			if (self.selectVal !== '' && self.searchStr !== '') {
				searchConditionList = searchConditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
			};
			task1 = rpc.query('/hybrid/tencent/image', {
				q: ['type=publicImage'].concat(searchConditionList),
				count: true
			})
				.then((resp) => {
					self.updateWindow({ publicImageCount: resp.total });
				});
			task2 = rpc.query('/hybrid/tencent/image', {
				q: ['type=privateImage'].concat(searchConditionList),
				count: true
			})
				.then((resp) => {
					self.updateWindow({ privateImageCount: resp.total });
				});
			tasks.push(task1, task2);
			return Promise.all(tasks);
		},

		getData() {
			let self = this;
			return self.windowData.uuidList.map( (uuid) => {
				return self.dbData.hybridTencentImage[uuid];
			})
		},

		//获得本地镜像名称
    getImageName(uuid) {
      let value
      let self = this
      try {
        value = self.dbData.image[uuid].name
      } catch (e) {
        if (checkBounce(`getImageName-${uuid}`)) return ''
        value = ''
        rpc.query(`images/${uuid}`)
          .then((resp) => {
            if (resp.inventories.length > 0) {
              return self.updateDbRow({
                tableName: 'image',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
            } else {
              return rpc.queryResourceNames(self, 'image', uuid)
            }
          })
          .then(() => this.$nextTick(this.$forceUpdate))
      }
      return value
		}
	}
}
