<style scoped>
  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("vrouterroutetable.create")}}
        </span>
      <span class="create-back" @click="$router.push('vrouterroutetable')"><i class="el-icon-back"></i>回到路由表列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row" style="margin-top: 20px;">
        <div class="title required">
          {{$t('common.name')}}
        </div>
        <help-trigger name="virtualRouterTable"/>
        <input maxlength="255" v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @blur="validateName" @keydown.enter="validateName"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }"/>
        <div class="error error-text" v-if="windowData.emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>
      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>

      <div id="vrouterroutetable-route" class="operation-row">
        <div class="title">
          {{$t("vrouterroutetable.route")}}
        </div>
        <add-or-delete-input  v-for="(uuid, index) in windowData.virtualRouterUuidList"
                              :key="index"
                              :value="dbData.vm[uuid] && dbData.vm[uuid].name"
                             @remove="removeVirtualRouter($event, uuid)"></add-or-delete-input>
        <add-or-delete-input @open="selectVirtualRouter"/>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('vrouterroutetable')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import List from './List';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreateVirtualRouterTablePage",
    mixins: [WindowBase, Root, List],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        canCreate: true
      }
    },
    computed: {},
    created() {
      this.updateWindow({
        name: '',
        description: '',
        virtualRouterUuidList: []
      })
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      getAttachableRouterList: function () {
        return rpc.query('vrouter-route-tables/virtual-router-refs').then((resp) => {
          if (resp.inventories.length === 0) return []
          let uuidList = resp.inventories.map(item => item.virtualRouterVmUuid)
          return uuidList
        })
      },
      selectVirtualRouter: function () {
        const self = this
        self.getAttachableRouterList().then((virtualRouterVmUuidList) => {
          let unAvaiableList = _.uniq(virtualRouterVmUuidList.concat([], this.windowData.virtualRouterUuidList))
          self.openDialog('RouterMultiSelectListDlg', {
            conditions: [`uuid!?=${unAvaiableList.join()}`, 'vmNics.l3Network.networkServices.networkServiceType=VRouterRoute', 'hypervisorType!=ESX'],
            select: (uuidList) => {
              let list = this.windowData.virtualRouterUuidList.concat([], uuidList)
              self.updateWindow({
                virtualRouterUuidList: list
              })
            }
          })
        })
      },
      removeVirtualRouter: function ($e, uuid) {
        let uuidList = _.cloneDeep(this.windowData.virtualRouterUuidList)
        let list = uuidList.filter(item => item !== uuid)
        this.updateWindow({
          virtualRouterUuidList: list
        })
      },
      validateName() {
        let obj = {emptyname: false}
        if (!this.windowData.name.trim()) {
          obj.emptyname = true
        }
        this.updateWindow(obj)
      },
      createParam: function () {
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          virtualRouterUuidList: this.windowData.virtualRouterUuidList
        }
      },

      ok: function () {
        this.validateName()
        if (this.windowData.emptyname) {
          return
        }
        this.canCreate = false;
        this.create(this.createParam())
          .then(() => {
            this.$router.push({name: 'vrouterroutetable'});
          }).catch(() => {
            this.canCreate = true;
        })
      }
    }
  }
</script>
