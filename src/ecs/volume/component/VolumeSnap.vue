<template>
  <div class="container">
    <div class="body">
      <div :style="{ width: (yMax + 1) * ySpace + 'px' }" class="snapshot tree" v-permission="'VOLUME.SNAPSHOT.CREATE'">
        <div :class="{'disabled': !canCreateSnapshot()}" :title="$t('common.createSnapshot')"
             @click="canCreateSnapshot() && openCreateSnapshot()" class="fake-node" style="display: inline-block;"
             v-permission="'VOLUME_VOLUME-SNAPSHOT.CREATE'">
          <i class="el-icon-circle-plus" style="font-size: 22px;color:#409EFF;"></i>
        </div>
        <help-trigger :style="{ position: 'absolute', top: '9px', left: '45px' }" name="createSnapshot"/>
      </div>
      <div :class="{'list-left': snapshotList.length === 0}" :style="{ 'margin-left': (yMax + 1) * ySpace + 'px' }"
           class="list">
        <div class="row-title">
          <span class="name" id="common-name">{{$t("common.name")}}</span>
          <span class="size" id="common-size" v-if="primaryStorageType !== 'Ceph'">{{$t("common.size")}}</span>
          <span class="date" id="common-createDate">{{$t("common.createDate")}}</span>
        </div>
        <div class="row" v-for="it in snapshotList" v-if="!it.data.fakeLeaf">
          <span class="root-name" id="vm-snapshot-root" v-if="it.data.root">{{ $t('vm.snapshot.root') }}</span>
          <span :title="it.data.inventory.name" class="name" v-if="!it.data.root" @click.stop="goToDetail({ uuid: it.data.inventory.uuid, volumeUuid: it.data.inventory.volumeUuid, volumeType: it.data.inventory.volumeType, refresh: query, primaryStorageType })">{{it.data.inventory.name}}</span>
          <span class="size" v-if="!it.data.root && primaryStorageType !== 'Ceph'" @click.stop="goToDetail({ uuid: it.data.inventory.uuid, volumeUuid: it.data.inventory.volumeUuid, volumeType: it.data.inventory.volumeType, refresh: query, primaryStorageType })">{{it.data.inventory.size && bytesToSize(it.data.inventory.size)}}</span>
          <span class="date" v-if="!it.data.root">{{formatDatetime(new Date(it.data.inventory.createDate))}}</span>
        </div>
      </div>
      <create-snap-dlg :message="createSnapMessage" :model="showCreateSnapDlg" @close="closeCreateSnapDlg"
                       v-if="showCreateSnapDlg"></create-snap-dlg>
    </div>
  </div>
</template>


