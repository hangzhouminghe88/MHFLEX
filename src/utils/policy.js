let policyApiList = [
  'org.zstack.header.vm.APICreateVmInstanceMsg',
  'org.zstack.network.securitygroup.APIUpdateSecurityGroupMsg',
  'org.zstack.network.securitygroup.APIAddVmNicToSecurityGroupMsg',
  'org.zstack.header.storage.snapshot.APIRevertVolumeFromSnapshotMsg',
  'org.zstack.header.volume.APIDeleteDataVolumeMsg',
  'org.zstack.header.volume.APIAttachDataVolumeToVmMsg',
  'org.zstack.header.volume.APIChangeVolumeStateMsg',
  'org.zstack.header.storage.snapshot.APIDeleteVolumeSnapshotMsg',
  'org.zstack.header.vm.APIAttachL3NetworkToVmMsg',
  'org.zstack.header.volume.APICreateDataVolumeMsg',
  'org.zstack.network.securitygroup.APICreateSecurityGroupMsg',
  'org.zstack.header.identity.APIUpdateUserMsg',
  'org.zstack.header.volume.APIDetachDataVolumeFromVmMsg',
  'org.zstack.network.securitygroup.APIChangeSecurityGroupStateMsg',
  'org.zstack.header.vm.APIAttachIsoToVmInstanceMsg',
  'org.zstack.header.vm.APIRebootVmInstanceMsg',
  'org.zstack.header.volume.APIExpungeDataVolumeMsg',
  'org.zstack.header.vm.APIMigrateVmMsg',
  'org.zstack.network.securitygroup.APIDeleteSecurityGroupRuleMsg',
  'org.zstack.header.vm.APIRecoverVmInstanceMsg',
  'org.zstack.header.vm.APIDetachL3NetworkFromVmMsg',
  'org.zstack.header.vm.APIDetachIsoFromVmInstanceMsg',
  'org.zstack.header.console.APIRequestConsoleAccessMsg',
  'org.zstack.header.vm.APIStopVmInstanceMsg',
  'org.zstack.header.volume.APIUpdateVolumeMsg',
  'org.zstack.header.storage.snapshot.APIUpdateVolumeSnapshotMsg',
  'org.zstack.header.vm.APIExpungeVmInstanceMsg',
  'org.zstack.network.securitygroup.APIDeleteVmNicFromSecurityGroupMsg',
  'org.zstack.header.vm.APIStartVmInstanceMsg',
  'org.zstack.header.vm.APIDestroyVmInstanceMsg',
  'org.zstack.header.image.APIAddImageMsg',
  'org.zstack.header.image.APIDeleteImageMsg',
  'org.zstack.header.image.APIExpungeImageMsg',
  'org.zstack.header.image.APIRecoverImageMsg',
  'org.zstack.network.securitygroup.APIDeleteSecurityGroupMsg',
  'org.zstack.header.volume.APICreateVolumeSnapshotMsg',
  // 'org.zstack.header.vm.APICreateStopVmInstanceSchedulerMsg',
  // 'org.zstack.header.volume.APICreateVolumeSnapshotSchedulerMsg',
  'org.zstack.header.vm.APIChangeInstanceOfferingMsg',
  'org.zstack.network.securitygroup.APIAddSecurityGroupRuleMsg',
  'org.zstack.network.securitygroup.APIAttachSecurityGroupToL3NetworkMsg',
  'org.zstack.header.vm.APIUpdateVmInstanceMsg',
  'org.zstack.header.image.APIChangeImageStateMsg',
  'org.zstack.header.vm.APISetVmStaticIpMsg',
  'org.zstack.ha.APISetVmInstanceHaLevelMsg',
  'org.zstack.ha.APIDeleteVmInstanceHaLevelMsg',
  'org.zstack.network.service.eip.APICreateEipMsg',
  'org.zstack.network.service.eip.APIDeleteEipMsg',
  'org.zstack.network.service.eip.APIUpdateEipMsg',
  'org.zstack.network.securitygroup.APIDeleteVmNicFromSecurityGroupMsg',
  'org.zstack.header.volume.APIRecoverDataVolumeMsg',
  'org.zstack.network.service.eip.APIAttachEipMsg',
  'org.zstack.network.service.eip.APIDetachEipMsg',
  'org.zstack.header.image.APICreateRootVolumeTemplateFromRootVolumeMsg',
  'org.zstack.network.service.vip.APICreateVipMsg',
  'org.zstack.network.service.vip.APIDeleteVipMsg',
  'org.zstack.header.vm.APISetVmBootOrderMsg',
  'org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg',
  'org.zstack.header.vm.APISetVmConsolePasswordMsg',
  'org.zstack.header.vm.APIDeleteVmConsolePasswordMsg',
  // 'org.zstack.header.vm.APICreateRebootVmInstanceSchedulerMsg',
  // 'org.zstack.header.vm.APICreateStartVmInstanceSchedulerMsg',
  // 'org.zstack.header.vm.APICreateStopVmInstanceSchedulerMsg',
  // 'org.zstack.header.volume.APICreateVolumeSnapshotSchedulerMsg',
  // 'org.zstack.core.scheduler.APIDeleteSchedulerMsg',
  // 'org.zstack.core.scheduler.APIUpdateSchedulerMsg',
  'org.zstack.scheduler.APIChangeSchedulerStateMsg',
  'org.zstack.header.vm.APICloneVmInstanceMsg',
  'org.zstack.header.vm.APISetVmSshKeyMsg',
  'org.zstack.header.vm.APIDeleteVmSshKeyMsg',
  'org.zstack.header.vm.APIDeleteVmStaticIpMsg',
  'org.zstack.header.tag.APICreateUserTagMsg',
  'org.zstack.header.tag.APIDeleteTagMsg',
  'org.zstack.header.volume.APISetVolumeQosMsg',
  'org.zstack.header.volume.APIDeleteVolumeQosMsg',
  'org.zstack.header.vm.APISetNicQosMsg',
  'org.zstack.header.vm.APIDeleteNicQosMsg',
  'org.zstack.network.securitygroup.APIAttachSecurityGroupToL3NetworkMsg',
  'org.zstack.network.securitygroup.APIDetachSecurityGroupFromL3NetworkMsg',
  'org.zstack.scheduler.APICreateSchedulerTriggerMsg',
  'org.zstack.scheduler.APICreateSchedulerJobMsg',
  'org.zstack.scheduler.APIDeleteSchedulerJobMsg',
  'org.zstack.scheduler.APIDeleteSchedulerTriggerMsg',
  'org.zstack.scheduler.APIUpdateSchedulerTriggerMsg',
  'org.zstack.scheduler.APIUpdateSchedulerJobMsg',
  'org.zstack.scheduler.APIRemoveSchedulerJobFromSchedulerTriggerMsg',
  'org.zstack.scheduler.APIAddSchedulerJobToSchedulerTriggerMsg'
]

