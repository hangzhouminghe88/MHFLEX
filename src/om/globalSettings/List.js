import rpc from 'src/utils/rpc';
import Utils from 'src/utils/utils';
import axios from 'axios';

export default {
  methods: {
      checkItemPermission: function (item) {
        let hasPermission = true
        let obj = {
          'LICENSE_BASIC_PAID': [
            {
              category: 'twofa',
              name: 'twofa.enable'
            },
            {
              category: 'ha',
              name: 'enable'
            },
            {
              category: 'mevoco',
              name: 'overProvisioning.memory'
            },
            {
              category: 'mevoco',
              name: 'overProvisioning.primaryStorage'
            },
            {
              category: 'mevoco',
              name: 'threshold.primaryStorage.physicalCapacity'
            },
            {
              category: 'mevoco',
              name: 'vm.consoleMode'
            },
            {
              category: 'loginControl',
              name: 'login.control'
            }
          ]
        }
        let isPaidLicense = this.getLicenseCapability('LICENSE_BASIC_PAID')
        if (!isPaidLicense) {
          obj['LICENSE_BASIC_PAID'].filter(it => {
            if (item.category === it.category && item.name === it.name) {
              hasPermission = false
            }
          })
        }
        return hasPermission
      },
      queryList: async function () {
        this.updateWindow({
          currTab: 'basic'
        })
        let mnConfigList = []
        try {
          let mnResp = await rpc.query('global-configurations', {
            replyWithCount: true,
            limit: 100000
          })
          mnConfigList = mnResp.inventories
        } catch (e) {}
        let config = Utils.buildAxiosConfig()
        config.url = '/config/query'
        let uiConfigList = []
        try {
          let uiResp = await axios(config)
          uiConfigList = uiResp.data
        } catch (e) {}

        uiConfigList = uiConfigList.map(it => {
          it.category = 'ui'
          return it
        })
        let configList = uiConfigList.concat(mnConfigList)
        configList.sort((a, b) => {
          if (`${a.category}${a.name}` > `${b.category}${b.name}`) return 1
          if (`${a.category}${a.name}` < `${b.category}${b.name}`) return -1
          if (`${a.category}${a.name}` === `${b.category}${b.name}`) return 0
        })
        let queryLdapEntryReturnAttributeSeparator = _.find(configList, it => it.name === 'queryLdapEntryReturnAttributeSeparator')
        this.$data.ldapSeparator = queryLdapEntryReturnAttributeSeparator.value
        this.configList = configList.filter(this.filterConfig)
        this.showList = this.getShowList()
      },
      //设置值
      transformValue (value) {
        let parsedValue = this.bytesToSize(Number(value))
        if ((/[GB|TB|MB]$/g).test(parsedValue)) {
          parsedValue = parsedValue.replace(/B/, '')
        }
        return parsedValue
      },
      //设置时间
      transformTime (milliseconds) {
        const table = {
          s: 1000,
          m: 1000 * 60,
          h: 1000 * 60 * 60,
          d: 1000 * 60 * 60 * 24
        }
        return ['d', 'h', 'm', 's'].reduce((res, unit) => {
          if (milliseconds <= 0) return res
          let tempResult = parseInt(milliseconds / table[unit])
          milliseconds -= tempResult * table[unit]
          res += tempResult > 0 ? tempResult + unit : ''
          return res
        }, '')
      },
      //过滤配置
      filterConfig (config) {
        let initialId = `${config.category}.${config.name}`
        let id = 'globalConfig.' + initialId.replace(/\./g, '_')
        let result = this.$t(id)
        if (result === '-') return false
        let hiddenCategories = _.keys(this.hiddenConfigs)
        let exposedCategories = _.keys(this.exposedConfigs)
        let isHiddenCategoryMathced = _.includes(hiddenCategories, config.category)
        let isExposedCategoryMathced = _.includes(exposedCategories, config.category)
        if (isHiddenCategoryMathced) {
          let category = this.hiddenConfigs[config.category]
          return !category.all && !_.includes(category, config.name)
        } else if (isExposedCategoryMathced) {
          let category = this.exposedConfigs[config.category]
          return category.all || _.includes(category, config.name)
        } else {
          return true
        }
      },
      isTranslateSizeUnit (item) {
        let categories = _.keys(this.translateSizeUnit)
        let isCategoryMathced = _.includes(categories, item.category)
        return isCategoryMathced && _.includes(this.translateSizeUnit[item.category], item.name)
      },
      //或得列表值
      getShowList: function () {
        let self = this
        let configureList = self.configList
        if (self.windowData.currTab === 'basic') {
          return configureList.filter(it => self.basicNameList.indexOf(`${it.category}.${it.name}`) > -1)
        }
        return configureList
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({
            currTab: tabName
          }).then(() => { this.showList = this.getShowList() })
        }
      },
     //重置
    handleReset() {
      let self = this;
      self.openDialog('ConfirmDlg', {
        title: '恢复全局设置',
        description: '确认要一键恢复全局设置？',
        warning:'所有基本设置和高级设置将恢复到初始化默认值。',
        ok: () => {
           let event = self.createEvent('reInitGlobalConfig.action.reInitGlobalConfig')
          let config = Utils.buildAxiosConfig()
          config.url = '/config/reset'
          Promise.all([
            rpc.put('global-configurations/actions', {
              'resetGlobalConfig': {}
            }, event),
            axios(config)
          ]).then(() => {
            self.incEventSuccess(event)
            self.queryList()
          }, () => {
            self.incEventFail(event)
          })
        }
      })
    },
    //编辑
      edit: function (item) {
        let displayItem = this.translateItemForEdit(item)
        this.openDialog('EditGlobalConfigDlg', {
          ldapSeparator: this.$data.ldapSeparator,
          item: displayItem,
          ok: (newValue) => {
            this.edit_ok(newValue, item)
          }
        })
      },
      translateItemForEdit (item) {
        item = _.cloneDeep(item)
        if (item.category === 'ui' && item.name === 'operation.max.history') {
          item.value = parseInt(this.transformTime(item.value))
        }
        return item
      },
      handleUiConfig (newValue, item) {
        const self = this
        let event = self.createEvent(self.$t('global.action.edit', {name: self.translateName(item)}))
        let config = Utils.buildAxiosConfig()
        config.url = '/config/set'
        config.params = {
          name: item.name,
          value: newValue
        }
        axios(config)
        .then((resp) => {
          item.value = resp.config.params.value
          self.incEventSuccess(event)
          let obj = {}
          if (item.category === 'ui' && item.name === 'virtualrouter.arm.enable') {
            obj['VirtualRouter'] = item.value === 'true'
          }
          self.updateDbObject({
            name: 'common',
            data: obj
          })
        }, () => self.incEventFail(event))
      },
      handleMnConfig (newValue, item) {
        const self = this
        let event = self.createEvent(self.$t('global.action.edit', {name: self.translateName(item)}))
        rpc.put(`global-configurations/${item.category}/${item.name}/actions`,
          {
            updateGlobalConfig: {
              value: newValue
            }
          }, event
        ).then((resp) => {
          self.incEventSuccess(event)
          item.value = resp.inventory.value
          let obj = {}
          if (item.category === 'vm' && item.name === 'numa') {
            obj['numa'] = item.value === 'true'
          } else if (item.category === 'localStoragePrimaryStorage' && item.name === 'liveMigrationWithStorage.allow') {
            obj['liveMigrate'] = item.value === 'true'
          } else if (item.category === 'ha' && item.name === 'enable') {
            obj['haEnabled'] = item.value === 'true'
          } else if (item.category === 'mevoco' && item.name === 'vm.consoleMode') {
            obj['spiceOn'] = item.value === 'spice'
          } else if (item.category === 'twofa' && item.name === 'twofa.enable') {
            obj['twofa'] = item.value === 'true'
          } else if (item.category === 'loginControl' && item.name === 'login.control') {
            obj['loginControl'] = item.value === 'true'
          }
          self.updateDbObject({
            name: 'common',
            data: obj
          })
        }, () => self.incEventFail(event))
      },
      edit_ok: function (newValue, item) {
        if (item.category === 'ui') {
          this.handleUiConfig(newValue, item)
        } else {
          this.handleMnConfig(newValue, item)
        }
      },
      translateName: function (item) {
        let initialId = `${item.category}.${item.name}`
        let id = 'globalConfig.' + initialId.replace(/\./g, '_')
        let result = this.$t(id)
        return result
      },
      translateCategory: function (item) {
        let id = `globalConfig.${item.category}_name`
        let result = this.$t(id)
        return result
      },
      translateDescription: function (item) {
        let initialId = `${item.category}.${item.name}`
        let id = 'globalConfigDescription.' + initialId.replace(/\./g, '_')
        let result = this.$t(id)
        if (id === 'globalConfigDescription.virtualRouter_ssh_passwordAuth') {
          result = this.$t(id, {path: 'ZSTACK'})
        }
        return result
      },
      getI18n (item) {
        if (item.category === 'ui' && item.name === 'operation.max.history') {
          return this.transformTime(item.value)
        }
        if (item.category === 'apiTimeout') return this.transformTime(item.value)
        if (this.isTranslateSizeUnit(item)) return this.transformValue(item.value)
        if (this.$t(`globalConfig.${item.value}`) === `globalConfig.${item.value}`) return item.value
        return this.$t(`globalConfig.${item.value}`)
      },
      ...Utils
  }
}
