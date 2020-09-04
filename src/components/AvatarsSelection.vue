<template>
  <v-menu
    v-model="menu"
    :disabled="fixed"
    transition="scale-transition"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-bind="{
          small: $vuetify.breakpoint.smAndDown,
          large: $vuetify.breakpoint.xl
        }"
        fab
        icon
        :disabled="fixed"
        v-on="on"
      >
        <v-avatar
          :size="avatarSize"
          color="grey lighten-4"
        >
          <img
            :src="selectedAvatar.src"
            :alt="selectedAvatar.name"
          >
        </v-avatar>
      </v-btn>
    </template>
    <v-container
      v-if="!fixed"
      white
      v-bind="{ [`grid-list-${gridListSize}`]: true }"
      fluid
    >
      <v-layout
        row
        wrap
        justify-space-around
      >
        <v-flex
          v-for="avatar in avatarList"
          :key="avatar.id"
          xs3
          @click="$emit('input', avatar.id)"
        >
          <v-avatar
            :size="avatarSize"
            color="grey lighten-4"
            class="avatar_hover"
            @mouseenter="soundEffects.play('registrationTick', true)"
          >
            <img
              :src="avatar.src"
              :alt="avatar.name"
            >
          </v-avatar>

          <!-- {{avatar.name}} -->
        </v-flex>
      </v-layout>
    </v-container>
  </v-menu>
</template>

<script>
import {mapState} from "vuex";

export default {
  props: {
    value: {type: Number, default: 1},
    fixed: {type: Boolean, default: false}
  },
  data: () => ({
    menu: false
  }),
  computed: {
    ...mapState(["gamesInfo", "avatarList", "soundEffects"]),
    gridListSize() {
      return this.$vuetify.breakpoint.name;
    },
    buttonSize() {
      switch (this.$vuetify.breakpoint.name) {
        case "xs":
          return "small";
        case "sm":
          return "small";
        case "lg":
          return "large";
        case "xl":
          return "large";
        default:
          return "large";
      }
    },
    avatarSize() {
      switch (this.$vuetify.breakpoint.name) {
        case "xs":
          return "30";
        case "sm":
          return "40";
        case "md":
          return "55";
        case "lg":
          return "60";
        case "xl":
          return "70";
        default:
          return "55";
      }
    },
    selectedAvatar() {
      let avatarFound = this.avatarList.find(avatar => avatar.id === this.value);
      if (avatarFound !== undefined && avatarFound != null) return avatarFound;
      return this.avatarList[0];
    }
  },
  created() {
  },
  methods: {}
};
</script>

<style scoped>
.avatar_hover {
  content: "";
}

.avatar_hover:hover {
  box-shadow: 0 0 11px rgba(33, 33, 33, 0.2);
  cursor: pointer;
}
</style>
