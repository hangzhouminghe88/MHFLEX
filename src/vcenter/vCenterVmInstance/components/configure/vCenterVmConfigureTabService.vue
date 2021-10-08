<script>
  import NetworkTabList from './NetworkTabList';
  import VolumeTabList from './VolumeTabList';

  export default {
    name: "vCenterVmConfigureTabService",
    components: {NetworkTabList, VolumeTabList},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      let self = this;
      return {
        netWorkItem: {
          id: 'network-tab',
          param: {
            conditions: {vmUuid: self.param.uuid}
          },
          ctrl: 'NetworkTabList'
        },
        volumeItem: {
          id: 'volume-tab',
          param: {
            uuid: self.param.uuid,
            createVolume: self.param.createVolume
          },
          ctrl: 'VolumeTabList'
        }
      }
    }
  }
</script>
