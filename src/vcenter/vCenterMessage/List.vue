<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from 'src/component/PageTemplate';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "List",
    mixins: [WindowBase, MultiSelectList, PageBase],
    components: {PageTemplate},
    data(){
      let self = this;
      return {
        currTab: 'eventAlarm',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        selectVal: 'name',
        searchStr: '',
        messageList: [],
        allEventMessageList: [],
        end_at: '',
        start_at: '',
        selectedVCenterUuid: 'all',
        pickerOptions0: {
          disabledDate: (time) => {

          }
        },
        pickerOptions1: {
          disabledDate: (time) => {
            let self = this;
            return time.getTime() < self.start_at;
          }
        },
        currMessageList: [],
        allAlarmMessageList: [],
        dataSource: {
          getItemList: () => self.currMessageList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          fields: [
            {
              getContent: item => self.getField('Description', item),
              getHeaderContent: self.$t('vCenterMessage.description'),
              tooltip: true
            },
            {
              getContent: item => self.getField('Severity', item),
              getHeaderContent: self.$t('common.type'),
              warningLevel: true
            },
            {
              getContent: item => self.getField('vCenter', item),
              renderHeader: self.handleRenderHeader
            },
            {
              getContent: item => self.getField('User', item),
              getHeaderContent: self.$t('common.user'),
              tooltip: true
            },
            {
              getContent: item => self.getField('target', item),
              getHeaderContent: self.$t('vCenterMessage.target')
            },
            {
              getContent: item => self.getField('date', item),
              getHeaderContent: self.$t('vCenterMessage.date')
            }
          ]
        }
      }
    },
    computed: {
      start_time:{
        get(){
          let self = this;
          return new Date(self.start_at);
        },
        set(val){
          let self = this;
          self.start_at = val.getTime();
        }
      },
      end_time:{
        get(){
          let self = this;
          return new Date(self.end_at);
        },
        set(val){
          let self = this;
          self.end_at = val.getTime();
        }
      },
      vcenterList () {
        let list = _.values(this.dbData.vCenters)
        list.sort((a, b) => {
          if (!a.name && b.name) return -1
          if (a.name && !b.name) return 1
          if (!a.name && !b.name) return 0
          return a.name.localeCompare(b.name)
        })
        list.unshift({name: 'operationLog.all', uuid: 'all'})
        return list
      },
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        resourceAlarmCount: 0,
        eventAlarmCount: 0,
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        this.getCurrTime().then(() => {
          this.queryList()
        })
      })
    },

    methods: {
      ...Utils,

      getField(field, item){
        let self = this;
        if(_.isUndefined(item)) return '';
        let normalFields = ['Description'];
        if(_.includes(normalFields, field)) return item.labels[field];
        if(field === 'User') return item.labels && item.labels.User ? item.labels.User : '-';
        if(field === 'target') return item.labels && item.labels.Target === 'n/a' ? '-' : item.labels.Target;
        if(field === 'date') return item.labels && item.labels.Time.replace(/\//g, '-');
        if(field === 'vCenter') return item.resourceName.replace(/\"/g, ' ');
        if(field === 'Severity') return {
          'icon': item.labels[field] ? item.labels[field] : 'success',
          'content': item.labels[field] ? self.$t(`common.${item.labels[field]}`) : self.$t(`common.info`)
        }
      },

      handleRenderHeader(h, {column, $index}) {
        let self = this;
        return h('el-dropdown',
          {
            on: {
              'command': self.selectVCenter
            }
          },
          [
            h('span', [
                [self.$t(`common.vCenter`)],
                h('i', {
                  staticClass: 'el-icon-caret-bottom'
                })
              ]
            ),
            h('el-dropdown-menu', {
                attrs: {
                  trigger: "hover",
                  placement: 'bottom',
                  slot: "dropdown"
                },
              },
              [
                self.vcenterList.map((item) => {
                  return (
                    h('el-dropdown-item', {
                      attrs: {
                        command: item.uuid
                      }
                    }, [self.$t(item.name)])
                  )
                })
              ])
          ])
      },

      selectVCenter (uuid) {
        this.selectedVCenterUuid = uuid
        return this.queryList()
      },

      getCurrTime: function () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = resp.currentTime.MillionSeconds
            self.start_at = self.end_at - 259200000;
            self.start_time = new Date(self.start_at);
            self.end_time =  new Date(self.end_at);
          })
      },

      queryList: function () {
        const self = this
        self.windowData.loading  = true;
        this.chunkList()
        let tasks = []
        let p = null
        p = this.getAllEventMessage()
        tasks.push(p)
        p = rpc.query(`vcenters`).then((vcenter) => {
          return this.updateDbTable({
            tableName: 'vCenters',
            list: vcenter.inventories
          })
        })
        tasks.push(p)
        return Promise.all(tasks)
          .then(() => {
              self.windowData.loading  = false;
            this.updateWindow({
              resourceAlarmCount: self.allAlarmMessageList.length,
              eventAlarmCount: self.allEventMessageList.length
            })
            this.chunkList()
          })
      },

      getAllEventMessage: async function () {
        let conditions = ['name=VCenterResourceEvent']
        if (this.selectedVCenterUuid !== 'all') conditions.push(`resourceId=${this.selectedVCenterUuid}`)
        return rpc.query('zwatch/events', {
          limit: 300,
          startTime: this.start_at,
          endTime: this.end_at,
          conditions
        }).then((resp) => {
          let events = resp.events
          events.sort((a, b) => {
            return (new Date(b.labels.Time.replace(/\//g, '-'))).getTime() - (new Date(a.labels.Time.replace(/\//g, '-'))).getTime()
          })
          this.allEventMessageList = events
          return new Promise((resolve, reject) => resolve())
        })
      },

      chunkList: function (size = 10) {
        if (this.currTab === 'resourceAlarm') {
          this.messageList = _.chunk(this.allAlarmMessageList, size)
        } else {
          this.messageList = _.chunk(this.allEventMessageList, size)
        }
        this.currMessageList = this.messageList[this.windowData.pageIndex - 1]
        let count = this.messageList.length
        this.updateWindow({
          total: count
        })
      },

      handleChangeDate(value){
        let self = this;
        if(self.start_at > self.end_at) {
          self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
          return;
        }
        self.queryList();
      },

      pageSizeChange(val){
        let self = this;
        self.updateWindow({
          pageSize: val,
          pageIndex: 1,
        })
      },

      pageCurrentChange(val){
        let self = this;
        self.updateWindow({
          pageIndex: val,
        })
      }
    },

    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.chunkList(val)
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal === undefined || val === oldVal) return
        let currMessageList = this.messageList[val - 1]
        this.currMessageList = currMessageList
      }
    },
  }
</script>
