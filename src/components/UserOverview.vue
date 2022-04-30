<template>
  <v-card
    class="mx-auto"
    color="transparent"
    dark
    flat
    max-width="800"
    min-width="350"
    min-height="212"
  >
    <v-card-title>
      <div
        v-if="isUser"
        class="px-2 title font-weight-light"
      >
        <span class="hidden-md-and-down">Captain on deck:</span>
        {{ user.userName }}!
      </div>
      <div
        v-if="!isUser && !waitingToJoin"
        class="px-2 title font-weight-light"
      >
        Your opponent: {{ user.userName }} !
      </div>
      <div
        v-if="!isUser && waitingToJoin"
        class="px-2 title font-weight-light"
      >
        Waiting for opponent to join
      </div>
    </v-card-title>
    <v-card-text v-if="waitingToJoin">
      <v-layout
        justify-center
        align-center
        fill-height
      >
        <v-progress-circular
          :size="100"
          color="primary"
          indeterminate
        />
      </v-layout>
    </v-card-text>
    <v-card-text v-if="!waitingToJoin">
      <v-layout row>
        <v-flex
          xs3
          align-self-center
          text-xs-center
        >
          <v-tooltip top>
            <template #activator="{ on }">
              <v-badge
                :color="isUserConnected ? 'green' : 'red'"
                left
                overlap
              >
                <template #badge>
                  <v-icon
                    dark
                    small
                    v-on="on"
                  >
                    {{ isUserConnected ? "fa-user" : "fa-user-alt-slash" }}
                  </v-icon>
                </template>
                <v-avatar
                  :size="80"
                  color="grey lighten-4"
                  class="avatar_hover"
                >
                  <img
                    :src="userAvatar.src"
                    :alt="userAvatar.name"
                  >
                </v-avatar>
              </v-badge>
            </template>
            <span>{{ isUserConnected ? "Player is connected" : "Player is disconnected" }}</span>
          </v-tooltip>
          <v-btn
            v-if="isUser && !isUserDefaultAnonymous"
            color="red"
            :loading="status === 'loading'"
            small
            :icon="$vuetify.breakpoint.mdAndDown"
            :round="$vuetify.breakpoint.mdAndDown"
            @click.stop="logOut()"
          >
            <span v-if="!$vuetify.breakpoint.mdAndDown">Logout</span>
            <v-icon
              v-if="$vuetify.breakpoint.mdAndDown"
            >
              fa-sign-out-alt
            </v-icon>
          </v-btn>
          <div v-if="isUserDefaultAnonymous">
            Please Login
          </div>
        </v-flex>
        <v-flex align-self-center>
          <v-flex class="subheading font-weight-bold">
            <span v-if="isUser">Your information & Statistics :</span>
            <span v-if="!isUser">Enemy information & Statistics :</span>
          </v-flex>
          <v-layout
            row
            class=" text-no-wrap"
          >
            <v-flex px-1>
              <v-layout
                fill-height
                column
              >
                <v-flex>
                  Email:<span class="orange--text"> {{ user.email }}</span>
                </v-flex>
                <v-flex>
                  Player id:
                  <span class="orange--text">{{ user.id }}</span>
                </v-flex>
                <!-- <v-flex>
                  Last move:
                  <span class="orange--text">{{ moment(user.lastPlayedDate).calendar() }}</span>
                </v-flex> -->
                <v-flex v-if="!isComputerMode">
                  Last Connected:
                  <span class="orange--text">{{ moment(user.lastConnectedDate).calendar() }} </span>
                </v-flex>
                <v-flex>
                  <div v-if="isUser && !isComputerMode">
                    Last Status:
                    <span class="orange--text"> {{ userActions }}</span>
                  </div>
                  <div v-if="!isUser && !isComputerMode">
                    Last Status:
                    <span class="orange--text"> {{ opponentActions }}</span>
                  </div>
                  <div v-if="isComputerMode">
                    Last Status:
                    <span class="orange--text"> Against computer</span>
                  </div>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex
              px-1
              hidden-sm-and-down
            >
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
import {mapState, mapGetters, mapActions} from "vuex";

export default {
  props: {
    isUser: {type: Boolean, default: true},
    user: {
      type: Object,
      default: () => ({
        avatarID: 11,
        id: "AI",
        lastPlayedDate: "",
        lastConnectedDate: "",
        userName: "NotAComputer",
        email: "SinkAllShips@Skynet.evil",
        score: {total: 0, won: 0, lost: 0, tied: 0}
      })
    },
    isUserConnected: {type: Boolean, default: true}
  },
  data: () => ({}),
  computed: {
    ...mapState(["avatarList", "avatarComputer", "status"]),
    ...mapGetters(["gameStateCode"]),
    isComputerMode() {
      return this.$route.name === "computer";
    },
    isUserDefaultAnonymous() {
      return this.user.id == null;
    },
    userAvatar() {
      let avatarFound = this.avatarList.find(
        avatar => avatar.id === this.user.avatarID
      );
      if (avatarFound !== undefined && avatarFound != null) return avatarFound;
      if (this.user.id === "AI") return this.avatarComputer;
      return this.avatarList[0];
    },
    waitingToJoin() {
      return this.gameStateCode === "0" && !this.isUser;
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
  },
  methods: {
    ...mapActions(["authRequest"]),
    logOut() {
      let payload = {
        data: {},
        rqUrl: "/logout"
      };
      this.authRequest(payload).then(
        res => {
          this.$router.push("/").catch(err => {
          });
        },
        err => {
          console.log(
            "Error login out with userOverview",
            err.response || err.request
          );
        }
      );
    }
  }
};
</script>
