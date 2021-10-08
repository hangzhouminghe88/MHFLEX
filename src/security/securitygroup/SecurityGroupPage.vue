<template>
    <page-template>
      <div slot="page-header" style="height: 60px; line-height: 60px;">
        <el-row :gutter="10">
          <el-col :span="2">
            <span class="page-header-title">{{ $t(`common.securitygroup`) }}</span>
          </el-col>
          <el-col :span="2.2">
            <el-tabs v-model="currTab">
              <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
      <div slot="page-toolbar" class="page-toolbar-container">
        <el-row type="flex" justify="space-between">
          <div style="flex-shrink: 0;">
            <span class="btn-success" @click="updateWindow({ currItemUuid: '' }); openCreateSecurityGroupDlg()"><i class="el-icon-plus icon"></i>{{$t('common.createSecurityGroup')}}</span>

            <drop-down class="btn-primary more dropdown" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }" :enabled="isSelected && windowData.currItemUuid === '' ">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
              <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a v-permission="'SG_L3.ATTACH'" @click="canEnable() && pageEnable(selectedList[0])" style="padding-top: 12px;" :class="{ 'disabled-text': !canEnable()}">{{$t("common.enable")}}</a>
                  <a v-permission="'SG_L3.ATTACH'" @click="canDisable() && pageDisable(selectedList[0])" :class="{ 'disabled-text': !canDisable()}">{{$t("common.disable")}}</a>
                  <a id="securityGroup-attachl3network" v-permission="'SG_L3.ATTACH'" @click="isSingleSelected && pageAttach(selectedList[0])" :class="{ 'disabled-text': !isSingleSelected}">{{$t("securityGroup.attachl3network")}}</a>
                  <a id="securityGroup-detachl3network" v-permission="'SG_L3.DETACH'" @click="isSingleSelected && (dbData.securitygroup[selectedList[0]].attachedL3NetworkUuids.length > 0) && pageDetach(selectedList[0])" :class="{ 'disabled-text': !isSingleSelected || (dbData.securitygroup[selectedList[0]].attachedL3NetworkUuids.length <= 0)}">{{$t("securityGroup.detachl3network")}}</a>
                  <a id="common-destroy" style="padding-bottom:12px;" v-permission="'SG.DELETE'" @click="isSingleSelected && pageDelete()" :class="{ 'disabled-text': !isSingleSelected }">{{ $t("common.destroy") }}</a>
                </div>
              </transition>
            </span>
            </drop-down>
          </div>
          <div style="text-align: right;flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
            <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
          </div>
        </el-row>
      </div>

      <div slot="page-table-content" style="max-height: 400px;">
        <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
            :current-page="windowData.pageIndex"
            :page-size="windowData.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="windowData.availableCount"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            class="page-table-pagination"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>

        </div>
      </div>
    </page-template>
</template>

