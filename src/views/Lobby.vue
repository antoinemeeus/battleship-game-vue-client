<template>
  <v-container
    fluid
    ma-0
    pa-0
  >
    <v-layout
      align-center
      justify-center
      row
      wrap
    >
      <v-flex
        lg10
        pa-2
        xs12
      >
        <h2 class="display-2 text-xs-center">
          Game List
        </h2>
      </v-flex>
      <v-flex
        lg10
        pa-3
        xs12
      >
        <GamesTable />
      </v-flex>
      <v-flex
        lg10
        pa-3
        xs12
      >
        <h2 class="display-2 text-xs-center">
          Leader Board
        </h2>
      </v-flex>
      <v-flex
        lg10
        pa-3
        xs12
      >
        <LeaderBoard />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import GamesTable from "../components/GamesTable.vue";
import LeaderBoard from "../components/LeaderBoard.vue";
import {mapActions, mapState} from "vuex";

export default {
    name: "LobbyComponent",
    components: {
        GamesTable,
        LeaderBoard
    },
    beforeRouteUpdate() {
        this.setAutoRefresh();
    },
    beforeRouteLeave(to, from, next) {
        this.stopAutoRefresh();
        next();
    },
    data() {
        return {
            autoRefresh: null
        };
    },
    computed: {
        ...mapState(["bgMusic"])
    },
    mounted() {
        this.bgMusic.fade(0.0, 0.6, 1500);
        this.setAutoRefresh();
    },
    beforeDestroy() {
        this.stopAutoRefresh();
    },
    methods: {
        ...mapActions(["getData"]),
        getGames() {
            let payload = {mutation: "setGames", url: "/games"};
            this.getData(payload);
        },
        getPlayers() {
            let payload = {mutation: "setPlayers", url: "/players"};
            this.getData(payload);
        },
        setAutoRefresh() {
            let self = this;
            if (this.autoRefresh == null) {
                this.autoRefresh = setInterval(
                    function () {
                        if (this.$route.name === "lobby") {
                            self.getGames();
                            self.getPlayers();
                        } else this.stopAutoRefresh();
                    }.bind(this),
                    10000
                );
            }
        },
        stopAutoRefresh() {
            clearInterval(this.autoRefresh);
            this.autoRefresh = null;
        }
    }
};
</script>
<style scoped>
.bg-box {
    background-color: #3a4e5ec2;

    box-shadow: 0 0 53px 11px rgba(32, 46, 77, 0.8);
}
</style>
