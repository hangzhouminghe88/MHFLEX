<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('adLdapServer.add')}}</span>
      <span class="create-back" @click="$router.push({name: 'adldapserver'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到AD/LDAP列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <el-radio v-model="type" :label="'AD'"></el-radio>
        <el-radio v-model="type" :label="'LDAP'"></el-radio>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('ldap.server')}}</div>
        <input type="text" v-model="server" :class="{'is-error': emptyserver}" @blur="validate('server')"
          placeholder="192.168.1.1"/>
        <div class="error error-text" v-if="emptyserver">{{$t('ldap.server')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('ldap.port')}}</div>
        <input type="number" min="1" v-model="port" :class="{'is-error': emptyport}" @blur="validate('port')"
          placeholder="386"/>
        <div class="error error-text" v-if="emptyport">{{$t('ldap.port')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('ldap.baseDn')}}</div>
        <input type="text" v-model="baseDn" :class="{'is-error': emptybaseDn}" @blur="validate('baseDn')"
        placeholder="ou=people,dc=example"/>
        <div class="error error-text" v-if="emptybaseDn">{{$t('ldap.baseDn')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('ldapEntry.ldapUseAsLoginName')}}</div>
        <input type="text" v-model="ldapUseAsLoginName" :class="{'is-error': emptyldapUseAsLoginName}" @blur="validate('ldapUseAsLoginName')"
        :placeholder="type==='AD' ? 'cn' : 'uid'"/>
        <div class="error error-text" v-if="emptyldapUseAsLoginName">{{$t('ldapEntry.ldapUseAsLoginName')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('ldap.ldapUserDn')}}</div>
        <input type="text" v-model="ldapUserDn" :class="{'is-error': emptyldapUserDn}" @blur="validate('ldapUserDn')"
        placeholder="cn=AA,ou=BB,dc=CC,dc=DD"/>
        <div class="error error-text" v-if="emptyldapUserDn">{{$t('ldap.ldapUserDn')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.password')}}</div>
        <input type="password" v-model="password" :class="{'is-error': emptypassword}" @blur="validate('password')"/>
        <div class="error error-text" v-if="emptypassword">{{$t('common.password')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('ldap.ldapCleanBindingFilter')}}</div>
        <input type="text" v-model="ldapCleanBindingFilter"/>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'adldapserver'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import AdLdapServerMethods from 'src/om/adldapserver/Methods';
  import WindowBase from 'src/windows/Window'

  export default {
    name: "CreateAdldapServerPage",
    components: {CreateTemplate},
    mixins: [WindowBase],
    data() {
      return {
        emptyserver: false,
        emptyport: false,
        emptybaseDn: false,
        emptyldapUseAsLoginName: false,
        emptyldapUserDn: false,
        emptypassword: false,
        server: '',
        port: '',
        baseDn: '',
        ldapUseAsLoginName: '',
        ldapUserDn: '',
        password: "",
        ldapCleanBindingFilter: '',
        type: 'AD',
        encryption: 'None',
        encryptionText: 'None',
        name: 'ldap-server',
      }
    },
    methods: {
      ...{
        add: AdLdapServerMethods.methods.add
      },
      validate(name) {
        let self = this, input = '';
        self[`empty${name}`] = false;
        input = name === 'name' ? String(self[name]).trim() : self[name];
        if (!input) {
          self[`empty${name}`] = true;
          return;
        }
      },
      validateAll(){
        let self = this, prop=['server', 'port', 'baseDn', 'ldapUseAsLoginName', 'ldapUserDn', 'password'];
        prop.forEach((name) => {
          self.validate(name)
        })
        let inValid = prop.every((name) => {
           return prop.some(name => self[`empty${name}`] === true);
        })
        return inValid;
      },
      createParam () {
        return {
          name: this.name,
          description: this.description,
          username: this.ldapUserDn,
          url: (this.port === undefined || this.port === '' || this.port === 'undefined') ? `ldap://${this.server}` : `ldap://${this.server}:${this.port}`,
          encryption: this.encryption,
          base: this.baseDn,
          password: this.password,
          ldapCleanBindingFilter: this.ldapCleanBindingFilter,
          LdapServerTypeIsAD: this.type === 'AD' ? true : false,
          ldapUseAsLoginName: (this.ldapUseAsLoginName === undefined || this.ldapUseAsLoginName === '') ? 'cn' : this.ldapUseAsLoginName
        }
      },
      confirm(){
        let self = this;
        let invalid = self.validateAll();
        if(invalid) return;
        self.add(self.createParam())
          .then(() => {
            self.$router.push({name: 'adldapserver'})
          })
      }
    }
  }
</script>

<style scoped>

</style>
