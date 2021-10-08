<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('vcenter.createvCenter')}}</span>
      <span class="create-back" @click="$router.push({name: 'resource'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到基础资源列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('vcenter.domainName')}}</div>
        <input placeholder="192.168.0.1" v-model="domainName" :class="{'is-error': emptydomainName}" @blur="validate('domainName')"/>
        <div class="error error-text" v-if="emptydomainName">{{$t('error.emptyInput') + $t('vcenter.domainName')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.port')}}</div>
        <input placeholder="443" v-model="port" :class="{'is-error': emptyport || invalidport}" @blur="validate('port')"/>
        <div class="error error-text" v-if="emptyport">{{$t('error.emptyInput') + $t('common.port')}}</div>
        <div class="error error-text" v-if="!emptyport && invalidport">{{$t('error.invalid') + $t('vcenter.port')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('user.name')}}</div>
        <input v-model="userName" :class="{'is-error': emptyuserName}" @click="validate('userName')"/>
        <div class="error error-text" v-if="emptyuserName">{{$t('error.emptyInput') + $t('user.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.password')}}</div>
        <input v-model="password" type="password" :class="{'is-error': emptypassword}" @blur="validate('password')"/>
        <div class="error error-text" v-if="emptypassword">{{$t('error.emptyInput') + $t('common.password')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">HTTPS/HTTP</div>
        <el-radio v-model="httpType" label="HTTPS">HTTPS</el-radio>
        <el-radio v-model="httpType" label="HTTP">HTTP</el-radio>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <div class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$router.push({name: 'resource'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
  import CreateResourceService from './CreateResourceService';

  export default {
    name: "CreateResourcePage",
    mixins: [CreateResourceService]
  }
</script>

<style scoped>

</style>
