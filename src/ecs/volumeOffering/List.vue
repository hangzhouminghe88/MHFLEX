<script>
  import {mapGetters, mapState} from 'vuex';
  import Root from 'src/windows/Root';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import VolumeOfferingMethods from 'src/ecs/volumeOffering/Methods';

  export default {
    mixins: [Root, WindowBase,VolumeOfferingMethods],
    computed:{
      ...mapGetters({getList: 'volumeoffering/getList'}),
      ...mapState({
        volumeoffering: state => state.volumeoffering
      }),
    },
    watch: {
      'windowData.pageIndex': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.queryList();
        }
      },
      'windowData.pageSize': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.queryList();
        }
      }
    },
    methods: {
      ...Utils,
      queryList: function () {
         let self = this;
        this.windowData.loading = true;
        return this.dispatchAction('volumeoffering/query', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          q: this.getCondition(),
          sortBy: this.windowData.sortBy,
          sortDirection: this.windowData.sortDirection
        }).then(resp => {
          this.windowData.loading = false;
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          })
        }).then(() => {
          self.itemList = this.getList(this.windowData.uuidList)
        })
      },
      getCondition: function () {
        let conditionList = []
        // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.searchStr !== '' && this.selectVal !== '' ) {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      canShareToAll(){
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      getSharedToAllList () {
        let uuidList = []
        uuidList = this.selectedList
        if (uuidList.length > 0) {
          let list = uuidList.filter((uuid) => !this.dbData.volumeoffering[uuid].toPublic)
          return list
        }
        return []
      },
      pageOperate(param){
        let self = this, enabledUuidList = [], disabledUuidList = [];
         self.selectedList.forEach((uuid) => {
          if(self.dbData.volumeoffering[uuid].state !== 'Enabled'){
            enabledUuidList.push(uuid);
          }
          if(self.dbData.volumeoffering[uuid].state !== 'Disabled'){
            disabledUuidList.push(uuid);
          }
        })
        switch (param) {
          case 'start':
            self.enable(enabledUuidList).then(() => self.queryList());
            break;
          case 'stop':
            self.stop(disabledUuidList).then(() => self.queryList());
            break;
        }
      },
      pageShareOperate(param){
        let shareUuidList = [], notShareUuidList = [], uuidList = [], self = this;
        uuidList = this.selectedList
        if (uuidList.length > 0) {
          shareUuidList = uuidList.filter((uuid) => !this.volumeoffering[uuid].toPublic)
          notShareUuidList = uuidList.filter((uuid) => this.volumeoffering[uuid].toPublic)
        }
        switch (param) {
          case 'share':
            self.openDialog('SharetoAllConfirmDlg',{
              title: 'common.shareToAll',
              warning: 'instanceOffering.shareToAllText',
              ok(){
                self.dispatchActionWithEvent('volumeoffering/shareToPublic', shareUuidList)
                  .then(() => {
                    self.dispatchAction('volumeoffering/query', {q: `uuid?=${shareUuidList.join(',')}`})
                  })
              }
            })
            break;
          case 'notShare':
            self.openDialog('SharetoAllConfirmDlg',{
              title: 'common.recallFromAll',
              warning: 'account.recall',
              ok(){
                self.dispatchActionWithEvent('volumeoffering/revokeSharing', notShareUuidList)
                  .then(() => {
                    self.dispatchAction('volumeoffering/query', {q: `uuid?=${notShareUuidList.join(',')}`})
                  })
              }
            })
            break;
        }
      },
      pageDelete(){
        let self = this, uuidList = [];
        if(!self.isSelected) return;
        uuidList = self.selectedList;
        self.delete(uuidList);
      },

      inStates () {
        let self = this, states = [];
        for (let arg in arguments) {
          states.push(arguments[arg]);
        }
        let instate = self.selectedList.every( (uuid) => {
          return states.some( (state) => {
            return self.dbData.volumeoffering[uuid].state === state;
          })
        })
        return instate;
      }
    }
  }
</script>
