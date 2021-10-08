<template>
    <create-template>
      <div class="create-header" slot="header">
         <span>
          {{$t('autoScaling.create')}}
        </span>
        <span class="create-back" @click="$router.push({name: 'autoscalinggroup'})"><i class="el-icon-back"></i>回到弹性伸缩组列表</span>
      </div>
      <div class="create-body" slot="body">
        <div v-if="step === 1">
          <div class="operation-row">
            <h1 class="title" style="font-weight: 500;font-size: 18px;">{{$t('autoScaling.BasicConfig')}}</h1>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.zone')}}{{$t('common.colon')}}{{getZoneName()}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('common.name')}}</div>
            <help-trigger name="autoScalingGroupConfig"/>
            <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')" @keydown.enter="validate('name')"/>
            <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.description')}}</div>
            <textarea v-model="description" rows="3"/>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.MinimumNumberOfInstance')}}</div>
            <help-trigger name="autoScalingGroupBasicConfigInfoMinVmInstanceNum"/>
            <input type="number" v-model="minResourceSize" min="1" placeholder="1~1000" :class="{'is-error': emptyminResourceSize || invalidminResourceSize || minResourceSizeunlimit}" @blur="validate('minResourceSize')"/>
            <div class="error error-text" v-if="!(invalidminResourceSize || minResourceSizeunlimit) && emptyminResourceSize">{{$t('autoScaling.MinimumNumberOfInstance')}}{{$t('error.noEmpty')}}</div>
            <div class="error error-text" v-else-if="!(emptyminResourceSize || invalidminResourceSize) && minResourceSizeunlimit">{{$t('error.inRange', {min: 1, max: 1000})}}</div>
            <div class="error error-text" v-else-if="!(emptyminResourceSize || minResourceSizeunlimit) && invalidminResourceSize">{{$t('autoScaling.error.minResourceSize')}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.MaximumNumberOfInstance')}}</div>
            <help-trigger name="autoScalingGroupBasicConfigInfoMaxVmInstanceNum"/>
            <input type="number" v-model="maxResourceSize" min="1" placeholder="1~100" :class="{'is-error': emptymaxResourceSize || invalidmaxResourceSize || maxResourceSizeunlimit}" @blur="validate('maxResourceSize'); validate('minResourceSize')"/>
            <div class="error error-text" v-if="!invalidmaxResourceSize && !maxResourceSizeunlimit && emptymaxResourceSize">{{$t('autoScaling.MaximumNumberOfInstance')}}{{$t('error.noEmpty')}}</div>
            <div class="error error-text" v-else-if="!emptymaxResourceSize && ! invalidmaxResourceSize && maxResourceSizeunlimit">{{$t('error.inRange', {min: 1, max: 1000})}}</div>
            <div class="error error-text" v-else-if="!emptyminResourceSize && !minResourceSizeunlimit && invalidminResourceSize">{{$t('autoScaling.error.maxResourceSize')}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.numberofInitialInstance')}}</div>
            <help-trigger name="autoScalingGroupBasicConfigInfonumberofInitialInstance"/>
            <input type="number" v-model="expectedNumberOfInstance" min="1" placeholder="1~100" :class="{'is-error':expectedNumberOfInstanceunlimit || emptyexpectedNumberOfInstance}" @blur="validate('expectedNumberOfInstance')"/>
            <div class="error error-text" v-if="emptyexpectedNumberOfInstance">{{$t('autoScaling.numberofInitialInstance')}}{{$t('error.noEmpty')}}</div>
            <div class="error error-text" v-if="!emptyexpectedNumberOfInstance && expectedNumberOfInstanceunlimit">{{$t('error.inRange', {min: 1, max: 1000})}}</div>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.loadbalancer')}}</div>
            <help-trigger name="autoScalingGroupBasicConfigInfoLoadBalancer"/>
            <add-or-delete-input @open="openLoadBalancer()" :value="dbData.loadBalancer[loadBalancerUuid] && dbData.loadBalancer[loadBalancerUuid].name" @remove="removeUuid('loadBalancerUuid')"/>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.listener')}}</div>
            <help-trigger name="autoScalingGroupBasicConfigInfoLoadBalancerListener"/>
            <add-or-delete-input @open="openloadbalancerListenerDlg()" v-if="loadbalancerListenerUuidList.length > 0"
                                 v-for="(loadbalancerListener, index) in loadbalancerListenerUuidList"
                                 :value="dbData.loadBalancerListener[loadbalancerListener].name"
                                 :key="index"
                                 @remove="deleteLoadBalancerListener(index)"/>
            <add-or-delete-input @open="openloadbalancerListenerDlg()" @remove="removeUuid('loadbalancerListener')"/>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('common.l3network')}}</div>
            <help-trigger name="autoScalingGroupBasicConfigL3Network"/>
            <add-or-delete-input @open="openL3NetWork()"
                                :value="dbData.l3network[l3NetworkUuid] && dbData.l3network[l3NetworkUuid].name"
                                :class="{'is-error': emptyl3NetworkUuid}"
                                @remove="removeUuid('l3NetworkUuid')"/>
            <div class="error error-text" v-if="emptyl3NetworkUuid">{{$t('common.l3network')}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.healthCheck')}}</div>
            <help-trigger name="healthCheck"/>
            <el-select v-model="healthText" style="width: 100%;">
              <el-option v-for="(item, index) in healthList"
                         :key="index"
                         :label="$t(item.label)"
                         :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="operation-row" v-if="healthText === 'LoadBalanceBackendStatus'">
            <div class="title required">
              {{$t('autoScaling.healthCheckGraceTime')}}
            </div>
            <help-trigger name="autoScalingGroupBasicConfigHealthCheckGraceTime"/>
            <input type="number" v-model="healthCheckGraceTime" :class="{'is-error': emptyhealthCheckGraceTime}" @blur="validate('healthCheckGraceTime')"/>
            <div class="error error-text" v-if="emptyhealthCheckGraceTime">{{$t('autoScaling.healthCheckGraceTime')}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <el-checkbox v-model="isEnableAlarmNotification">{{$t('autoScaling.EnableAlarmNotification')}}</el-checkbox>
            <help-trigger name="autoScalingGroupBasicConfigEnableAlarmNotification"/>
          </div>
          <div class="operation-row" v-if="isEnableAlarmNotification">
            <div class="title required">{{$t('home.endPoint')}}</div>
            <add-or-delete-input v-for="(endpoint, index) in genEndpointName()" :key="index" :value="endpoint" @remove="removeEndPointName(index)"/>
            <add-or-delete-input @open="openZwatchEndPointer()"/>
          </div>
          <div class="operation-row">
            <el-checkbox v-model="isEnableImmediatelyAfterCreation">{{$t('autoScaling.EnableImmediatelyAfterCreation')}}</el-checkbox>
          </div>
        </div>
        <div v-if="step ===2 ">
          <div class="operation-row">
            <h1 class="title" style="font-weight: 500;font-size: 18px;">{{$t('autoScaling.ConfigVmInstance')}}</h1>
          </div>
          <div class="operation-row">
            <div class="title required">
              {{$t("common.vmName")}}
            </div>
            <help-trigger name="autoScalingGroupConfigVmInstanceName"/>
            <input type="text" v-model="vmName" :class="{'is-error': emptyvmName}" @blur="validate('vmName')"/>
            <div class="error error-text" v-if="emptyvmName">{{$t("common.vmName")}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('ticket.vmDescription')}}</div>
            <textarea rows="3" v-model="vmDescription"></textarea>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('common.instanceOffering')}}</div>
            <add-or-delete-input @open="openInstanceOffering()"
                                 :value="dbData.instanceOffering[instanceOfferingUuid] && dbData.instanceOffering[instanceOfferingUuid].name"
                                  @remove="removeUuid('instanceOfferingUuid')"
                                  :class="{'is-error': emptyinstanceOfferingUuid}"
                                 />
            <div class="error error-text" v-if="emptyinstanceOfferingUuid">{{$t('common.instanceOffering')}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('common.image')}}</div>
            <help-trigger name="autoScalingGroupConfigVmInstanceImage"/>
            <add-or-delete-input @open="openImageDlg()"
                                 :value="dbData.image[imageUuid] && dbData.image[imageUuid].name"
                                 :class="{'is-error': emptyimageUuid}"
                                 @remove="removeUuid('imageUuid')"/>
            <div class="error error-text" v-if="emptyimageUuid">{{$t('common.image')}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.l3network')}}{{$t('common.colon')}}{{dbData.l3network[l3NetworkUuid] && dbData.l3network[l3NetworkUuid].name}}</div>
          </div>
          <div class="operation-row" style="border-bottom: 1px solid #ccc;" @click="showAdvice = !showAdvice">
            <div class="title">高级<i class="el-icon-arrow-down" v-if="!showAdvice"></i><i class="el-icon-arrow-up" v-if="showAdvice"></i></div>
          </div>
          <div v-if="showAdvice">
            <div class="operation-row">
              <div class="title">{{$t('common.dataVolumeOffering')}}</div>
              <add-or-delete-input @open="openDataVolumeInstancOffering()"
                                   :value="dbData.volumeoffering[dataVolumeInstanceOfferingUuid]
                                   && dbData.volumeoffering[dataVolumeInstanceOfferingUuid].name"
                                   @remove="removeUuid('dataVolumeInstanceOfferingUuid')"
                                   />
            </div>
            <div class="operation-row">
              <div class="title">{{$t('common.securityGroup')}}</div>
              <add-or-delete-input @open="openSecurityGroup()"
                                   :value="dbData.securitygroup[securityGroupUuid]
                                   && dbData.securitygroup[securityGroupUuid].name"
                                   @remove="removeUuid('securityGroupUuid')"/>
            </div>
            <div class="operation-row">
              <div class="title">{{$t('vm.consolePassword')}}</div>
              <help-trigger name="consolePassword"/>
              <input type="password" v-model="consolePassword"/>
            </div>
            <div class="operation-row">
              <div class="title">{{$t('vm.sshPublicKey')}}</div>
              <help-trigger name="sshKey"/>
              <input type="text" v-model="sshPublicKey"/>
            </div>
            <div class="operation-row">
              <div class="title" v-text="'User Data'"></div>
              <help-trigger name="userData"/>
              <textarea rows="3" v-model="userData"/>
            </div>
          </div>
          <instance-offering-single-dlg :model="showInstanceOfferingSingleDlg"
                                        v-if="showInstanceOfferingSingleDlg"
                                        :message="instanceOfferingMessage"
                                        @close="closeInstanceOfferingDlg"/>
          <data-volume-instance-offer-single-dlg :model="showDataVolumeSingleDlg"
                                                 v-if="showDataVolumeSingleDlg"
                                                 :message="dataVolumeMessage"
                                                 @close="closeDataVolumeDlg"
                                                 />
        </div>
        <div v-if="step === 3">
          <div class="operation-row">
            <h1 class="title" style="font-size: 18px; font-weight: 500">{{$t('autoScaling.ConfigScalingPolicy')}}</h1>
          </div>
          <div class="operation-row" style="border-bottom: 1px solid #ccc;">
            <div class="title">{{$t('autoScaling.ExpansionStrategy')}}</div>
            <help-trigger name="expansionStrategy"/>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.TriggerEntry')}}</div>
            <el-select v-model="triggerEntry" style="width: 100%">
              <el-option v-for="(item, index) in triggerEntryList"
                         :key="index"
                         :label="$t(item.label)"
                         :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.TriggerCondition')}}</div>
              <drop-down :param="{
                getOptionList: () => {return TriggerConditionList},
                getIndex: () => TriggerConditionList.findIndex((num) =>{
                   return num.value === triggerConditionUnit
                 }),
                setIndex: (index) => {
                  return triggerConditionUnit = TriggerConditionList[index].value;
                },
                style: {width: '80px' }
              }"></drop-down>
              <input type="text" v-model="triggerCondition" style="width:  39%;display:inline-block;margin-left:-2px;"
                     :class="{'is-error': emptytriggerCondition}"
                     @blur="validate('triggerCondition')"/>
              <span class="unit">%</span>
            <div class="error error-text" v-if="emptytriggerCondition">{{$t('autoScaling.TriggerCondition')}}{{$t('error.noEmpty')}}</div>
            </div>
            <div class="operation-row">
              <div class="title required">{{$t('autoScaling.Duration')}}</div>
              <input type="number" min="0" v-model="durationTime" style="width: 66%" :class="{'is-error': emptydurationTime}" @blur="validate('durationTime')"/>
              <drop-down :param="{
                getOptionList: () => {return healthCheckGraceTimeList},
                getIndex: () => healthCheckGraceTimeList.findIndex((num) =>{
                   return num.value === durationTimeTimeUnit
                 }),
                setIndex: (index) => {
                  return durationTimeTimeUnit = healthCheckGraceTimeList[index].value;
                },
                style: {width: '80px' , marginLeft: '-2px'}
              }"></drop-down>
              <div class="error error-text" v-if="emptydurationTime">{{$t('autoScaling.Duration')}}{{$t('error.noEmpty')}}</div>
            </div>
            <div class="operation-row">
              <div class="title required">{{$t('autoScaling.CoolDownTime')}}</div>
              <help-trigger name="autoScalingGroupConfigConfigScalingPolicyCoolDownTime"/>
              <input type="number" min="0" v-model="coolTime" style="width: 66%" :class="{'is-error':emptycoolTime}" @blur="validate('coolTime')"/>
              <drop-down :param="{
                getOptionList: () => {return coolTimeList},
                getIndex: () => coolTimeList.findIndex((num) =>{
                   return num.value === coolTimeUnit
                 }),
                setIndex: (index) => {
                  return coolTimeUnit = coolTimeList[index].value;
                },
                style: {width: '80px' , marginLeft: '-2px'}
              }"></drop-down>
              <div class="error error-text" v-if="emptycoolTime">{{$t("autoScaling.CoolDownTime")}}{{$t("error.noEmpty")}}</div>
            </div>
            <div class="operation-row">
              <div class="title required">{{$t('autoScaling.IncreaseInQuantityEachTime')}}</div>
              <help-trigger name="autoScalingGroupConfigConfigScalingPolicyIncreaseInQuantityEachTime"/>
              <input type="number" v-model="increaseInQuantityEachTimeNum" :class="{'is-error': emptyincreaseInQuantityEachTimeNum}" @blur="validate('increaseInQuantityEachTimeNum')"/>
              <div class="error error-text" v-if="emptyincreaseInQuantityEachTimeNum">{{$t('autoScaling.IncreaseInQuantityEachTime')}}{{$t('error.noEmpty')}}</div>
            </div>
            <div class="operation-row" style="border-bottom: 1px solid #ccc">
              <div class="title">{{$t('autoScaling.ShrinkageStrategy')}}</div>
              <help-trigger name="shrinkageStrategy"/>
            </div>
            <div class="operation-row">
              <div class="title required">{{$t('autoScaling.TriggerEntry')}}</div>
              <help-trigger name="autoScalingGroupConfigConfigScalingPolicyTriggerEntry"/>
               <el-select v-model="triggerEntry" style="width: 100%" :disabled="true">
                  <el-option v-for="(item, index) in triggerEntryList"
                         :key="index"
                         :label="$t(item.label)"
                         :value="item.value"></el-option>
                </el-select>
            </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.TriggerCondition')}}</div>
            <drop-down :param="{
                getOptionList: () => {return shrinkageTriggerConditionList},
                getIndex: () => shrinkageTriggerConditionList.findIndex((num) =>{
                   return num.value === shrinkageTriggerConditionUnit
                 }),
                setIndex: (index) => {
                  return shrinkageTriggerConditionUnit =shrinkageTriggerConditionList[index].value;
                },
                style: {width: '80px' }
              }"></drop-down>
            <input type="text" v-model="shrinkageTriggerCondition" style="width: 39%;display:inline-block;margin-left:-2px;" :class="{'is-error': emptyshrinkageTriggerCondition}" @blur="validate('shrinkageTriggerCondition')"/>
            <span class="unit">%</span>
            <div class="error error-text" v-if="emptyshrinkageTriggerCondition">{{$t('autoScaling.TriggerCondition')}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.Duration')}}</div>
            <input type="number" min="0" v-model="shrinkageDurationTime" style="width: 66%" :class="{'is-error':emptyshrinkageDurationTime}" @blur="validate('shrinkageDurationTime')"/>
            <drop-down :param="{
                getOptionList: () => {return healthCheckGraceTimeList},
                getIndex: () => healthCheckGraceTimeList.findIndex((num) =>{
                   return num.value === shrinkageDurationTimeUnit
                 }),
                setIndex: (index) => {
                  return shrinkageDurationTimeUnit = healthCheckGraceTimeList[index].value;
                },
                style: {width: '80px' , marginLeft: '-2px'}
              }"></drop-down>
            <div class="error error-text" v-if="emptyshrinkageDurationTime">{{$t("autoScaling.Duration")}}{{$t('error.noEmpty')}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.CoolDownTime')}}</div>
            <help-trigger name="autoScalingGroupConfigConfigScalingPolicyCoolDownTime"/>
            <input type="number" min="0" v-model="shrinkageCoolDownTime" style="width: 66%" :class="{'is-error': emptyshrinkageCoolDownTime}" @blur="validate('shrinkageCoolDownTime')"/>
            <drop-down :param="{
                getOptionList: () => {return coolTimeList},
                getIndex: () => coolTimeList.findIndex((num) =>{
                   return num.value === shrinkageCoolDownTimeUnit
                 }),
                setIndex: (index) => {
                  return shrinkageCoolDownTimeUnit = coolTimeList[index].value;
                },
                style: {width: '80px' , marginLeft: '-2px'}
              }"></drop-down>
            <div class="error error-text" v-if="emptyshrinkageCoolDownTime">{{$t('autoScaling.CoolDownTime')}}{{$t("error.noEmpty")}}</div>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.RemovalPolicy')}}</div>
            <el-select v-model="shrinkageRemovalPolicy" style="width: 100%">
              <el-option v-for="(item, index) in RemovalPolicyList"
                         :key="index"
                         :label="$t(item.label)"
                         :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="operation-row">
            <div class="title required">{{$t('autoScaling.ReduceQuantityEveryTime')}}</div>
            <help-trigger name="autoScalingGroupConfigConfigScalingPolicyReduceQuantityEveryTime"/>
            <input type="number" v-model="reduceQuantityEveryTimeNum" :class="{'is-error': emptyreduceQuantityEveryTimeNum}" @blur="validate('reduceQuantityEveryTimeNum')"/>
            <div class="error error-text" v-if="emptyreduceQuantityEveryTimeNum">{{$t('autoScaling.ReduceQuantityEveryTime')}}{{$t('error.noEmpty')}}</div>
          </div>
        </div>
      </div>
      <div class="create-footer" slot="footer">
        <span v-if="step === 1">
          <span class="step-item" @click="nextStep()">{{$t('common.nextStep')}}</span>
        </span>
        <span v-if="step === 2">
          <span class="step-item" @click="prevStep()">上一步</span>
          <span class="step-item" @click="nextStep()">{{$t('common.nextStep')}}</span>
        </span>
        <span v-if="step === 3">
          <span class="step-item"  @click="prevStep()">上一步</span>
          <span class="step-item btn-confirm" style="border: none;" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.ok')}}</span>
        </span>
        <span class="step-item" @click="$router.push({name: 'autoscalinggroup'})">{{$t('common.cancel')}}</span>
      </div>
    </create-template>
