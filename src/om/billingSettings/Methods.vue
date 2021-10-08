<script>
import rpc from 'src/utils/rpc';
export default{
	name: 'Methods',
	methods: {
		 create (param){
          if (!_.isArray(param)) param = [param]
          let event = this.createEvent('billing.action.create', null, param.length)
          param.forEach(obj => {
            rpc.create('billings/prices', obj, event)
              .then((resp) => {
                this.incEventSuccess(event)
              }, () => {
                this.incEventFail(event)
              })
          })
        }
	}
}
</script>
