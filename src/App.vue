<template>
  <v-app>
    <v-toolbar
      dense
      dark
    >
      <v-btn
        icon
        to="/"
      >
        <v-icon>home</v-icon>
      </v-btn>
      <v-toolbar-title class="">
        <span class="px-3 font-weight-light">Battleship Game </span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <AvatarButton />
      <v-btn
        icon
        to="/lobby"
      >
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-parallax
        dark
        height="1100"
        :src="require('@/assets/battle_ship_background.jpg')"
      >
        <router-view />
      </v-parallax>
    </v-content>
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
  },

  created() {}
};
</script>

<style></style>
