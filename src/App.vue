<template>
  <v-app dark>
    <div class="background-fixed">
      <v-toolbar
        dense
        dark
        pa-3
      >
        <v-toolbar-side-icon to="/">

          <v-icon>home</v-icon>

        </v-toolbar-side-icon>
        <v-btn to="/lobby">
          <v-icon>fa-globe-europe</v-icon> <span class="px-2">Lobby</span>
        </v-btn>
        <v-toolbar-title>
          <span class="px-3  font-weight-light">Battleship Game </span>
        </v-toolbar-title>

        <v-spacer></v-spacer>
        <AvatarButton />
        <v-icon
          :class="{refresh:this.$store.state.loading}"
          dark
          small
        >sync</v-icon>

      </v-toolbar>
      <v-content>

        <router-view />

      </v-content>

    </div>
  </v-app>
</template>

<script>
import AvatarButton from "./components/AvatarButton.vue";
export default {
  name: "App",
  components: { AvatarButton },
  data() {
    return {
      //
    };
  }
};
</script>

<style scoped>
.background-fixed {
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
