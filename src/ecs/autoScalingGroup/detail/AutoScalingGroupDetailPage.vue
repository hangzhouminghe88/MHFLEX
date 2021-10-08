<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">弹性伸缩组详情</span>
      <span class="create-back detail-header-item"
            @click="$router.push({name: 'autoscalinggroup'})"><i
        class="el-icon-back"></i>回到弹性伸缩组</span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('autoScaling.Actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" @click="canEnabled() && detailEnabled('enable')" :class="{'disabled-text': !canEnabled()}">{{$t('common.start')}}</a>
              <a @click="!canEnabled() && detailEnabled('disable')" :class="{'disabled-text': canEnabled()}">{{$t('common.stop')}}</a>
              <a style="margin-bottom: 12px;" @click="detailDelete()">{{$t('common.destroyed')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
        <el-tabs v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
         <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
         <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
         <el-tab-pane :label="$t('autoScaling.ScalingRecord')" name="scalingRecord"></el-tab-pane>
         <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon class="icon" name="detail_auto_scaling"/>
          <div class="after-icon">
            <detail-info-state slot="item" outer-class-name="detail-page-state" :state="model.state"/>
          </div>
          <detail-name class="name" :param="getNameParam()"/>
          <detail-description class="description" :param="getDescriptionParam()"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row
            :param="{
              title: 'autoScaling.MinimumNumberOfInstance',
              content: model.minResourceSize
            }"
          ></detail-row>
          <detail-row
            :param="{
              title: 'autoScaling.MaximumNumberOfInstance',
              content: model.maxResourceSize
            }"
          ></detail-row>
          <detail-row
            :param="{
              title: 'autoScaling.CurrentNumberOfVmInstance',
              content: model.totalVmInstanceNum || 0
            }"
          ></detail-row>
          <detail-row
            :param="{
              title: 'autoScaling.numberofInitialInstance',
              content: model.initialInstanceNumber || 0
            }"
          ></detail-row>
          <detail-row
            :param="{
              title: 'autoScaling.healthCheck',
              content: getValue()
            }"
          />
          <detail-row v-if="model && model.vmInstanceHealthStrategy === 'LoadBalanceBackendStatus'"
            :param="{
              title: 'autoScaling.healthCheckGraceTime',
              content: model && model.vmNicLoadbalancerListenerHealthCheckGraceTimeSeconds + $t('time.second')
            }"
          />
          <detail-row
           :param="{
             title: 'common.createDate',
             content: model && model.createDate && formatDatetime(new Date(model.createDate))
           }"
          />
          <detail-row
           :param="{
             title: 'common.lastOpDate',
             content: model && model.createDate && formatDatetime(new Date(model.lastOpDate))
           }"
          />
          <div class="detail-block-header">
            {{$t("common.moreInformation")}}
          </div>
          <detail-row
            :param="{
              title:  'UUID',
              content: model.uuid,
              copy: true
            }"
          />
          <detail-row
            :param="{
              title: 'common.loadbalancer',
              content: model && model.loadBalancerName || '',
              handler: () =>{
                $router.push({name: 'detailloadbalancer', params: {uuid: model.loadBalancerUuid}})
              }
            }"
          />

          <detail-row-list
            :param="{
             title: 'common.loadbalancerlistener',
             contentList: getLoadBalancerListenerUUidList(),
              canLink: (uuid) => {
                return true;
              },
              getValue: (uuid) =>{
                if(uuid)
                return getLoadBalancerListenerName(uuid)
              },
              handler: (item) => {
                $router.push({name: 'detailloadbalancerlistener', params: {uuid: model.loadBalancerListenerUuids}})
              },
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right" style="right: 20px;">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
            {{$t("tag.resourceInfo")}}
		    </div>
        <div class="resource-info">
          <div class="right">
            <detail-row
              :param="{
                title: 'common.name',
                content: model.vmTemplates && model.vmTemplates.vmInstanceName
              }"
            />
            <detail-row
              :param="{
                title: 'common.description',
                content: model.vmTemplates && model.vmTemplates.description
              }"
            />
            <detail-row
              :param="{
                title: 'CPU',
                content: getCpuNum()
              }"
            />
            <detail-row
              :param="{
                title: 'common.memorySize',
                content: getMemorySize()
              }"
            />
            <detail-row
              :param="{
               title: 'common.instanceOffering',
               content:  getInstanceOfferingName(),
               handler: () => {
                  $router.push({name: 'detailInstanceOffering', params: {uuid: model.vmTemplates.vmInstanceOfferingUuid}})
               }
              }"
            />
            <detail-row
              :param="{
                title: 'common.image',
                content: getImageName(),
                handler: () => {
                  $router.push({name: 'detailImage', params: {uuid: model.vmTemplates.imageUuid}})
               }
              }"
            />

             <detail-row-list
              :param="{
                title: 'common.network',
                contentList: getNetworkName && getNetworkName.l3NetworkList,
                canLink: (uuid) => {
                  return true;
                },
               getValue: (item) =>{
                 if(getNetworkName && item.uuid === getNetworkName.defaultL3NetworkUuid){
                   return getNetwork(item.uuid) ? getNetwork(item.uuid) + `(${$t('common.default')})` : '';
                 }
                 return getNetwork(item.uuid);
               },
               handler: (item) => {
                 $router.push({name: 'detailPublicNetwork', params: {uuid: item.uuid}})
               },
              }"
            />

          </div>
          <div class="left">

            <detail-row-list
              :param="{
                title: 'common.dataVolumeOffering',
                contentList: model && model.vmTemplates && model.vmTemplates.dataDiskOfferingUuids,
                canLink: (uuid) => {
                  return true;
                },
               getValue: (uuid) =>{
                 return getDataDiskOfferingName(uuid);
               },
               handler: (uuid) => {
                 $router.push({name: 'detailVolumeOffering', params: {uuid}})
               },
              }"
            />

            <detail-row-list
              :param="{
                 title: 'common.securityGroup',
                  contentList: model && [model.securityGroupUuid],
                canLink: (uuid) => {
                  return true;
                },
                getValue: (uuid) =>{
                  return getSecurityGroupName(uuid)
               },
               handler: (uuid) => {
                  $router.push({name: 'detailsecuritygroup', params: {uuid}})
               },
              }"
            />

            <detail-row
              :param="{
                title: 'vm.consolePassword',
                content:  model.vmTemplates && model.vmTemplates.consolePassword ? '******' : ''
              }"
            />

            <detail-row
              :param="{
                title: 'vm.sshPublicKey',
                content: model.vmTemplates && model.vmTemplates.sshkey || ''
              }"
            />

            <detail-row
             :param="{
              title: 'vm.userData',
              content: userdataWindowBase64(model.vmTemplates && model.vmTemplates.userdata) || ''
             }"
            />

          </div>
        </div>
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t("autoScaling.ScalingPolicy")}}
        </div>
        <div class="operation-row">
          <div class="title" style="padding-left:30px;color: #c5c5c5;">{{$t('autoScaling.ExpansionStrategy')}}</div>
        </div>
        <div class="resource-info">

          <div class="right">

            <detail-row
              :param="{
                title: 'autoScaling.TriggerEntry',
                content: getTriggerEntryName()
              }"
            />

            <div class="detail-row editable" key="volumeReadBandwidth">
              <div class="detail-title">
                {{$t("autoScaling.Duration")}}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editDuration">{{getDurationValue()}}</span>
                <span
                  @click.stop="editDuration = true"
                  class="edit-icon"
                  v-if="!editDuration && model">
                  <i class="el-icon-edit"></i>
                </span>
                <detail-time-editor
                  :defaultUnit = "'second'"
                  :finish="getDuration"
                  v-if="editDuration"
                />
              </div>
            </div>

            <div class="detail-row editable">
              <div class="detail-title">
                {{$t('autoScaling.IncreaseInQuantityEachTime')}}{{$t('common.colon')}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editIncreaseInQuantityEachTime">{{model && model.addingNewInstanceRule && model.addingNewInstanceRule.adjustmentValue}}</span>
                <span
                  @click.stop="editIncreaseInQuantityEachTime = true"
                  class="edit-icon"
                  v-if="!editIncreaseInQuantityEachTime && model">
                  <i class="el-icon-edit"></i>
                </span>
                <input type="number" v-if="editIncreaseInQuantityEachTime" v-model="newIncreaseInQuantityEachTime" @blur="model && model.addingNewInstanceRule && updateAutoScalingGroupAddingNewInstanceRule('adjustmentValue', newIncreaseInQuantityEachTime, model.addingNewInstanceRule.uuid); editIncreaseInQuantityEachTime= false;"/>
              </div>
            </div>

          </div>
          <div class="left">

           <div class="detail-row editable">
             <div class="detail-title">
               {{$t('autoScaling.TriggerCondition')}}{{$t('common.colon')}}
             </div>
             <div class="detail-container">
               <span class="detail-content" v-if="!editThreshold">{{model && model.addingNewInstanceRule && model.addingNewInstanceRule.comparisonOperator ? (model.addingNewInstanceRule.comparisonOperator === 'GreaterThan' ? $t('monitoralarm.moreThen') : $t('monitoralarm.more')) : ''}}{{model && model.addingNewInstanceRule && model.addingNewInstanceRule.threshold}}</span>
               <span @click.stop="editThreshold = true"
                     class="edit-icon"
                     v-if="!editThreshold && model">
                   <i class="el-icon-edit"></i>
               </span>
               <div v-if="editThreshold" style="display: inline-flex;">
                  <drop-down2 style="width:80px;height: 40px;line-height: 40px;margin-right:-2px;"
                              :param="{
                getOptionList: () => {return TriggerConditionList},
                getIndex: () => TriggerConditionList.findIndex((num) =>{
                   if(num.value === triggerConditionUnit){
                    comparisonOperator = num.name
                   }
                   return num.value === triggerConditionUnit
                 }),
                setIndex: (index) => {
                  return triggerConditionUnit = TriggerConditionList[index].value;
                },
              }"></drop-down2>
                <input type="text" v-model="newThreshold" style="width:  45%;display:inline-block;margin-left:0px;" @blur="getTriggerConidtion(newThreshold, triggerConditionUnit);editThreshold = false;" @keydown.enter="getTriggerConidtion(newThreshold, triggerConditionUnit);editThreshold=false;"/>
                <span class="unit">%</span>
               </div>
             </div>
           </div>

            <div class="detail-row editable" key="volumeReadBandwidth">
              <div class="detail-title">
                {{$t("autoScaling.CoolDownTime")}}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editCoolDownTime">{{getCoolDownValue()}}</span>
                <span
                  @click.stop="editCoolDownTime = true"
                  class="edit-icon"
                  v-if="!editCoolDownTime && model">
                  <i class="el-icon-edit"></i>
                </span>
                <detail-time-editor :inputStyle="{width: '45%'}"
                                    :defaultUnit = "'second'"
                                    :finish="setCoolDownTime"
                                    v-if="editCoolDownTime"
                />
              </div>
            </div>

          </div>
        </div>
        <div class="split-line"></div>

        <div class="operation-row">
          <div class="title" style="padding-left:30px;color: #c5c5c5;">{{$t('autoScaling.ShrinkageStrategy')}}</div>
        </div>

        <div class="resource-info">

          <div class="right">
            <detail-row
              :param="{
                title: 'autoScaling.TriggerEntry',
                content: getTriggerEntryName()
              }"
            />

            <div class="detail-row editable" key="volumeReadBandwidth">
              <div class="detail-title">
                {{$t("autoScaling.Duration")}}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editRemoveDuration">{{getRemoveDurationValue()}}</span>
                <span
                  @click.stop="editRemoveDuration = true"
                  class="edit-icon"
                  v-if="!editRemoveDuration && model">
                  <i class="el-icon-edit"></i>
                </span>
                <detail-time-editor :defaultUnit = "'second'"
                                    :finish="getRemoveDuration"
                                    v-if="editRemoveDuration"
                />
              </div>
            </div>

            <div class="detail-row editable">
              <div class="detail-title">
                {{$t('autoScaling.ReduceQuantityEveryTime')}}{{$t('common.colon')}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editReduceQuantityEveryTime">{{model && model.removalInstanceRule && model.removalInstanceRule.adjustmentValue}}</span>
                <span
                  @click.stop="editReduceQuantityEveryTime = true"
                  class="edit-icon"
                  v-if="!editReduceQuantityEveryTime && model">
                  <i class="el-icon-edit"></i>
                </span>
                <input type="number" v-if="editReduceQuantityEveryTime" v-model="newReduceQuantityEveryTime" @blur="model && model.removalInstanceRule && updateAutoScalingGroupRemovalInstanceRule('adjustmentValue', newReduceQuantityEveryTime, model.removalInstanceRule.uuid); editReduceQuantityEveryTime= false;"/>
              </div>

            </div>
          </div>
          <div class="left">

            <div class="detail-row editable">
              <div class="detail-title">
                {{$t('autoScaling.TriggerCondition')}}{{$t('common.colon')}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editRemoveThreshold">{{model && model.removalInstanceRule && model.removalInstanceRule.comparisonOperator ? (model.removalInstanceRule.comparisonOperator === 'LessThan' ? $t('monitoralarm.lessThen') : $t('monitoralarm.less')) : ''}}{{model && model.removalInstanceRule && model.removalInstanceRule.threshold}}</span>
                <span @click.stop="editRemoveThreshold = true"
                      class="edit-icon"
                      v-if="!editRemoveThreshold && model">
                   <i class="el-icon-edit"></i>
               </span>
                <div v-if="editRemoveThreshold" style="display: inline-flex;">
                  <drop-down2 style="height: 40px;line-height: 40px;"
                              :param="{
                getOptionList: () => {return removeTriggerConditionList},
                getIndex: () => removeTriggerConditionList.findIndex((num) =>{
                   if(num.value === removeTriggerConditionUnit){
                    removeComparisonOperator = num.name
                   }
                   return num.value === removeTriggerConditionUnit
                 }),
                setIndex: (index) => {
                  return removeTriggerConditionUnit = removeTriggerConditionList[index].value;
                },
                style: {width: '80px'}
              }"></drop-down2>
                  <input type="text" v-model="newRemoveThreshold" style="width:  45%;display:inline-block;margin-left:-1px;" @blur="getRemoveTriggerConidtion(newRemoveThreshold, removeTriggerConditionUnit);editRemoveThreshold = false;" @keydown.enter="getTriggerConidtion(newRemoveThreshold, triggerConditionUnit);editRemoveThreshold=false;"/>
                  <span class="unit">%</span>
                </div>
              </div>
            </div>

            <div class="detail-row editable" key="volumeReadBandwidth">
              <div class="detail-title">
                {{$t("autoScaling.CoolDownTime")}}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content" v-if="!editRemoveCoolDownTime">{{getRemoveCoolDownValue()}}</span>
                <span
                  @click.stop="editRemoveCoolDownTime = true"
                  class="edit-icon"
                  v-if="!editRemoveCoolDownTime && model">
                  <i class="el-icon-edit"></i>
                </span>
                <detail-time-editor :defaultUnit = "'second'"
                                    :finish="setRemoveCoolDownTime"
                                    v-if="editRemoveCoolDownTime"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'vm'">
      <vm-tab-list-for-auto-scaling :param="{conditions: [`uuid?=${model.vmInstanceUuidList}`, 'state!=Destroyed', 'type=UserVm'], uuid: $route.params.uuid}"/>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'scalingRecord'">
      <auto-scaling-record-tab-list :param="{uuid: windowData.dataUuid, conditions: [`scalingGroupUuid=${$route.params.uuid}`], goToAutoScalingRecordDetail: goToAutoScalingRecordDetail}"/>
    </div>
    <div class="detail-body" slot="body" v-if="activeName === 'log'">
      <log-list :param="{uuid: $route.params.uuid}"/>
    </div>

    <div slot="footer">
      <auto-scaling-record-detail class="detail-footer" :param="autoScalingRecordParam" v-if="showAutoScalingRecordDetail" @close="showAutoScalingRecordDetail = false;"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import Utils from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import {mapState, mapGetters} from 'vuex';
  import DetailInfoState from "../../../component/DetailInfoState";
  import Utf8Base64 from 'src/utils/utf8Base64.js';
  import rpc from 'src/utils/rpc';
  import systemTagApi from '../../../../store/modules/systemTag/apis';
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import VmTabListForAutoScaling from "../component/VmTabListForAutoScaling";
  import AutoScalingRecordTabList from "../component/AutoScalingRecordTabList";
  import AutoScalingRecordDetail from './AutoScalingRecordDetailPage';
  import LogList from "../../../component/LogList";

  export default {
    name: "AutoScalingGroupDetailPage",
    mixins: [WindowBase],
    components: {
      LogList,
      AutoScalingRecordTabList,
      VmTabListForAutoScaling,
      DetailInfoState, DetailTemplate,
      'drop-down2': DropDown,
      AutoScalingRecordDetail,
    },
    data() {
      return {
        activeName: 'info',
        dataUuid: '',
        healthCheckList: [
          {
            displayName: 'autoScaling.loadbalancerHealthCheck',
            value: 'LoadBalanceBackendStatus'
          },
          {
            displayName: 'autoScaling.vmInstanceHealthCheck',
            value: 'VmInstanceStatus'
          }
        ],
        ExpansionTriggerEntryList: [
          {
            displayName: 'autoScaling.VmMemoryUsedInPercent',
            value: 'MemoryUsedInPercent'
          },
          {
            displayName: 'autoScaling.VmCPUAverageUsedUtilization',
            value: 'CPUAverageUsedUtilization'
          }
        ],
        editDuration: false,
        newDuration: '',
        healthCheckGraceTimeList: [
          {
            name: 'common.second',
            value: 'second'
          },
          {
            name: 'common.minute',
            value: 'minute'
          },
          {
            name: 'common.hour',
            value: 'hour'
          }
        ],
        TriggerConditionList: [
          {name: 'monitoralarm.moreThen', value: 'GreaterThan'},
          {name: 'monitoralarm.more', value: 'GreaterThanOrEqualTo'}
        ],
        removeTriggerConditionList: [
          {name: 'monitoralarm.lessThen', value: 'LessThan'},
          {name: 'monitoralarm.less', value: 'LessThanOrEqualTo'}
        ],
        removeComparisonOperator: '',
        newRemoveThreshold: '',
        removeTriggerConditionUnit: 'LessThan',
        durationTimeTimeUnit: 'second',
        triggerConditionUnit: 'GreaterThan',
        editIncreaseInQuantityEachTime: false,
        newIncreaseInQuantityEachTime: '',
        newThreshold: '',
        editThreshold: false,
        editCoolDownTime: false,
        editRemoveDuration: false,
        editReduceQuantityEveryTime: false,
        newReduceQuantityEveryTime: '',
        editRemoveThreshold: false,
        comparisonOperator: '',
        editRemoveCoolDownTime: false,
        editRemoveThreshold: false,
        showAutoScalingRecordDetail: false,
        autoScalingRecordParam: {}
      }
    },
    computed: {
      ...mapState({
        autoScalingGroup: state => state.autoScalingGroup
      }),
      ...mapGetters({
        get: 'autoScalingGroup/get'
      }),
      model () {
        let self = this;
        return this.get(self.$route.params.uuid)
      },
      getNetworkName(){
        let self = this;
        if(!self.model || !self.model.vmTemplates) return;
        let value = {
          defaultL3NetworkUuid: self.model && self.model.vmTemplates.defaultL3NetworkUuid,
          l3NetworkList: []
        }

        if ( self.model.vmTemplates.l3NetworkUuids &&  self.model.vmTemplates.l3NetworkUuids.length > 0) {
          self.model.vmTemplates.l3NetworkUuids.forEach((uuid, index) => {
            let systemTags =  self.model.vmTemplates.systemTags
            let obj = { uuid }
            for (let i in systemTags) {
              if (systemTags[i].indexOf(uuid) >= 0) {
                let tagList = systemTags[i].split('::')
                obj[tagList[0]] = tagList[2]
              }
            }
            value.l3NetworkList.push(obj)
          })
        }
        return value;
      },
    },
    created(){
      let self = this;
      self.dataUuid = self.$route.params.uuid;
      self.updateWindow({
        methods: {
          query: self.detailQuery
        }
      })
        .then(() => {
          self.detailQuery()
        })
    },
    methods: {
      ...Utils,
      detailQuery() {
        let self = this;
        return this.dispatchAction('autoScalingGroup/query',  self.$route.params.uuid)
      },
      handleTabChange() {

      },
      getNameParam(){
        let self = this;
        return {
          getValue: () => {
            if (self.model) {
              return self.model.name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'AUTOSCALINGGROUP.UPDATE'
          },
          setValue: (value) => {
            self.updateAutoScalingGroup('name', value)
          }
        }
      },
      getDescriptionParam(){
        let self = this;
        return {
          getValue: () => {
            if (self.model) {
              return self.model.description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true
          },
          getPermission: () => {
            return 'AUTOSCALINGGROUP.UPDATE'
          },
          setValue: (value) => {
            self.updateAutoScalingGroup('description', value)
          }
        }
      },
      //更新弹性伸缩组
      updateAutoScalingGroup(key, newValue){
        let self = this;
        let oldValue = String(self.model[key]);
        if (oldValue === String(newValue)) return;
        if (key === 'name' && !String(newValue).trim()) return;
        let param = {};
        param[key] = newValue;
        this.dispatchActionWithEvent('autoScalingGroup/update', {
          uuid: self.dataUuid,
          value: param
        })
      },
      getValue(){
        let index = _.findIndex(this.healthCheckList, it => it.value === this.model.vmInstanceHealthStrategy)
        if (index < 0) return this.$t('autoScaling.vmInstanceHealthCheck')
        return this.$t(`${this.healthCheckList[index].displayName}`)
      },
      getLoadBalancerListenerUUidList(){
          let self = this;
          if (self.model && self.model.loadBalancerListenerUuids) {
             return this.model.loadBalancerListenerUuids.split(',')
          }
          return []
      },
      getLoadBalancerListenerName(uuid){
        let self = this;
        if(self.dbData && self.dbData.loadBalancerListener){
          return self.dbData.loadBalancerListener[uuid] && self.dbData.loadBalancerListener[uuid].name;
        }
      },
      getDataDiskOfferingName(uuid){
        let self = this;
        if (!self.dbData.volumeoffering[uuid]) {
          Utils.queryResourceByUuid('disk-offerings', uuid, 'volumeoffering', self)
        } else {
          return this.dbData.volumeoffering[uuid].name
        }
      },
      getSecurityGroupName(uuid){
        let self = this;
        if (!self.dbData.securitygroup[uuid]) {
          Utils.queryResourceByUuid('security-groups', uuid, 'securitygroup', self)
        } else {
          return self.dbData.securitygroup[uuid].name
        }
      },
      getCpuNum(){
        let self = this;
        if(!self.model || !self.model.vmTemplates || !self.model.vmTemplates.vmInstanceOfferingUuid) return;
        let uuid =  this.model.vmTemplates.vmInstanceOfferingUuid
        if (this.dbData.instanceOffering[uuid]) {
          return this.dbData.instanceOffering[uuid].cpuNum
        } else {
          Utils.queryResourceByUuid('instance-offerings', uuid, 'instanceOffering', this)
        }
        return ''
      },
      userdataWindowBase64 (item) {
        if (item !== undefined) {
          return Utf8Base64.decode(item)
        } else {
          return ''
        }
      },
      getImageName(){
        let self = this;
        if(!self.model || !self.model.vmTemplates || !self.model.vmTemplates.imageUuid) return;
        let uuid = self.model.vmTemplates.imageUuid
        if (!self.dbData.image[uuid]) {
          Utils.queryResourceByUuid('images', uuid, 'image', self)
        } else {
          return self.dbData.image[uuid].name
        }
      },

      getMemorySize(){
        let self = this;
        if(!self.model || !self.model.vmTemplates || !self.model.vmTemplates.vmInstanceOfferingUuid) return;
        if(self.model.vmTemplates.vmInstanceOfferingUuid && self.dbData.instanceOffering[self.model.vmTemplates.vmInstanceOfferingUuid])
         return self.bytesToSize(self.dbData.instanceOffering[self.model.vmTemplates.vmInstanceOfferingUuid].memorySize)
      },
      getInstanceOfferingName() {
        let self = this;
        if(!self.model || !self.model.vmTemplates || !self.model.vmTemplates.vmInstanceOfferingUuid) return;
        return self.dbData.instanceOffering[self.model.vmTemplates.vmInstanceOfferingUuid] && self.dbData.instanceOffering[self.model.vmTemplates.vmInstanceOfferingUuid].name
      },
      getTriggerEntryName(){
        let self = this;
        if(!self.model || ! this.model.addingNewInstanceRule) return
        let index = _.findIndex(this.ExpansionTriggerEntryList, it => it.value === this.model.addingNewInstanceRule.metricName)
        if (index === -1) return ''
        return this.$t(`${this.ExpansionTriggerEntryList[index].displayName}`)
      },
      getDurationValue(){
        let self = this;
        if(!self.model || !self.model.addingNewInstanceRule || !self.model.addingNewInstanceRule.period) return '';
        return this.durationConvert(self.model.addingNewInstanceRule.period)
      },
      durationConvert (s) {
        let time = this.secToTime(s)
        let str = ''
        if (time.hour > 0) {
          str += time.hour + this.$t('common.hourShort')
        }
        if (time.min > 0) {
          str += time.min + this.$t('common.minuteShort')
        }
        if (time.sec > 0) {
          str += time.sec + this.$t('common.secondShort')
        }
        if (time.hour === 0 && time.min === 0 && time.sec === 0) {
          str = 0 + this.$t('common.secondShort')
        }
        return str
      },
      //更新持续时间
      getDuration(value){
        let self = this;
        if(!value || value === self.model.addingNewInstanceRule.period) {
          self.editDuration = false;
          return;
        }
        this.updateAlarm('period', value, this.model.addingNewInstanceRule.alarmUuid)
          .then(() => {
            this.durationConvert(self.model.addingNewInstanceRule.period)
          })
        self.editDuration = false;
      },
      updateAlarm (key, value, alarmUuid) {
        let uuid = alarmUuid
        let param = {}
        param[key] = value
        if (key === 'comparisonOperator') {
          value = this.$t(`zwatchAlarm.${value}`)
        }
        if (key === 'period') {
          if (String(value).trim() === '') return
          param[key] = value
          value = value + this.$t('common.second')
        }
        if (key === 'threshold') {
          value = value + '%'
        }
        let event = this.createEvent(`zwatchAlarm.update.${key}`, value)
        let tasks = []
        let p = null
        p = rpc.update('zwatch/alarms', uuid, {
          updateAlarm: param
        }, event).then(() => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        })
        tasks.push(p)
        return Promise.all(tasks)
          .then(() => {
            this.detailQuery();
          })
      },
      //更新添加云主机数量
      updateAutoScalingGroupAddingNewInstanceRule (key, value, ruleUuid, alarmUuid) {
        if(!value || value === this.model.addingNewInstanceRule.adjustmentValue) return;
        let uuid = ruleUuid
        let param = {}
        param[key] = value
        let event = this.createEvent(`autoScaling.update.${key}`, value)
        let tasks = []
        let p = null
        p = rpc.update('autoscaling/rules/adding-new-instance', uuid, {
          updateAutoScalingGroupAddingNewInstanceRule: param
        }, event).then(() => {
          this.incEventSuccess(event)
          this.deleteAutoScalingGroupCooldownDataTag()
        }, () => {
          this.incEventFail(event)
        })
        tasks.push(p)
        if (key === 'cooldown' && alarmUuid) {
          p = rpc.update('zwatch/alarms', alarmUuid, {
            'updateAlarm': {
              'repeatInterval': Math.ceil(value / 10) >= 10 ? Math.ceil(value / 10) : 10
            }
          }, event)
          tasks.push(p)
        }
        return Promise.all(tasks)
          .then(() => {
            this.detailQuery();
          })
      },
      deleteAutoScalingGroupCooldownDataTag: async function () {
        const self = this
        let scalingGroupUuid = self.model.addingNewInstanceRule.scalingGroupUuid || self.model.removalInstanceRule.scalingGroupUuid
        let cooldownDataResp = await systemTagApi.query([`resourceUuid=${scalingGroupUuid}`, 'resourceType=AutoScalingGroupVO', `tag~=cooldownData::%25`])
        let tagUuidList = cooldownDataResp.inventories.map(it => it.uuid)
        if (tagUuidList && tagUuidList.length > 0) {
          tagUuidList.forEach(uuid => {
            systemTagApi._delete(uuid)
          })
        }
      },
      getTriggerConidtion(value, cunit){
        if (_.isNaN(_.toNumber(value)) || !_.isNumber(_.toNumber(value)) || _.isEmpty(value) || _.toNumber(value) <= 0 || !_.isInteger(_.toNumber(value)) || _.toNumber(value) > 100) return
        if (this.model.addingNewInstanceRule.comparisonOperator !== cunit) {
          this.updateAlarm('comparisonOperator', cunit, this.model.addingNewInstanceRule.alarmUuid)
            .then(() => {
              this.model.addingNewInstanceRule.comparisonOperator = cunit
            })
        }
        if (value && this.model.addingNewInstanceRule.threshold !== value) {
          this.updateAlarm('threshold', value, this.model.addingNewInstanceRule.alarmUuid)
            .then(() => {
              this.model.addingNewInstanceRule.threshold = value
            })
        }
      },
      //获得冷却时间
      getCoolDownValue(){
        let self = this;
        if (!self.model || !self.model.addingNewInstanceRule || !this.model.addingNewInstanceRule.cooldown) return ''
        return this.durationConvert(this.model.addingNewInstanceRule.cooldown)
      },
      //更新coolDown时间
      setCoolDownTime(value){
        let self = this;
        if(value && value !== this.model.addingNewInstanceRule.cooldown)
        self.updateAutoScalingGroupAddingNewInstanceRule('cooldown', value, this.model.addingNewInstanceRule.uuid, this.model.addingNewInstanceRule.alarmUuid)
          .then(() => {
            self.detailQuery();
          });
        self.editCoolDownTime = false;
      },
      //或得缩容触发条件
      getRemoveDurationValue(value){
        let self = this;
        if(!self.model || !self.model.removalInstanceRule || !self.model.removalInstanceRule.period) return;
        if(!self.model || !self.model.removalInstanceRule || !self.model.removalInstanceRule.period) return '';
        return this.durationConvert(self.model.removalInstanceRule.period)
      },
      //更新缩容触发条件
      getRemoveDuration(value){
        let self = this;
        if(value && value !== self.model.removalInstanceRule.period)
        this.updateAlarm('period', value, this.model.removalInstanceRule.alarmUuid)
          .then(() => {
            this.durationConvert(self.model.removalInstanceRule.period)
          })
        self.editRemoveDuration = false;
      },
      //修改缩容策略次数
      updateAutoScalingGroupRemovalInstanceRule: function (key, value, ruleUuid, alarmUuid) {
        if(!value || value === this.model.removalInstanceRule.adjustmentValue) return;
        let uuid = ruleUuid
        let param = {}
        param[key] = value
        if (key === 'removalPolicy') {
          value = this.$t(`autoScaling.${value}`)
        }
        let event = this.createEvent(`autoScaling.update.${key}`, value)
        let tasks = []
        let p = null
        p = rpc.update('autoscaling/rules/removal-instance', uuid, {
          updateAutoScalingGroupRemovalInstanceRule: param
        }, event).then(() => {
          this.incEventSuccess(event)
          this.deleteAutoScalingGroupCooldownDataTag()
        }, () => {
          this.incEventFail(event)
        })
        tasks.push(p)
        if (key === 'cooldown' && alarmUuid) {
          p = rpc.update('zwatch/alarms', alarmUuid, {
            'updateAlarm': {
              'repeatInterval': Math.ceil(value / 10) >= 10 ? Math.ceil(value / 10) : 10
            }
          }, event)
          tasks.push(p)
        }
        return Promise.all(tasks)
          .then(() => {
            this.detailQuery();
          });
      },
      //更细触发条件
      getRemoveTriggerConidtion(value, cunit){
        if (_.isNaN(_.toNumber(value)) || !_.isNumber(_.toNumber(value)) || _.isEmpty(value) || _.toNumber(value) <= 0 || !_.isInteger(_.toNumber(value)) || _.toNumber(value) > 100) return
        if (this.model.removalInstanceRule.comparisonOperator !== cunit) {
          this.updateAlarm('comparisonOperator', cunit, this.model.removalInstanceRule.alarmUuid)
            .then(() => {
              this.model.removalInstanceRule.comparisonOperator = cunit
            })
        }
        if (this.model.removalInstanceRule.threshold !== value) {
          this.updateAlarm('threshold', value, this.model.removalInstanceRule.alarmUuid)
            .then(() => {
              this.model.removalInstanceRule.threshold = value
            })
        }
      },
      //获得缩容冷却时间
      getRemoveCoolDownValue(){
        let self = this;
        if(!self.model || !self.model.removalInstanceRule || !self.model.removalInstanceRule.cooldown) return '';
        return this.durationConvert(self.model.removalInstanceRule.cooldown)
      },
      //设置缩容冷却时间
      setRemoveCoolDownTime(value){
        let self = this;
        if(!value || !self.model || !self.model.removalInstanceRule || !self.model.removalInstanceRule.cooldown) {
          self.editRemoveCoolDownTime = false;
          return;
        }
        self.updateAutoScalingGroupRemovalInstanceRule('cooldown', value, this.model.removalInstanceRule.uuid, this.model.removalInstanceRule.alarmUuid)
          .then(() => {
            self.detailQuery();
          });
        self.editRemoveCoolDownTime = false;
      },
      //是否可以启用
      canEnabled(){
        let self =  this;
        if(!self.model && !self.model.state) return false;
        if(self.model.state !== 'Delete' && self.model.state === 'Disabled') return true;
        else return false;
      },
      //启用弹性伸缩
      detailEnabled(param){
        let self = this;
        self.dispatchActionWithEvent(`autoScalingGroup/${param}`, self.$route.params.uuid)
          .then(() => {
            self.detailQuery();
          });
      },
      //删除弹性伸缩
      detailDelete() {
        const self = this
        self.openDialog('ConfirmDlg', {
          uuidList: [self.$route.params.uuid],
          description: "autoScaling.info.deleteGroupConfirm",
          title: "autoScaling.deleteGroup",
          icon: 'pop_auto_scaling_n',
          warning: 'autoScaling.warning.deleteAutoScalingGroup',
          getName: (uuid) => {
            return self.autoScalingGroup[uuid].name;
          },
          ok: () => {
            let zql = "query AutoScalingRuleTrigger where ruleUuid in (query AutoScalingRule.uuid where scalingGroupUuid='" + `${self.windowData.dataUuid}` + "')"
            rpc.query('/zql', {
              zql: encodeURIComponent(zql)
            }).then((resp) => {
              self.dispatchActionWithEvent('autoScalingGroup/delete', [self.$route.params.uuid])
                .then(() => {
                  let alarmUuidList = []
                  if (resp.results && resp.results.length > 0 && resp.results[0].inventories && resp.results[0].inventories.length > 0) {
                    alarmUuidList = resp.results[0].inventories.map(it => it.alarmUuid)
                    alarmUuidList.forEach(function (uuid) {
                      ((uuid) => {
                        rpc._delete(`zwatch/alarms/${uuid}`)
                      })(uuid)
                    })
                  }
                  self.$router.push({name: 'autoscalinggroup'})
                })
            })
          }
        })
      },

      //网络
    getNetwork(uuid) {
          if (!this.dbData.l3network[uuid]) {
            Utils.queryResourceByUuid('l3-networks', uuid, 'l3network', this)
            return ''
          }
          // let value = this.param.getValue()
          let retStr = this.dbData.l3network[uuid].name
          // if (!_.isUndefined(retStr)) {
          //   if (value.defaultL3NetworkUuid === uuid) {
          //     retStr += `(${this.$t('common.default')})`
          //   }
          // }
          return retStr
       },
       //伸缩记录详情
       goToAutoScalingRecordDetail(param) {
         let self = this;
         self.autoScalingRecordParam = param;
         self.showAutoScalingRecordDetail = true;
       }
    }
  }
</script>

<style scoped lang="less">
  .resource-info{
    display: inline-block;
    position: relative;
    width: 100%;
    .right{
      width: 46%;
      display: inline-block;
      position: relative;
    }
    .left{
      width: 50%;
      display: inline-block;
      position: absolute;
    }
  }
   .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 62px!important;
    height: 60px!important;
    background-repeat: no-repeat;
  }

  .detail-footer{
    position: absolute;
    width: 100%;
    min-height: 100%;
    background: #fff;
    top: 0;
    z-index: 2;
  }
  .unit{
    display: inline-block;
    height: 40px;
    line-height: 40px;
  }
</style>