export function getPolicyApiList () {
  return policyApiList
}

const policyMap = {
  'VM.CREATE': ['org.zstack.header.vm.APICreateVmInstanceMsg'],
  'SECURITY-GROUP.UPDATE': ['org.zstack.network.securitygroup.APIUpdateSecurityGroupMsg'],
  'SECURITY-GROUP.ADD-NIC': ['org.zstack.network.securitygroup.APIAddVmNicToSecurityGroupMsg'],
  'VOLUME.SNAPSHOT.REVERT': ['org.zstack.header.storage.snapshot.APIRevertVolumeFromSnapshotMsg'],
  'VOLUME.DELETE': ['org.zstack.header.volume.APIDeleteDataVolumeMsg'],
  'VOLUME.ATTACH': ['org.zstack.header.volume.APIAttachDataVolumeToVmMsg'],
  'VOLUME.CHANGE-STATE': ['org.zstack.header.volume.APIChangeVolumeStateMsg'],
  'VOLUME.SNAPSHOT.DELETE': ['org.zstack.header.storage.snapshot.APIDeleteVolumeSnapshotMsg'],
  'VM.L3.ATTACH': ['org.zstack.header.vm.APIAttachL3NetworkToVmMsg'],
  'VOLUME.CREATE': ['org.zstack.header.volume.APICreateDataVolumeMsg'],
  'SECURITY-GROUP.CREATE': ['org.zstack.network.securitygroup.APICreateSecurityGroupMsg'],
  'USER-RESET-PASSWORD': ['org.zstack.header.identity.APIUpdateUserMsg'],
  'TAG.CREATE-USER-TAG': ['org.zstack.header.tag.APICreateUserTagMsg'],
  'TAG.DELETE-TAG': ['org.zstack.header.tag.APIDeleteTagMsg'],
  'VOLUME.DETACH': ['org.zstack.header.volume.APIDetachDataVolumeFromVmMsg'],
  'SECURITY-GROUP.CHANGE-STATE': ['org.zstack.network.securitygroup.APIChangeSecurityGroupStateMsg'],
  'VM.ISO.ADD': ['org.zstack.header.vm.APIAttachIsoToVmInstanceMsg'],
  'VM.REBOOT': ['org.zstack.header.vm.APIRebootVmInstanceMsg'],
  'VOLUME.EXPUNGE': ['org.zstack.header.volume.APIExpungeDataVolumeMsg'],
  'VM.MIGRATE': ['org.zstack.header.vm.APIMigrateVmMsg'],
  'SECURITY-GROUP.REMOVE-RULE': ['org.zstack.network.securitygroup.APIDeleteSecurityGroupRuleMsg'],
  'VM.RECOVER': ['org.zstack.header.vm.APIRecoverVmInstanceMsg'],
  'VM.L3.DETACH': ['org.zstack.header.vm.APIDetachL3NetworkFromVmMsg'],
  'VM.ISO.REMOVE': ['org.zstack.header.vm.APIDetachIsoFromVmInstanceMsg'],
  'VM.CONSOLE': ['org.zstack.header.console.APIRequestConsoleAccessMsg'],
  'VM.STOP': ['org.zstack.header.vm.APIStopVmInstanceMsg'],
  'VOLUME.UPDATE': ['org.zstack.header.volume.APIUpdateVolumeMsg'],
  'VOLUME.SNAPSHOT.UPDATE': ['org.zstack.header.storage.snapshot.APIUpdateVolumeSnapshotMsg'],
  'VM.EXPUNGE': ['org.zstack.header.vm.APIExpungeVmInstanceMsg'],
  'SECURITY-GROUP.REMOVE-NIC': ['org.zstack.network.securitygroup.APIDeleteVmNicFromSecurityGroupMsg'],
  'VM.START': ['org.zstack.header.vm.APIStartVmInstanceMsg'],
  'VM.DESTROY': ['org.zstack.header.vm.APIDestroyVmInstanceMsg'],
  'IMAGE.ADD': ['org.zstack.header.image.APIAddImageMsg'],
  'IMAGE.DELETE': ['org.zstack.header.image.APIDeleteImageMsg'],
  'IMAGE.EXPUNGE': ['org.zstack.header.image.APIExpungeImageMsg'],
  'IMAGE.RECOVER': ['org.zstack.header.image.APIRecoverImageMsg'],
  'SECURITY-GROUP.DELETE': ['org.zstack.network.securitygroup.APIDeleteSecurityGroupMsg'],
  'VOLUME.SNAPSHOT.CREATE': ['org.zstack.header.volume.APICreateVolumeSnapshotMsg'],
  // 'VOLUME.SCHEDULER.JOB.CREATE': ['org.zstack.header.volume.APICreateVolumeSnapshotSchedulerMsg'],
  // 'VMSTOP.SCHEDULER.JOB.CREATE': ['org.zstack.header.vm.APICreateStopVmInstanceSchedulerMsg'],
  'VM.INSTANCE-OFFERING.CHANGE': ['org.zstack.header.vm.APIChangeInstanceOfferingMsg'],
  'SECURITY-GROUP.ADD-RULE': ['org.zstack.network.securitygroup.APIAddSecurityGroupRuleMsg'],
  'VM.UPDATE': ['org.zstack.header.vm.APIUpdateVmInstanceMsg'],
  'SECURITY-GROUP.ATTACH-L3NETWORK': ['org.zstack.network.securitygroup.APIAttachSecurityGroupToL3NetworkMsg'],
  'VM.LOCAL-STORAGE.MIGRATE': ['org.zstack.header.volume.APIAttachDataVolumeToVmMsg', 'org.zstack.header.volume.APIDetachDataVolumeFromVmMsg'],
  'VOLUME.LOCALSTORAGE.MIGRATE': ['org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg'],
  'VOLUME.CREATE-AND-ATTACH': ['org.zstack.header.volume.APICreateDataVolumeMsg', 'org.zstack.header.volume.APIAttachDataVolumeToVmMsg'],
  'SECURITY-GROUP.CREATE-AND-ATTACH-L3NETWORK': ['org.zstack.network.securitygroup.APICreateSecurityGroupMsg', 'org.zstack.network.securitygroup.APIAttachSecurityGroupToL3NetworkMsg'],
  'IMAGE.CHANGE-STATE': ['org.zstack.header.image.APIChangeImageStateMsg'],
  'VM.STATIC-IP.SET': ['org.zstack.header.vm.APISetVmStaticIpMsg'],
  'VM.STATIC-IP.DELETE': ['org.zstack.header.vm.APIDeleteVmStaticIpMsg'],
  'VM.HA-LEVEL': ['org.zstack.ha.APISetVmInstanceHaLevelMsg', 'org.zstack.ha.APIDeleteVmInstanceHaLevelMsg'],
  'VM.HA-LEVEL.SET': ['org.zstack.ha.APISetVmInstanceHaLevelMsg'],
  'VM.HA-LEVEL.DELETE': ['org.zstack.ha.APIDeleteVmInstanceHaLevelMsg'],
  'EIP.CREATE': ['org.zstack.network.service.eip.APICreateEipMsg'],
  'EIP.DELETE': ['org.zstack.network.service.eip.APIDeleteEipMsg'],
  'EIP.UPDATE': ['org.zstack.network.service.eip.APIUpdateEipMsg'],
  'VOLUME.RECOVER': ['org.zstack.header.volume.APIRecoverDataVolumeMsg'],
  'EIP.ATTACH': ['org.zstack.network.service.eip.APIAttachEipMsg'],
  'EIP.DETACH': ['org.zstack.network.service.eip.APIDetachEipMsg'],
  'IMAGE.CREATE-FROM-ROOT-VOLUME': ['org.zstack.header.image.APICreateRootVolumeTemplateFromRootVolumeMsg'],
  'VIP.CREATE': ['org.zstack.network.service.vip.APICreateVipMsg'],
  'VIP.DELETE': ['org.zstack.network.service.vip.APIDeleteVipMsg'],
  'EIP-VIP.CREATE': ['org.zstack.network.service.eip.APICreateEipMsg', 'org.zstack.network.service.vip.APICreateVipMsg'],
  'EIP-VIP.DELETE': ['org.zstack.network.service.eip.APIDeleteEipMsg', 'org.zstack.network.service.vip.APIDeleteVipMsg'],
  'VM.BOOT-ORDER.SET': ['org.zstack.header.vm.APISetVmBootOrderMsg'],
  'VM.CONSOLE-PASSWORD.SET': ['org.zstack.header.vm.APISetVmConsolePasswordMsg'],
  'VM.CONSOLE-PASSWORD.DELETE': ['org.zstack.header.vm.APIDeleteVmConsolePasswordMsg'],
  'SCHEDULER.TRIGGER.CREATE': ['org.zstack.scheduler.APICreateSchedulerTriggerMsg'],
  'SCHEDULER.JOB.CREATE': ['org.zstack.scheduler.APICreateSchedulerJobMsg'],
  'SCHEDULER.TRIGGER.DELETE': ['org.zstack.scheduler.APIDeleteSchedulerTriggerMsg'],
  'SCHEDULER.JOB.DELETE': ['org.zstack.scheduler.APIDeleteSchedulerJobMsg'],
  'SCHEDULER.TRIGGER.UPDATE': ['org.zstack.scheduler.APIUpdateSchedulerTriggerMsg'],
  'SCHEDULER.JOB.UPDATE': ['org.zstack.scheduler.APIUpdateSchedulerJobMsg'],
  'SCHEDULER.ADD': ['org.zstack.scheduler.APIAddSchedulerJobToSchedulerTriggerMsg'],
  'SCHEDULER.REMOVE': ['org.zstack.scheduler.APIRemoveSchedulerJobFromSchedulerTriggerMsg'],
  // 'SCHEDULER.JOB.CREATE': ['org.zstack.scheduler.APICreateSchedulerTriggerMsg', 'org.zstack.scheduler.APICreateSchedulerJobMsg'],
  // 'SCHEDULER.JOB.DELETE': ['org.zstack.scheduler.APIDeleteSchedulerJobMsg', 'org.zstack.scheduler.APIDeleteSchedulerTriggerMsg'],
  // 'SCHEDULER.JOB.UPDATE': ['org.zstack.scheduler.APIUpdateSchedulerTriggerMsg', 'org.zstack.scheduler.APIUpdateSchedulerJobMsg'],
  'SCHEDULER.CHANGE-STATE': ['org.zstack.scheduler.APIChangeSchedulerStateMsg'],
  'VM.CLONE': ['org.zstack.header.vm.APICloneVmInstanceMsg'],
  'VM.SSH-KEY.SET': ['org.zstack.header.vm.APISetVmSshKeyMsg'],
  'VM.SSH-KEY.DELETE': ['org.zstack.header.vm.APIDeleteVmSshKeyMsg'],
  'VOLUME.SET-VOLUME.QOS': ['org.zstack.header.volume.APISetVolumeQosMsg'],
  'VOLUME.DELETE-VOLUME.QOS': ['org.zstack.header.volume.APIDeleteVolumeQosMsg'],
  'VM.SET-NIC.QOS': ['org.zstack.header.vm.APISetNicQosMsg'],
  'VM.DELETE-NIC.QOS': ['org.zstack.header.vm.APIDeleteNicQosMsg'],
  'SECURITY-GROUP.DEATTACH-L3NETWORK': ['org.zstack.network.securitygroup.APIDetachSecurityGroupFromL3NetworkMsg']
}

