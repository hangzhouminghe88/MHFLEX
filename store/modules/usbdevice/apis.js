import rpc from 'src/utils/rpc';
export default {
  queryNormal(param){
    return rpc.query('usb-device/usb-devices',param);
  },
  detach(uuid,vmUuid, progressCb){
    let vmParam = {
      vmInstanceUuid: vmUuid
    }
    return rpc._delete(`usb-device/usb-devices/${uuid}/detach`, vmParam, progressCb)
  },
  attach(uuid, vmUuid, progressCb){
    return rpc.create(`usb-device/usb-devices/${uuid}/attach`, {
      vmInstanceUuid: vmUuid
    }, progressCb)
  },
  disable(uuid, progressCb){
   return rpc.update('usb-device/usb-devices', uuid, {
     'updateUsbDevice': {
       'state': 'Disabled'
     }
   }, progressCb)
  },
  enable(uuid, progressCb){
    return rpc.update('usb-device/usb-devices', uuid, {
      'updateUsbDevice': {
        'state': 'Enabled'
      }
    }, progressCb)
  },
  update(uuid, param, progressCb){
    return rpc.update('usb-device/usb-devices', uuid, {
      'updateUsbDevice': param
    }, progressCb)
  },

  queryHost(uuid) {
    return rpc.query(`hosts`, {
      q: [`uuid=${uuid}`]
    });
  }
}
