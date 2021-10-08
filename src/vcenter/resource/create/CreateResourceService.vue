<script>
  import CreateTemplate from 'src/component/CreateTemplate';
  import Validator from  'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';

  export default {
    name: "CreateResourceService",
    mixins: [WindowBase],
    components: {CreateTemplate},
    data(){
      return{
        name: '',
        emptyname: false,
        description: '',
        domainName: '',
        emptydomainName: false,
        port: '',
        emptyport: false,
        invalidport: false,
        userName: 'administrator@vsphere.local',
        emptyuserName: false,
        password: '',
        emptypassword: false,
        invalidpassword: false,
        httpType: 'HTTPS',
        zoneUuid: '',
        canCreate: true
      }
    },
    methods: {
      ...Validator,
      ...{
        create: Methods.methods.create
      },
      //校验表单
      validate(name){
        let self = this, input;
        self[`empty${name}`] = false;
        input = name === 'name' ? String(self[name]).trim() : self[name];
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'port' && !this.isUint(input)){
          self[`invalid${name}`] = true
        }
      },
      //全局校验
      validateAll(){
        let self = this, invalidInput = false;
        let props = ['name', 'domainName', 'port', 'userName', 'password'];
        props.forEach(item => {
          self.validate(item);
        });
        let isInvalid = props.some(item => self[`empty${item}`] || self[`invalid${item}`]);
        if(isInvalid) invalidInput = true;
        return invalidInput;
      },
      //创建参数
      createParam(){
        let self =  this;
        return {
          name: self.name,
          description: self.description,
          domainName: self.domainName,
          port: self.port,
          username: self.userName,
          password: self.password,
          https: self.httpType === 'HTTPS',
          zoneUuid: self.zoneUuid
        }
      },
      //确定添加
      confirm(){
        let self = this, invalid = self.validateAll()
        if (invalid) return
        let currZoneUuid = localStorage.getItem('currZoneUuid')
        self.zoneUuid = currZoneUuid;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'resource'})
          }).catch(() => {
           self.canCreate = true;
        });
      }
    }
  }
</script>

<style scoped>

</style>
