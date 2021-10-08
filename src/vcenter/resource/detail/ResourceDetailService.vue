<script>
  import VCenterPrimaryStorageTab from 'src/vcenter/resource/components/primaryStorage/VCenterPrimaryStorageTab';
  import VCenterBackupStorageTab from 'src/vcenter/resource/components/backupStorage/VCenterBackupStorageTab';
  import VCenterClusterTab from 'src/vcenter/resource/components/cluster/VCenterClusterTab';
  import VCenterHostTab from 'src/vcenter/resource/components/host/VCenterHostTab';
  import VCenterPoolTab from 'src/vcenter/resource/components/pool/VCenterPoolTab';
  import DetailLongInfoState from 'src/component/DetailInfoState';
  import DetailTemplate from 'src/component/DetailTemplate';
  import Methods from 'src/vcenter/resource/Methods';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "ResourceDetailService",
    mixins: [WindowBase, Methods],
    components: {
      DetailTemplate,
      DetailLongInfoState,
      VCenterClusterTab,
      VCenterPrimaryStorageTab,
      VCenterBackupStorageTab,
      VCenterHostTab,
      VCenterPoolTab
    },
    computed: {
      //计算详情数据
      model: {
        get(){
          let self = this;
          return self.vCenter;
        },
        set(val){
          let self = this;
          self.vCenter = val;
        }
      },
    },

    data(){
      return {
        vCenter: {},
        currTab: 'info',
        subResources: {}
      }
    },

    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid
      }).then( async () => {
        await self.detailQuery();
      })
    },

    methods: {
      ...Utils,
      //查询vCenter并给详情数据赋值
      detailQuery() {
        let self = this, uuid = self.windowData.dataUuid, vCenterData = [];
        self.dispatchAction(`vCenter/basicQuery`, {
          q: `uuid=${self.windowData.dataUuid}`
        }).then(resp => {
            vCenterData =  _.get(self.dbData.vCenters, [self.windowData.dataUuid]);
            let tasks = []
            let p = rpc.query('vcenters/clusters', {
              q: `vCenterUuid=${uuid}`
            }).then((resp) => {
              vCenterData.clusterUuids = resp.inventories.map(it => it.uuid)
            })
            tasks.push(p)
            p = rpc.query('vcenters/backup-storage', {
              q: `vCenterUuid=${uuid}`
            }).then(resp => {
              vCenterData.backupstorageUuids = resp.inventories.map(it => it.uuid)
            })
            tasks.push(p)
            p = rpc.query('vcenters/primary-storage', {
              q: `vCenterUuid=${uuid}`
            }).then(resp => {
              vCenterData.primarystorageUuids = resp.inventories.map(it => it.uuid)
            })
            tasks.push(p)
            return Promise.all(tasks).then(() => {
              return self.updateDbRow({
                tableName: 'vCenters',
                id: uuid,
                data: vCenterData
              }).then(() => {
                self.model  = _.get(self.dbData.vCenters, [self.windowData.dataUuid]);
              }).then(() => {
                this.countSubResources()
              })
            })
          })
      },
      //更新资源
      updateResourceParam(param){
        let self = this;
        return {
          getValue(){
            return self.model[param];
          },
          setValue(newVal){
            if(newVal !== self.model[param]){
              let realParam ={};
              realParam["uuid"] = self.windowData.dataUuid;
              realParam["param"] = {};
              realParam["param"][param] =  newVal;
              let event = self.createEvent('common.updateInfo' + param, newVal);
              self.dispatchActionWithEvent('vCenter/update', realParam, null, event)
                .then(() => {
                  self.detailQuery();
                });
            }
          },
          canEdit(){
            return true;
          }
        }
      },
      //删除资源
      detailDelete(){
        let self = this;
        self.openDialog('ConfirmDlg',{
          title:  'vcenter.delete',
          description: 'vcenter.info.deleteConfirm',
          warning: 'vcenter.deleteWarning',
          uuidList: [self.windowData.dataUuid],
          icon: 'vcenter_popup',
          ok(){
            self.delete([self.windowData.dataUuid])
              .then(() => {
                self.$router.push({name: 'resource'})
              });
          },
          getName(){
            return self.model.name;
          }
        })
      },
      //同步资源
      detailAsync(){
        let self = this;
        self.asyncVcenter([self.windowData.dataUuid]).then(() => {
          let interval = setInterval(() => {
            this.detailQuery()
            clearInterval(interval)
          }, 3000)
        })
      },
      //获得各资源数量
      countSubResources () {
        const { clusterUuids, backupstorageUuids, primarystorageUuids } = this.dbData.vCenters[this.windowData.dataUuid];
        let obj = {}
        let tasks = []
        let p = rpc.query('vm-instances', {q: `clusterUuid?=${clusterUuids}`, count: true}).then(resp => {
          obj.vmInstanceCount = resp.total
        })
        tasks.push(p)
        p = rpc.query('hosts', {q: `clusterUuid?=${clusterUuids}`, count: true}).then(resp => {
          obj.hostCount = resp.total
        })
        tasks.push(p)
        p = rpc.query('vcenters/clusters/resourcepools', {q: `vCenterClusterUuid?=${clusterUuids}`, count: true}).then(resp => {
          obj.resourcePoolCount = resp.total
        })
        tasks.push(p)
        p = rpc.query('images', {q: `backupStorage.uuid?=${backupstorageUuids}`, count: true}).then(resp => {
          obj.imageCount = resp.total
        })
        tasks.push(p)
        p = rpc.query('volumes', {q: [`primaryStorageUuid?=${primarystorageUuids}`, 'type=Data'], count: true}).then(resp => {
          obj.volumeCount = resp.total
        })
        tasks.push(p)
        p = rpc.query('l3-networks', {q: `l2Network.cluster.uuid?=${clusterUuids}`, count: true}).then(resp => {
          obj.l3NetworkCount = resp.total
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => { this.$set(this.$data, 'subResources', obj) })
      }
    }
  }
</script>

<style scoped>

</style>
