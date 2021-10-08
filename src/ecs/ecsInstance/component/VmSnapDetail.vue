<template>
  <detail-template class="vm-snap__container">
		<div slot="header" class="detail-header">
			<span class="detail-title">快照详情</span>
			<span class="detail-header-item create-back el-icon-back" @click="$emit('close')">
				返回快照
			</span>
			<span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">
							{{$t('common.snapshotActions')}}
						</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
             <a v-permission="'SP_VOLUME.REVERT'" :class="{'disabled-text': !showRecover}" style="padding-top: 12px;" @click="showRecover && pageRevert()">{{$t("common.recover")}}</a>
             <a v-permission="'SP_VOLUME.DELETE'" :class="{'disabled-text': !showDelete}" style="padding-bottom:12px;" @click="showDelete && pageDelete()">{{$t("common.destroy")}}</a>
						</div>
					</span>
				</drop-down>
			</span>
			<el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
				<el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
				<el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
			</el-tabs>
		</div>
		<div slot="body" class="detail-body" v-if="currTab === 'info'">
			<div class="left">
				<div class="left-header">
					<div class="icon"></div>
					<div class="after-icon">
						<detail-info-state outer-class-name="detail-page-state" v-if="model && model.state" :state="model.state" />
            <detail-info-state outer-class-name="detail-page-state" v-if="model && model.status" :state="model.status" />
					</div>
					<detail-name class="name" :param="updateResourceParam('name')"/>
					<detail-description class="description" :param="updateResourceParam('description')"/>
				</div>
				<div class="left-body">
					<div class="detail-block-header">
						{{$t('common.overview')}}
					</div>
					<detail-row
					  :param="{
							title: 'common.format',
							content: model && model.format
						}"
					/>
					<detail-row
					  :param="{
							title: 'common.type',
							content: model && model.type
						}"
					/>
						<detail-row
					  :param="{
							title: 'snapshot.volumeType',
							content: model && model.volumeType
						}"
					/>
						<detail-row
					  :param="{
							title: 'common.createDate',
							content: model && formatDatetime(new Date(model.createDate))
						}"
					/>
						<detail-row
					  :param="{
							title: 'common.lastOpDate',
							content: model && formatDatetime(new Date(model.lastOpDate))
						}"
					/>
				</div>
			</div>
			<div class="right">
				<div style="height: 40px"></div>
          <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
				<detail-row
				  :param="{
						title: 'UUID',
						content: model && model.uuid,
						copy: true
					}"
				/>
				<detail-row v-if="model && dbData.common.isAdmin && dbData.primarystorage[model.primaryStorageUuid]"
				  :param="{
						title: 'common.primaryStorage',
            content: model && dbData.primarystorage[model.primaryStorageUuid].name,
						handler: (item) => {
							$router.push({name: 'detailprimarystorage', params: {uuid: model.primaryStorageUuid}});
						}
					}"
				/>
				<detail-row v-if="model && dbData.common.isAdmin && dbData.volume[model.volumeUuid]"
				  :param="{
						title: 'common.volume',
            content: model && dbData.volume[model.volumeUuid].name,
						handler: (item) => {
							$router.push({name: 'detailVolume', params: {uuid: model.volumeUuid}});
						}
					}"
				/>
				<detail-row
				  :param="{
						title: 'common.installPath',
						content: model && model.primaryStorageInstallPath,
						copy: true
					}"
				/>
			</div>
		</div>
		<div slot="body" class="detail-body" v-if="currTab === 'log'">
				<log-list :param="{uuid: windowData.dataUuid}"/>
			</div>
	</detail-template>
</template>

<script>
import DetailInfoState from 'src/component/DetailInfoState';
import DetailTemplate from 'src/component/DetailTemplate';
import LogList from 'src/component/LogList';
import WindowBase from 'src/windows/Window';
import Utils from 'src/utils/utils';
import rpc from 'src/utils/rpc';