export function getPolicyMap () {
  return policyMap
}

export const virtualPolicyMap = {
  'VM.LOCAL-STORAGE.MIGRATE': [
    'VOLUME.ATTACH',
    'VOLUME.DETACH',
    'VOLUME.LOCALSTORAGE.MIGRATE'
  ],
  'VOLUME.CREATE-AND-ATTACH': [
    'VOLUME.CREATE',
    'VOLUME.ATTACH'
  ],
  'SECURITY-GROUP.CREATE-AND-ATTACH-L3NETWORK': [
    'SECURITY-GROUP.CREATE',
    'SECURITY-GROUP.ATTACH-L3NETWORK'
  ],
  'VM.HA-LEVEL': [
    'VM.HA-LEVEL.SET',
    'VM.HA-LEVEL.DELETE'
  ],
  'EIP-VIP.CREATE': [
    'EIP.CREATE',
    'VIP.CREATE'
  ],
  'EIP-VIP.DELETE': [
    'EIP.DELETE',
    'VIP.DELETE'
  ]
}

export const policyOnDependsMap = {
  'VM.EXPUNGE': [
    'VM.DESTROY'
  ],
  'VOLUME.EXPUNGE': [
    'VOLUME.DELETE'
  ],
  'IMAGE.EXPUNGE': [
    'IMAGE.DELETE'
  ],
  'EIP-VIP.CREATE': [
    'EIP.ATTACH'
  ],
  'VM.UPDATE': [
    'VOLUME.UPDATE'
  ],
  'IMAGE.CREATE-FROM-ROOT-VOLUME': [
    'IMAGE.COMMIT-VOLUME-AS-IMAGE'
  ]
}

