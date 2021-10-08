<template>
  <create-no-route-template>
    <div slot="header">
      <span>{{$t('common.addIpRange')}}</span>
      <span class="create-back" @click="$emit('close')">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">返回</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title">{{$t('common.ipVersion')}}{{$t('common.colon')}}{{`IPv${ipVersion}`}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.method')}}</div>
        <el-radio-group v-model="showMethod">
          <el-radio :label="true">{{$t('common.ipRange')}}</el-radio>
          <el-radio :label='false'>CIDR</el-radio>
        </el-radio-group>
      </div>
      <div class="operation-row" v-if="showMethod">
        <div class="title required">{{$t('common.startIp')}}</div>
        <input type="text" placeholder="192.168.0.100" v-model="startIp" :class="{'is-error': emptystartIp || invalidstartIp}" @blur="validate('startIp')"/>
        <div class="error error-text" v-if="emptystartIp">{{$t('error.emptyInput') + $t('common.startIp')}}</div>
        <div class="error error-text" v-if="!emptystartIp && invalidstartIp">{{$t('error.invalid') + $t('common.startIp')}}</div>
      </div>
      <div class="operation-row" v-if="showMethod">
        <div class="title required">{{$t('common.endIp')}}</div>
        <input type="text" placeholder="192.168.0.255" v-model="endIp" :class="{'is-error': emptyendIp || invalidendIp || invalidipRange}" @blur="validate('endIp')"/>
        <div class="error error-text" v-if="emptyendIp">{{$t('error.emptyInput') + $t('common.endIp')}}</div>
        <div class="error error-text" v-if="!emptyendIp && invalidendIp">{{$t('error.invalid') + $t('common.endIp')}}</div>
        <div class="error error-text" v-if="!emptyendIp && !invalidendIp && invalidipRange">无效的IP范围</div>
      </div>
      <div class="operation-row" v-if="showMethod">
        <div class="title required">{{$t('common.netmask')}}</div>
        <input type="text" placeholder="255.255.255.0" v-model="netmask" :class="{'is-error': emptynetmask || invalidnetmask}" @blur="validate('netmask')"/>
        <div class="error error-text" v-if="emptynetmask">{{$t('error.emptyInput') + $t('common.netmask')}}</div>
        <div class="error error-text" v-if="!emptynetmask && invalidnetmask">{{$t('error.invalid') + $t('common.netmask')}}</div>
      </div>
      <div class="operation-row" v-if="showMethod">
        <div class="title required">{{$t('common.gateway')}}</div>
        <input type="text" placeholder="192.168.0.1" v-model="gateway" :class="{'is-error': emptygateway || invalidgateway}" @blur="validate('gateway')"/>
        <div class="error error-text" v-if="emptygateway">{{$t('error.emptyInput') + $t('common.gateway')}}</div>
        <div class="error error-text" v-if="!emptygateway && invalidgateway">{{$t('error.invalid') + $t('common.gateway')}}</div>
      </div>
      <div class="operation-row" v-if="!showMethod">
        <div class="title required">CIDR</div>
        <input type="text" placeholder="192.168.1.0/24" v-model="cidr" :class="{'is-error': emptycidr || invalidcidr}" @blur="validate('cidr')"/>
        <div class="error error-text" v-if="emptycidr">{{$t('error.emptyInput') + $t('common.gateway')}}</div>
        <div class="error error-text" v-if="!emptycidr && invalidcidr">{{$t('error.invalid') + $t('common.gateway')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('baremetal.dhcpService') + 'IP'}}</div>
        <help-trigger name="dhcpInRange"/>
        <input type="text" v-model="dhcp" :disabled="param.dhcpDisabled"/>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <div class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</div>
    </div>
  </create-no-route-template>
</template>

<script>
  import AddIpRangeService from './AddIpRangeService';
  export default AddIpRangeService
</script>

<style scoped>

</style>
