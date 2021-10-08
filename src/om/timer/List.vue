<script>
import Utils from "src/utils/utils";
import WindowBase from "src/windows/Window";
import { mapGetters, mapState } from "vuex";
import Methods from "src/om/timer/Methods";
import rpc from "src/utils/rpc";
export default {
  name: "TimerList",
  mixins: [WindowBase, Methods],
  computed: {
    ...mapGetters({
      get: "timer/getList"
    })
  },
  methods: {
    async queryList() {
      let self = this;
      self.windowData.loading = true;
      let resp = await self.getUuidList();
      let condition = this.getCondition();
      if (this.currTab === "available") {
        condition = condition.concat(`uuid?=${resp.join(",")}`);
      } else if (this.currTab === "done") {
        condition = condition.concat(`uuid!?=${resp.join(",")}`);
      }
      return self
        .dispatchAction("timer/query", {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          q: condition,
          sortDirection: self.windowData.sortDirection,
          sortBy: self.windowData.sortBy,
          replyWithCount: true
        })
        .then(resp => {
          let uuidList = resp.uuidList;
          return self
            .updateWindow({
              uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              pageCount: Utils.computePageCount(
                resp.total,
                self.windowData.pageSize
              ),
              total: resp.total
            })
            .then(() => {
              self.itemList = self.get(self.windowData.uuidList);
              self.windowData.loading = false;
            });
        });
    },
    getCondition: function() {
      let conditionList = [],
        self = this;
      conditionList.push("schedulerType!=cron");
      if (self.selectVal !== "" && self.searchStr !== "") {
        conditionList = conditionList.concat(
          `${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`
        );
      }
      return conditionList;
    },
    getUuidList() {
      let uuidList = [];
      let preStep;
      preStep = rpc
        .query("scheduler/triggers/available", {
          fileds: "uuid"
        })
        .then(resp => {
          uuidList = resp.inventories.map(item => item.uuid);
          this.updateCount(uuidList);
          return new Promise((resolve, reject) => {
            resolve(uuidList);
          });
        });
      return preStep;
    },
    updateCount: function(availableUuidList) {
      rpc
        .query(`scheduler/triggers`, {
          count: true,
          q: this.getCondition().concat(`uuid?=${availableUuidList.join(",")}`)
        })
        .then(resp => {
          this.updateWindow({
            availableCount: resp.total
          });
        });

      rpc
        .query(`scheduler/triggers`, {
          count: true,
          q: this.getCondition().concat(`uuid!?=${availableUuidList.join(",")}`)
        })
        .then(resp => {
          this.updateWindow({
            doneCount: resp.total
          });
        });
    },
    goToCreate() {
      let self = this;
      self.$router.push({ name: "createTimer" });
    }
  }
};
</script>