export default {
	mixins: [WindowBase],

	props: {
		param: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},

  components: {
		DetailTemplate,
		DetailInfoState,
		LogList
	},

	computed: {
		model: {
			get () {
				return this.snapshot;
			},
			set (val) {
				let self = this;
				self.snapshot = val;
			}
		}
	},

	created () {
		let update = (key, newValue) => {
      if (this.dbData.snapshot[this.windowData.dataUuid][key] === newValue) return
      if (key === 'name' && !String(newValue).trim()) return
      let self = this
      let event = self.createEvent(`common.updateInfo${key}`, newValue)
      let param = {}
      param[key] = newValue
      rpc.update('volume-snapshots', self.windowData.dataUuid, {
        'updateVolumeSnapshot': param
      }, event)
      .then(resp => {
				self.incEventSuccess(event)
				self.query();
        self.updateDbRow({
          tableName: 'snapshot',
          id: self.windowData.dataUuid,
          data: resp.inventory
        })
        .then(() => {
          this.$forceUpdate()
        })
      }, () => {
        self.incEventFail(event)
      })
    }
    this.updateSnapshot = _.debounce(update, 100)
    let dataUuid = this.param.uuid
    let volumeUuid = this.param.volumeUuid
    let volumeType = this.param.volumeType
    this.updateWindow({
      dataUuid: dataUuid,
      volumeUuid: volumeUuid,
      volumeType: volumeType,
      methods: {
        query: this.query,
        close: () => { return this.$emit('close') }
      }
    })
    .then(() => {
      return this.query()
    })
    .then(() => {
      this.$forceUpdate()
    })
	},

	data ()  {
		return {
			currTab: 'info',
			updateSnapshot: null,
			snapshot: null,
			showRecover: true,
      showDelete: true,
		}
	},

	methods: {
		...Utils,

	  query () {
      const self = this
      let volumeInventories
      let tasks = []
      let p = null
      p = rpc.query(`volume-snapshots/${self.windowData.dataUuid}`)
      .then((resp) => {
        if (resp.inventories.length > 0) {
          volumeInventories = resp.inventories[0]
          self.updateDbRow({
            tableName: 'snapshot',
            id: volumeInventories.uuid,
            data: volumeInventories
          }).then(() => {
            if (self.dbData.common.isAdmin) {
              rpc.query('primary-storage', {
                q: `uuid=${volumeInventories.primaryStorageUuid}`
              }).then((psResp) => {
                if (psResp.inventories.length > 0) {
                  self.updateDbRow({
                    tableName: 'primarystorage',
                    id: psResp.inventories[0].uuid,
                    data: psResp.inventories[0]
                  })
                }
              })
            }
          })
        }
      })
      tasks.push(p)
      p = rpc.query(`volumes/${self.windowData.volumeUuid}`)
      .then((volumesResp) => {
        if (volumesResp.inventories.length > 0) {
          self.updateDbRow({
            tableName: 'volume',
            id: volumesResp.inventories[0].uuid,
            data: volumesResp.inventories[0]
          })
        }
      })
      tasks.push(p)

      p = (() => {
        let uuid = self.windowData.volumeUuid
        let volumeType = self.windowData.volumeType
        let vmConditions = []
        let getShareableVolumeVmRefs = () => {
          return rpc.query('volumes/vm-instances/refs', {
            q: `volumeUuid=${uuid}`
          })
        }
        let getSnapshotCapabilities = (conditions) => {
          return rpc.query('vm-instances', {
            q: conditions
          }).then((vmResp) => {
            if (vmResp.inventories.length === 0) return
            let isRunning = vmResp.inventories.some(it => it.state === 'Running')
            let isStopped = vmResp.inventories.some(it => it.state === 'Stopped')
            self.showDelete = false
            self.showRecover = false
            if (isRunning) {
              self.showDelete = true
            }
            if (isStopped) {
              self.showDelete = true
              self.showRecover = true
            }
          })
        }
        if (volumeType === 'Root') {
          vmConditions = [`rootVolumeUuid=${uuid}`]
        }
        if (volumeType === 'Data') {
          if (self.dbData.volume[uuid].isShareable) {
            return getShareableVolumeVmRefs().then((resp) => {
              let uuidList = resp.inventories.map(it => it.vmInstanceUuid)
              vmConditions = [`uuid?=${uuidList}`]
              return getSnapshotCapabilities(vmConditions)
            })
          } else {
            let vmUuid = self.dbData.volume[uuid].vmInstanceUuid
            vmConditions = [`uuid=${vmUuid}`]
          }
        }
        return getSnapshotCapabilities(vmConditions)
      })()
      tasks.push(p)
      return Promise.all(tasks)
      .then(() => {
        if (!self.dbData.common.isAdmin) {
          return self.checkResourceAccount(self.windowData.dataUuid)
        }
      }).then( () => {
				self.model = _.get(self.dbData.snapshot, self.windowData.dataUuid)
			})
		},

		checkResourceAccount (resourceUuid) {
      const self = this
      return rpc.query('accounts/resources/refs', {
        q: `resourceUuid?=${resourceUuid}`,
        fields: 'accountUuid'
      }).then(resp => {
        if (resp.inventories.length !== 1) {
          self.showDelete = false
          self.showRecover = false
          return
        }
        if (resp.inventories[0].accountUuid === self.browserLocalStorageGetItem('accountUuid')) {
          self.showDelete = true
        } else {
          self.showRecover = false
          self.showDelete = false
        }
      })
		},

		updateResourceParam (param) {
			let self = this;
			return {
				getValue () {
					return self.model && self.model[param];
				},
				setValue (newVal) {
					if(!self.model) return;
					if(newVal === self.model[param]) return;
					self.updateSnapshot(param, newVal);
				},
				canEdit: () => {
					return true;
				}
			}
		},

		pageRevert () {
      let self = this
      let uuidList = [self.windowData.dataUuid]
      let warning = self.windowData.volumeType === 'Root' ? 'snapshot.warning.rootRevertWarning' : 'snapshot.warning.dataRevertWarning'
      return self.openDialog('ConfirmDlg',{
        title: 'snapshot.revert',
        icon: 'snapshot_popupico',
        description: 'snapshot.info.revertConfirm',
        warning,
        uuidList,
        ok: () => {
          return self.revertVolumeFromSnapshot()
        },
        getName: (uuid) => {
				 return	self.dbData.snapshot[uuid].name;
				}
      })
		},

    pageDelete () {
			 let self = this
      this.openDialog('ConfirmDlg', {
				uuidList: [this.windowData.dataUuid],
				title: 'snapshot.delete',
				description: 'snapshot.info.deleteConfirm',
				icon: 'snapshot_popupico',
				warning: 'snapshot.deleteWarnings',
        ok: () => {
          this.deleteVolumeSnapshot(this.windowData.dataUuid)
				},
				 getName: (uuid) => {
				 return	self.dbData.snapshot[uuid].name;
				}
      })
		},

		 revertVolumeFromSnapshot () {
      const self = this
      let jobUuid = self.genUniqueId()
      let uuid = self.windowData.dataUuid
      let event = self.createEvent('snapshot.action.revert', this.dbData.snapshot[uuid] ? this.dbData.snapshot[uuid].name : '', undefined, undefined, undefined, {
        tableName: 'snapshot',
        resourceUuid: uuid,
        jobUuid
      })
      return rpc.create('longjobs', {
        jobName: 'APIRevertVolumeFromSnapshotMsg',
        jobData: JSON.stringify({ uuid })
      }, event, jobUuid)
      .then(() => {
				self.incEventSuccess(event);
        return self.triggerLongJobTask()
      }, () => {
        self.incEventFail(event)
        return self.longJobHandler(event, self)
      })
		},

    deleteVolumeSnapshot (uuid) {
      const self = this
      let jobUuid = self.genUniqueId()
      let event = self.createEvent('snapshot.action.delete', this.dbData.snapshot[uuid] ? this.dbData.snapshot[uuid].name : '', undefined, undefined, undefined, {
        tableName: 'snapshot',
        resourceUuid: uuid,
        jobUuid
      })
      return rpc.create('longjobs', {
        jobName: 'APIDeleteVolumeSnapshotMsg',
        jobData: JSON.stringify({ uuid })
      }, event, jobUuid)
      .then(() => {
		    self.incEventSuccess(event);
        return self.triggerLongJobTask()
      }, () => {
        self.incEventFail(event)
        return self.longJobHandler(event, self)
      })
		},

	}
}
</script>

<style lang="less" scoped>
 @import url('../../../style/mixins');
 .vm-snap__container{
	  position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;
    z-index: 9;
 }
 .icon {
	 .detail-icon('~assets/snapshot.svg')
 }
</style>