export const policyOffDependsMap = {
  'VM.DESTROY': [
    'VM.EXPUNGE'
  ],
  'VOLUME.DELETE': [
    'VOLUME.EXPUNGE'
  ],
  'IMAGE.DELETE': [
    'IMAGE.EXPUNGE'
  ],
  'EIP.ATTACH': [
    'EIP-VIP.CREATE'
  ],
  'VOLUME.UPDATE': [
    'VM.UPDATE'
  ],
  'IMAGE.CREATE-FROM-ROOT-VOLUME': [
    'IMAGE.COMMIT-VOLUME-AS-IMAGE'
  ]
}

const policyGroup = [
  {
    name: 'VM',
    left: [
      {
        name: 'VM.CREATE',
        value: false
      },
      {
        name: 'VM.START',
        value: false
      },
      {
        name: 'VM.STOP',
        value: false
      },
      {
        name: 'VM.REBOOT',
        value: false
      },
      {
        name: 'VM.UPDATE',
        value: false
      },
      {
        name: 'VM.DESTROY',
        value: false
      },
      {
        name: 'VM.EXPUNGE',
        value: false
      },
      {
        name: 'VM.RECOVER',
        value: false
      },
      {
        name: 'VM.MIGRATE',
        value: false
      },
      {
        name: 'VM.CONSOLE',
        value: false
      },
      {
        name: 'VM.ISO.ADD',
        value: false
      },
      {
        name: 'VM.ISO.REMOVE',
        value: false
      },
      {
        name: 'VM.INSTANCE-OFFERING.CHANGE',
        value: false
      }
    ],
    right: [
      {
        name: 'VM.L3.ATTACH',
        value: false
      },
      {
        name: 'VM.L3.DETACH',
        value: false
      },
      {
        name: 'VM.STATIC-IP.SET',
        value: false
      },
      {
        name: 'VM.STATIC-IP.DELETE',
        value: false
      },
      {
        name: 'VM.HA-LEVEL',
        value: false
      },
      {
        name: 'VM.BOOT-ORDER.SET',
        value: false
      },
      {
        name: 'VM.CONSOLE-PASSWORD.SET',
        value: false
      },
      {
        name: 'VM.CONSOLE-PASSWORD.DELETE',
        value: false
      },
      {
        name: 'VM.CLONE',
        value: false
      },
      {
        name: 'VM.SSH-KEY.SET',
        value: false
      },
      {
        name: 'VM.SSH-KEY.DELETE',
        value: false
      },
      {
        name: 'VM.SET-NIC.QOS',
        value: false
      },
      {
        name: 'VM.DELETE-NIC.QOS',
        value: false
      }
    ]
  },
    // 'VM.HA-LEVEL.SET',
    // 'VM.HA-LEVEL.DELETE'],

  {
    name: 'SCHEDULER',
    left: [
      {
        name: 'SCHEDULER.JOB.CREATE',
        value: false
      },
      {
        name: 'SCHEDULER.JOB.DELETE',
        value: false
      },
      {
        name: 'SCHEDULER.TRIGGER.CREATE',
        value: false
      }
    ],
    right: [
      {
        name: 'SCHEDULER.CHANGE-STATE',
        value: false
      },
      {
        name: 'SCHEDULER.TRIGGER.DELETE',
        value: false
      }
      // 'SCHEDULER.JOB.UPDATE'
    ]
  },

  {
    name: 'IMAGE',
    left: [
      {
        name: 'IMAGE.ADD',
        value: false
      },
      {
        name: 'IMAGE.CHANGE-STATE',
        value: false
      },
      {
        name: 'IMAGE.DELETE',
        value: false
      }
    ],
    right: [
      {
        name: 'IMAGE.RECOVER',
        value: false
      },
      {
        name: 'IMAGE.EXPUNGE',
        value: false
      },
      {
        name: 'IMAGE.CREATE-FROM-ROOT-VOLUME',
        value: false
      }
      // 'IMAGE.COMMIT-VOLUME-AS-IMAGE'
    ]
  },
  {
    name: 'VOLUME',
    left: [
      {
        name: 'VOLUME.CREATE',
        value: false
      },
      {
        name: 'VOLUME.CREATE-AND-ATTACH',
        value: false
      },
      {
        name: 'VOLUME.UPDATE',
        value: false
      },
      {
        name: 'VOLUME.DELETE',
        value: false
      },
      {
        name: 'VOLUME.ATTACH',
        value: false
      },
      {
        name: 'VOLUME.DETACH',
        value: false
      },
      {
        name: 'VOLUME.CHANGE-STATE',
        value: false
      },
      // {
      //   name: 'VOLUME.LOCALSTORAGE.MIGRATE',
      //   value: false
      // },
      {
        name: 'VOLUME.RECOVER',
        value: false
      }
    ],
    right: [
      {
        name: 'VOLUME.EXPUNGE',
        value: false
      },
      {
        name: 'VOLUME.SNAPSHOT.CREATE',
        value: false
      },
      {
        name: 'VOLUME.SNAPSHOT.UPDATE',
        value: false
      },
      {
        name: 'VOLUME.SNAPSHOT.DELETE',
        value: false
      },
      {
        name: 'VOLUME.SNAPSHOT.REVERT',
        value: false
      },
      {
        name: 'VOLUME.SET-VOLUME.QOS',
        value: false
      },
      {
        name: 'VOLUME.DELETE-VOLUME.QOS',
        value: false
      }
    ]
  },
  {
    name: 'EIP',
    left: [
      {
        name: 'VIP.CREATE',
        value: false
      },
      {
        name: 'EIP.CREATE',
        value: false
      },
      {
        name: 'EIP.ATTACH',
        value: false
      },
      {
        name: 'EIP.DETACH',
        value: false
      }
    ],
    right: [
      {
        name: 'VIP.DELETE',
        value: false
      },
      {
        name: 'EIP.DELETE',
        value: false
      },
      {
        name: 'EIP.UPDATE',
        value: false
      }
    ]
  },
  {
    name: 'SECURITY-GROUP',
    left: [
      {
        name: 'SECURITY-GROUP.CREATE-AND-ATTACH-L3NETWORK',
        value: false
      },
      {
        name: 'SECURITY-GROUP.UPDATE',
        value: false
      },
      {
        name: 'SECURITY-GROUP.ADD-RULE',
        value: false
      },
      {
        name: 'SECURITY-GROUP.REMOVE-RULE',
        value: false
      }
      // 'SECURITY-GROUP.CHANGE-STATE',
    ],
    right: [
      {
        name: 'SECURITY-GROUP.ADD-NIC',
        value: false
      },
      {
        name: 'SECURITY-GROUP.REMOVE-NIC',
        value: false
      },
      {
        name: 'SECURITY-GROUP.ATTACH-L3NETWORK',
        value: false
      },
      {
        name: 'SECURITY-GROUP.DEATTACH-L3NETWORK',
        value: false
      }
    ]
  },
  {
    name: 'USER',
    left: [
      {
        name: 'USER-RESET-PASSWORD',
        value: false
      }
    ],
    right: []
  },
  {
    name: 'TAG',
    left: [
      {
        name: 'TAG.CREATE-USER-TAG',
        value: false
      }
    ],
    right: [
      {
        name: 'TAG.DELETE-TAG',
        value: false
      }
    ]
  }
]

export function getPolicyGroup () {
  return policyGroup
}



// WEBPACK FOOTER //
// ./src/utils/policy.js