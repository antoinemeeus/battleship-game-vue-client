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
      <v-icon
        :class="{refresh:this.$store.state.loading}"
        dark
        small
      >sync</v-icon>
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

<style scoped>
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
