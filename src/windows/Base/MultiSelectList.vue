<script>
  import _ from 'lodash'

  export default {
    created: function () {
    },
    methods: {
      clickCheckbox: function (uuid, $event) {
        let newState = {
          table: {
            ...this.windowData.table,
            [uuid]: {
              selected: !this.windowData.table[uuid].selected
            }
          }
        };

        this.updateWindow(newState);
        if($event!=undefined)
          $event.stopPropagation();

        let uuidList = [];
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        });

        if (uuidList.length !== 1) {
          this.updateWindow({
            currItemUuid: ''
          })
          //this.destroyDialogs()
          //this.destroyChildrenPanels(this.windowId)
        }
      },
      clickSelectAll: function () {
        let newState = !this.isAllSelected;
        let table = _.cloneDeep(this.windowData.table);
        let uuidList = _.get(this, ['windowData', 'uuidList']) || [];
        uuidList.forEach((uuid) => {
          table[uuid].selected = newState
        });
        this.updateWindow({ table })
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            if(self.queryList){
              return self.queryList();
            }
            if(self.query){
              return self.query();
            }
          })
      },
      pageSizeChange(val){
        let self = this;
        self.updateWindow({
          pageSize: val,
          pageIndex: 1
        })
          .then(() => {
            if(self.queryList){
              return self.queryList();
            }
            if(self.query){
              return self.query();
            }
          })
      },
      pageCurrentChange(val){
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
          .then(() => {
            if(self.queryList){
              return self.queryList();
            }
            if(self.query){
              return self.query();
            }
          })
      },
      refresh(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          if(self.queryList){
            return self.queryList();
          }
          if(self.query){
            return self.query();
          }
        })
      },
      handleSort(e) {
        if(!e.order) return;
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      handleSelect(rows){
        let self = this, uuidList =[];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      }
    },
    computed: {
      isAllSelected: function () {
        let uuidList = _.get(this, ['windowData', 'uuidList']);

        if (!uuidList || uuidList.length === 0) return false;
        for (let i in uuidList) {
          if (!_.get(this.windowData, ['table', `${uuidList[i]}`, 'selected'])) {
            return false
          }
        }
        return true
      },
      isSingleSelected: function () {
        let self = this;
        return self.windowData.selectedUuidList.length === 1;
      },
      isSelected: function () {
        let self = this;
        return self.windowData.selectedUuidList.length >= 1
      },
      canClear: {
        get() {
          let uuidList = _.get(this, ['windowData', 'uuidList']);
          if (!uuidList || uuidList.length === 0) return false;
          let selectedList = this.selectedList;
          if (selectedList.length > 0) {
            return selectedList.some(uuid => this.dbData.backupstorage[uuid].type === 'ImageStoreBackupStorage')
          }
        },
        set(val) {
          if (val.length > 0) {
            return val.some(uuid => this.dbData.backupstorage[uuid].type === 'ImageStoreBackupStorage')
          }
        }
      },
      selectedList: function () {
        let self = this;
        return self.windowData.selectedUuidList;
      }
    }
  }
</script>

