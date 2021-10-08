<script>
  import {mapGetters} from 'vuex';
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import Methods from './Methods';
  export default {
    name: "ScheduleJobList",
    mixins: [WindowBase, Methods],
    data() {
      return {
        backupTaskUuidList: []
      }
    },
    computed: {
      ...mapGetters({
        get: 'scheduler/getList',
      }),
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        if (this.backupTaskUuidList.length > 0) {
          conditionList.push(`uuid!?=${this.backupTaskUuidList}`)
        }
        return conditionList
      },
      async getBackupTask () {
        let resp =await rpc.query(`scheduler/triggers`, {q: `schedulerType=cron`})
          let backupTriggerUuids = resp.inventories.map(it => it.uuid)
          if (backupTriggerUuids.length > 0) {
            return rpc.query(`scheduler/jobs`, {q: `triggersUuid?=${backupTriggerUuids}`}).then(resp => {
              this.backupTaskUuidList = resp.inventories.map(it => it.uuid)
            })
          }else return Promise.resolve()
      },
      queryList(){
        let self = this;
        self.windowData.loading = true;
        self.dispatchAction('scheduler/query',{
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true
        }).then((resp) =>{
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          })
        }).then(() => {
          setTimeout(() => {
            self.itemList =  self.get(self.windowData.uuidList);
            self.windowData.loading = false;
          }, 100)
        })
      },
      instates(){
        let instatesList = [], self = this, selectedStatesList = [];
        if(!self.isSelected) return;
        if(arguments){
          for(let state of arguments){
            instatesList.push(state);
          }
        }
        self.selectedList.forEach((uuid) => {
          selectedStatesList.push(self.scheduler[uuid].state)
        })
        return selectedStatesList.every((item) => {
          return instatesList.some((state) => { return state === item })
        })
        // return isInStates
      },
      pageUpdateState(state){
        let self = this, uuidList = [];
        if(!self.isSelected) return;
        for(let uuid of self.selectedList){
          if(self.scheduler[uuid].state !== state){
            uuidList.push(uuid)
          }
        }
        switch (state) {
          case  'Enabled': self.enable(uuidList).then(() =>  self.queryList()); break;
          case 'Disabled': self.disable(uuidList).then(() =>  self.queryList()); break;
        }
      },
      //解绑定时器
      pageDetach() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: "timer.detach",
          description: 'timer.detachConfirm',
          icon: 'timed_task_n',
          getName(uuid) {
            return self.scheduler[uuid].name
          },
          uuidList: self.selectedList,
          ok() {
            self.detachScheduler('', self.selectedList)
              .then(() => {
                self.queryList();
              });
          }
        })
      },
      deleteSechduler(){
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: "scheduler.delete",
          description: 'common.deleteScheduler',
          icon: 'timed_task_n',
          getName(uuid) {
            return self.scheduler[uuid].name
          },
          uuidList: self.selectedList,
          ok() {
            self.deleteScheduler(self.selectedList)
              .then(() => {
                self.queryList();
              });
          }
        })
      },
      pageAttach(){
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.scheduler[uuid].triggersUuid.length === 0) uuidList.push(uuid)
        })
        let self = this;
        if (uuidList.length > 0) {
          this.openDialog('AttachSchedulerJobDlg', {
            ok: (uuid) => self.attach(uuid, uuidList).then(() => self.queryList())
          })
        }
      },
      canAttach () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.scheduler[uuid].triggersUuid.length === 0) uuidList.push(uuid)
        })
        return uuidList.length > 0
      },
      canDetach () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if ( this.scheduler[uuid].triggersUuid.length > 0) uuidList.push(uuid)
        })
        return uuidList.length > 0
      },
    }
  }
</script>
