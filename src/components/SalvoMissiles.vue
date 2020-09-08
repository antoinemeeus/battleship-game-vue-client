<template>
  <fieldset>
    <legend class="missile-legend subheading text-xs-center">
      Missiles
    </legend>
    <v-layout row>
      <v-flex
        v-for="m in missileNumber"
        :key="m"
      >
        <v-img
          v-if="m <= missileLeft"
          :src="require('../assets/missiles/missile_2.png')"
          class="image-missile-big"
        />
        <v-img
          v-else
          :src="require('../assets/missiles/missile_2_used.png')"
          class="image-missile-big"
        />
      </v-flex>
    </v-layout>
  </fieldset>
</template>

<script>
export default {
  components: {},
  props: ["salvoSize", "missileNumber"],
  data() {
    return {};
  },
  create() {
  },
  computed: {
    missileLeft() {
      return this.missileNumber - this.salvoSize;
    }
  },
  beforeDestroy() {
  },
  methods: {}
};
</script>

<style scoped>
.missile-legend {
  border: 2px grey solid;
}

.image-missile-big {
  width: inherit;
}

.image-missile-small {
  width: 20px;
}
</style>
