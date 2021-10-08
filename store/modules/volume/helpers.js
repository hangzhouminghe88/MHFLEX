import _ from 'lodash'
import rpc from 'src/utils/rpc'
import tagPartialHelper from '../tag/partialHelperForResource'

export default {
  ...tagPartialHelper,
  addAttr(volume) {
    volume.forEach((vo) => {
        vo.myUserTagUuidList = [];
        vo.otherUserTagUuidList= []
    })
  },
  buildQueryScript (rootState, uuid) {
    let script = `

def tmp = query("QueryVolume uuid?=${uuid}")
def VolumeList = tmp.result
put("volume", VolumeList)

def uuidList = VolumeList.collect { it.uuid }

if (VolumeList[0].rootImageUuid) {
  def ImageList = query("QueryImage uuid?=" + VolumeList[0].rootImageUuid).result
  put("image", ImageList)
}

def VmUuids = VolumeList.collect { it.vmInstanceUuid }

def VmInstanceList = query("QueryVmInstance uuid?=" + VmUuids).result
put('vm', VmInstanceList)

def SystemTagList = query("QuerySystemTag resourceUuid?=${uuid}").result
put("systemTags", SystemTagList)
def VolumeAList = []
uuidList.each { uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  def result = call("org.zstack.header.volume.APIGetVolumeCapabilitiesMsg", '{"uuid": ' + uuid +'}').result
  tmp["MigrationInCurrentPrimaryStorage"] = result.capabilities.MigrationInCurrentPrimaryStorage

  def tagsAboutVolume = SystemTagList.findAll{ it.resourceUuid == uuid }
  tagsAboutVolume.each{ tag ->
    if (tag.tag.indexOf("kvm::volume::") > -1) {
      tmp["WWN"] = tag.tag.split('::')[2]
    }
    if (tag.tag.indexOf("capability::virtio-scsi") > -1) {
      tmp["systemTagsVirtioSCSI"] = "VirtioSCSI"
    }
    if (tag.tag.indexOf("ThinProvisioning") > -1) {
      tmp["thinProvision"] = "thinProvision"
    }
  }
  VolumeAList.push(tmp)
}
def SharedVolumeList = VolumeList.findAll { it.isShareable }
def SharedVolumeUuidList = SharedVolumeList.collect { it.uuid }
SharedVolumeUuidList.each { uuid ->
  def result = query("QueryShareableVolumeVmInstanceRef volumeUuid=" + uuid).result
  if (result.size()) {
    def volumeIndex = VolumeList.findIndexOf{ it.uuid == uuid }
    VolumeList[volumeIndex].vmInstanceUuidList = []
    result.each { item -> 
      VolumeList[volumeIndex].vmInstanceUuidList.push(item.vmInstanceUuid)
    }
  }
}
put("volume", VolumeList)
put("volumeA", VolumeAList)
def InstantiatedVolumeList = VolumeList.findAll { it.primaryStorageUuid }
def primaryStorageUuidList = InstantiatedVolumeList.collect { it.primaryStorageUuid }
if (primaryStorageUuidList.size()) {
  def PrimaryStorageList = query("QueryPrimaryStorage uuid?=" + primaryStorageUuidList.join(",")).result
  put('primarystorage', PrimaryStorageList)
} else {
  put('primarystorage', [])
}
`
    if (!rootState.db.common.isOpensource) {
      script += `
uuidList.each{ uuid ->
  result = call("org.zstack.header.volume.APIGetVolumeQosMsg", '{"uuid": ' + uuid + '}').result
  def index = VolumeAList.findIndexOf { it.uuid == uuid }
  VolumeAList[index]["volumeBandwidthReadUpthreshold"] = result.volumeBandwidthReadUpthreshold
  VolumeAList[index]["volumeBandwidthWriteUpthreshold"] = result.volumeBandwidthWriteUpthreshold
  VolumeAList[index]["volumeBandwidthUpthreshold"] = result.volumeBandwidthUpthreshold
  VolumeAList[index]["volumeBandwidth"] = result.volumeBandwidth

  VolumeAList[index]["volumeReadBandwidth"] = result.volumeBandwidthRead
  VolumeAList[index]["volumeWriteBandwidth"] = result.volumeBandwidthWrite
}

`
    }
    return script
  },
  // cannot use 'restrict by' sub clause of zql.
  // so the condition, 'primaryStorage.zone.uuid=xxx' cannot be translated to zql.
  // keep batch query here.
  // and, query shared volume, account and shared resource should query volume again and again.
  // it wasts server resource.
  buildBatchQueryScript (rootState, param) {
    let script = `

def tmp = query("QueryVolume limit=${param.limit} start=${param.start} ${param.q.join(' ')} sortBy=${param.sortBy} sortDirection=${param.sortDirection} replyWithCount=true")
put("total", tmp.total)

def VmInstanceList = query("QueryVmInstance").result
put('vm', VmInstanceList)
def VolumeList = tmp.result
def uuidList = VolumeList.collect{ it.uuid }
def VolumeAList = []
uuidList.each { uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  def result = call("org.zstack.header.volume.APIGetVolumeCapabilitiesMsg", '{"uuid": ' + uuid +'}').result
  tmp["MigrationInCurrentPrimaryStorage"] = result.capabilities.MigrationInCurrentPrimaryStorage
  VolumeAList.push(tmp)
}
def SharedVolumeList = VolumeList.findAll { it.isShareable }
def SharedVolumeUuidList = SharedVolumeList.collect { it.uuid }
SharedVolumeUuidList.each { uuid ->
  def result = query("QueryShareableVolumeVmInstanceRef volumeUuid=" + uuid).result
  if (result.size()) {
    def volumeIndex = VolumeAList.findIndexOf{ it.uuid == uuid }
    VolumeAList[volumeIndex].vmInstanceUuidList = []
    result.each { item -> 
      VolumeAList[volumeIndex].vmInstanceUuidList.push(item.vmInstanceUuid)
    }
  }
}
put("volume", VolumeList)
put("volumeA", VolumeAList)
def InstantiatedVolumeList = VolumeList.findAll { it.primaryStorageUuid }
def primaryStorageUuidList = InstantiatedVolumeList.collect { it.primaryStorageUuid }
if (primaryStorageUuidList.size()) {
  def PrimaryStorageList = query("QueryPrimaryStorage uuid?=" + primaryStorageUuidList.join(",")).result
  put('primarystorage', PrimaryStorageList)
} else {
  put('primarystorage', [])
}
`
    if (!rootState.db.common.isOpensource) {
      script += `
uuidList.each{ uuid ->
  result = call("org.zstack.header.volume.APIGetVolumeQosMsg", '{"uuid": ' + uuid + '}').result
  def index = VolumeAList.findIndexOf { it.uuid == uuid }
  VolumeAList[index]["volumeBandwidthReadUpthreshold"] = result.volumeBandwidthReadUpthreshold
  VolumeAList[index]["volumeBandwidthWriteUpthreshold"] = result.volumeBandwidthWriteUpthreshold
  VolumeAList[index]["volumeBandwidthUpthreshold"] = result.volumeBandwidthUpthreshold
  VolumeAList[index]["volumeBandwidth"] = result.volumeBandwidth

  VolumeAList[index]["volumeReadBandwidth"] = result.volumeBandwidthRead
  VolumeAList[index]["volumeWriteBandwidth"] = result.volumeBandwidthWrite
}

`
    }
    return script
  },
  buildGetExtraDataScript (uuidList, rootState) {
    let script = `
def uuidList = [${uuidList.map(uuid => `"${uuid}"`).join(',')}]
def VolumeList = []
uuidList.each { uuid ->
  def tmp = [:]
  tmp["uuid"] = uuid
  def result = call("org.zstack.header.volume.APIGetVolumeCapabilitiesMsg", '{"uuid": ' + uuid +'}').result
  tmp["MigrationInCurrentPrimaryStorage"] = result.capabilities.MigrationInCurrentPrimaryStorage
  tmp["MigrationToOtherPrimaryStorage"] = result.capabilities.MigrationToOtherPrimaryStorage
`
    if (!rootState.db.common.isOpensource) {
      script += `
  result = call("org.zstack.header.volume.APIGetVolumeQosMsg", '{"uuid": ' + uuid + '}').result
  tmp["volumeBandwidthReadUpthreshold"] = result.volumeBandwidthReadUpthreshold
  tmp["volumeBandwidthWriteUpthreshold"] = result.volumeBandwidthWriteUpthreshold
  tmp["volumeBandwidthUpthreshold"] = result.volumeBandwidthUpthreshold
  tmp["volumeBandwidth"] = result.volumeBandwidth

  tmp["volumeReadBandwidth"] = result.volumeBandwidthRead
  tmp["volumeWriteBandwidth"] = result.volumeBandwidthWrite
`
    }
    script += `
  VolumeList.push(tmp)
}
put("result", VolumeList)
`
    return script
  },
  buildCreateParam (param, rootState) {
    let msg = {
      name: param.name,
      description: param.description
    }
    msg.systemTags = []
    if (param.VirtioSCSI) {
      msg.systemTags.push('capability::virtio-scsi')
      if (param.shareable) {
        msg.systemTags.push('ephemeral::shareable')
      }
    }
    if (param.thinProvision) {
      msg.systemTags.push('volumeProvisioningStrategy::ThinProvisioning')
    } else if (param.thinProvision === false) {
      msg.systemTags.push('volumeProvisioningStrategy::ThickProvisioning')
    }
    let ps
    if (param.primaryStorageUuid) {
      msg.primaryStorageUuid = param.primaryStorageUuid
      ps = rootState.db.primarystorage[param.primaryStorageUuid]
    }
    if (ps && ps.type === 'Ceph' && param.poolName) {
      msg.systemTags.push('ceph::pool::' + param.poolName)
    }
    // create volume by volumeOffering
    if (param.diskOfferingUuid) {
      msg.diskOfferingUuid = param.diskOfferingUuid
      if (ps && ps.type === 'LocalStorage') {
        msg.systemTags.push('localStorage::hostUuid::' + param.hostUuid + '')
      }
    }
    // create volume by volumeImage
    if (param.volumeImageUuid) {
      if (param.hostUuid) {
        msg.hostUuid = param.hostUuid
      }
    }
    return msg
  },
  async queryVm (uuidList, commit) {
    let resp = await rpc.query('vm-instances', {q: `uuid?=${uuidList}`})
    commit('mergeDbTable', {tableName: 'vm', list: resp.inventories}, { root: true })
  },
  async queryPrimaryStorage (uuidList, commit) {
    uuidList = _.uniq(uuidList)
    let resp = await rpc.query('primary-storage', {q: `uuid?=${uuidList}`})
    commit('mergeDbTable', {tableName: 'primarystorage', list: resp.inventories}, { root: true })
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/volume/helpers.js
