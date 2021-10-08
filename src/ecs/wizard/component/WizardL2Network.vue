<template>
  <div class="container">
    <div id="common-zone" class="operation-row">
      <div class="sole-title">
        {{$t("common.zone")}}{{$t("common.colon")}}
      </div>
      <div class="sole-content">
        {{ dbData.zone[zoneUuid] && dbData.zone[zoneUuid].name }}
      </div>
    </div>

    <div id="common-name" class="operation-row">
      <div class="title required">
        {{$t("common.name")}}
      </div>
      <input v-model="name" maxlength="255" :class="{'is-error': emptyname}" @blur="validate('name')" @keydown.enter="validate('name')" />
      <div class="error error-text" v-if="emptyname">
        {{$t('error.emptyInput')+$t('common.name')}}
      </div>
    </div>

    <div id="common-description" class="operation-row">
      <div class="title">
        {{$t("common.description")}}
      </div>
      <textarea rows="3" v-model="description"/>
    </div>

    <div id="common-type" class="operation-row">
      <div class="title">
        {{$t("common.type")}}
      </div>
      <help-trigger name="l2network_wizard" />
      <drop-down class="create-dropdown dropdown">
        <span slot="title">
          <span class="text">{{type}}</span>
        </span>
        <span slot="content">
          <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdownType }">
            <a @click="(e) => {type = e.target.text }" v-for=" type in types " :key="type">{{ type }}</a>
          </div>
        </span>
      </drop-down>
    </div>

    <div id="common-vlan" class="operation-row" v-if="type === 'L2VlanNetWork'">
      <div class="title required">
        {{$t("common.vlan")}}
      </div>
      <input v-model="vlan" maxlength="255" :class="{'is-error': emptyvlan || invalidvlan}" @blur="validate('vlan')" @keydown.enter="validate('vlan')" />
      <div class="error error-text" v-if="type === 'L2VlanNetWork' && emptyvlan">
        {{$t('error.emptyInput')+$t('common.vlan')}}
      </div>
      <div class="error error-text" v-if="type === 'L2VlanNetWork'  && !emptyvlan && invalidvlan">
        {{$t('error.invalid')+$t('common.vlan')}}
      </div>
    </div>

    <div id="common-physicalInterface" class="operation-row">
      <div class="title required">
        {{$t("common.physicalInterface")}}
      </div>
      <input v-model="physicalInterface" maxlength="255" placeholder="eth0" :class="{'is-error': emptyphysicalInterface || invalidphysicalInterface}" @blur="validate('physicalInterface')" @keydown.enter="validate('physicalInterface')" />
      <div class="error" v-if="emptyphysicalInterface">
        {{$t('error.emptyInput')+$t('l2network.nicName')}}
      </div>
    </div>

    <div id="common-cluster" class="operation-row">
      <div class="sole-title required">
        {{$t("common.cluster")}}{{$t("common.colon")}}
      </div>
      <div class="sole-content">
        {{ dbData.cluster[clusterUuid] && dbData.cluster[clusterUuid].name }}
      </div>
    </div>
  </div>
</template>

<script>
  //添加二层网络导航
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  export default {
    name: "WizardL2Network",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        },
      },
      'parentWindowUuid': {
        type: String,
        default: ''
      }
    },
    data(){
      return{
        name: 'L2Network-1',
        emptyname: false,
        description: '',
        physicalInterface: '',
        emptyphysicalInterface: false,
        invalidphysicalInterface: false,
        vlan: '',
        emptyvlan: false,
        invalidvlan: false,
        type: 'L2NoVlanNetWork',
        zoneUuid: '',
        clusterUuid: '',
        types: [
          'L2NoVlanNetWork',
          'L2VlanNetWork'
        ]
      }
    },
    created(){
      let self = this, wizard = {};
      wizard = _.cloneDeep(self.$store.state.windowManager.windows[self.parentWindowUuid].wizard);
      self.zoneUuid = wizard.zone.uuid;
      self.clusterUuid = wizard.cluster.uuid;
      window.addEventListener('click', this.onWindowClick)
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
      document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', this.updateValue, true);
    },
    mounted(){
      let self = this;
      if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true);
    },
    methods: {
      createParam: function () {
        let data = this
        let hash = {
          'L2NoVlanNetWork': 'no-vlan',
          'L2VlanNetWork': 'vlan'
        }
        return {
          name: data.name,
          description: data.description,
          type: hash[data.type],
          vlan: data.vlan === '' ? undefined : data.vlan,
          zoneUuid: data.zoneUuid,
          physicalInterface: data.physicalInterface
        }
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
        if (this.windowData.showMoreDropdownType) this.updateWindow({ showMoreDropdownType: false })
      },
      ...Validator,
      //单个校验
      validate (name) {
        let self = this;
        self[`empty${name}`] = false
        let input = name === 'name' ? String(this[name]).trim() : this[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        let vlanRange = {
          maxValue: 4094,
          minValue: 1
        }
        if (name === 'vlan') {
          if (!self.isUint(input) || !self.isIn(input, vlanRange)) {
            self[`invalid${name}`] = true
            return
          }
        }
      },
      //整体校验
      validateAll () {
        let obj = {}, self = this;
        obj.invalidInput = false
        let type = self.type
        let props
        switch (type) {
          case 'L2NoVlanNetWork':
            props = ['name', 'physicalInterface']
            break
          case 'L2VlanNetWork':
            props = ['name', 'vlan', 'physicalInterface']
            break
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] === true)
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },

      updateValue(){
        let self = this;
        if(self.param.disabled) return;
        self.validateAll();
        if(this.windowData.invalidInput) return;
        self.param.update(self.createParam());
      }
    }
  }
</script>

<style scoped>

</style>