<script>
  import rpc from 'src/utils/rpc';
  import SecurityGroupList from './List';
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import NetWorkSelectListConfirmDlg from "../../dialog/NetWorkSelectListConfirmDlg";
  import TableBodyItemState from "../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "SecurityGroupPage",
    mixins: [Root,WindowBase,SecurityGroupList, MultiSelectList, PageBase],
    components: {PageTemplate,TableBodyItemState,NetWorkSelectListConfirmDlg},
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: true,
        methods: {
          queryList: this.queryList
        }
      })
        .then(() => {
          this.queryList()
        })
    },
    destroyed: function () {

    },
    data () {
      return {
        networkType:'IPV4',
        showNetWorkSelectDlg:false,
        currTab: 'available',
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        searchStr: "",
        selectVal: 'name',
        itemList:[],
        message: {},
        command:'ipVersion',
        dataSource: {
          getItemList: () => this.itemList,
          handleSelection: this.handleSelect,
          handleSort: this.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => this.getField('name', item),
              className: 'link',
              onClick: item => { this.$router.push({name: 'detailsecuritygroup', params: {uuid: item.uuid}}) },
              getHeaderContent: this.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => this.getField('state', item),
              getHeaderContent: this.$t('common.state'),
              field: 'state',
            },
            {
              getContent: item => this.getField('ipVersion', item),
              getHeaderContent: this.$t('common.ipVersion'),
              field: 'ipVersion',
              renderHeader: this.handleRenderHeader
            },
            {
              getContent: item => this.getField('createDate', item),
              getHeaderContent: this.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            },
          ]
        },
      }

    },
    methods: {
      getField (field, item) {
        if (_.isUndefined(item)) return ''
        let normalFields = ['name', 'state','name']
        if (_.includes(normalFields, field)) return item[field]
        if (field === 'createDate') return this.formatDatetime(new Date(item[field]));
        if(field === 'ipVersion') return `IPv${item[field]}`
      },
      closeRouterEntry(){
        this.showRouterEntryDlg = false;
      },
      handleRenderHeader(h, { column, $index }){
        let self = this;
        return h('el-dropdown',
          {
            on: {
              'command': self.handleIpVersionChange
            }
          },
          [
          h('span',[
            [self.$t(`common.${self.command}`)],
            h('i',{
              staticClass: 'el-icon-caret-bottom'
            })
            ]
          ),
          h('el-dropdown-menu', {
            attrs: {
              trigger: "hover",
              placement:'bottom',
              slot:"dropdown"
            },
          },
           [h('el-dropdown-item',{
             attrs: {
               "command": 'ipVersion'
             }
           },
           [self.$t('operationLog.all')]
           ),
            h('el-dropdown-item',{
                attrs: {
                  "command": 'ipv4'
                }
              },
              [self.$t('common.ipv4')]
            ),
            h('el-dropdown-item',{
                attrs: {
                  "command": 'ipv6'
                }
              },
              [self.$t('common.ipv6')]
            ),
          ])
        ])
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      handleIpVersionChange(command){
        this.command = command
        this.queryList()
      },
      canEnable () {
        if (!this.isSingleSelected) return false;
        let uuid = this.selectedList[0];

        if (uuid === '') return false;
        return this.dbData.securitygroup[uuid].state === 'Disabled'
      },
      canDisable () {
        if (!this.isSingleSelected) return false;
        let uuid = this.selectedList[0];
        if (uuid === '') return false;
        return this.dbData.securitygroup[uuid].state === 'Enabled'
      },
      pageEnable () {
        let selectedUuidList = this.selectedList.filter(uuid => this.dbData.securitygroup[uuid].state !== 'Enabled');
        if (selectedUuidList.length === 0) return;
        this.enabled(selectedUuidList).then(() => this.queryList())
      },
      pageDisable () {
        let selectedUuidList = this.selectedList.filter(uuid => this.dbData.securitygroup[uuid].state !== 'Disabled');
        if (selectedUuidList.length === 0) return;
        this.disabled(selectedUuidList).then(() => this.queryList())
      },

      createSecurityGroup(){
        this.$router.push('createsecuritygroup');
      },
      getCondition: async function () {
        let conditionList = [];
        let securityGroupUuidList = await this.getCandidateSecurityGroup();
        conditionList.push(`uuid?=${securityGroupUuidList.join()}`);
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        if(this.command && this.command !== 'ipVersion'){
          conditionList = conditionList.concat(`ipVersion=${this.command.replace(/ipv/g, '')}`)
        }
        return conditionList
      },
      getCandidateSecurityGroup: async function () {
        let noL3NetworksecurityGroupUuidList = [];
        let securityGroupUuidList = [];
        let taskList = [];
        let p = rpc.query('security-groups', {
          q: 'l3Network.uuid+not+null',
          fields: 'uuid'
        }).then((resp) => {
          noL3NetworksecurityGroupUuidList = noL3NetworksecurityGroupUuidList.concat(resp.inventories.map(it => it.uuid));
          return rpc.query('security-groups', {
            q: `uuid!?=${noL3NetworksecurityGroupUuidList.join()}`,
            fields: 'uuid'
          }).then((resp) => {
            securityGroupUuidList = securityGroupUuidList.concat(resp.inventories.map(it => it.uuid))
          })
        });
        taskList.push(p);

        p = rpc.query('security-groups', {
          q: `l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`,
          fields: 'uuid'
        }).then((resp) => {
          securityGroupUuidList = securityGroupUuidList.concat(resp.inventories.map(it => it.uuid))
        });
        taskList.push(p);
        return Promise.all(taskList).then(() => {
          return securityGroupUuidList
        })
      },
      openCreateSecurityGroupDlg: function () {
        this.$router.push('createsecuritygroup');
      },
      pageDelete: function () {
        let uuidList = this.selectedList;
        const self = this;
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'securityGroup.delete',
            description: "securityGroup.info.deleteConfirm",
            uuidList,
            icon: 'security_group_popupico',
            ok: () => {
              self.delete(uuidList).then(() => {
                self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.securitygroup[uuid].name;
            }
          })
        }
      },
      pageAttach: function (uuid) {
        const self = this
        let l3List = _.cloneDeep(self.dbData.securitygroup[uuid].attachedL3NetworkUuids)

        this.openDialog('L3NetworkSingleSelectListDlg', {
          conditions: ['system=false', 'networkServices.networkServiceType=SecurityGroup', `uuid!?=${l3List}`, `ipVersion=${this.dbData.securitygroup[uuid].ipVersion}`, 'l2Network.cluster.type=zstack'],
          select: (l3networkList) => {
            let list = [];
            list.push(l3networkList);

            self.attach(uuid, list)
          }
        })

      },
      pageDetach: function (uuid) {
        const self = this
        let l3List = _.cloneDeep(self.dbData.securitygroup[uuid].attachedL3NetworkUuids)

        self.openDialog('L3NetworkMultiSelectListDlg', {
          conditions: [`uuid?=${l3List}`],
          select: (l3networkList) => {
            self.openDialog('ConfirmDlg',{
              title: 'securityGroup.detachl3network',
              description: "securityGroup.info.detachL3Confirm",
              uuidList:l3networkList,
              icon: 'l3_popupico',
              ok: () => {
                self.detach(uuid, l3networkList)
                  .then(() => self.queryList())
              },
              getName: (uuid) => {
                return self.dbData.l3network[uuid].name;
              }
            })
          }
        })
      }
    },
    watch: {
    },
    filters: {


    }
  }
</script>

<style scoped>

</style>
