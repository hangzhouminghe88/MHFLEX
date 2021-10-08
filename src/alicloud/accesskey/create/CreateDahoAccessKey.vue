<template>
  <div class="container">
    <div class="operation-row">
      <div class="title required">{{$t('common.name')}}</div>
      <input type="text" v-model="name"
             @blur="validate('name')" @input="setName()"
             maxlength="255"
             :class="{'is-error': emptyname}"
      />
      <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
    </div>

    <div class="operation-row">
      <div class="title">{{$t('common.description')}}</div>
      <textarea v-model="description" @input="setDescription()"
                rows="3"
                maxlength="255"
      />
    </div>

    <div class="operation-row">
      <div class="title required">{{$t('hybridKey.AccessKeyID')}}</div>
      <input v-model="accessKeyID" @blur="validate('accessKeyID')"
             @input="setAccessKeyID()"
             :class="{'is-error': emptyaccessKeyID}"
      />
      <div class="error error-text" v-if="emptyaccessKeyID">{{$t('error.emptyInput') + $t('hybridKey.AccessKeyID')}}</div>
    </div>

    <div class="operation-row" draggable="true" style="position: absolute">
      <div class="title required">{{$t('common.password')}}</div>
      <input v-model="password" @blur="validate('password')"
             @input="setPassword()"
             :class="{'is-error': emptypassword}"
             type="password"
      />
      <div class="error error-text" v-if="emptypassword">{{$t('error.emptyInput') + $t('common.password')}}</div>
    </div>

  </div>
</template>

<script>

  export default {
    name: "CreateDahoAccessKey",

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    data () {
      return {
        name: '',
        emptyname: false,
        description: '',
        accessKeyID: '',
        emptyaccessKeyID: false,
        password: '',
        emptypassword: false,
        sync: true
      }
    },

    methods: {
      validate (name) {
        let self = this, input = '';
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },

      setName () {
        let self = this;
        self.param.setName(self.name);
      },

      setDescription () {
        let self = this;
        self.param.setDescription(self.description);
      },

      setAccessKeyID () {
        let self = this;
        self.param.setAccessKey(self.accessKeyID);
      },

      setPassword () {
        let self = this;
        self.param.setPassword(self.password);
      },

      validateAll () {
        let self = this,
          invalid = false,
          props = ['name', 'accessKeyID', 'password'];
        props.forEach( (name) => self.validate(name));
        invalid = props.some( (name) => self[`empty${name}`] === true);
        return invalid;
      },

      handleSync () {
        let self = this;
        self.param.setAsync(self.sync);
      }
    }
  }
</script>

<style scoped>

</style>
