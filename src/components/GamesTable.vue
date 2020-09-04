<template>
  <v-layout
      pa-0
      ma-0
      justify-center
      column
  >
    <v-alert
        :value="alert"
        :type="alertType"
        transition="scale-transition"
    >
      {{ alertMsg }}
    </v-alert>
    <v-layout
        row
        wrap
        justify-center
    >
      <v-flex
          xs12
          class="dark-bg"
      >
        <v-btn
            dark
            icon
            @click="getGames()"
        >
          <v-icon>fa-redo-alt</v-icon>
        </v-btn>
        <v-btn
            v-if="isAuthenticated"
            dark
            color="green"
            @click="createGame()"
        >
          <v-icon>fa-plus</v-icon>
          <span class="px-2">Create New Game</span>
        </v-btn>
        <v-dialog
            v-model="dialog"
            max-width="500"
        >
          <v-flex shrink>
            <Registration @loginSuccess="closeModal"/>
          </v-flex>
        </v-dialog>
        <!-- <v-btn @click="playAgainstComputer()">Play Against Computer</v-btn> -->
      </v-flex>
      <v-flex
          xs12
          class="anchor"
      >
        <div :class="[{ 'wrapper-abs-btn dark-bg': !isAuthenticated }]">
          <v-btn
              v-if="!isAuthenticated"
              large
              depressed
              :loading="loading && dialog"
              dark
              color="green"
              class="absolute-center"
              @click="openModal()"
          >
            <v-icon>fa-sign-in-alt</v-icon>
            <span class="px-2">Login to create New Game</span>
          </v-btn>
        </div>
        <div>
          <v-data-table
              :headers="headers"
              :items="presentGames"
              :pagination.sync="pagination"
              class="table-height"
              dark
              hide-actions
              :loading="loading"
          >
            <v-progress-linear
                v-slot:progress
                color="red"
                indeterminate
            />
            <template
                slot="items"
                slot-scope="props"
            >
              <tr :class="props.item.isFinished ? 'finished-row-bg' : ''">
                <td class="text-xs-center px-1 table-bg">
                  {{ props.item.id }}
                </td>
                <td class="text-xs-center px-1 table-bg">
                  {{ moment(props.item.created).calendar() }}
                </td>
                <td class="table-bg">
                  <v-layout
                      v-if="isAuthenticated && !props.item.isFinished"
                      align-center
                      justify-space-between
                  >
                    <div>
                      <v-avatar
                          :size="22"
                          color="grey lighten-4"
                      >
                        <img
                            :src="playerAvatar(props.item.avatarP1).src"
                            :alt="playerAvatar(props.item.avatarP1).name"
                        >
                      </v-avatar>
                      <span
                          class="pl-2"
                      >{{ props.item.player1 }} -
                        {{ props.item.p1_.email }}</span>
                    </div>
                    <v-btn
                        v-if="props.item.p1_.isUser"
                        :color="btnEnterColor"
                        @click="toPlayerBoard(props.item.p1_.gp_id)"
                    >
                      Enter
                    </v-btn>
                    <v-btn
                        v-else-if="!props.item.p1_.isJoined"
                        :color="btnJoinColor"
                        @click="joinGame(props.item.id)"
                    >
                      Join
                    </v-btn>
                  </v-layout>
                  <v-layout
                      v-else
                      justify-space-between
                      align-center
                  >
                    <div>
                      <v-avatar
                          :size="22"
                          color="grey lighten-4"
                      >
                        <img
                            :src="playerAvatar(props.item.avatarP1).src"
                            :alt="playerAvatar(props.item.avatarP1).name"
                        >
                      </v-avatar>
                      <span class="pl-2">{{ props.item.p1_.name }}</span>
                    </div>
                    <v-chip
                        v-if="props.item.isFinished"
                        light
                        :color="
                        props.item.p1_.result == 'won'
                          ? 'yellow'
                          : props.item.p1_.result == 'tie'
                            ? 'cyan'
                            : 'red lighten-3'
                      "
                        class="text-uppercase"
                    >
                      <v-icon>
                        {{
                          props.item.p1_.result == "won"
                              ? "star"
                              : props.item.p1_.result == "tie"
                              ? "fa-equals"
                              : "fa-skull-crossbones"
                        }}
                      </v-icon>
                      <span class="pl-2">{{ props.item.p1_.result }}</span>
                    </v-chip>
                  </v-layout>
                </td>
                <td class=" table-bg">
                  <v-layout
                      v-if="isAuthenticated && !props.item.isFinished"
                      align-center
                      justify-space-between
                  >
                    <div>
                      <v-avatar
                          :size="20"
                          color="grey lighten-4"
                      >
                        <img
                            :src="playerAvatar(props.item.avatarP2).src"
                            :alt="playerAvatar(props.item.avatarP2).name"
                        >
                      </v-avatar>
                      <span class="pl-2">{{ props.item.p2_.name }}</span>
                    </div>
                    <v-btn
                        v-if="props.item.p2_.isUser"
                        :color="btnEnterColor"
                        @click="toPlayerBoard(props.item.p2_.gp_id)"
                    >
                      Enter
                    </v-btn>
                    <v-btn
                        v-else-if="
                        !props.item.p2_.isJoined && !props.item.p1_.isUser
                      "
                        :color="btnJoinColor"
                        @click="joinGame(props.item.id)"
                    >
                      Join
                    </v-btn>
                  </v-layout>
                  <v-layout
                      v-else
                      justify-space-between
                      align-center
                  >
                    <div>
                      <v-avatar
                          :size="20"
                          color="grey lighten-4"
                      >
                        <img
                            :src="playerAvatar(props.item.avatarP2).src"
                            :alt="playerAvatar(props.item.avatarP2).name"
                        >
                      </v-avatar>
                      <span class="pl-2">{{ props.item.p2_.name }}</span>
                    </div>
                    <v-chip
                        v-if="props.item.isFinished"
                        light
                        :color="
                        props.item.p2_.result == 'won'
                          ? 'yellow'
                          : props.item.p2_.result == 'tie'
                            ? 'cyan'
                            : 'red lighten-3'
                      "
                        class="text-uppercase"
                    >
                      <v-icon>
                        {{
                          props.item.p2_.result == "won"
                              ? "star"
                              : props.item.p2_.result == "tie"
                              ? "fa-equals"
                              : "fa-skull-crossbones"
                        }}
                      </v-icon>
                      <span class="pl-2">{{ props.item.p2_.result }}</span>
                    </v-chip>
                  </v-layout>
                </td>
                <td class="subheading font-weight-light table-bg">
                  {{ props.item.status }}
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
        <div class="text-xs-center pt-2">
          <v-pagination
              v-show="pagination.totalItems > pagination.rowsPerPage"
              v-model="pagination.page"
              dark
              color="orange"
              :length="pages"
          />
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import Registration from "./Registration.vue";
import axios from "axios";
import {mapState, mapGetters, mapActions} from "vuex";

