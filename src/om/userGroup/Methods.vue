<script>
  import {mapState} from 'vuex'
  export default {
    name: "Methods",
    computed: {
      ...mapState({
        userGroup: state => state.userGroup
      })
    },
    methods: {
      delete(uuidList){
        let self = this;
        event = self.createEvent('usergroup.action.delete', uuidList.length === 1 ? self.dbData.usergroup[uuidList[0]].name : '', uuidList.length);
        return self.dispatchActionWithEvent('userGroup/delete', uuidList, null, event);
      },
      addUser(userUuidList, userGroupUuid){
        let self = this;
        let paramList = userUuidList.map((uuid) => {
          return {
            uuid,
            userGroupUuid
          }
        })
        return self.dispatchActionWithEvent('userGroup/addUser', paramList);
      }
    }
  }
</script>

<style scoped>

</style>
