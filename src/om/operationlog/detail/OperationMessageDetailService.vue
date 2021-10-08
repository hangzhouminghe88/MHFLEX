<script>
  import Utils from 'src/utils/utils';
  import OperationList from '../List';
  export default {
    name: "OperationMessageDetailService",
    mixins: [OperationList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        message: {}
      }
    },
    computed:{
       isIE() {
          return /rv\:11\.0|MSIE/.test(window.navigator.userAgent)
        }
    },
    created(){
      let self = this;
      self.message = self.param.message ? self.param.message :  {}
    },
    methods: {
      ...{
        formatDatetime: Utils.formatDatetime
      },
      nameParam() {
        let self = this;
        return {
          getValue() {
            return self.$t(self.param.message.action, self.param.message);
          },
          canEdit(){
            return false;
          }
        }
      },
      copy () {
        if (typeof InstallTrigger !== 'undefined') { // firefox
          var range = document.createRange()
          range.selectNode(this.$refs.valueElm)
          window.getSelection().addRange(range)
          document.execCommand('copy')
          window.getSelection().removeAllRanges()
        } else {
          this.$nextTick(() => {
            var range = document.createRange()
            range.selectNode(this.$refs.valueElm)
            window.getSelection().removeAllRanges()
            this.$nextTick(() => {
              // var range = document.createRange()
              range.selectNode(this.$refs.valueElm)
              window.getSelection().addRange(range)
              document.execCommand('copy')
              window.getSelection().removeAllRanges()
            })
          })
        }
      },
      getContent(value){
        if(/rv\:11\.0|MSIE/.test(window.navigator.userAgent)) {
           let reg = /password.*?([,}$])/;
          let realValue = value.replace(reg, 'password":"******"$1');
          return  realValue;
        }else{
           let reg = /password.*?([,}$])/;
          let realValue = value.replace(reg, 'password":"******"$1');
          return JSON.parse(realValue);
        }
      }
    }
  }
</script>

<style scoped>

</style>
