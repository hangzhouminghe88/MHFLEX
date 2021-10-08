<script>
    export default {
      name: "Methods",
      methods: {
        changeTemplateState(uuidList, state){
          let self = this;
          if (!Array.isArray(uuidList)) {
            uuidList = [uuidList]
          }
          let event = self.createEvent(`resourcestacktemplate.action.${state}`, uuidList.length === 1 ? this.dbData.resourceStackTemplate[uuidList[0]].name : '', uuidList.length);
          let paramList = uuidList.map((uuid) =>  {
            return {
              uuid,
              state
            }
          })
          return self.dispatchActionWithEvent('sysResourceStackTemplate/changeTemplateState', paramList, null, event);
        }
      }
    }
</script>

<style scoped>

</style>
