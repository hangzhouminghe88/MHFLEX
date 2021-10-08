import rpc from 'src/utils/rpc';

export default {
  query(param){
    return rpc.query(`zwatch/alarms/sns/text-templates`, param);
  },
  setDefault(uuid, param, progressCb){
    return rpc.update('zwatch/alarms/sns/text-templates', uuid, {
      'updateSNSTextTemplate': {
        'defaultTemplate': param
      }
    },  progressCb)
  },
  delete(uuid, progressCb){
    return rpc._delete(`zwatch/alarms/sns/text-templates/${uuid}`, null, progressCb)
  },
  create(param, progressCb){
    return rpc.create('zwatch/alarms/sns/text-templates', param, progressCb);
  },
  update(uuid, param, progressCb){
    return rpc.update('zwatch/alarms/sns/text-templates', uuid, {
      'updateSNSTextTemplate':param
    },  progressCb)
  }
}
