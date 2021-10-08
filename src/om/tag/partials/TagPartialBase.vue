<script>
  import _ from 'lodash'

  export default {
  methods: {
    getConditionsForDetach (resourceList) {
      let currAccountCondition = [];
      let resourceOwnerCondition = [];
      let myUserTagUuidListArray = resourceList.map(rs => rs.myUserTagUuidList);
      let otherUserTagUuidListArray = resourceList.map(rs => rs.otherUserTagUuidList);
      let currAccountTagUuidList = _.union(...myUserTagUuidListArray);
      let resourceOwnerTagUuidList = _.union(...otherUserTagUuidListArray);
      if (currAccountTagUuidList.length > 0) {
        currAccountCondition = [`uuid?=${currAccountTagUuidList.join(',')}`]
      } else {
        // this condition will be translate to zql so should =''
        currAccountCondition = [`uuid?=`]
      }
      if (resourceOwnerTagUuidList.length > 0) {
        resourceOwnerCondition = [`uuid?=${resourceOwnerTagUuidList.join(',')}`]
      } else {
        // this condition will be translate to zql so should =''
        resourceOwnerCondition = [`uuid?=`]
      }
      return {
        currAccountCondition,
        resourceOwnerCondition
      }
    },
    getConditionsBothTagForAttach (resourceList) {
      let currAccountUuid = window.localStorage.getItem('accountUuid');
      let currAccountCondition = [];
      let resourceOwnerCondition = [];
      let myUserTagUuidListArray = resourceList.map(rs => rs.myUserTagUuidList);
      let otherUserTagUuidListArray = resourceList.map(rs => rs.otherUserTagUuidList);
      let currAccountTagUuidList = _.intersection(...myUserTagUuidListArray);
      let resourceOwnerTagUuidList = _.intersection(...otherUserTagUuidListArray);
      if (currAccountTagUuidList.length > 0) {
        currAccountCondition = [`uuid!?=${currAccountTagUuidList.join(',')}`]
      } else {
        // this condition will be translate to zql so should =''
        currAccountCondition = [`uuid!?=''`]
      }

      if (_.uniqBy(resourceList, 'ownerUuid').length === 1 &&
          resourceList[0].ownerUuid === currAccountUuid) {
        // nothing in this list, because everything is in currAccountCondtion
        resourceOwnerCondition = [`uuid=''`]
      } else {
        if (resourceOwnerTagUuidList.length > 0) {
          resourceOwnerCondition = [`uuid!?=${resourceOwnerTagUuidList.join(',')}`]
        } else {
          // this condition will be translate to zql so should =''
          resourceOwnerCondition = [`uuid!?=''`]
        }
      }
      return {
        currAccountCondition,
        resourceOwnerCondition
      }
    },
    getConditionsFromMyTagForAttach (resourceList) {
      let currAccountCondition = [];
      let myUserTagUuidListArray = resourceList.map(rs => rs.myUserTagUuidList);
      let currAccountTagUuidList = _.intersection(...myUserTagUuidListArray);
      if (currAccountTagUuidList.length > 0) {
        currAccountCondition = [`uuid!?=${currAccountTagUuidList.join(',')}`]
      } else {
        // this condition will be translate to zql so should =''
        currAccountCondition = [`uuid!?=''`]
      }
      return currAccountCondition
    },
    getConditionsNormalAccountForDettach (resourceList) {
      let currAccountCondition = [];
      let myUserTagUuidListArray = resourceList.map(rs => rs.myUserTagUuidList);
      let currAccountTagUuidList = _.intersection(...myUserTagUuidListArray);
      if (currAccountTagUuidList.length > 0) {
        currAccountCondition = [`uuid?=${currAccountTagUuidList.join(',')}`]
      } else {
        // this condition will be translate to zql so should =''
        currAccountCondition = [`uuid?=''`]
      }
      return currAccountCondition
    },
    _openAttachTagPanel (resourceUuidList) {
      let paramObj = {
        showCreateButton: true,
        ok: (uuidList) => {
          this.attachTag(resourceUuidList, uuidList)
          .then(() => {
            if (this.queryList) {
              this.queryList()
            } else if (this.detailQuery) {
              this.detailQuery()
            }
          })
        }
      };
      let resourceList = this.get(resourceUuidList);
      if (this.dbData.common.isAdmin) {
        let currAccountCondition;
        let resourceOwnerCondition;
        // same owner
        let isSameOwner = _.uniqBy(resourceList, 'ownerUuid').length === 1;
        if (isSameOwner) {
          let obj = this.getConditionsBothTagForAttach(resourceList);
          currAccountCondition = obj.currAccountCondition;
          resourceOwnerCondition = obj.resourceOwnerCondition
        } else {
          currAccountCondition = this.getConditionsFromMyTagForAttach(resourceList)
          // not same owner
        }
        let currAccountUuid = window.localStorage.getItem('accountUuid');
        let resourceOwnerUuid = '';
        if (isSameOwner) {
          let resourceOwnerAccountUuid = resourceList[0].ownerUuid;
          let ownerIsAdmin = resourceOwnerAccountUuid === currAccountUuid;
          if (ownerIsAdmin) {
            resourceOwnerUuid = ''
          } else {
            if (resourceList[0].ownerType === 'project') {
              resourceOwnerAccountUuid = resourceList[0].ownerLinkedAccountUuid
            }
            resourceOwnerUuid = resourceOwnerAccountUuid
          }
        }
        paramObj.currAccountUuid = currAccountUuid;
        paramObj.currAccountCondition = currAccountCondition;
        paramObj.resourceOwnerUuid = resourceOwnerUuid;
        paramObj.resourceOwnerCondition = resourceOwnerCondition;
        paramObj.showTab = true
      } else {
        paramObj.conditions = this.getConditionsFromMyTagForAttach(resourceList);
        paramObj.showTab = false
      }
      this.openDialog('AttachTagDlg', paramObj)
    },
    _openDettachTagPanel (resourceUuidList) {
      let paramObj = {
        showCreateButton: false,
        queryType: 'normal',
        ok: (uuidList, close) => {
          this.openDialog('ConfirmDlg', {
            title: 'tag.detach',
            description: 'tag.detachDescription',
            uuidList,
            icon: 'tag_n',
            getName: (uuid) => {
              return this.getTag(uuid).name
            },
            ok: () => {
              this.closeDialog(self.windowId);
              this.detachTag(resourceUuidList, uuidList)
              .then(() => {
                if (this.queryList) {
                  this.queryList()
                } else if (this.detailQuery) {
                  this.detailQuery()
                }
              })
            }
          });
          return false
        }
      };
      let resourceList = this.get(resourceUuidList);
      if (this.dbData.common.isAdmin) {
        let currAccountCondition;
        let resourceOwnerCondition;
        let obj = this.getConditionsForDetach(resourceList);
        currAccountCondition = obj.currAccountCondition;
        resourceOwnerCondition = obj.resourceOwnerCondition;
        paramObj.currAccountCondition = currAccountCondition;
        paramObj.resourceOwnerCondition = resourceOwnerCondition;
        paramObj.showTab = true
      } else {
        paramObj.conditions = this.getConditionsNormalAccountForDettach(resourceList);
        paramObj.showTab = false
      }
      this.openDialog('AttachTagDlg', paramObj)
    }
  }
}
</script>
