<template>
	<page-template>
		<div slot="page-header">
			<span class="page-header-title">
				{{$t('common.hybridconfig')}}
			</span>
		</div>

		<div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading">
        <template slot="tableSlot" slot-scope="scope">
          <el-button icon="el-icon-edit" type="success" size="mini" @click="edit(scope.data)">编辑</el-button>
        </template>
      </mh-table>
		</div>
	</page-template>
</template>

<script>
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import rpc from 'src/utils/rpc';
import _ from 'lodash'

export default {
	name: 'HybridAliCloudConfigPage',

	mixins: [PageBase, WindowBase, MultiSelectList],

	components: {
		PageTemplate
	},

	data () {
		return {
		 ldapSeparator: '',
      configList: [],
      showList: [],
      hiddenConfigs: {
        'aliyun': ['aliyun.openapi.page.size'],
        'hybrid': ['max.backup.per.region']
      },
      basicNameList: [
        'ha.enable',
        'host.cpu.overProvisioning.ratio',
        'identity.session.timeout',
        'kvm.reservedMemory',
        'kvm.vm.cacheMode',
        'kvm.vm.cpuMode',
        'localStoragePrimaryStorage.liveMigrationWithStorage.allow',
        'mevoco.overProvisioning.memory',
        'mevoco.overProvisioning.primaryStorage',
        'mevoco.threshold.primaryStorage.physicalCapacity',
        'mevoco.vm.consoleMode',
        'virtualRouter.vrouter.password',
        'vm.cleanTraffic',
        'vm.deletionPolicy',
        'vm.expungePeriod',
        'vm.numa',
        'vm.videoType'
      ],
        dataSource: {
          getItemList: () => this.showList,
          handleSort: this.handleSort,
          fields: [
            {
              getHeaderContent: this.$t('common.name'),
              getContent: item => this.getField('name', item),
              tooltip: true
            },
            {
              getHeaderContent: this.$t('common.type'),
              getContent: item => this.getField('type', item),
              tooltip: true
            },
            {
              getHeaderContent: this.$t('common.description'),
              getContent: item => this.getField('description', item),
              tooltip: true
            },
            {
              getHeaderContent: this.$t('common.value'),
              getContent: item => this.getField('value', item),
              tooltip: true
            },
            {
              getHeaderContent: this.$t('common.action'),
              type: 'slot',
              tooltip: true
            }
          ]
        },
		}
	},

	created () {
		let self = this;
		self.updateWindow({
      methods: {
        queryList: this.queryList
      }
		}).then( () => {
			self.queryList();
		})
	},

	methods: {
		 queryList () {
      this.updateWindow({
        currTab: 'advanced'
      }).then(() => {
        rpc.query('global-configurations', {
          replyWithCount: true,
          q: 'category?=hybrid,daho,aliyun,aliyunEbs,aliyunNas'
        }).then((resp) => {
          this.configList = resp.inventories
          this.configList.sort((a, b) => {
            if (`${a.category}${a.name}` > `${b.category}${b.name}`) return 1
            if (`${a.category}${a.name}` < `${b.category}${b.name}`) return -1
            if (`${a.category}${a.name}` === `${b.category}${b.name}`) return 0
          })
          // this.configList = this.configList.filter(config => {
          //   debugger
          //   if (config.category === 'aliyun' && config.name !== 'user.define.api.endpoint') {
          //     return false
          //   }
          //   if (config.category === 'hybrid' && config.name === 'max.backup.per.region') return false
          //   return true
          // })
          this.showList =  this.configList.filter(this.filterConfig)
        })
      })
		},

    filterConfig (config) {
      let categories = _.keys(this.hiddenConfigs)
      let isCategoryMathced = _.includes(categories, config.category)
      if (isCategoryMathced) {
        let category = this.hiddenConfigs[config.category]
        return !_.includes(category, config.name)
      } else {
        return true
      }
    },
		getShowList () {
      let self = this
      let configureList = this.configList
      let removeIndexList = []
      configureList.forEach( (item, index, list) => {
        let initialId = `${item.category}.${item.name}`
        let id = 'globalConfig.' + initialId.replace(/\./g, '_')
        let result = self.$t(id)
        if (result === '-') {
          removeIndexList.push(index)
        }
      })
      for (var i = removeIndexList.length - 1; i >= 0; i--) {
        let removeIndex = removeIndexList[i]
        configureList.splice(removeIndex, 1)
      }
      return configureList
		},

		 translateName (item) {
      let initialId = `${item.category}.${item.name}`
      let id = 'globalConfig.' + initialId.replace(/\./g, '_')
      let result = this.$t(id)
      return result
		},

    translateCategory (item) {
      let id = `globalConfig.${item.category}_name`
      let result = this.$t(id)
      return result
		},

    translateDescription (item) {
      let initialId = `${item.category}.${item.name}`
      let id = 'globalConfigDescription.' + initialId.replace(/\./g, '_')
      let result = this.$t(id)
      return result
		},

		 edit (item) {
      this.openDialog('EditGlobalConfigDlg', {
        ldapSeparator: this.$data.ldapSeparator,
        item: _.cloneDeep(item),
        ok: (newValue) => {
          this.edit_ok(newValue, item)
        }
      })
		},

    getField(field, item) {
      if(field === 'name') return this.translateName(item);
      if(field === 'type') return this.translateCategory(item);
      if(field === 'description') return this.translateDescription(item);
      if(field === 'value') return item.value;
    },
		edit_ok (newValue, item) {
      const self = this
      let event = self.createEvent('global.action.edit')
      rpc.put(`global-configurations/${item.category}/${item.name}/actions`,
        {
          updateGlobalConfig: {
            value: newValue
          }
        }, event
      ).then((resp) => {
        self.incEventSuccess(event)
        let itemName = item.name.toLowerCase()
        if (item.category === 'quota' && (_.includes(itemName, 'size') || _.includes(itemName, 'capacity'))) {
          item.value = self.transformValue(resp.inventory.value)
        } else {
          item.value = resp.inventory.value
        }
        if (item.category === 'vm' && item.name === 'numa') {
          this.updateDbObject({
            name: 'common',
            data: {
              liveMigrate: item.value === 'true'
            }
          })
        } else if (item.category === 'ha' && item.name === 'enable') {
          this.updateDbObject({
            name: 'common',
            data: {
              haEnabled: item.value === 'true'
            }
          })
        } else if (item.category === 'mevoco' && item.name === 'vm.consoleMode') {
          this.updateDbObject({
            name: 'common',
            data: {
              spiceOn: item.value === 'spice'
            }
          })
        }
      }, () => self.incEventFail(event))
    },
	}
}
</script>

<style lang="less" scoped>

</style>
