<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
  methods: {
    enabled: function(uuidList){
      if(uuidList.length !==1 ) return;
      let event = null, self = this;
      event = self.createEvent(`securityGroup.action.enable`, uuidList.length === 1 ? self.dbData.securitygroup[uuidList[0]].name : '', uuidList.length);
      return rpc.put(`security-groups/${uuidList[0]}/actions`, {
        "changeSecurityGroupState": {
          "stateEvent": 'enable'
        }
      },event)
        .then((result) => {
          self.incEventSuccess(event);
        }).catch(e =>{
          self.incEventFail(event)
        })
    },
    disabled: function(uuidList){
      if(uuidList.length !==1 ) return;
      let event = null, self = this;
      event = self.createEvent(`securityGroup.action.disable`, uuidList.length === 1 ? self.dbData.securitygroup[uuidList[0]].name : '', uuidList.length);
      return rpc.put(`security-groups/${uuidList[0]}/actions`, {
        "changeSecurityGroupState": {
          "stateEvent": 'disable'
        }
      },event)
        .then((result) => {
          self.incEventSuccess(event);
        }).catch(e =>{
          self.incEventFail(event)
        })
    },
    getCondition: function () {
      let conditionList = [];
      // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
      if (this.selectVal !== '' && this.searchStr !== '') {
        conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
      }
      debugger
      if(this.command){
        conditionList = conditionList.concat(`ipVersion=${this.command}`)
      }
      return conditionList
    },
    queryList: async function () {
      this.windowData.loading = true;
      let resp = await rpc.query('security-groups', {
        count: false,
        start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
        limit: this.windowData.pageSize,
        replyWithCount: true,
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
        q: await this.getCondition()
      });

      this.windowData.loading = false;
      this.updateWindow({
        pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
        list: resp.inventories,
        availableCount: resp.total
      });

      let uuidList = resp.inventories.map((item) => item.uuid);
      let table = {};
      uuidList.forEach((uuid) => {
        table[uuid] = {
          selected: false
        }
      });
      this.updateWindow({ uuidList, table });
      this.updateDbTable({
        tableName: 'securitygroup',
        list: resp.inventories
      })
      this.itemList = this.getData();
    },
    updateCount: async function () {
      rpc.query('security-groups', {
        replyWithCount: true,
        q: await this.getCondition()
      })
      .then((resp) => {
        this.updateWindow({
          availableCount: resp.total
        })
      })
    },
    delete: function (uuidList) {
      const self = this;
      let event = self.createEvent('securityGroup.action.delete', uuidList.length === 1 ? self.dbData.securitygroup[uuidList[0]].name : '', uuidList.length);
      let tasks = [];
      uuidList.forEach(function (uuid) {
        ((uuid) => {
          let p = rpc._delete(`security-groups/${uuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          });
          tasks.push(p)
        })(uuid)
      });
      return Promise.all(tasks)
    },
    create: async function (param) {
      let msg = {
        name: param.name,
        description: param.description
      };
      let event = this.createEvent('securityGroup.action.create', param.name);
      let resp;
      try {
        resp = await rpc.create('security-groups', msg, event)
      } catch (e) {
        this.incEventFail(event);
        return
      }
      let taskList = [];
      let p = null;
      if (param.ruleList.length > 0) {
        param.ruleList.forEach(function (item) {
          ((item) => {
            p = rpc.create(`security-groups/${resp.inventory.uuid}/rules`, { rules: [item], remoteSecurityGroupUuids: item.remoteSecurityGroupUuids })
          })(item);
          taskList.push(p)
        })
      }

      if (param.l3NetworkUuidList.length > 0) {
        param.l3NetworkUuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc.create(`security-groups/${resp.inventory.uuid}/l3-networks/${uuid}`);
            taskList.push(p)
          })(uuid)
        })
      }

      if (param.vmNicUuidList.length > 0) {
           p =  rpc.create(`security-groups/${resp.inventory.uuid}/vm-instances/nics`, {
            vmNicUuids: param.vmNicUuidList
          })
           taskList.push(p)
        }

      Promise.all(taskList)
      this.incEventSuccess(event);
    },
    attach: function (uuid, l3networkList) {
      const self = this;
      let event = self.createEvent('securityGroup.action.attachl3network', l3networkList.length > 1 ? '' : self.dbData.securitygroup[uuid].name, l3networkList.length);
      let tasks = [];
      let p = null;
      l3networkList.forEach(function (l3NetworkUuid) {
        ((l3NetworkUuid) => {
          p = rpc.create(`security-groups/${uuid}/l3-networks/${l3NetworkUuid}`, null, event)
          .then((resp) => {
            let securitygroup = _.cloneDeep(self.dbData.securitygroup[uuid]);
            securitygroup.attachedL3NetworkUuids.push(l3NetworkUuid);
            self.updateDbRow({
              tableName: 'securitygroup',
              id: uuid,
              data: securitygroup
            });
            self.incEventSuccess(event)
          }, () => self.incEventFail(event));
          tasks.push(p)
        })(l3NetworkUuid)
      });
      return Promise.all(tasks)
    },
    detach: function (uuid, l3networkList) {
      const self = this;
      let event = self.createEvent('securityGroup.action.detachl3network', l3networkList.length > 1 ? '' : self.dbData.securitygroup[uuid].name, l3networkList.length);
      let tasks = [];
      let p = null;
      l3networkList.forEach(function (l3NetworkUuid) {
        ((l3NetworkUuid) => {
          p = rpc._delete(`security-groups/${uuid}/l3-networks/${l3NetworkUuid}`, null, event)
          .then((resp) => {
            let securitygroup = _.cloneDeep(self.dbData.securitygroup[uuid]);
            if (securitygroup.attachedL3NetworkUuids.indexOf(l3NetworkUuid) > -1) {
              securitygroup.attachedL3NetworkUuids.splice(securitygroup.attachedL3NetworkUuids.indexOf(l3NetworkUuid), 1)
            }
            self.updateDbRow({
              tableName: 'securitygroup',
              id: uuid,
              data: securitygroup
            });
            self.incEventSuccess(event)
          }, () => self.incEventFail(event));
          tasks.push(p)
        })(l3NetworkUuid)
      });
      return Promise.all(tasks)
    },
    ...Utils
  }
}
</script>
