<script>
  import AccountShareTabList from "../../../om/account/component/ShareTabList";
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
  import vCenterMethods from 'src/vcenter/vCenterImage/Methods';
  import DetailInfoState from 'src/component/DetailInfoState';
  import DetailTemplate from 'src/component/DetailTemplate';
  import LogList from "../../../component/LogList";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "vCenterImageDetailService",
    mixins: [WindowBase, vCenterMethods],
    components: {DetailTemplate, DetailInfoState, AccountShareTabList, LogList},
    data() {
      return {
        currTab: 'info',
        image: {},
        platformList: [
          'Linux',
          'Windows',
          'Other'
        ],
        changeResourceOwnerDlg: null
      }
    },

    computed: {
      model: {
        get() {
          let self = this;
          if (self.image)
            return self.image;
        },
        set(val) {
          let self = this;
          self.image = val;
        }
      }
    },
    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      let currentAccountUuid = window.localStorage.getItem('accountUuid');
      self.changeResourceOwnerDlg  = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this);
      self.updateWindow({
        dataUuid,
        uuidList: [dataUuid],
        QGA: false,
        currentAccountUuid
      }).then(() => {
        self.query();
      })
    },

    methods: {
      ...Utils,

      query() {
        let self = this, imageInventories, accountInventories;
        return rpc.query(`images/${self.windowData.dataUuid}`)
          .then((resp) => {
            imageInventories = resp.inventories[0]
            if (self.dbData.common.isAdmin) {
              return rpc.query('accounts/resources/refs', {
                q: `resourceUuid=${resp.inventories[0].uuid}`
              })
            } else {
              return new Promise((resolve, reject) => {
                resolve()
              })
            }
          })
          .then((resp) => {
            if (self.dbData.common.isAdmin) {
              accountInventories = resp.inventories[0]
              return rpc.query('accounts', {
                q: `uuid=${resp.inventories[0].accountUuid}`
              })
            } else {
              self.getResourceAccount()
              // return new Promise((resolve, reject) => { resolve() })
            }
          })
          .then((resp) => {
            if (self.dbData.common.isAdmin) {
              accountInventories.uuid = accountInventories.resourceUuid
              accountInventories.owner = resp.inventories[0]
              return self.updateDbRow({
                tableName: 'accountRef',
                id: accountInventories.uuid,
                data: accountInventories
              })
            } else {
              return new Promise((resolve, reject) => {
                resolve()
              })
            }
          })
          .then(() => {
            if (self.dbData.common.isAdmin) {
              return rpc.query('backup-storage', {
                q: `uuid=${imageInventories.backupStorageRefs[0].backupStorageUuid}`
              })
                .then((resp) => {
                  return self.updateDbRow({
                    tableName: 'backupstorage',
                    id: resp.inventories[0].uuid,
                    data: resp.inventories[0]
                  })
                })
            } else {
              return new Promise((resolve, reject) => {
                resolve()
              })
            }
          })
          .then(() => {
            if (!self.dbData.common.isOpensource) {
              return rpc.query(`images/${this.windowData.dataUuid}/qga`)
                .then((resp) => {
                  return self.updateWindow({QGA: resp.enable})
                })
            } else {
              return new Promise((resolve, reject) => {
                resolve()
              })
            }
          })
          .then(() => {
            if (self.dbData.common.isAdmin) {
              return self.isShareToAll(imageInventories.uuid)
                .then((resp) => {
                  imageInventories.toPublic = resp
                  return new Promise((resolve, reject) => {
                    resolve()
                  })
                })
            } else {
              return new Promise((resolve, reject) => {
                resolve()
              })
            }
          })
          .then(() => {
            if (this.dbData.common.isAdmin) {
              return rpc.query('vcenters').then(resp => {
                return this.updateDbTable({
                  tableName: 'vCenters',
                  list: resp.inventories
                })
              })
            } else return new Promise((resolve, reject) => {
              resolve()
            })
          })
          .then((resp) => {
            rpc.getResourceAccount([self.windowData.dataUuid], self)
            self.updateDbRow({
              tableName: 'image',
              id: self.windowData.dataUuid,
              data: imageInventories
            })
          }).then(() => {
            self.model = _.get(self.dbData.image, self.windowData.dataUuid);
          })
      },

      isShareToAll(uuid) {
        return rpc.query('accounts/resources', {
          q: `resourceUuid=${uuid}`
        })
          .then((resp) => {
            let toPublic = false
            resp.inventories.forEach((item) => {
              if (item.toPublic) toPublic = true
            })
            return toPublic
          })
      },

      updateResourceParam(param) {
        let self = this;
        return {
          getValue() {
            return self.model[param];
          },
          setValue(newVal) {
            if (newVal === self.model[param]) return;

          },
          canEdit: () => {
            return true;
          }
        }
      },

      inStates() {
        let self = this, states = [];
        if (arguments) {
          for (let arg in arguments) {
            states.push(arguments[arg]);
          }
        }
        let invalid = states.some(state => self.model.state === state || self.model.status === state);
        return invalid;
      },

      detailStartOrStop(param) {
        let self = this;
        self[param.toLocaleLowerCase()]([self.windowData.dataUuid], self.query);
      },

      detailShareImageToAll() {
        let self = this
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.shareToAll',
          warning: 'instanceOffering.shareToAllText',
          ok: () => {
            this.shareToAll([self.windowData.dataUuid]).then(() => self.query())
          }
        })
      },

      detailRecallImageFromAll() {
        let self = this
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.shareToAll',
          warning: 'account.recall',
          ok: () => {
            this.recallFromAll([self.windowData.dataUuid]).then(() => self.query())
          }
        })
      },

      detailChangeResourceOwner(){
        let self = this;
        self.changeResourceOwnerDlg(self.windowData.dataUuid, self.changeResourceToAccountOrProject, self.query)
      },

      deleteImage(param){
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'image.deleteImage',
          description: 'image.info.deleteConfirm',
          uuidList: [this.windowData.dataUuid],
          icon: 'image_popupico',
          ok: () => {
            self[param]([self.windowData.dataUuid])
              .then(() => {
                self.$router.push({name: 'vcenterimage'})
              })
          },
          getName: (uuid) => {
            return self.model.name;
          }
        })
      },


      detailRecoverImage() {
        let event = this.createEvent('image.action.recover', this.dbData.image[this.windowData.dataUuid].name)
        let self = this
        rpc.update('images', [self.windowData.dataUuid], {
          'recoverImage': {
            'backupStorageUuids': [
              self.dbData.image[self.windowData.dataUuid].backupStorageRefs[0].backupStorageUuid
            ]
          }
        }, event)
          .then(() => {
            self.incEventSuccess(event)
            self.$router.push({name: 'vcenterimage'})
          }, () => {
            self.incEventFail(event)
          })
      },
    }
  }
</script>
