import rpc from "../../../utils/rpc";
import {genUniqueId} from "../../../utils/utils";

export let accountKeyAssistant = (that) => {
  let self = that;
  //帮助提示以及提示后的跳转
  var newAssistant = (resourceName, operate) => {
    let id = `assistant-${genUniqueId()}`
    //默认跳转到添加accountKey页面
    let handler = () => {
      self.$router.push({name: 'createHybridHuaWeiAccountKey'});
    }
    //如果操作类型为check跳转到accountKey列表页面
    if (operate === 'check') {
      handler = () => {
        self.$router.push({name: 'hybridhuaweiaccountkey'})
      }
    }
    let params = {
      id,
      title: 'accountKeyTitle',
      content: resourceName,
      operate,
      hide: false,
      handler
    }
    //创建新帮助
    self.newGlobalAssistant(params, 'Hybrid')
  }
  //请求华为云accountKey如果没有需添加
  return rpc.query('brid/key', {
    replyWithCount: true,
  }).then((resp) => {
     if(resp.total === 0) {
       self.deleteGlobalAssistant('Hybrid')
       newAssistant(`lackOfHybridHuaweiKeySecret`, 'add')
       return
     }
     //定义计数器
    let count = 0
    for (let i = resp.inventories.length - 1; i >= 0; i--) {
      //如果当前默认为false则计数器累加
      if (resp.inventories[i].current === 'false') {
        count++
      }
    }
    //如果count等于所有请求数组总数的话证明没有默认可用的需设置默认
    if (count === resp.inventories.length) {
      newAssistant('disabledHybridHuaweiyunKeySecret', 'check')
      return
    }
    self.deleteGlobalAssistant('Hybrid')
  })
}
