<template>
  <v-container pa-0 ma-0>
    <v-layout row wrap justify-center style="overflow:auto">
      <v-flex xs12 class="dark-bg">
        <v-btn dark icon @click="getPlayers()">
          <v-icon>fa-redo-alt</v-icon>
        </v-btn>
        <!-- <v-btn @click="playAgainstComputer()">Play Against Computer</v-btn> -->
      </v-flex>
      <v-flex xs12>
        <v-data-table
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
          <template slot="items" slot-scope="props">
            <td class="text-xs-center subheading font-weight-light">
              {{ props.item.id }}
            </td>
            <td class="text-xs-right subheading font-weight-light">
              {{ props.item.userName }} / {{ props.item.email }}
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
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import { mapState, mapActions } from "vuex";
export default {
  data: () => ({
    pagination: {
      sortBy: "total",
      descending: true
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
  computed: {
    ...mapState(["players", "loading"]),

    presentPlayers() {
      //flatten players.score to direct properties to make sortables items.
      return this.players.map(player => {
        player["total"] = player.score.total;
        player["won"] = player.score.won;
        player["lost"] = player.score.lost;
        player["tied"] = player.score.tied;
        return player;
      });
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
</style>