<script>
  import _ from 'lodash'
  import * as d3 from 'd3'
  import WindowBase from 'src/windows/Window'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  import VmInstanceMethods from 'src/ecs/ecsInstance/Methods'
  import Root from 'src/windows/Root';
  import strategy from 'src/ecs/volume/strategy';
  import CreateSnapDlg from "../../../dialog/CreateSnapDlg";

  export default {
    name: 'VmSnapshot',
    components: {CreateSnapDlg},
    mixins: [WindowBase, VmInstanceMethods, Root],
    props: ['param', 'type', 'primaryStorageType'],
    data: function () {
      return {
        snapshotList: [],
        yMax: -1,
        xSpace: 48,
        ySpace: 34,
        fakeNewNode: {},
        showCreateSnapDlg: false,
        createSnapMessage: {}
      }
    },
    created: function () {
      this.updateWindow({
        dataUuid: this.param,
        methods: {
          queryList: this.query
        }
      });
      this.query()
    },
    mounted() {
      this.query()
    },
    destroyed: function () {
    },
    methods: {
      ...Utils,

      goToDetail(param) {
        let self = this;
        self.$emit('open', param);
      },

      init: function () {
        this.snapshotList = [];
        this.yMax = -1;
        this.fakeNewNode = {};
        let oldSvg = d3.select(this.$el).select('.tree svg');
        if (oldSvg) oldSvg.remove()
      },
      create: function () {
      },
      query: function () {
        let volumeUuid = this.windowData.dataUuid;
        this.dispatchAction('volume/query', volumeUuid);
        rpc.query('volume-snapshots/trees', {
          q: `volumeUuid=${volumeUuid}`
        })
          .then((resp) => {
            let current = resp.inventories.filter(it => it.current);
            if (current.length > 0) {
              this.currentTreeUuid = current[0].uuid
            }
            this.init();
            let fakeRoot = {
              inventory: {
                name: '',
                createDate: 'May 1, 1970 00:00:00 AM'
              },
              children: resp.inventories.map(it => {
                return it.tree
              }),
              root: true
            };
            this.sortNodesByCreateDate(fakeRoot);
            if (resp.inventories.length > 0) this.draw(fakeRoot)
          })
      },
      sortNodesByCreateDate(root) {
        function visitNode(node) {
          node.children = _.sortBy(node.children, [it => {
            return -(new Date(it.inventory.createDate).getTime())
          }]);

          node.children.forEach(it => {
            visitNode(it)
          })
        }

        visitNode(root)
      },
      canCreateSnapshot: function () {
        const dbState = this.$store.state;
        if (!dbState.volume) return false;
        return strategy.canCreateSnapshot(dbState.volume[this.windowData.dataUuid], dbState.db.primarystorage)
      },
      openCreateSnapshot: function () {
        let self = this;
        self.createSnapMessage = {
          type: this.type,
        };
        self.showCreateSnapDlg = true;
      },
      closeCreateSnapDlg(param) {
        let self = this;
        if (param) {
          self.createSnapshot(this.windowData.dataUuid, param);
        }
        self.showCreateSnapDlg = false;
      },
      createSnapshot: function (volumeUuid, param) {
        let event = this.createEvent('vm.action.createSnapshot', param.name);
        rpc.create(`volumes/${volumeUuid}/volume-snapshots`, {
          'name': param.name,
          'description': param.description
        }, event).then((resp) => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        }).then(() => {
          this.query()
        })
      },
      //d3画右侧显示的树状图
      draw: function (treeData) {
        let self = this;
        this.snapshotList = [];
        let margin = {top: 20, right: 0, bottom: 50, left: 30};
        var nodes = d3.hierarchy(treeData);
        let latestNode;
        nodes.each(function (d) {
          if (d.data.inventory.latest && d.data.inventory.treeUuid === self.currentTreeUuid) {
            latestNode = d
          }
        });
        if (!latestNode) {
          latestNode = nodes
        }
        self.fakeNewNode = {
          data: {
            inventory: {
              fakeNode: true
            },
            fakeLeaf: true
          },
          parent: latestNode,
          ...self.fakeNewNode
        };

        if (!latestNode.children) latestNode.children = [];
        latestNode.children.push(self.fakeNewNode);

        self.xIndex = 0;
        self.yMax = -1;

        function visitNode(node, root, yIndex) {
          if (node.children && node.children.length > 0) {
            let leaves = node.leaves();
            leaves.forEach(function (leaf) {
              if (!leaf.accessed) {
                visitNode(leaf, node, yIndex + 1)
              }
            })
          }
          node.x = self.xIndex * self.xSpace;
          node.y = yIndex * self.ySpace;
          if (self.yMax < yIndex) self.yMax = yIndex;
          node.accessed = true;
          if (node === root) return;
          self.snapshotList.push(node);
          self.xIndex++;
          visitNode(node.parent, root, yIndex)
        }

        visitNode(self.fakeNewNode, nodes, 0);

        // push root
        self.snapshotList.push(nodes);

        var svg = d3.select(this.$el.querySelector('.tree')).append('svg')
          .attr('width', (self.yMax + 1) * self.ySpace + margin.left + margin.right)
          .attr('height', self.xIndex * self.xSpace + margin.top + margin.bottom);
        let g = svg.append('g')
          .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

        // adds the links between the nodes
        g.selectAll('.link')
          .data(nodes.descendants().slice(1))
          .enter().append('path')
          .attr('stroke-dasharray', function (d) {
            if (d.data.inventory.fakeNode) return '5, 5';
            return ''
          })
          .attr('class', 'link')
          .attr('d', function (d) {
            return 'M' + d.y + ',' + d.x +
              ' L' + d.y + ',' + (d.x + d.parent.x) / 2 +
              ' L' + d.parent.y + ',' + d.parent.x
          });
        var node = g.selectAll('.node')
          .data(nodes.descendants())
          .enter().append('g')
          .attr('class', function (d) {
            return 'node' +
              (d.children ? ' node--internal' : ' node--leaf')
          })
          .attr('transform', function (d) {
            return 'translate(' + d.y + ',' + d.x + ')'
          });
        node.append('circle')
          .attr('r', 7)
          .attr('fill', (d) => d.data.inventory.latest && d.data.inventory.treeUuid === this.currentTreeUuid ? '#90D9FF' : '#fff')
      }
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return;
        if (this.param) {
          this.updateWindow({dataUuid: this.param}).then(() => this.query())
        }
      }
    }
  }
</script>

<style scoped lang="less">

  .body {
    padding-top: 40px;
  }

  .tree {
    position: absolute;
  }

  .list {
    padding-top: 7px;
    padding-left: 40px;
    font-size: 14px;
  }

  .list-left {
    padding-left: 74px;
  }

  .list .row {
    height: 48px;
  }

  .list .row-title {
    height: 31px;
    box-shadow: inset 0 -1px 0 0 #E2EEF4;
    margin-bottom: 20px;
  }

  .list .row-title .name {
    display: inline-block;
    width: 30%;
  }

  .list .row-title .size {
    display: inline-block;
    width: 30%;
  }

  .list .row-title .date {
    display: inline-block;
    width: 30%;
  }

  .list .row .name {
    display: inline-block;
    width: 30%;
    color: #3C73B9;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .list .row .root-name {
    display: inline-block;
    width: 30%;
  }

  .list .row .size {
    display: inline-block;
    width: 30%;
  }

  .list .row .date {
    display: inline-block;
    width: 30%;
  }
</style>
