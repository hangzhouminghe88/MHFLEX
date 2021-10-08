<script>
  import DetailInfoState from "../../../component/DetailInfoState";
  import ZwatchAlarmTab from "../components/ZwatchAlarmTab";
  import LogList from "../../../component/LogList";
  import AlarmLogList from "../../zwatchalarm/components/AlarmLogList";
  import DetailTemplate from "../../../component/DetailTemplate";
  import ZwatchEndPointMethods from '../Methods';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "DetailService",
    mixins: [ZwatchEndPointMethods, WindowBase],
    components: {DetailTemplate,AlarmLogList, LogList, ZwatchAlarmTab, DetailInfoState},
    data() {
      return {
        currTab: 'info',
        value: {}
      }
    },
    computed: {
      model:{
        get(){
          let self = this;
          return self.value;
        },
        set(val){
          let self = this;
          self.value = val;
        }
      }
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid
      }).then(() => {
        self.detailQuery();
      })
    },
    methods: {
      query: async function () {
        let self = this;
         await self.queryResource();
        let uuid = self.windowData.dataUuid
        let type = self.dbData.zwatchEndpoint[uuid].type
        await self.queryTopic(uuid)
        await self.queryAlarmForTopic(uuid)
        await self._query(type, uuid)
        self.model = self.dbData.zwatchEndpoint[uuid];
      },
      async detailQuery(){
        let self = this;
        await rpc.query('sns/application-endpoints', {q: [`uuid=${self.windowData.dataUuid}`]})
          .then((resp) =>  this.updateDbRow({
            tableName: 'zwatchEndpoint',
            id: self.windowData.dataUuid,
            data: resp.inventories[0]
          }))
        self.query();
      },
      queryResource: async function () {
        let self = this;
        let uuid = self.dbData.zwatchEndpoint[self.windowData.dataUuid].platformUuid
        await rpc.queryResourceNames(self, 'emailserversetting', [uuid])
      },
      updateResourceParam(param){
        let self = this, value;
        if(!self.model[param]) return;
        if(param === 'name')
          value = self.getEndpointName(self.model.uuid)
        else value = self.getEndpointDescription(self.model.uuid)
        if(!value) return;
        return {
          getValue(){
            return value;
          },
          setValue(newVal) {
            self.updateZWatchEndpoint(param, newVal);
          },
          canEdit(){
            return !self.isSystemEndpointUuid([self.model.uuid]);
          },
        }
      },
      updateZWatchEndpoint (key, value) {
        this.updateResource('sns/application-endpoints', 'updateSNSApplicationEndpoint', key, 'zwatchEndpoint', value)
      },
      getPlatformName (uuid) {
        if (!this.model.platformUuid) return ''
        let platformUuid = this.model.platformUuid
        if (!this.dbData.emailserversetting[platformUuid]) return ''
        return this.dbData.emailserversetting[platformUuid].name
      },
      getZwatchDingTalkEndpointMember (uuid) {
        let atAll = this.dbData.zwatchEndpoint[uuid].atAll
        let atPersonPhoneNumbers = this.dbData.zwatchEndpoint[uuid].atPersonPhoneNumbers
        if (atAll) return this.$t('zwatchEndpoint.allMember')
        if (!atAll && atPersonPhoneNumbers && atPersonPhoneNumbers.length > 0) return this.$t('zwatchEndpoint.appointMember')
        if (!atAll && (!atPersonPhoneNumbers || atPersonPhoneNumbers.length === 0)) return this.$t('zwatchEndpoint.nobody')
        return ''
      },
      editAtPersonPhoneNumbers(){
        let self = this;
        let endpointUuid = this.windowData.dataUuid
        let oldNumbers = this.dbData.zwatchEndpoint[endpointUuid].atPersonPhoneNumbers
        let update = async (numbers) => {
          let addList = numbers.filter(number => oldNumbers.every(item => item !== number))
          let removeList = oldNumbers.filter(number => numbers.every(item => item !== number))
          if (addList.length > 0) {
            await this.addSNSDingTalkAtPerson(endpointUuid, addList)
          }
          if (removeList.length > 0) {
            await this.removeSNSDingTalkAtPerson(endpointUuid, removeList)
          }
          this.query()
        }
        self.openDialog('EditAtPersonPhoneNumberDlg',{
          atPersonPhoneNumbers: self.model.atPersonPhoneNumbers,
          uuid: this.windowData.dataUuid,
          ok: (numbers) => update(numbers)
        })
      },
      instate(){
        let self = this, states = [];
        if(arguments){
          for(let arg in arguments){
            states.push(arguments[arg]);
          }
        }
        let inState = states.some((state) => self.model.state === state)
        return inState;
      },
      pageEnable(param) {
        this[param]([this.windowData.dataUuid])
          .then(() => this.detailQuery());
      },
      async detailAddAlarm(){
        let self = this
        let endpointUuid = this.windowData.dataUuid
        if (!this.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = this.dbData.zwatchTopic[endpointUuid].uuid
        let uuidList = await this.getAssociatedAlarmUuidList(topicUuid)
        self.openDialog('ZwatchAlaramMultiSelectDlg', {
          conditions: [`uuid!?=${uuidList}`],
          select: (alarmUuidList, alarmObj, alarmItems) => self.addAlarmToEndpoint(endpointUuid, alarmItems).then(() => this.detailQuery())
        })
      },
      detailRemoveAlarm () {
        let self = this
        let endpointUuid = this.windowData.dataUuid
        if (!this.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = this.dbData.zwatchTopic[endpointUuid].uuid
        let conditions = [`actions.actionUuid=${topicUuid}`]
        if (this.isSystemAlarmTopic([topicUuid])) {
          conditions.push(`uuid!?=${this.getZWatchSystemAlarmUuidList()}`)
        }
        self.openDialog('ZwatchAlaramMultiSelectDlg', {
          removeMode: true,
          conditions,
          select: (alarmUuidList, alarmObj, alarmItems) => self.removeAlarmFromEndpoint(endpointUuid, alarmItems).then(() => this.detailQuery())
        })
      },
      detailDestroy(){
        let self = this;
        self.openDialog('ConfirmDlg',{
          title: 'zwatchEndpoint.delete',
          description: 'zwatchEndpoint.deleteConfirm',
          icon: 'zwatch_endpoint_n',
          uuidList: [self.windowData.dataUuid],
          ok: () => {
            self.destroy([self.windowData.dataUuid]).then(() => self.$router.push({name: 'zwatchendpoint'}))
          },
          getName: (uuid) => {
            return self.model.name;
          }
        })
      }
    }
  }
</script>
