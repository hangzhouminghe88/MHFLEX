<script>
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from 'src/component/CreateTemplate';
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import vCenterMethods from '../Methods.vue';
  import Utils from  'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "CreatevCenterImageService",
    components: {CreateTemplate, AddOrDeleteInput},
    mixins: [WindowBase],
    data() {
      return {
        name: '',
        emptyname: '',
        description: '',
        isSystem: true,
        platform: 'Linux',
        backupStorageUuid: '',
        emptybackupStorageUuid: '',
        url: '',
        emptyurl: false,
        invalidurl: false,
        mediaType: 'Image',
        datacenterName: '',
      }
    },

    methods: {
      ...Validator,
      ...Utils,
      ...{
        create: vCenterMethods.methods.create,
      },

      openBSDlg(){
        const self = this
        self.openDialog('BackupStorageSingleSelectListDlg', {
          conditions: ['type=VCenter', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup'],
          isVCenter: true,
          select: (uuid) => self.selectBackupStorage(uuid)
        })
      },

      selectBackupStorage (uuid) {
        this.backupStorageUuid = uuid
        if (this.dbData.common.isAdmin) this.initDataVcenter()
      },

      validate(name){
        let self = this, input = '';
        input = name === 'name' ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'url'){
          if(!self.isUrl(input, 'image')){
            self[`invalid${name}`] = true;
            return;
          }
          if (self.backupStorageUuid && self.dbData.backupstorage[self.backupStorageUuid] && (self.dbData.backupstorage[self.backupStorageUuid].type === 'Fusionstor' || this.dbData.backupstorage[self.backupStorageUuid].type === 'Sftp')) {
            if ((input.indexOf('ftp') > -1) || (input.indexOf('sftp') > -1)) {
              self[`invalid${name}`] = true
              return
            }
          }
        }
      },

      validateAll(){
        let self = this, props = [], invalid = false;
        if(self.isSystem) props = ['name', 'backupStorageUuid', 'url'];
        if(!self.isSystem) props = ['name', 'url', 'backupStorageUuid'];
        props.forEach((item) => {
          self.validate(item);
        })
        invalid = props.some((item) => {return self[`empty${item}`] === true || self[`invalid${item}`] === true});
        return invalid;
      },

      confirm(){
        let self = this, invalid = false;
        invalid = self.validateAll();
        if(invalid) return;
        self.create(self.createParam());
        self.$router.push({name: 'vcenterimage'})
      },

      createParam(){
        let self = this, obj = {};
        obj = {
          name: self.name,
          description: self.description,
          isSystem: self.isSystem,
          platform: self.platform,
          url: self.url,
          mediaType: self.mediaType,
          backupStorageUuids: [`${self.backupStorageUuid}`],
        }
        if (this.datacenterName !== '') obj.systemTags = `vcenter::datacenter::${self.datacenterName}`;
        return obj;
      },

      initDataVcenter () {
        let self = this
        if (!self.backupStorageUuid) return
        let vCenterUuid = self.dbData.backupstorage[self.backupStorageUuid].vCenterUuid
        rpc.query('vcenters/datacenters', {
          q: `vCenterUuid=${vCenterUuid}`
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              let nameList = resp.inventories.map((item) => item.name)
              selfDataVcenterList =nameList;
              self.datacenterName = nameList[0];
            }
          })
      },
    }
  }
</script>
