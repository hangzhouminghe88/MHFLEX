<template>
  <div class="container">
    <div class="operation-row">
      <div class="title required">{{$t('common.zone')}}{{$t('common.colon')}}{{dbData.zone[zoneUuid].name}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.name')}}</div>
      <input maxlength="255" v-model="name" :class="{'is-error': emptyname}"  @blur="validate('name')" />
      <div class="error error-text" v-if="emptyname">
        {{$t("error.emptyInput")+$t("common.name")}}
      </div>
    </div>
    <div class="operation-row">
      <div class="title">
        {{$t("common.description")}}
      </div>
      <textarea rows="3" v-model="description"/>
    </div>
    <div class="operation-row">
      <div class="title">{{$t('common.type')}}</div>
      <help-trigger name="primaryStorage"/>
      <drop-down class="create-dropdown"
      :param="{
        getIndex(){
          return avaiablePsTypes.findIndex((item) => {
            return item.value === type;
          })
        },
        setIndex(index){
          type = avaiablePsTypes[index].value;
          type === 'LocalStorage' ? url = `/${$t('common.productionNameForPlaceholderLowerCase')}_ps` : '';
        },
        getOptionList(){
          return avaiablePsTypes;
        }
      }"></drop-down>
    </div>
    <div v-if="type === 'Ceph'" class="operation-row">
      <el-checkbox v-model="nocephx">{{$t('primaryStorage.nocephx')}}</el-checkbox>
      <help-trigger name="nocephx"/>
    </div>
    <div v-if="type==='Ceph' || type === 'Fusionstor'">

      <div class="operation-row">
        <div class="title required">{{$t('common.mgtIp')}}</div>
        <input maxlength="255" v-model="monIp" :class="{'is-error': emptymonIp || invalidmonIp}" @blur="validate('monIp')"/>
        <div class="error error-text" v-if="emptymonIp">
          {{$t("error.emptyInput")+$t("common.mgtIp")}}
        </div>
        <div class="error error-text" v-if="!emptymonIp && invalidmonIp">
          {{$t("error.invalid")+$t("common.mgtIp")}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">
          {{$t("common.sshPort")}}
        </div>
        <input type="number"  step="any" :value="sshPort" :class="{'is-error': emptysshPort || invalidsshPort}"  @blur="validate('sshPort')"/>
        <div class="error" v-if="emptysshPort">
          {{$t("error.emptyInput")+$t("common.sshPort")}}
        </div>
        <div class="error error-text" v-if="!emptysshPort && invalidsshPort">
          {{$t("error.invalid")+$t("common.sshPort")}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">
          {{$t("user.name")}}
        </div>
        <input maxlength="255" :value="username" :class="{'is-error':emptyusername}" @blur="validate('username')"/>
        <div class="error error-text" v-if="emptyusername">
          {{$t("error.emptyInput")+$t("user.name")}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">
          {{$t("common.password")}}
        </div>
        <input maxlength="255" type="password" v-model="password" :class="{'is-error': emptypassword}" @blur="validate('password')"/>
        <div class="error error-text" v-if="emptypassword">
          {{$t("error.emptyInput")+$t("common.password")}}
        </div>
      </div>

    </div>

    <div class="operation-row zs-select" v-if="type === 'AliyunNAS'">
      <div class="title required">
        {{$t("common.nasFileSystem")}}
      </div>
      <dropdown class="button dropdown" style="padding-left: 12px; padding-right: 8px;">
        <span slot="title" />
        <span slot="title">
              <span class="text">{{selectedNasFs.name}}</span>
            </span>
        <span slot="content">
              <div class="dropdown-content" style="padding: 12px 20px">
                <a @click="selectNasFs(item)" v-for=" item of nasFsList_filter ">{{ item.name }}</a>
              </div>
            </span>
      </dropdown>
    </div>

    <div class="operation-row zs-select" v-if="type === 'AliyunNAS'">
      <div class="title required">
        {{$t("common.nasAccessGroup")}}
      </div>
      <dropdown class="button dropdown" style="padding-left: 12px; padding-right: 8px;">
        <span slot="title" />
        <span slot="title">
              <span class="text">{{selectedNasAccessGroup.name}}</span>
            </span>
        <span slot="content">
              <div class="dropdown-content" style="padding: 12px 20px">
                <a @click="selectNasAccessGroup(item)" v-for=" item of nasAccessGroupList_filter ">{{ item.name }}</a>
              </div>
            </span>
      </dropdown>
    </div>

    <div class="operation-row" v-if="type !== 'Ceph' && type !== 'Fusionstor' && type !== 'SharedBlock'">
      <div class="title required">
        {{ type === 'AliyunNAS' ? $t("common.mountUrl") : $t("common.url") }}
      </div>
      <input :class="{'error-input': emptyurl || invalidurl}" v-if="type === 'LocalStorage'" maxlength="255" v-model="url"  :placeholder="`/${$t('common.productionNameForPlaceholderLowerCase')}_ps`" @blur="validate('url')" @keywown.enter="validate('url')" />
      <input :class="{'error-input': emptyurl || invalidurl}" v-if="type === 'SharedMountPoint'" maxlength="255" v-model="url"  placeholder="/mnt/nfs" @blur="validate('url')" @keywown.enter="validate('url')" />
      <input :class="{'error-input': emptyurl || invalidurl}" v-if="type === 'NFS'" maxlength="255" v-model="url"  placeholder="192.168.0.1:/nfs_root/" @blur="validate('url')" @keywown.enter="validate('url')" />
      <input :class="{'error-input': emptyurl || invalidurl}" v-if="type === 'AliyunNAS'" maxlength="255" v-model="url" placeholder="/nas_root" @blur="validate('url')" @keywown.enter="validate('url')" />
    </div>

    <div v-if="type === 'SharedBlock'" class="operation-row option">
       <el-checkbox v-model="forceWipe"> {{ $t("primaryStorage.forceWipe") }}</el-checkbox>
      <help-trigger name="forceWipe" />
    </div>

    <div class="operation-row" v-if="type === 'NFS' ">
      <div class="title">
        {{$t("common.attachParam")}}
      </div>
      <input maxlength="255" v-model="mountOptions" />
    </div>

    <div v-if="type === 'Ceph' ">
      <div id="common-imagePoolName" class="operation-row">
        <div class="title">
          {{$t("common.imagePoolName")}}
        </div>
        <help-trigger name="storagePoolName" />
        <input maxlength="255" v-model="imageCachePoolName" :class="{'is-error': invalidimageCachePoolName}" @blur="validate('imageCachePoolName')" @keywown.enter="validate('imageCachePoolName')" />
        <div class="error error-text" v-if="imageCachePoolName && invalidimageCachePoolName">
          {{$t("error.invalid")+$t("common.imagePoolName")}}
        </div>
      </div>
      <div id="common-dataVolumePoolName" class="operation-row">
        <div class="title">
          {{$t("common.dataVolumePoolName")}}
        </div>
        <input maxlength="255" :value="dataVolumePoolName"  :class="{'error-input': invaliddataVolumePoolName}" @blur="validate('dataVolumePoolName')" @keywown.enter="validate('dataVolumePoolName')" />
        <div class="error error-text" v-if="dataVolumePoolName && invaliddataVolumePoolName">
          {{$t("error.invalid")+$t("common.dataVolumePoolName")}}
        </div>
      </div>
      <div id="common-rootVolumePoolName" class="operation-row">
        <div class="title">
          {{$t("common.rootVolumePoolName")}}
        </div>
        <input maxlength="255" :value="rootVolumePoolName" :class="{'error-input': invalidrootVolumePoolName}" @blur="validate('rootVolumePoolName')" @keywown.enter="validate('rootVolumePoolName')" />
        <div class="error error-text" v-if="rootVolumePoolName && invalidrootVolumePoolName">
          {{$t("error.invalid")+$t("common.rootVolumePoolName")}}
        </div>
      </div>
    </div>

    <div class="operation-row" v-if="type === 'Ceph' || type === 'NFS' || type === 'SharedMountPoint' || type === 'Fusionstor' || type === 'SharedBlock'">
      <div class="title" v-permission="'LICENSE_BASIC_PAID'">
        {{$t('common.storageNetworkCidr')}}
      </div>
      <help-trigger name="primaryStorage_storageNetworkCidr" />
      <input v-model="cidr" :class="{'is-error': invalidcidr}" placeholder="192.168.1.0/24" maxlength="255" @blur="validate('cidr')" @keydown.enter="validate('cidr')" v-permission="'LICENSE_BASIC_PAID'"/>
      <div class="error error-text" v-if="(type === 'Ceph' || type === 'NFS' || type === 'SharedMountPoint') && !emptycidr && invalidcidr">
        {{$t('error.invalid')+$t('common.cidr')}}
      </div>
    </div>


    <div class="operation-row">
      <div class="sole-title">
        {{$t("common.cluster")}}{{$t("common.colon")}}
      </div>
      <div class="sole-content">
        {{ dbData.cluster[clusterUuid] && dbData.cluster[clusterUuid].name }}
      </div>
    </div>

    <div class="diskUuid operation-row" v-if="type === 'SharedBlock'">
      <div class="title required">
        {{$t("common.SharedBlock")}}
      </div>
      <help-trigger name="diskUuid" />
      <div v-for="(diskUuid, i) of diskList">
        <input :value="diskUuid" readonly />
        <div class="delete-param" @click="deleteDisk(i)"></div>
      </div>
    </div>

    <div id="common-disk" class="operation-row" v-if="type === 'SharedBlock'">
      <div class="content" @click="addDisk()">
        <div class="add"></div>
      </div>
    </div>

  </div>
</template>

<script>
  //添加主存储导航
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import Dropdown from 'src/component/DropDown';
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  export default {
    name: "WizardPrimaryStorage",
    mixins: [WindowBase],
    components: {
      DropDown,
      'dropdown':Dropdown
    },
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      },
      parentWindowUuid: {
        type: String,
        default: ''
      }
    },
    data(){
      return {
        clusterUuidList: [],
        name: 'PS-1',
        description: '',
        type: '',
        url: '',
        zoneUuid: '',
        clusterUuid: '',
        wizard: null,
        sshPort: 22,
        showClusterDlg: false,
        username: 'root',
        step: 1,
        monIp: '',
        cidr: '',
        mountOptions: '',
        avaiablePsTypes: [],
        nocephx: false,
        forceWipe: false,
        psTypes: [
          'LocalStorage',
          'NFS',
          'SharedMountPoint',
          'Ceph',
          'Fusionstor'
        ],
        password: '',
        imageCachePoolName: '',
        dataVolumePoolName: '',
        rootVolumePoolName: '',
        emptypassword: false,
        emptysshPort: false,
        emptyname: false,
        emptycidr: false,
        emptyusername: false,
        emptymonIp: false,
        emptyurl: false,
        invalidmonIp: false,
        invalidsshPort: false,
        invalidcidr: false,
        invalidimageCachePoolName: false,
        invaliddataVolumePoolName: false,
        invalidurl: false,
        nasFsList_filter: [],
        nasAccessGroupList_filter: []
      }
    },
    async created(){
      let self = this, wizard = null;
      wizard = _.cloneDeep(self.$store.state.windowManager.windows[self.parentWindowUuid].wizard);
      self.zoneUuid = wizard.zone.uuid;
      self.clusterUuid = wizard.cluster.uuid;
      await self.queryPsTypes();
      await self.queryAllNasFs;
    },
    mounted() {
      let self = this;
      if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true);
    },
    methods: {
      //查询主存储类型
      queryPsTypes () {
        return rpc.query('backup-storage')
          .then(resp => {
            let BsTypes = _.uniq(resp.inventories.map(item => item.type))
            let avaiablePsTypes = []
            BsTypes.forEach(type => {
              switch (type) {
                case 'Ceph':
                  avaiablePsTypes = [{name:'Ceph', value: 'Ceph'}]
                  break
                case 'Fusionstor':
                  avaiablePsTypes = [{name:'Fusionstor', value: 'Fusionstor'}]
                  break
                case 'ImageStoreBackupStorage':
                  avaiablePsTypes = [
                    {name: 'LocalStorage', value: 'LocalStorage'},
                    {name:'NFS', value: 'NFS'},
                    {name: 'SharedMountPoint', value: 'SharedMountPoint'},
                    {name: 'Ceph', value: 'Ceph'}
                    ]
                  break
                case 'SftpBackupStorage':
                  avaiablePsTypes = [
                    {name: 'LocalStorage', value: 'LocalStorage'},
                    {name:'NFS', value: 'NFS'},
                    {name: 'SharedMountPoint', value: 'SharedMountPoint'}
                    ]
                  break
              }
            })
            this.type = avaiablePsTypes[0].value;
            this.avaiablePsTypes = avaiablePsTypes;
          })
      },
      //查询所有Nas服务
      queryAllNasFs: async function () {
        let resp = await ApiNasFilesystemService.queryList()
        this.nasFsList_all = resp.inventories
        this.nasFsList_filter = resp.inventories
      },
      //选择Nas服务
      selectNasFs: function (item) {
        this.selectedNasFs = item
        this.nasFsList_filter = this.nasFsList_all.map((obj) => {
          if (item.dataCenterUuid === obj.dataCenterUuid) {
            return obj
          }
        })
        if (this.selectedNasFs.dataCenterUuid !== this.selectedNasAccessGroup.dataCenterUuid) {
          this.selectedNasAccessGroup = {}
        }
      },
      //选择组
      selectNasAccessGroup: function (item) {
        this.selectedNasAccessGroup = item
        this.nasAccessGroupList_filter = this.nasAccessGroupList_all.map((obj) => {
          if (item.dataCenterUuid === obj.dataCenterUuid) {
            return obj
          }
        })
        if (this.selectedNasAccessGroup.dataCenterUuid !== this.selectedNasFs.dataCenterUuid) {
          this.selectedNasFs = {}
        }
      },
      //添加磁盘
      addDisk: function () {
        let self = this
        if (self.clusterUuid === '') {
          return
        }
        self.openDialog('SharedBlockSelectListDlg', {
          filterUuids: self.diskList,
          clusterUuid: self.clusterUuid,
          select: (diskUuids) => {
            let mergeUniqueArray = _.union(self.diskList, diskUuids)
            self.diskList = mergeUniqueArray
          }
        })
      },
      //删除磁盘
      deleteDisk: function (i) {
        this.diskList.splice(i, 1)
      },
      //校验
      validate (name) {
        let self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['name', 'monIp', 'url', 'cidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? String(self[name]).trim() : self[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        if (name === 'url') {
          if (self.type === 'NFS') {
            if (!self.isPath(input, 'nfs')) {
              self[`invalid${name}`] = true
            }
          } else {
            if (!self.isPath(input)) {
              self[`invalid${name}`] = true
            }
          }
        }
        if (name === 'cidr') {
          if (!self.isCidr(input)) {
            self[`invalid${name}`] = true
          }
        }
        if (name === 'monIp') {
          if (!self.isIP(input)) {
            self[`invalid${name}`] = true
          }
        }
        if (name === 'imageCachePoolName' || name === 'dataVolumePoolName' || name === 'rootVolumePoolName') {
          if (!self.isPoolName(input)) {
            self[`invalid${name}`] = true
          }
        }
      },
      //整体校验
      validateAll () {
        let self = this, invalidInput = false;
        let type = this.type
        let props
        let poolProps = ['imageCachePoolName', 'dataVolumePoolName', 'rootVolumePoolName']
        if (type === 'LocalStorage' || type === 'NFS' || type === 'SharedMountPoint' || type === 'AliyunNAS') {
          props = ['name', 'url', 'type']
        } else if (type === 'SharedBlock') {
          props = ['name', 'type']
        } else if (type === 'Ceph' || type === 'Fusionstor') {
          props = ['name', 'monIp', 'sshPort', 'username', 'password', 'type']
        }
        if (this.windowData.cidr && (type === 'Ceph' || type === 'NFS' || type === 'SharedMountPoint' || type === 'Fusionstor')) {
          props.push('cidr')
        }
        if (type === 'Ceph') {
          poolProps.forEach((item) => {
            if (this[item]) props.push(item)
          })
        }
        props.forEach(item => self.validate(item))
        let isInvalid = props.some(item => {
          if (poolProps.indexOf(item) > -1) return self[`invalid${item}`]
          else return self[`empty${item}`] === true
        })
        if (this['errorType']) isInvalid = true
        if (isInvalid) invalidInput = true
        if (invalidInput === false && type === 'SharedBlock') {
          if (self.diskList.length > 0) {
            invalidInput = false
          } else {
            invalidInput = true
          }
        }
        if (type === 'AliyunNAS') {
          if (!(self.selectedNasFs.dataCenterUuid || self.selectedNasAccessGroup.dataCenterUuid)) {
            invalidInput = true
          }
        }
        return invalidInput;
      },

      ...Validator,
      //添加参数
      createParam () {
        let data = this
        let hash = {
          'LocalStorage': 'local-storage',
          'NFS': 'nfs',
          'Ceph': 'ceph',
          'Fusionstor': 'fusionstor',
          'SharedMountPoint': 'smp',
          'SharedBlock': 'SharedBlock',
          'AliyunNAS': 'AliyunNAS'
        }
        let systemTags = []
        if (data.cidr !== '' && data.cidr !== undefined && (data.type === 'Ceph' || data.type === 'NFS' || data.type === 'SharedMountPoint' || data.type === 'Fusionstor' || data.type === 'SharedBlock')) {
          systemTags.push(`primaryStorage::gateway::cidr::${data.cidr}`)
        }
        if (data.type === 'LocalStorage' || data.type === 'NFS' || data.type === 'SharedMountPoint') {
          if (data.type === 'NFS') {
            if (data.mountOptions) {
              systemTags.push(`nfs::mount::options::${data.mountOptions}`)
            }
          }
          return {
            name: data.name,
            type: hash[data.type],
            url: data.url,
            systemTags: systemTags,
            zoneUuid: data.zoneUuid,
            description: data.description,
            clusterUuid: data.clusterUuid
          }
        } else if (data.type === 'AliyunNAS') {
          return {
            name: data.name,
            description: data.description,
            type: hash[data.type],
            url: data.url,
            nasUuid: this.selectedNasFs.uuid,
            accessGroupUuid: this.selectedNasAccessGroup.uuid,
            clusterUuid: data.clusterUuid,
            zoneUuid: data.zoneUuid,
            systemTags: systemTags
          }
        } else if (data.type === 'SharedBlock') {
          if (data.forceWipe) {
            systemTags.push('forceWipe')
          }
          return {
            name: data.name,
            type: hash[data.type],
            diskUuids: this.diskList,
            description: data.description,
            zoneUuid: data.zoneUuid,
            clusterUuid: data.clusterUuid,
            systemTags: systemTags
          }
        } else {
          let monUrls = []
          let url = `${data.username}:${data.password}@${data.monIp}:${data.sshPort}`
          monUrls.push(url)
          let p = {
            type: hash[data.type],
            monUrls: monUrls,
            name: data.name,
            zoneUuid: data.zoneUuid,
            systemTags: systemTags,
            description: data.description,
            imageCachePoolName: data.imageCachePoolName === '' ? undefined : data.imageCachePoolName,
            dataVolumePoolName: data.dataVolumePoolName === '' ? undefined : data.dataVolumePoolName,
            rootVolumePoolName: data.rootVolumePoolName === '' ? undefined : data.rootVolumePoolName
          }
          if (data.type === 'Ceph' && this.nocephx) {
            p.systemTags.push('ceph::nocephx')
          }
          return p
        }
      },

      updateValue(){
        let self = this;
        if(self.param.disabled) return;
        let invalid = self.validateAll();
        if(invalid) return;
        self.param.update(self.createParam());
      }

    },
    destroyed(){
      let self = this;
      document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', self.updateValue, true);
    },
  }
</script>

<style scoped>

</style>
