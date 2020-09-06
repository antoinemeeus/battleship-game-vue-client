<template>
  <div>
    <v-menu
      v-model="menu"
      offset-y
      nudge-left="50%"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          fab
          icon
          small
        >
          <v-avatar
            :size="40"
            color="grey lighten-4"
            v-on="on"
          >
            <img
              :src="selectedAvatar.src"
              :alt="selectedAvatar.name"
            >
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
        <v-list-tile
          v-if="!isAuthenticated"
          @click.stop="openModal"
        >
          <v-list-tile-avatar
            tile
            :size="30"
          >
            <v-icon color="green">
              fa-sign-in-alt
            </v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title pr-2>
              Connect
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="isAuthenticated"
        >
          <v-list-tile-content>
            <v-list-tile-title pr-2>
              Connected as {{ currentUser.userName }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="isAuthenticated"
        >
          <v-list-tile-content>
            <v-list-tile-title pr-2>
              User id {{ currentUser.id }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-if="isAuthenticated"
          @click="logOut"
        >
          <v-list-tile-avatar
            tile
            :size="30"
          >
            <v-icon color="red">
              fa-sign-out-alt
            </v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title pr-2>
              Log out
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>
    <v-dialog
      v-model="dialog"
      max-width="500"
    >
      <v-flex shrink>
        <Registration @loginSuccess="closeModal"/>
      </v-flex>
    </v-dialog>
  </div>
</template>

<script>
import Registration from "../components/Registration.vue";
import {mapState, mapActions, mapGetters} from "vuex";

export default {
  components: {
    Registration
  },
  data: () => ({
    menu: false,
    dialog: false,
    avatarID: 1
  }),
  computed: {
    ...mapState(["loading", "avatarList"]),
    ...mapGetters(["currentUser", "isAuthenticated"]),
    selectedAvatar() {
      return this.avatarList.find(av => av.id === this.currentUser.avatarID);
    }
  },
  mounted() {
    this.valid = false;
  },
  methods: {
    ...mapActions(["authRequest", "postData", "getData"]),
    openModal() {
      this.dialog = true;
    },
    closeModal(value) {
      if (value)
        setTimeout(() => {
          this.dialog = false;
        }, 2500);
    },
    logOut(e) {
      let payload = {
        data: {},
        rqUrl: "/logout"
      };
      this.authRequest(payload).then(
        res => {
          this.menu = false;
          this.$router.push("/").catch(err => {
          });
        },
        err => {
        }
      );
      e.preventDefault();
    }
  }
};
</script>

<style></style>
