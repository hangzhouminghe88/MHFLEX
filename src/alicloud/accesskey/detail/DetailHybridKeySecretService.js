import rpc from 'src/utils/rpc';
import {checkAccessKey} from "../Assistant/AccessKeyAssistant";

export default class DetailHybridKeySecretService{
  constructor(self) {
    this.query = this.query.bind(self);
    this.updateResourceParam = this.updateResourceParam.bind(self);
    this._updateAliyunKeySecret = this._updateAliyunKeySecret.bind(self);
    this.detailAttach = this.detailAttach.bind(self);
    this.detailDetach = this.detailDetach.bind(self);
    this.detailDelete = this.detailDelete.bind(self);
  }

   query () {
    let self = this;
    return rpc.query(`hybrid/hybrid/key/${self.windowData.dataUuid}`)
      .then(resp => {
        return self.updateDbRow({
          tableName: 'hybridKeySecret',
          id: self.windowData.dataUuid,
          data: resp.inventories[0]
        }).then( () => {
          self.model = _.get(self.dbData.hybridKeySecret, self.windowData.dataUuid);
        })
      })
  }

  updateResourceParam (param) {
    let self = this;
    return {
      getValue () {
        return self.model[param];
      },
      setValue (value) {
        if(value === self.model[param]) return;
        self.service._updateAliyunKeySecret(param, value)
          .then ( () => {
            self.service.query();
          });
      },
      canEdit () {
        return true;
      }
    }
  }

  _updateAliyunKeySecret(type, value) {
    const self = this
    let uuid = self.windowData.dataUuid
    let event = self.createEvent('common.updateInfo' + type, value)
    let msg = {}
    msg[type] = value
    return rpc.create(`hybrid/aliyun/${uuid}/key`, msg, event).then(resp => {
      self.incEventSuccess(event)
      return self.updateDbRow({
        tableName: 'hybridKeySecret',
        id: uuid,
        data: resp.inventory
      })
    }, () => {
      self.incEventFail(event)
    })
  }

  detailAttach () {
    let self = this;
    self.attach([self.windowData.dataUuid], self.service.query)
      .then( () => {
        checkAccessKey(self.windowData.type, self);
      })
  }

  detailDetach () {
    let self = this;
    self.detach([self.windowData.dataUuid], self.service.query)
      .then( () => {
        checkAccessKey(self.windowData.type, self);
      })
  }

  detailDelete () {
    let self = this;
    self.openDialog('ConfirmDlg', {
      title: 'hybridKey.DeleteAccessKey',
      description: 'hybridKey.delete',
      warning: 'hybridKey.info.deleteWarning',
      icon: 'access_key_popupico',
      uuidList: [self.windowData.dataUuid],
      ok: () => {
        self.delete([self.windowData.dataUuid], self.service.query)
          .then(() => {
            self.$router.push({name: 'hybridkeysecret', params: {type: self.windowData.type}})
          });
      },
      getName: () => {
        return self.model.name;
      }
    })
  }
}
