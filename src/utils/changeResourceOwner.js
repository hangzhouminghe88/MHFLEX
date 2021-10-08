import { getCandidateConditionsForChangeResourceOwner, getLicensePermission } from 'src/utils/utils'

export async function changeResourceOwnerDlg (resourceUuidList, selectedFn, callBackfn) {
  if (!Array.isArray(resourceUuidList)) {
    resourceUuidList = [resourceUuidList]
  } else if (!resourceUuidList || resourceUuidList.length <= 0) {
    return
  }
  const self = this
  let conditionsObj = await getCandidateConditionsForChangeResourceOwner(resourceUuidList)
  let conditions = []
  let pjConditions = []
  if (conditionsObj.accountUuidList && conditionsObj.accountUuidList.length === 1) {
    conditions.push(`uuid!=${conditionsObj.accountUuidList[0]}`)
    pjConditions.push(`linkedAccountUuid!=${conditionsObj.accountUuidList[0]}`)
  }
  let licensePermission = getLicensePermission('LICENSE_EXTRA_COMPANY', self) || false
  let windowDlg = licensePermission ? 'ChangeResourceOwnerToAccountProjectSingleSelectListDlg' : 'AccountListDlg'
  let paramObj = {
    conditions: conditions,
    select: (uuid) => {
      selectedFn(resourceUuidList, uuid).then(() => {
        if (callBackfn) callBackfn()
      })
    },
    accountUuidList: licensePermission ? conditionsObj.accountUuidList : undefined,
    projectCondition: licensePermission ? conditionsObj.projectCondition : undefined,
    pjConditions: licensePermission ? pjConditions : undefined,
    type: 'radio'
  }
  self.openDialog(windowDlg, paramObj)
}

export default {
  changeResourceOwnerDlg
}

