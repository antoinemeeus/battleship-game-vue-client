<template>
  <v-app dark>
    <div class="background-image-fixed">
      <v-toolbar
        v-show="this.$route.name !== 'landingPage' || alreadyVisited"
        dense
        dark
        pa-3
      >
        <v-toolbar-side-icon to="/">
          <v-icon @click="soundEffects.play('registrationTick')">
            home
          </v-icon>
        </v-toolbar-side-icon>
        <v-btn
          to="/lobby"
          @click.native="soundEffects.play('registrationTick')"
        >
          <v-icon>fa-globe-europe</v-icon> <span class="px-2">Lobby</span>
        </v-btn>
        <v-toolbar-title>
          <span class="px-3  font-weight-light">Battleship Game </span>
        </v-toolbar-title>

        <v-spacer />
        <v-btn
          icon
          @click.prevent="soundOnOff()"
        >
          <v-icon
            v-show="musicPlaying"
            color="white"
          >
            volume_up
          </v-icon>
          <v-icon
            v-show="!musicPlaying"
            color="white"
          >
            volume_off
          </v-icon>
        </v-btn>
        <AvatarButton class="px-2" />
        <v-icon
          :class="{ refresh: this.$store.state.loading }"
          dark
          small
        >
          sync
        </v-icon>
      </v-toolbar>
      <v-content>
        <router-view />
      </v-content>
    </div>
  </v-app>
</template>

<script>
import AvatarButton from "./components/AvatarButton.vue";
import { mapState } from "vuex";
export default {
  name: "App",
  components: { AvatarButton },
  data() {
    return {};
  },
  computed: {
    ...mapState(["musicPlaying", "alreadyVisited", "soundEffects"])
  },
  mounted() {},
  methods: {
    soundOnOff() {
      if (this.musicPlaying) {
        this.$store.commit("stopMusic");
      } else {
        this.$store.commit("playMusic");
      }
    }
  }
};
</script>

<style scoped>
.background-image-fixed {
  min-height: 100vh;
  background-attachment: fixed;
  background-image: url("./assets/battle_ship_background.jpg");
}

.refresh {
  animation: rotation 2s infinite linear reverse;
}
@keyframes rotation {
  from {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
  }
}
</style>
