<script>
import Utils from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
export default {
	mixins: [WindowBase],
	methods: {
		...Utils,
		 showInterval (interval) {
        const minute = 60
        const hour = 3600
        const day = hour * 24
        // const week = day * 7
        if (interval < hour) {
          return (interval / minute + this.$t('common.minute'))
        } else if (interval < day) {
          if (interval % hour === 0) return (interval / hour + this.$t('common.hour'))
          else {
            let remainHour = interval % hour
            return (parseInt(interval / hour) + this.$t('common.hour')) + ((remainHour % minute === 0 ? parseInt(remainHour / minute) : (remainHour / minute).toFixed(3)) + this.$t('common.minute'))
          }
        } else if (interval >= day) {
          if (interval % day === 0) return (interval / day + this.$t('common.day'))
          else {
            let remainHour = interval % day
            return (parseInt(interval / day) + this.$t('common.day')) + ((remainHour % hour === 0 ? parseInt(remainHour / hour) : (remainHour / hour).toFixed(3)) + this.$t('common.hour'))
          }
        }
			},
			timerIsDone (currItemTimerUuid) {
        return (new Date(this.dbData.timer[currItemTimerUuid].stopTime)).getTime() < (Date.now() + window.___currServerTimeMillionDvalue)
			},
			pageDelete(selectedUuidList){
				let self = this, uuidList = [];
				uuidList = selectedUuidList;
				self.openDialog('ConfirmDlg', {
					title: 'timer.delete',
					description: 'timer.deleteConfirm',
					icon: 'timer',
					uuidList,
					getName(uuid){
						return self.dbData.timer[uuid].name;
					},
					ok(){
						self.delete(uuidList)
						.then(() => {self.queryList()})
					}
				})
			},
			delete(uuidList){
				let self = this,
				event = self.createEvent('timer.action.delete', uuidList.length === 1 ? self.dbData.timer[uuidList[0]].name : '', uuidList.length);
				return self.dispatchActionWithEvent(`timer/delete`, uuidList, null, event);
			},
			create(param){
				let self = this,
				event = self.createEvent('timer.action.create', param.name);
			 return self.dispatchActionWithEvent(`timer/create`, param,null, event);
			},
    createSchedulerJob(resourceUuid){
		  let self = this;
		  self.$router.push({name: 'createSchedulerJob', params:{resourceUuid:resourceUuid, resourceType: 'timer'}})
    }
	}
}
</script>
