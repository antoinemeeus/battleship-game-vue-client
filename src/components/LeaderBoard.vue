<template>
  <v-layout
    ma-0
    pa-0
  >
    <v-layout
      justify-center
      row
      style="overflow:auto"
      wrap
    >
      <v-flex
        class="dark-bg"
        xs12
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
          :headers="headers"
          :items="presentPlayers"
          :loading="loading"
          :pagination.sync="pagination"
          class="table-height"
          dark
          hide-actions
        >
          <v-progress-linear
            color="red"
            indeterminate
          />
          <template
            slot="items"
            slot-scope="props"
          >
            <td class="text-xs-center subheading font-weight-light">
              {{ props.item.id }}
            </td>
            <td class="text-xs-right subheading font-weight-light">
              {{ props.item.userName }} - (<span class="body-1">{{
                props.item.email
              }}</span>)
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
            :length="pages"
            color="orange"
            dark
          />
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import {mapActions, mapState} from "vuex";

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
            {text: "Won", align: "center", value: "won"},
            {text: "Lost", align: "center", value: "lost"},
            {text: "Tied", align: "center", value: "tied"}
        ],
        fetchedGames: []
    }),
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

            return pPlayers.filter(player => player.total !== 0);
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
    watch: {
        presentPlayers(newPPlayers) {
            this.pagination.totalItems = newPPlayers.length;
        }
    },
    created() {
        this.getPlayers();
    },
    methods: {
        ...mapActions(["getData"]),
        getPlayers() {
            let payload = {mutation: "setPlayers", url: "/players"};
            this.getData(payload);
        },
        toPlayerBoard(id) {
            this.$router.push("/game?gp=" + id);
        }
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
