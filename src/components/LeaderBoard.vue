<template>
  <v-layout
    pa-0
    ma-0
  >
    <v-layout
      row
      wrap
      justify-center
      style="overflow:auto"
    >
      <v-flex
        xs12
        class="dark-bg"
      >
        <v-btn
          dark
          icon
          @click="getPlayers()"
        >
          <v-icon>fa-redo-alt</v-icon>
        </v-btn>
        <!-- <v-btn @click="playAgainstComputer()">Play Against Computer</v-btn> -->
      </v-flex>
      <v-flex xs12>
        <v-data-table
          class="table-height"
          :headers="headers"
          :items="presentPlayers"
          :pagination.sync="pagination"
          dark
          :loading="loading"
          hide-actions
        >
          <v-progress-linear
            v-slot:progress
            color="red"
            indeterminate
          ></v-progress-linear>
          <template
            slot="items"
            slot-scope="props"
          >
            <td class="text-xs-center subheading font-weight-light">
              {{ props.item.id }}
            </td>
            <td class="text-xs-right subheading font-weight-light">
              {{ props.item.userName }} - (<span class="body-1">{{ props.item.email }}</span>)
            </td>
            <td class="text-xs-center subheading font-weight-light">
              {{ props.item.total }}
            </td>
            <td class="text-xs-center subheading font-weight-light">
              {{ props.item.won }}
            </td>
            <td class="text-xs-center subheading font-weight-light">
              {{ props.item.lost }}
            </td>
            <td class="text-xs-center subheading font-weight-light">
              {{ props.item.tied }}
            </td>
          </template>
        </v-data-table>
        <div class="text-xs-center pt-2">
          <v-pagination
            v-show="pagination.totalItems > pagination.rowsPerPage"
            v-model="pagination.page"
            dark
            color="orange"
            :length="pages"
          ></v-pagination>
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import axios from "axios";
import { mapState, mapActions } from "vuex";
export default {
  data: () => ({
    pagination: {
      descending: true,
      rowsPerPage: 8,
      sortBy: "total",
      totalItems: null
    },
    headers: [
      {
        text: "Id",
        align: "center",
        value: "id",
        sortable: false
      },
      {
        text: "Player",
        align: "right",
        value: "player",
        sortable: false,
        class: "text-xs-right"
      },
      {
        text: "Total Score",
        align: "center",
        value: "total",
        class: "text-xs-center"
      },
      { text: "Won", align: "center", value: "won" },
      { text: "Lost", align: "center", value: "lost" },
      { text: "Tied", align: "center", value: "tied" }
    ],
    fetchedGames: []
  }),
  watch: {
    presentPlayers(newPPlayers) {
      this.pagination.totalItems = newPPlayers.length;
    }
  },
  computed: {
    ...mapState(["players", "loading"]),
    presentPlayers() {
      //flatten players.score to direct properties to make sortables items.
      let pPlayers = this.players.map(player => {
        player["total"] = player.score.total;
        player["won"] = player.score.won;
        player["lost"] = player.score.lost;
        player["tied"] = player.score.tied;
        return player;
      });

      return pPlayers.filter(player => player.total != 0);
    },
    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  },
  methods: {
    ...mapActions(["getData"]),
    getPlayers() {
      let payload = { mutation: "setPlayers", url: "/players" };
      this.getData(payload);
    },
    toPlayerBoard(id) {
      this.$router.push("/game?gp=" + id);
    }
  },
  created() {
    this.getPlayers();
  }
};
</script>

<style scoped>
.dark-bg {
  background-color: rgba(68, 69, 70, 0.822);
}
.table-height {
  max-height: 50vh;
  overflow-y: auto;
}
</style>
