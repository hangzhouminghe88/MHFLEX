import { genUniqueId } from 'src/utils/utils';
import rpc from 'src/utils/rpc';

export function checkHybridDataCenterAssistant (type, self){
	let newAssistant = (resourceName, operation) => {
		let id = `assistant-${genUniqueId()}`
		let content = `lackOf${resourceName}`
		let hide
		let handler = () => {
		   self.$router.push({name: 'createHybridAliCloudDataCenter'})
		}
		hide = false
		if (operation === 'check' && resourceName === 'HybridAliyunKeySecret') {
			content = `disabled${resourceName}`
			handler = () => {
				this.$router.push('/main/hybridaliyunkeysecret')
				content = `disabled${resourceName}`
			}
		}
		self.createAssistant({
			id,
			hide,
			operation,
			title: 'iZoneTitle',
			ownerId: self.windowData.id,
			content: content,
			handler
		})
	}

	rpc.query('hybrid/hybrid/key', {
		count: true,
		q: `type=${type}`
	}).then(resp => {
		if (resp.total === 0) {
			newAssistant('HybridAliyunKeySecret', 'add')
		} else {
			rpc.query('hybrid/hybrid/key', {
				q: ['current=true', `type=${type}`]
			})
			.then((resp) => {
				if (resp.inventories.length === 0) newAssistant('HybridAliyunKeySecret', 'check')
			})
		}
	})

	rpc.query('hybrid/hybrid/key', {
		q: ['current=true', `type=${type}`]
	}).then((resp) => {
		if (resp.inventories.length === 1) {
			rpc.query('system-tags', {
				q: ['resourceType=DataCenterVO', `tag=accesskey::${resp.inventories[0].akey}`]
			}).then((resp) => {
				if (resp.inventories.length === 0) {
					newAssistant('HybridDataCenter', 'add')
				}
			})
		}
	})
}