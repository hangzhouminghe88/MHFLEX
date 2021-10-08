
import HybridTencentImageMethods from './Methods'
import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import rpc from 'src/utils/rpc'

export default {
	name: "HybridTencentImageList",

	mixins: [HybridTencentImageMethods],

	computed: {
		...mapGetters({
			get: `hybridTencentImage/getList`
		})
	},


	methods: {
		getCondition() {
			let self = this, conditionList = [];
			if (self.currTab !== 'uploading') {
				conditionList = conditionList.concat(`type=${self.currTab}`);
			}
			if (self.selectVal !== '' && self.searchStr !== '') {
				conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
			};
			return conditionList;
		},

		queryList() {
			let self = this;
			self.updateCount();
			self.windowData.loading = true;
			return self.dispatchAction('hybridTencentImage/basicQuery', {
				start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
				limit: self.windowData.pageSize,
				q: self.getCondition(),
				sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
			}).then(resp => {
				return self.updateWindow({
					uuidList: resp.uuidList,
					table: Utils.createTableObjFromUuidList(resp.uuidList),
					total: resp.total
				}).then(() => {
					self.itemList = self.get(self.windowData.uuidList);
					self.windowData.loading = false;
					self.queryTencentUpLoadingImage();
				})
			}).catch((e) => {
				self.queryTencentUpLoadingImage();
				self.windowData.loading = false;
			})
		},

		queryTencentUpLoadingImage: async function () {
			let uplodingTencentImage = [];
			let uplodingImageUuidList = [];
			let self = this;
			self.uploadItemList = [];
			let systemResp = await rpc.query('system-tags', {
				q: ['resourceType=ImageVO', 'tag~=%25imageImporting%25']
			})
			if (systemResp.inventories.length === 0) {
				return this.updateWindow({
					uplodingImageUuidList: [],
					uploadingCount: 0
				})
			}
			systemResp.inventories.forEach((item) => {
				let it = item.tag.split('::')[1].split(',')
				let imageName = item.tag.split('::')[3].split(',')[0]
				if (item.tag.split('::')[0] === 'imageImporting') {
					it.forEach((datacenteruuid, index) => {
						let obj = {
							uuid: item.resourceUuid + datacenteruuid,
							imageUuid: item.resourceUuid,
							dataCenterUuid: datacenteruuid,
							name: imageName,
							progress: 0
						}
						uplodingTencentImage.push(obj)
						uplodingImageUuidList.push(obj.uuid)
					})
				}
			})
			this.updateDbTable({
				tableName: 'uplodingTencentImage',
				list: uplodingTencentImage
			}).then(() => {
				self.uploadItemList = this.windowData.list;
			})
			if (uplodingImageUuidList.length === 0) return this.updateWindow({ uplodingImageUuidList: uplodingImageUuidList, uploadingCount: 0 })
			this.updateWindow({
				uplodingImageUuidList,
				uploadingCount: uplodingImageUuidList.length
			})
			this.refreshEcsImageProcess()
		},
		refreshEcsImageProcess() {
			if (this.windowData.uplodingImageUuidList && this.windowData.uplodingImageUuidList.length > 0) {
				this.windowData.uplodingImageUuidList.forEach(uuid => this.getEcsImageProcess(uuid))
			}
		},
		getEcsImageProcess(uuid) {
			let imageUuid = this.dbData.uplodingTencentImage[uuid].imageUuid
			let dataCenterUuid = this.dbData.uplodingTencentImage[uuid].dataCenterUuid
			rpc.query(`hybrid/tencent/image/${dataCenterUuid}/${imageUuid}/progress`, {})
				.then((resp) => {
					let uplodingImage = _.cloneDeep(this.dbData.uplodingTencentImage[uuid])
					uplodingImage.progress = resp.progress
					this.updateDbRow({
						tableName: 'uplodingTencentImage',
						id: uuid,
						data: uplodingImage
					})
					if (resp.progress == '99%' || Object.keys(resp.progress).length == 0) {
						uplodingImage.progress = '99%'
						this.updateDbRow({
							tableName: 'uplodingTencentImage',
							id: uuid,
							data: uplodingImage
						})
						this.queryTencentUpLoadingImage()
					}
				})
		},
		pageDelete() {
			let self = this, uuidList = [];
			if (!self.isSelected) return;
			uuidList = self.selectedList;
			self.openDialog('ConfirmDlg', {
				uuidList,
				title: 'image.deleteImage',
				description: 'image.info.deleteConfirm',
				icon: 'image_popupico',
				checkBoxText: 'hybrid.deleteOrigin',
				isChecked: !self.isAllSystemImage(),
				warning: !self.isAllSystemImage() ? 'hybrid.info.deleteImage' : '',
				getName: (uuid) => {
					return self.dbData.hybridTencentImage[uuid].name;
				},
				ok: (isChecked) => {
					self.delete(uuidList, isChecked, self.queryList)
				},
			})
		},

		//是否全为公有镜像
		isAllSystemImage() {
			let self = this;
			return self.selectedList.every(uuid => {
				return self.dbData.hybridTencentImage[uuid].type === 'PUBLIC_IMAGE'
			});
		},
	},
}