export default {
  components: {
    Registration
  },
  data: () => ({
    dialog: false,
    headers: [
      {
        text: "Game Id",
        align: "center",
        value: "id",
        class: "px-1 table-bg"
      },
      {
        text: "Created at",
        align: "center",
        value: "created",
        class: "table-bg"
      },
      {text: "Player 1", value: "player1", class: "table-bg"},
      {text: "Player 2", value: "player2", class: "table-bg"},
      {text: "Status", value: "status", class: "table-bg px-1"}
      // { text: "Action", value: "actionObj", class: "px-1" }
    ],
    pagination: {
      descending: true,
      rowsPerPage: 8,
      sortBy: "created",
      totalItems: null
    },
    fetchedGames: [],
    alert: false,
    alertType: "info",
    alertMsg: "",
    btnEnterColor: "amber darken-3",
    btnJoinColor: "blue"
  }),
  computed: {
    ...mapState(["gamesInfo", "loading", "avatarList"]),
    ...mapGetters(["currentUser", "isAuthenticated"]),
    pages() {
      if (
          this.pagination.rowsPerPage == null ||
          this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
          this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    presentGames() {
      function formatPlayer(playerObj) {
        return playerObj.userName || "-No username saved-";
      }

      let newGameList = [];
      if (this.gamesInfo.games) {
        newGameList = this.gamesInfo.games.map(game => {
          let status = "In progress";
          let isFinished = false;
          let action = {actionType: 0, id: null};
          let p1_ = {
            isUser: false,
            isJoined: false,
            player_id: null,
            gp_id: null,
            name: "Waiting for player",
            avatarID: null,
            score: null,
            result: ""
          };
          let p2_ = {
            isUser: false,
            isJoined: false,
            player_id: null,
            avatarID: null,
            gp_id: null,
            name: "Waiting for player",
            score: null,
            result: ""
          };

          if (game.gamePlayers[0]) {
            p1_.name = formatPlayer(game.gamePlayers[0].player);
            p1_.avatarID = game.gamePlayers[0].player.avatarID;
            p1_.player_id = game.gamePlayers[0].player.id;
            p1_.gp_id = game.gamePlayers[0].id;
            p1_.isJoined = true;
            if (this.currentUser.id === p1_.player_id) {
              p1_.isUser = true;
              p2_.isUser = false;
            }
          }
          if (game.gamePlayers[1]) {
            p2_.name = formatPlayer(game.gamePlayers[1].player);
            p2_.avatarID = game.gamePlayers[1].player.avatarID;
            p2_.player_id = game.gamePlayers[1].player.id
            p2_.gp_id = game.gamePlayers[1].id;
            p2_.isJoined = true;
            if (this.currentUser.id === p2_.player_id) {
              p2_.isUser = true;
              p1_.isUser = false;
            }
          }

          if (game.scores.length >= 2) {
            isFinished = true;
            status =
                "Finished - " + this.moment(game.scores[0].finishDate).calendar();
            game.scores.map(sc => {
              if (sc.playerID == p1_.player_id) {
                p1_.score = sc.score;
              }
              if (sc.playerID == p2_.player_id) {
                p2_.score = sc.score;
              }
            });

            if (p1_.score > p2_.score) {
              p1_.result = "won";
              p2_.result = "lost";
            }
            if (p1_.score < p2_.score) {
              p1_.result = "lost";
              p2_.result = "won";
            }
            if (p1_.score == p2_.score) {
              p1_.result = "tie";
              p2_.result = "tie";
            }
          }

          if (!isFinished) {
            //Enter
            if (p1_.isUser) {
              action.actionType = 1;
              action.id = p1_.gp_id;
            }
            if (p2_.isUser) {
              action.actionType = 1;
              action.id = p2_.gp_id;
            }
          }

          game["p1_"] = p1_;
          game["p2_"] = p2_;
          game["player1"] = p1_.name;
          game["player2"] = p2_.name;
          game["avatarP1"] = p1_.avatarID;
          game["avatarP2"] = p2_.avatarID;
          game["status"] = status;
          game["isFinished"] = isFinished;
          game["actionObj"] = action;
          return game;
        });
      }
      this.pagination.totalItems = newGameList.length;
      return newGameList;
    }
  },
  methods: {
    ...mapActions(["getData", "postData"]),
    playerAvatar(p_avatar) {
      if (p_avatar == null) return this.avatarList[0];
      return this.avatarList.find(av => av.id == p_avatar);
    },
    openModal() {
      this.dialog = true;
    },
    closeModal(value) {
      if (value)
        setTimeout(() => {
          this.dialog = false;
        }, 2500);
    },
    handleSuccessAlertMsgs(response, msg) {
      this.alert = true;
      this.alertType = "success";
      this.alertMsg = msg + " Successfully: " + response.status;
      setTimeout(() => {
        this.alert = false;
        this.alertMsg = "";
      }, 2000);
    },
    handleErrorAlertMsgs(error, msg) {
      this.alertType = "error";

      if (error.response) {
        this.alertMsg = msg + " failed: " + error.response.data.error;
      } else if (error.request) {
        this.alertMsg = msg + " failed : Request Error: " + error.request;
      } else {
        this.alertMsg =
            requestType + msg + "failed : Settings error:" + error.message;
      }
      this.alert = true;
      setTimeout(() => {
        this.alert = false;
        this.alertMsg = "";
      }, 5000);
    },
    getGames() {
      let payload = {mutation: "setGames", url: "/games"};
      this.getData(payload);
    },
    clearGameView() {
      this.$store.commit("setGameDisplayed", {});
    },
    createGame() {
      let payload = {data: {}, rqUrl: "/games"};
      let msgIntro = "Game Creation";
      //Erase memory in store:
      this.clearGameView();
      this.postData(payload).then(
          res => {
            this.handleSuccessAlertMsgs(res, msgIntro);
            if (res.data.gpid) this.toPlayerBoard(res.data.gpid);
            else {
              this.handleErrorAlertMsgs(
                  {
                    message: "Couldn't find gpid in Server response"
                  },
                  msgIntro
              );
            }
          },
          err => {
            this.handleErrorAlertMsgs(err, msgIntro);
          }
      );
    },
    playAgainstComputer() {
      this.clearGameView();
      this.$router.push("/game_vs_computer");
    },
    joinGame(id) {
      this.clearGameView();
      let payload = {
        data: {},
        rqUrl: "/game/" + id + "/players"
      };
      let msgIntro = "Game Joining";
      this.postData(payload).then(
          res => {
            this.handleSuccessAlertMsgs(res, msgIntro);
            if (res.data.gpid) this.toPlayerBoard(res.data.gpid);
            else {
              this.handleErrorAlertMsgs(
                  {
                    message: "Couldn't find gpid in Server Response!"
                  },
                  msgIntro
              );
            }
          },
          err => {
            this.handleErrorAlertMsgs(err, msgIntro);
          }
      );
    },
    toPlayerBoard(id) {
      this.clearGameView();
      this.$router.push("/game?gp=" + id);
    }
  },
  watch: {
    isAuthenticated() {
      this.getGames();
    }
  },
  created() {
    this.getGames();
  }
};
</script>
<style scoped>
.table-height {
  max-height: 50vh;
  overflow-y: auto;
}

.finished-row-bg {
  background-color: rgba(80, 102, 105, 0.623);
}

.dark-bg {
  background-color: rgba(68, 69, 70, 0.822);
}

.anchor {
  position: relative;
}

.wrapper-abs-btn {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

<style>
/* OverWrite Vuetify class */
.v-datatable__progress {
  height: 3px !important;
}
</style>
