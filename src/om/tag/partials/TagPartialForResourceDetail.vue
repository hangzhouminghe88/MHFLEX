<script>
  import _ from 'lodash'
  import {mapGetters} from 'vuex'
  import TagListForDetail from 'src/component/TagListForDetail'
  import TagPartialBase from './TagPartialBase'
  import TagPartialForResourceList from './TagPartialForResourceList'

  export default {
  mixins: [TagPartialBase, TagPartialForResourceList],
  data () {
    return {
      tagUuidList: [],
      showOtherTag: true
    }
  },
  mounted () {
    if (!this.dbData.common.isAdmin) {
      this.showOtherTag = false
    }
  },
  destroyed: function () {
  },
  components: {
    'tag-list-for-detail': TagListForDetail
  },
  computed: {
    ...mapGetters({
      getTag: 'tag/get'
    })
  },
  watch: {
    'windowData.showSearchBox' (val, oldVal) {
      if (val === oldVal) return;
      this.$nextTick(() => {
        this.calcTagListWidth()
      })
    }
  },
  methods: {
    getMyTagParam () {
      let self = this;
      return {
        getTagUuidList () {
          return self.getMyUserTagUuidList()
        },
        getIconName () {
          return 'detail_tag_admin'
        },
        getTitle () {
          if (self.dbData.common.isAdmin) {
            return self.$t('tag.admin')
          } else {
            return ''
          }
        },
        onAttach: () => {
          self.onAttach('my')
        },
        detachTagUuidList (uuidList) {
          self.detachTag([self.model.uuid], uuidList)
          .then(self.refreshForTag)
        },
        isRemoveDeleteButton () {
          return _.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted'
        },
        canShowAttach () { return !(_.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted') }
      }
    },
    getOtherTagParam () {
      let self = this;
      return {
        getTagUuidList () {
          return self.getOtherUserTagUuidList()
        },
        getIconName () {
          return 'detail_tag_others'
        },
        getTitle () {
          return self.$t('tag.other')
        },
        onAttach: () => {
          self.onAttach('other')
        },
        detachTagUuidList (uuidList) {
          self.detachTag([self.model.uuid], uuidList)
          .then(self.refreshForTag)
        },
        isRemoveDeleteButton () {
          return _.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted'
        },
        canShowAttach () {
          if (_.get(self.model, 'state') === 'Destroyed' || _.get(self.model, 'status') === 'Deleted') {
            return false
          }
          let currAccountUuid = window.localStorage.getItem('accountUuid');
          if (self.model && self.model.ownerUuid !== currAccountUuid) {
            return true
          }
          return false
        }
      }
    },
    openAttachTagPanel () {
      // return this.onAttach()
      this._openAttachTagPanel([this.model.uuid])
    },
    vmDetachTag(){
      let self = this, uuidList = [];
      uuidList = self.getMyUserTagUuidList();
      uuidList.concat(self.getOtherUserTagUuidList());
      self.openDialog('ConfirmDlg', {
        title: 'tag.detach',
        description: 'tag.detachDescription',
        uuidList,
        icon: 'tag_n',
        getName: (uuid) => {
          return item.name
        },
        ok: () => {
          this.param.detachTagUuidList([item.uuid])
        }
      })
    },
    openDetachTagPanel () {
      if (!this.canDetachTag()) return;
      this._openDettachTagPanel([this.model.uuid])
    },
    canDetachTag () {
      if ((this.model && this.model.myUserTagUuidList && this.model.myUserTagUuidList.length > 0) ||
          (this.model.otherUserTagUuidList && this.model.otherUserTagUuidList.length > 0)) {
        return true
      }
      return false
    },
    onAttach (type) {
      let currUuidList = [];
      if (type === 'my') {
        currUuidList = this.getMyUserTagUuidList()
      } else {
        currUuidList = this.getOtherUserTagUuidList()
      }

      let conditions = [];
      if (currUuidList.length > 0) {
        conditions = [`uuid!?=${currUuidList.join(',')}`]
      } else {
        // this condition will be translate to zql so should =''
        conditions = [`uuid!?=''`]
      }
      let accountUuid;
      let currAccountUuid = window.localStorage.getItem('accountUuid');
      let showCreateButton = true;
      if (type === 'my') {
        accountUuid = currAccountUuid;
        showCreateButton = true
      } else {
        let resourceOwnerAccountUuid = this.model.ownerUuid;
        if (this.model.ownerType === 'project') {
          resourceOwnerAccountUuid = this.model.ownerLinkedAccountUuid
        }
        if (resourceOwnerAccountUuid !== currAccountUuid) {
          accountUuid = resourceOwnerAccountUuid;
          showCreateButton = false
        } else {
          accountUuid = currAccountUuid;
          showCreateButton = true
        }
      }
      let currTagCount = this.getMyUserTagUuidList().length
      this.openDialog('AttachTagDlg', {
        conditions,
        accountUuid,
        queryType: 'zql',
        showTab: false,
        showCreateButton,
        ok: (uuidList) => {
          this.attachTag([this.getResourceUuid()], uuidList)
            .then(() => {
              this.refreshForTag()
            })
        }
      })
    },
    getResourceUuid () {
      return this.model.uuid
    },
    getMyUserTagUuidList () {
      let uuidList = [];
      if (this.model && this.model.myUserTagUuidList) {
        uuidList = this.model.myUserTagUuidList
      }
      return uuidList
    },
    getOtherUserTagUuidList () {
      let uuidList = [];
      if (this.model && this.model.otherUserTagUuidList) {
        uuidList = this.model.otherUserTagUuidList
      }
      return uuidList
    },
    refreshForTag () {
      this.detailQuery()
    }
  }
}
</script>


// WEBPACK FOOTER //
// TagPartialForResourceDetail.vue?432a4101
