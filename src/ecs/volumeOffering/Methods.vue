<script>
  import {mapState} from 'vuex';
  export default {
    name: "Methods",
    computed: {
      ...mapState({
        volumeoffering: state => state.volumeoffering
      })
    },
    methods: {
      enable(uuidList) {
        const self = this
        return this.dispatchActionWithEvent('volumeoffering/enable', uuidList)
          .then(() => {
            return this.dispatchAction('volumeoffering/query', {q: `uuid?=${uuidList.join(',')}`})
          })
      },
      disable(uuidList) {
        const self = this;
        return this.dispatchActionWithEvent('volumeoffering/disable', uuidList)
          .then(() => {
            return self.dispatchAction('volumeoffering/query', {q: `uuid?=${uuidList.join(',')}`});
          })
      },
      stop(uuidList) {
        const self = this
        return this.dispatchActionWithEvent('volumeoffering/disable', uuidList)
          .then(() => {
            return this.dispatchAction('volumeoffering/query', {q: `uuid?=${uuidList.join(',')}`})
          })
      },
      delete(uuidList){
        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'volumeoffering.delete',
            description: 'volumeoffering.info.deleteConfirm',
            icon: 'volume_offering_popupico',
            uuidList,
            ok: () => {
              this.dispatchActionWithEvent('volumeoffering/delete', uuidList)
                .then(() => {
                  return self.queryList()
                })
            },
            getName(uuid){
              return self.volumeoffering[uuid].name;
            }
          })
        }
      },

      create(param){
        let self = this;
        return self.dispatchActionWithEvent('volumeoffering/create', param);
      },
    }
  }
</script>

<style scoped>

</style>