</template>

<script>
    import CreateTemplate from "../../component/CreateTemplate";
    import AddOrDeleteInput from "../../component/AddOrDeleteInput";
    import rpc from 'src/utils/rpc';
    import ZWatchEndpointMethods from 'src/om/zwatchEndPoint/Methods';
    import WindowBase from 'src/windows/Window';
    import InstanceOfferingSingleDlg from "../../dialog/InstanceOfferingSingleDlg";
    import DataVolumeInstanceOfferSingleDlg from "../../dialog/DataVolumeInstanceOfferSingleDlg";
    import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
    export default {
      name: "CreateAutoScalingGroupPage",
      mixins: [WindowBase],
      components: {
        DataVolumeInstanceOfferSingleDlg,
        InstanceOfferingSingleDlg,
        AddOrDeleteInput,
        CreateTemplate,
        'drop-down':DropDown
      },
      data(){
        let zoneUuid = window.localStorage.getItem('currZoneUuid')
        return {
          step: 1,
          name: '',
          emptyname: false,
          emptyl3NetworkUuid: false,
          emptyminResourceSize: false,
          invalidminResourceSize: false,
          minResourceSizeunlimit: false,
          emptymaxResourceSize: false,
          invalidmaxResourceSize: false,
          maxResourceSizeunlimit: false,
          expectedNumberOfInstanceunlimit: false,
          emptyexpectedNumberOfInstance: false,
          emptyhealthCheckGraceTime: false,
          emptyvmName: false,
          description: '',
          minResourceSize: '',
          maxResourceSize: '',
          zoneUuid,
          expectedNumberOfInstance: '',
          healthText: 'VmInstanceStatus',
          healthList: [
            {label:'autoScaling.vmInstanceHealthCheck', value: 'VmInstanceStatus'}
          ],
          isEnableAlarmNotification: false,
          isEnableImmediatelyAfterCreation: false,
          loadBalancerUuid: '',
          loadbalancerListenerUuidList: [],
          l3NetworkUuid: '',
          healthCheckGraceTime: 300,
          endpointUuidList: [],
          minResourceError: '',
          maxResourceError: '',
          vmName: '',
          vmDescription:'',
          showAdvice: false,
          consolePassword: '',
          userData: '',
          sshPublicKey: '',
          showInstanceOfferingSingleDlg: false,
          showDataVolumeSingleDlg: false,
          instanceOfferingMessage: {},
          dataVolumeMessage: {},
          instanceOfferingUuid: '',
          imageUuid: '',
          securityGroupUuid: '',
          dataVolumeInstanceOfferingUuid: '',
          emptyimageUuid: false,
          emptyinstanceOfferingUuid: false,
          TriggerConditionList: [
            {name: 'monitoralarm.moreThen', value: 'GreaterThan'},
            {name: 'monitoralarm.more', value: 'GreaterThanOrEqualTo'}
          ],
          shrinkageTriggerConditionList:[
            {name: 'monitoralarm.lessThen', value: 'LessThan'},
            {name: 'monitoralarm.less', value: 'LessThanOrEqualTo'}
          ],
          shrinkageTriggerCondition: '',
          shrinkageTriggerConditionUnit: 'LessThan',
          triggerConditionUnit: 'GreaterThan',
          triggerEntryList: [
            {
              label: 'autoScaling.VmMemoryUsedInPercent',
              value: 'MemoryUsedInPercent'
            },
            {
              label: 'autoScaling.VmCPUAverageUsedUtilization',
              value: 'CPUAverageUsedUtilization'
            }
          ],
          triggerEntry: 'MemoryUsedInPercent',
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
          coolTimeList: [
            {
              name: 'common.second',
              value: 'second'
            },
            {
              name: 'common.minute',
              value: 'minute'
            },
          ],
          healthCheckGraceTimeUnit: 'second',
          coolTimeUnit: 'second',
          coolTime: '60',
          shrinkageDurationTime: '60',
          shrinkageDurationTimeUnit: 'second',
          shrinkageCoolDownTimeUnit: 'second',
          shrinkageCoolDownTime: '60',
          durationTimeTimeUnit: 'second',
          durationTime: '60',
          increaseInQuantityEachTimeNum: '1',
          reduceQuantityEveryTimeNum: '1',
          RemovalPolicyList: [
            {
              label: 'autoScaling.OldestInstance',
              value: 'OldestInstance'
            },
            {
              label: 'autoScaling.NewestInstance',
              value: 'NewestInstance'
            },
            {
              label: 'autoScaling.MinimumCPUUsageInstance',
              value: 'MinimumCPUUsageInstance'
            },
            {
              label: 'autoScaling.MinimumMemoryUsageInstance',
              value: 'MinimumMemoryUsageInstance'
            }
          ],
          shrinkageRemovalPolicy: 'OldestInstance',
          invalidate: false,
          emptytriggerEntry: false,
          emptydurationTime: false,
          emptycoolTime: false,
          emptyincreaseInQuantityEachTimeNum: false,
          emptyshrinkageTriggerCondition: false,
          emptyshrinkageDurationTime: false,
          emptyshrinkageCoolDownTime: false,
          emptyshrinkageRemovalPolicy: false,
          emptyreduceQuantityEveryTimeNum: false,
          triggerCondition: '',
          emptytriggerCondition: false,
          strategy: 'InstantStart',
          type: 'UserVm',
          l3NetworkUuids: [],
          scalingResourceType: 'VmInstance',
          adjustmentType: 'QuantityChangeInCapacity',
          canCreate: true,
          dataDiskOfferingUuids: []
        }
      },
      computed:{
      },
      methods: {
        ...{
          getSystemEndpointUuid: ZWatchEndpointMethods.methods.getSystemEndpointUuid,
          isSystemEndpointUuid: ZWatchEndpointMethods.methods.isSystemEndpointUuid,
          getEndpointName: ZWatchEndpointMethods.methods.getEndpointName
        },
        getZoneName(){
          let zonName = this.dbData.zone[this.zoneUuid] && this.dbData.zone[this.zoneUuid].name
          return zonName
        },
        openLoadBalancer(){
          let self = this;
          self.openDialog('LoadBalancerSingleSelectDlg', {
            conditions: [`vip.l3Network.zoneUuid=${self.zoneUuid}`, 'vip.l3Network.l2Network.cluster.hypervisorType=KVM'],
            ok(uuid){
              self.loadBalancerUuid = uuid;
            }
          })
        },
        removeUuid(uuid){
          let self = this;
          self[uuid] = '';
          self.validate(uuid);
        },
        validate(name){
          let self = this;
          self[`empty${name}`] = false;
          let input = name=== 'name' ? String(self[name]).trim() : self[name];
          if(!input){
            self[`empty${name}`] = true;
            return;
          }else{
            self[`empty${name}`] = false;
          }
          if(name==='minResourceSize' || name === 'maxResourceSize' || name === 'expectedNumberOfInstance'){
             if(self.minResourceSize > self.maxResourceSize){
               self[`invalid${name}`] = true;
               return
             }else if(self[name] > 1000 || self[name] < 1){
               self[`${name}unlimit`] = true;
               return
             }else{
               self[`invalid${name}`] = false;
               self[`${name}unlimit`] = false;
             }
          }
        },
        openloadbalancerListenerDlg () {
          const self = this
          let conditions = [`loadBalancer.vip.l3Network.zoneUuid=${self.zoneUuid}`, 'loadBalancer.vip.l3Network.l2Network.cluster.hypervisorType=KVM']
          if (self.loadBalancerUuid) {
            //this.checkLoadBalancer = false
            conditions.push(`loadBalancerUuid=${self.loadBalancerUuid}`)
          } else {
            return
          }
          if (self.loadbalancerListenerUuidList && self.loadbalancerListenerUuidList.length > 0) {
            conditions.push(`uuid!?=${self.loadbalancerListenerUuidList}`)
          }
          self.openDialog('LoadBalancerListenerMultiSelectListDlg', {
            select: (uuid) => self.selectLoadBalancerListener(uuid),
            conditions: conditions
          })
        },
        selectLoadBalancerListener (uuidList) {
          let loadbalancerListenerUuidList = this.loadbalancerListenerUuidList
          loadbalancerListenerUuidList = _.uniq(loadbalancerListenerUuidList.concat(uuidList))
          this.loadbalancerListenerUuidList = loadbalancerListenerUuidList
          this.healthList = [
            {
              label: 'autoScaling.loadbalancerHealthCheck',
              value: 'LoadBalanceBackendStatus'
            },
            {
              label: 'autoScaling.vmInstanceHealthCheck',
              value: 'VmInstanceStatus'
            }
          ]
          this.healthText = "LoadBalanceBackendStatus"
          this.l3NetworkUuid = ''
        },
        deleteLoadBalancerListener(index){
          let loadbalancerListenerUuidList = _.cloneDeep(this.loadbalancerListenerUuidList)
          loadbalancerListenerUuidList.splice(index, 1)
          this.loadbalancerListenerUuidList = loadbalancerListenerUuidList
          if (!this.loadbalancerListenerUuidList || this.loadbalancerListenerUuidList.length === 0) {
            this.healthList = [
              {
                label: 'autoScaling.vmInstanceHealthCheck',
                value: 'VmInstanceStatus'
              }
            ]
            this.healthText = "autoScaling.vmInstanceHealthCheck"
            this.healthCheck = 'VmInstanceStatus'
          }
        },
        openL3NetWork(){
          const self = this
          let conditions = ['category=Private', 'serviceProvider.type=vrouter', 'l2Network.cluster.hypervisorType=KVM']
          if (self.loadBalancerUuid && self.dbData.loadBalancer[self.loadBalancerUuid] && self.dbData.loadBalancer[self.loadBalancerUuid].vipUuid) {
            let vipUuid = self.dbData.loadBalancer[self.loadBalancerUuid].vipUuid
            rpc.query('vips', {
              fields: 'l3NetworkUuid',
              q: `uuid=${vipUuid}`
            }).then(vip => {
              let l3NetworkUuidList = vip.inventories.map(it => it.l3NetworkUuid)
              rpc.query('vm-instances', {
                q: [`vmNics.l3NetworkUuid?=${l3NetworkUuidList}`, 'type=ApplianceVm']
              }).then(vm => {
                let uuidList = []
                for (let i = vm.inventories.length - 1; i >= 0; i--) {
                  for (let j = vm.inventories[i].vmNics.length - 1; j >= 0; j--) {
                    uuidList.push(vm.inventories[i].vmNics[j].l3NetworkUuid)
                  }
                }
                uuidList = _.uniq(uuidList)
                if (uuidList.length > 0) {
                  conditions.push(`uuid?=${uuidList}`)
                }
                self.openDialog('L3NetworkSingleSelectListDlg', {
                  conditions: conditions,
                  select: (uuid) => self.selectL3Network(uuid)
                })
              })
            })
          }else{
            self.openDialog('L3NetworkSingleSelectListDlg', {
              conditions: conditions,
              select: (uuid) => self.selectL3Network(uuid)
            })
          }
        },
        selectL3Network(uuid){
          let self = this;
          self.l3NetworkUuid = uuid
          self.l3NetworkUuids = [uuid]
          self.validate('l3NetworkUuid');
        },
        openZwatchEndPointer(){
          let self = this;
          let conditions = ['name!=created-by-SystemHTTPTopicAndEndpointCreator']
          if (self.endpointUuidList && self.endpointUuidList.length > 0) {
            conditions.push(`uuid!?=${self.endpointUuidList}`)
          }
          self.openDialog('ZwatchEndPointerMultiSelectListDlg',{
            conditions,
            select(uuidList){
              self.selectZWatchEndpoint(uuidList);
            }
          })
        },
        selectZWatchEndpoint (uuidList) {
          let endpointUuidList = this.endpointUuidList
          endpointUuidList = _.uniq(endpointUuidList.concat(uuidList))
          this.endpointUuidList = endpointUuidList
        },
        genEndpointName () {
          const self = this
          let endpointNameList = []
          if (self.endpointUuidList && self.endpointUuidList.length > 0) {
            self.endpointUuidList.forEach(uuid => {
              endpointNameList.push(self.getEndpointName(uuid))
            })
          }
          return endpointNameList
        },
        removeEndPointName(index){
          let self = this;
          let endpointUuidList = _.cloneDeep(this.endpointUuidList)
          endpointUuidList.splice(index, 1)
          this.endpointUuidList = endpointUuidList
        },
        nextStep(){
          let self = this;
          if(self.step === 1){
            let prop = ['minResourceSize', 'maxResourceSize', 'healthCheckGraceTime', 'expectedNumberOfInstance', 'name', 'l3NetworkUuid'];
            prop.forEach((item) => {
              self.validate(item);
            })
            let invalid = prop.some((name) => self[`empty${name}`] || self[`invalid${name}`] || self[`${name}unlimit`]);
            if(invalid) return;
          }
          if(self.step === 2){
            let prop = ['vmName', 'imageUuid', 'instanceOfferingUuid'];
            prop.forEach((item) => {
              self.validate(item);
            })
            let invalid = prop.some((name) => self[`empty${name}`]);
            if(invalid) return;
          }
          self.step ++;
        },
        prevStep(){
          let self = this;
          self.step --;
        },
        openInstanceOffering(){
          let self = this;
          self.validate('instanceOfferingUuid');
          self.instanceOfferingMessage ={
            conditions: ['state!=Disabled', 'type=UserVm'],
          }
          self.showInstanceOfferingSingleDlg = true;
        },
        closeInstanceOfferingDlg(param){
          let self = this;
          if(param){
            self.instanceOfferingUuid = param.uuid;
          }
          self.validate('instanceOfferingUuid');
          self.showInstanceOfferingSingleDlg = false;
        },
        async openImageDlg(){
          let self = this;
          let conditions = ['system=false', 'state=Enabled', 'status=Ready', 'format?=qcow2,raw']
          let imageUuidList = []
          if (self.zoneUuid && self.l3NetworkUuid) {
            let imageResp = await rpc.query(`images-l3networks/dependencies`, {
              zoneUuid: self.zoneUuid,
              l3NetworkUuids: [self.l3NetworkUuid]
            })
            imageUuidList = imageUuidList.concat(imageResp.inventories.map(item => item.uuid))
            if (imageUuidList.length > 0) conditions.push(`uuid?=${imageUuidList}`)
          }
          self.validate('imageUuid');
          self.openDialog('ImageSingleSelectListDlg',{
            conditions,
            showTab: false,
            ok:(uuid)=>{
              self.imageUuid = uuid;
              self.validate('imageUuid');
            }
          })
        },
        closeDataVolumeDlg(param){
          let self = this;
          if(param){
            self.dataVolumeInstanceOfferingUuid = param;
            self.dataDiskOfferingUuids = [param]
          }
          self.showDataVolumeSingleDlg = false;
        },
        openDataVolumeInstancOffering(){
          let self  = this;
          self.dataVolumeMessage ={
            conditions: ['state=Enabled']
          }
          self.showDataVolumeSingleDlg = true;
        },
        openSecurityGroup(){
          let self = this;
          self.openDialog('SecurityGroupSingleSelectListDlg',{
            conditions: ['l3Network.l2Network.cluster.type=zstack'],
            ok(uuid){
              self.securityGroupUuid = uuid;
            }
          })
        },
        validateAll(){
          let self = this;
          let prop= ['triggerEntry', 'triggerCondition', 'durationTime', 'coolTime', 'increaseInQuantityEachTimeNum',
            'shrinkageTriggerCondition', 'shrinkageDurationTime', 'shrinkageCoolDownTime', 'shrinkageRemovalPolicy', 'reduceQuantityEveryTimeNum'];
          prop.forEach((name) => {
            self.validate(name);
          });
          self.invalidate = prop.some((name) => {
            return self[`empty${name}`] === true;
          })
        },
        setVmTemplateSystemTags () {
          let systemTags = []
          if (this.consolePassword) systemTags.push(`consolePassword::${this.consolePassword}`)
          if (this.sshPublicKey) systemTags.push(`sshkey::${this.sshPublicKey}`)
          if (this.userdata) systemTags.push(`userdata::${Utf8Base64.encode(this.userdata)}`)
          if (this.loadbalancerListenerUuidList && this.loadbalancerListenerUuidList.length > 0) {
            systemTags.push(`loadBalancerListenerUuids::${this.loadbalancerListenerUuidList.join(',')}`)
          }
          if (this.securityGroupUuid) systemTags.push(`securityGroupUuid::${this.securityGroupUuid}`)
          this.vmTemplateSystemTags = systemTags
          return this.vmTemplateSystemTags
        },
        setAutoScalingSystemTags () {
          let systemTags = []
          if (this.expectedNumberOfInstance) systemTags.push(`initialInstanceNumber::${this.expectedNumberOfInstance}`)
          if (this.healthText) systemTags.push(`vmInstanceHealthStrategy::${this.healthText}`)
          if (this.healthText === 'LoadBalanceBackendStatus') {
            this._healthCheckGraceTime = this._healthCheckGraceTime || 300
            systemTags.push(`vmNicLoadbalancerListenerHealthCheckGraceTimeSeconds::${this._healthCheckGraceTime}`)
          }
          systemTags.push(`automaticallyRemoveUnhealthyInstance::true`)
          this.autoScalingSystemTags = systemTags
          return this.autoScalingSystemTags
        },
        formatActions (endpointUuidList) {
          let topicUuidList = endpointUuidList.map(uuid => {
            return this.dbData.zwatchTopic[uuid].uuid
          })
          return topicUuidList.map(uuid => {
            return {
              actionType: 'sns',
              actionUuid: uuid
            }
          })
        },
        createParam(){
          let self = this;
          self.setVmTemplateSystemTags();
          self.setAutoScalingSystemTags();
          return {
            name: self.name,
            description: self.description,
            scalingResourceType: self.scalingResourceType,
            minResourceSize: parseInt(self.minResourceSize),
            maxResourceSize: parseInt(self.maxResourceSize),
            autoScalingSystemTags: self.autoScalingSystemTags,
            // removalPolicy: self.RemovalPolicy,
            defaultCooldown: self.defaultCooldown,
            defaultEnable: self.defaultEnable, // ddd
            vmInstanceName: self.vmName,
            vmInstanceDescription: self.vmDescription,
            instanceOfferingUuid: self.instanceOfferingUuid,
            imageUuid: self.imageUuid,
            l3NetworkUuid: self.l3NetworkUuid,
            l3NetworkUuids: self.l3NetworkUuids,
            dataDiskOfferingUuids: self.dataDiskOfferingUuids,
            strategy: self.strategy,
            type: self.type,
            vmTemplateSystemTags: self.vmTemplateSystemTags,
            securityGroupUuid: self.securityGroupUuid, // 暂时没有 left
            namespace: 'ZStack/VM',
            adjustmentType: self.adjustmentType,
            repeatInterval_add: Math.ceil(self.toSecond(self.coolTime, self.coolTimeUnit) || 60 / 10) >= 10 ? Math.ceil(self._cooldown_add || 60 / 10) : 10,
            repeatInterval_remove: Math.ceil(self.toSecond(self.shrinkageCoolDownTime, self.shrinkageCoolDownTimeUnit) || 60 / 10) >= 10 ? Math.ceil(self._cooldown_remove || 60 / 10) : 10,
            actions: self.formatActions(self.endpointUuidList),
            labels: [{
              'key': 'VMUuid',
              'op': 'Regex',
              'value': 'none'
            }],
            metricName_add: self.triggerEntry,
            threshold_add: self.triggerCondition,
            comparisonOperator_add: self.triggerConditionUnit,
            period_add: self.toSecond(self.durationTime, this.durationTimeTimeUnit) || 60,
            cooldown_add: self.toSecond(self.coolTime, self.coolTimeUnit) || 60,
            adjustmentValue_add: parseInt(self.increaseInQuantityEachTimeNum), // right
            metricName_remove: self.triggerEntry,
            cooldown_remove: self.toSecond(self.shrinkageCoolDownTime, self.shrinkageCoolDownTimeUnit) || 60,
            threshold_remove: self.shrinkageTriggerCondition,
            comparisonOperator_remove: self.shrinkageTriggerConditionUnit,
            period_remove: self.toSecond(self.shrinkageDurationTime, self.shrinkageDurationTimeUnit) || 60,
            adjustmentValue_remove: parseInt(self.reduceQuantityEveryTimeNum),
            removalPolicy: self.shrinkageRemovalPolicy
          }
        },
        toSecond (time, unit) {
          let obj = {
            'second': 1,
            'minute': 60,
            'hour': 60 * 60
          }
          return time * obj[unit]
        },
        setVmTemplateSystemTags () {
          let systemTags = []
          if (this.consolePassword) systemTags.push(`consolePassword::${this.consolePassword}`)
          if (this.sshkey) systemTags.push(`sshkey::${this.sshkey}`)
          if (this.userdata) systemTags.push(`userdata::${Utf8Base64.encode(this.userdata)}`)
          if (this.loadbalancerListenerUuidList && this.loadbalancerListenerUuidList.length > 0) {
            systemTags.push(`loadBalancerListenerUuids::${this.loadbalancerListenerUuidList.join(',')}`)
          }
          if (this.securityGroupUuid) systemTags.push(`securityGroupUuid::${this.securityGroupUuid}`)
          this.vmTemplateSystemTags = systemTags
          return this.vmTemplateSystemTags
        },
        setAutoScalingSystemTags () {
          let systemTags = []
          if (this.ExpectedNumberOfInstance) systemTags.push(`initialInstanceNumber::${this.ExpectedNumberOfInstance}`)
          if (this.healthCheck) systemTags.push(`vmInstanceHealthStrategy::${this.healthCheck}`)
          if (this.healthCheck === 'LoadBalanceBackendStatus') {
            this._healthCheckGraceTime = this._healthCheckGraceTime || 300
            systemTags.push(`vmNicLoadbalancerListenerHealthCheckGraceTimeSeconds::${this._healthCheckGraceTime}`)
          }
          systemTags.push(`automaticallyRemoveUnhealthyInstance::true`)
          this.autoScalingSystemTags = systemTags
          return this.autoScalingSystemTags
        },
        confirm(){
          let self = this;
          self.setVmTemplateSystemTags();
          self.setAutoScalingSystemTags();
          self.validateAll();
          if(self.invalidate) return;
          self.canCreate = false;
          let param = self.createParam();
          let event = this.createEvent('action.autoScalingGroup.create', param.name, 9)
          self.dispatchActionWithEvent('autoScalingGroup/create', param, null, event)
            .then(() => {
              self.$router.push({name: 'autoscalinggroup'})
            }).catch(() => {
              self.canCreate = true;
          })

        }
      },
    }
</script>

<style scoped>
 .unit{
   display: inline-block;
   width: 80px;
   border: 1px solid #adb0b8;
   height: 40px;
   line-height: 40px;
   margin-left: -2px;
   text-align: center;
 }
</style>
