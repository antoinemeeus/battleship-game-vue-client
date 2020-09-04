<template>
  <v-container
    pa-0
    ma-0
    fluid
  >
    <fieldset class="fleet-box">
      <legend class="legend-box title text-xs-center">
        {{ fleetName }}
      </legend>
      <v-layout
        column
        px-1
        class="metal-bg"
      >
        <v-flex
          v-for="ship in ships"
          :key="ship.type"
          py-2
        >
          <v-card class="card-style">
            <v-img
              :src="ship.imgUrl"
              :width="(ship.length / 5) * 100 + '%'"
              :top="getShipSunk(ship) ? '-50px' : ''"
              class="background-boat-image"
            >
              <v-scale-transition group>
                <div
                  v-for="i in getShipDamage(ship)"
                  :key="ship.type + '_' + i"
                  class="damage"
                  :style="explosionStyle(i, ship)"
                />
              </v-scale-transition>
            </v-img>
            <v-layout
              justify-space-between
              align-baseline
              class="water-line"
              :style="{ fontSize: fontSize }"
            >
              <span class=" text-capitalize text-truncate white--text pl-2">{{
                ship.type
              }}</span>
              <span class=" white--text pr-2">
                {{
                  fleetHasDamageInfo
                    ? getShipDamage(ship)
                    : getShipSunk(ship)
                      ? ship.length
                      : "?"
                }}/{{ ship.length }}</span>
            </v-layout>
            <v-expand-transition>
              <div
                v-if="getShipSunk(ship)"
                class="overlay"
              >
                <h3 class="headline">
                  SUNKEN
                </h3>
              </div>
            </v-expand-transition>
          </v-card>
        </v-flex>
      </v-layout>
    </fieldset>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  components: {},
  props: ["fleetState", "imageBaseWidth", "fleetName"],
  data() {
    return {
      ships: [
        {
          type: "carrier",
          length: 5,
          dmg: 0,
          sunk: false,
          imgUrl: require("../assets/Carrier/Carrier_FrontView_2.png")
        },
        {
          type: "battleship",
          sunk: false,
          length: 4,
          dmg: 0,
          imgUrl: require("../assets/Battleship/Battleship_FrontView_2.png")
        },
        {
          type: "destroyer",
          sunk: false,
          length: 3,
          dmg: 0,
          imgUrl: require("../assets/Destroyer/Destroyer_FrontView_2.png")
        },
        {
          type: "submarine",
          sunk: false,
          length: 3,
          dmg: 0,
          imgUrl: require("../assets/Submarine/Submarine_FrontView_2.png")
        },
        {
          type: "patrolboat",
          sunk: false,
          length: 2,
          dmg: 0,
          imgUrl: require("../assets/PatrolBoat/PatrolBoat_FrontView_2.png")
        }
      ]
    };
  },
  watch: {
    //Sound logic
    fleetState(newVal, oldVal) {
      if (newVal !== undefined && newVal !== null && oldVal !== undefined) {
        for (let ship of this.ships) {
          if (newVal[ship.type].sunk && !oldVal[ship.type].sunk) {
            //On opponent sound
            if (newVal[ship.type].damage === undefined)
              setTimeout(() => this.soundEffects.play("targetDestroyed"), 1000);
            //On current sound
            else {
              let randomNb = Math.floor(Math.random() * 3) + 1;
              setTimeout(
                () => this.soundEffects.play("userShipDestroyed" + randomNb),
                2000
              );
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapState(["soundEffects"]),
    fontSize() {
      switch (this.$vuetify.breakpoint.name) {
        case "xs":
          return "0.6em";
        case "sm":
          return "0.75em";
        case "xl":
          return "1.7em";
        default:
          return "1em";
      }
    },
    fleetHasDamageInfo() {
      return !!(this.fleetState && this.fleetState.carrier.hasOwnProperty("damage"));

    }
  },
  methods: {
    getShipDamage(ship) {
      if (this.fleetState && this.fleetState[ship.type]) {
        let isShipSunk = this.fleetState[ship.type].sunk;
        if (isShipSunk) return ship.length;
        if (this.fleetState[ship.type].damage)
          return this.fleetState[ship.type].damage;
      }
      return 0;
    },
    getShipSunk(ship) {
      if (this.fleetState && this.fleetState[ship.type])
        return this.fleetState[ship.type].sunk;
      return false;
    },
    explosionStyle(index, ship) {
      return {
        content: " ",
        width: 100 / ship.length + "%",
        left: (100 / ship.length) * (index - 1) + "%"
      };
    }
  }
};
</script>

<style scoped>
.fleet-box {
  border: 3px #5e5a5a solid;
  background-image: url("../assets/textures/metal_plates.jpg");
  background-repeat: repeat;
  background-size: 100% 100%;
  background-color: #6c7b87;
}

.legend-box {
  background-color: #979aa1;
  /* border: 2px grey solid; */
}
.card-style {
  border-radius: 6px;
  /* background: radial-gradient(
    ellipse at center,    
    rgba(86, 224, 253, 1) 0%,
    rgba(83, 203, 241, 1) 26%,
    rgba(83, 203, 241, 1) 57%,
    rgba(5, 171, 224, 1) 100%
  ); */
  /* background: linear-gradient(to bottom, #2473ab 0%, #1e528e 70%, #5b7983 100%);
  background: linear-gradient(to bottom, #2d91c2 0%, #1e528e 100%); */
  /* background: linear-gradient(to bottom, #57c1eb 0%, #246fa8 100%); */
  background: linear-gradient(to bottom, #90dffe 0%, #38a3d1 100%);
  /* background: linear-gradient(to bottom, #1e528e 0%, #728a7c 50%, #e9ce5d 100%); */
  /* background: linear-gradient(
    to bottom,
    #154277 0%,
    #576e71 30%,
    #e1c45e 70%,
    #b26339 100%
  ); */
}
.ship-container {
  position: relative;
}
.water-line {
  /* background-color: #203a58; */
  background: #373b44; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to bottom,
    #4286f4,
    #373b44
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to bottom,
    #4286f4,
    #373b44
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  width: inherit;
  height: 100%;
  z-index: 1;
}
.damage {
  position: absolute;
  z-index: 2;
  height: 100%;
  background-size: contain;
  background-position: center;
  /* background-image: url("../assets/explosion/Explosion&Smoke.png"); */
  background-image: url("../assets/explosion/explosion.png");
  opacity: 0.8;
}
.overlay {
  position: absolute;
  background-color: crimson;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.6;
  border-radius: 6px;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
