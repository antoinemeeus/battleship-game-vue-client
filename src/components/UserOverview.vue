<template>
  <v-card
    class="mx-auto"
    color="#373d5598"
    dark
    flat
    max-width="800"
    min-width="350"
    min-height="212"
  >
    <v-card-title>
      <div v-if="isUser" class="px-2 title font-weight-light">
        <span class="hidden-md-and-down">Welcome to the battlefield,</span>
        Captain {{ user.userName }}!
      </div>
      <div
        v-if="!isUser && !waitingTojoin"
        class="px-2 title font-weight-light"
      >
        Your opponent: {{ user.userName }} !
      </div>
      <div v-if="!isUser && waitingTojoin" class="px-2 title font-weight-light">
        Waiting for opponent to join
      </div>
    </v-card-title>
    <v-card-text v-if="waitingTojoin">
      <v-layout justify-center align-center fill-height>
        <v-progress-circular
          :size="100"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-layout>
    </v-card-text>
    <v-card-text v-if="!waitingTojoin">
      <v-layout row>
        <v-flex xs3 align-self-center>
          <v-avatar :size="80" color="grey lighten-4" class="avatar_hover">
            <img :src="userAvatar.src" :alt="userAvatar.name" />
          </v-avatar>
        </v-flex>
        <v-flex align-self-center>
          <v-flex class="subheading font-weight-bold">
            <span v-if="isUser">Your informations & Statistics :</span>
            <span v-if="!isUser">Enemy informations & Statistics :</span>
          </v-flex>
          <v-layout row class=" text-no-wrap">
            <v-flex px-1>
              <v-layout fill-height column>
                <v-flex>
                  Email:<span class="orange--text"> {{ user.email }}</span>
                </v-flex>
                <v-flex>
                  Player id:
                  <span class="orange--text">{{ user.id }}</span>
                </v-flex>
                <v-flex>
                  <div v-if="isUser">
                    <span class="orange--text">{{ userActions }}</span>
                  </div>
                  <div v-if="!isUser">
                    <span class="orange--text">{{ opponentActions }}</span>
                  </div>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex px-1 hidden-sm-and-down>
              <v-layout column>
                <v-flex>
                  <v-layout justify-space-between>
                    <span>Total:</span>
                    <span class="orange--text">{{ user.score.total }}</span>
                  </v-layout>
                </v-flex>
                <v-flex>
                  <v-layout justify-space-between>
                    <span>Wins:</span>
                    <span class="orange--text">{{ user.score.won }}</span>
                  </v-layout>
                </v-flex>
                <v-flex>
                  <v-layout justify-space-between>
                    <span>Loses:</span>
                    <span class="orange--text">{{ user.score.lost }}</span>
                  </v-layout>
                </v-flex>
                <v-flex>
                  <v-layout justify-space-between>
                    <span>Ties: </span>
                    <span class="orange--text">{{ user.score.tied }}</span>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  props: {
    isUser: { type: Boolean, default: true },
    user: {
      type: Object,
      default: () => ({
        avatarID: 11,
        id: "AI",
        userName: "NotAComputer",
        email: "SinkAllShips@Skynet.evil",
        score: { total: 0, won: 0, lost: 0, tied: 0 }
      })
    }
  },
  data: () => ({}),
  computed: {
    ...mapState(["avatarList", "avatarComputer"]),
    ...mapGetters(["gameStateCode"]),
    userAvatar() {
      let avatarFound = this.avatarList.find(
        avatar => avatar.id == this.user.avatarID
      );
      if (avatarFound != undefined && avatarFound != null) return avatarFound;
      if (this.user.id === "AI") return this.avatarComputer;
      return this.avatarList[0];
    },
    waitingTojoin() {
      return this.gameStateCode == "0" && !this.isUser;
    },
    userActions() {
      switch (this.gameStateCode) {
        case "-2":
          return "";
        case "1":
          return "Placing Ships";
        case "5":
          return "Game finished";
        case "3":
          return "Waiting for opponent";
        case "4":
          return "Placing salvo!";
        default:
          return "Waiting for opponent...";
      }
    },
    opponentActions() {
      switch (this.gameStateCode) {
        case "-2":
          return "";
        case "2":
          return "Placing Ships";
        case "5":
          return "Game finished";
        case "3":
          return "Placing salvo!";
        case "4":
          return "Waiting for you!";
        default:
          return "Waiting for opponent...";
      }
    }
  }
};
</script>

<style scoped></style>
