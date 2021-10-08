<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import OperationMessageDetail from "./OperationMessageDetail";
    export default {
      name: "OperationLogDetailService",
      components: {OperationMessageDetail, DetailTemplate},
      computed: {
        model() {
          return JSON.parse(window.localStorage.getItem('operationItem'));
        }
      },
      methods: {

      },
      destroyed(){
        window.localStorage.removeItem('operationItem')
      }
    }
</script>

<style scoped>

</style>
