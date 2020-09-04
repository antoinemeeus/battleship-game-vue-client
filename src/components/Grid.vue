<template>
  <div
    :id="assignedID"
    :ref="assignedID"
    class="grid"
    :style="gridDimensionObject"
  >
    <!-- Here is where the ships will be injected (HTML wise) -->
    <slot />
    <!-- ----- -->
    <!-- Loader Overlay -->
    <div
      v-if="blockSalvoGrid"
      class="loading"
    >
      <v-layout
        justify-center
        align-center
        fill-height
      >
        <v-progress-circular
          :size="(cellSize * gridSize) / 2"
          color="primary"
          indeterminate
        />
      </v-layout>
    </div>
    <div
      class="grid-cell cell-header top-header left-header"
      :style="cellSizeStyleObject"
    >
      \
    </div>
    <div
      v-for="x in gridSize"
      :key="'H-' + x"
      class="grid-cell cell-header top-header"
      :style="cellSizeStyleObject"
    >
      {{ x }}
    </div>

    <div
      v-for="i in gridSize"
      :key="'R-' + i"
    >
      <div
        class="grid-cell cell-header left-header"
        :style="cellSizeStyleObject"
      >
        {{ toRowName(i) }}
      </div>
      <div
        v-for="j in gridSize"
        :id="getIdFromCoord(i, j)"
        :key="j"
        :ref="getIdFromCoord(i, j)"
        class="grid-cell effect droppable"
        :class="cellPropertyObject(getIdFromCoord(i, j)).class"
        :style="cellPropertyObject(getIdFromCoord(i, j)).style"
        :data-row="i"
        :data-col="j"
        :data-type="null"
      >
        <span
          v-if="isSalvoTarget.includes(getIdFromCoord(i, j))"
          class="numberOverEverything "
        >{{ getMissileCount(i, j) }}</span>
        <span
          v-if="isSalvoLocked.includes(getIdFromCoord(i, j))"
          class="targetLocked"
        >
          <v-progress-circular
            :size="cellSize / 1.2"
            :width="cellSize / 8"
            indeterminate
          />
        </span>
        <span
          v-if="!cellIsEmpty(i, j)"
          class="numberInCorner"
        >{{
          getTurnNumber(i, j)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
  components: {},
  props: {
    assignedID: { type: String, default: "shipGrid" },
    canFire: { type: Boolean, default: false },
    turn: { type: Number, default: 1 },
    gridSize: { type: Number, default: 10 },
    cellSize: { type: Number, default: 40 },
    hasShipList: { type: Array, default: () => [] },
    duplicateLocation: { type: Array, default: () => [] },
    isSalvoTarget: { type: Array, default: () => [] },
    isSalvoLocked: { type: Array, default: () => [] },
    hits: { type: Object, default: () => ({}) },
    probabilities: { type: Object, default: () => ({}) },
    waitingForOpponent: { type: Boolean, default: false }
  },
  data() {
    return {};
  },
  watch: {
    allHitsList(newVal, oldVal) {
      if (
        (oldVal == undefined && newVal.length > 0) ||
        newVal.length > oldVal.length
      ) {
        if (this.assignedID == "salvoGrid") {
          this.soundEffects.play("farAwayShot");
        } else {
          this.soundEffects.play("explosion");
          let randomNb = Math.floor(Math.random() * 3) + 1;
          setTimeout(
            () => this.soundEffects.play("underAttack" + randomNb),
            1000
          );
        }
      }
    },
    allMissList(newVal, oldVal) {
      if (
        (oldVal == undefined && newVal.length > 0) ||
        newVal.length > (oldVal.length || 0)
      ) {
        this.soundEffects.play("waterSplash");
      }
    }
  },

  beforeDestroy() {
    this.$el.removeEventListener("click", this.clickEvent);
  },
  computed: {
    ...mapState(["gameDisplayed", "soundEffects"]),
    ...mapGetters(["gameStateCode"]),
    cellSizeStyleObject() {
      return {
        width: this.cellSize + "px",
        height: this.cellSize + "px"
      };
    },
    gridDimensionObject() {
      return {
        width: this.gridSize * this.cellSize + this.cellSize + "px",
        height: this.gridSize * this.cellSize + this.cellSize + "px"
      };
    },
    blockSalvoGrid() {
      return this.gameStateCode == 0 && this.assignedID == "salvoGrid";
    },
    allHitsList() {
      let lastTurn = Object.keys(this.hits).length;
      if (this.hits[lastTurn]) return this.hits[lastTurn].AllHits;
      return [];
    },
    allMissList() {
      let lastTurn = Object.keys(this.hits).length;
      if (this.hits[lastTurn]) return this.hits[lastTurn].AllMissed;
      return [];
    }
  },
  mounted() {
    if (this.assignedID == "salvoGrid") {
      this.$nextTick(() => {
        this.$el.addEventListener("click", this.clickEvent);
      });
    }
  },
  methods: {
    ...mapActions([]),
    clickEvent(event) {
      this.$emit("salvoGridClicked", event.target);
    },
    cellPropertyObject(id) {
      let hitTp = this.isInObject(this.hits, id);

      let hasMissed = hitTp.locType == "missed";
      let hasHit = hitTp.locType == "hit";
      let isCellTargeted = this.isSalvoTarget.includes(id);
      let isCellLockedTarget = this.isSalvoLocked.includes(id);
      let isCellContainingShip = this.hasShipList.includes(id);
      let isOverlappingCell = this.duplicateLocation.includes(id);

      let idClass = {
        pulse: isCellTargeted,
        isSalvoTarget: isCellTargeted,
        targetLocked: isCellLockedTarget && !hasHit && !hasMissed,
        target: isCellTargeted,
        hasShip: isCellContainingShip,
        isOverlapping: isOverlappingCell,
        fire: this.canFire && this.assignedID == "salvoGrid",
        wait: !this.canFire && this.assignedID == "salvoGrid",
        targetHover: this.canFire && this.assignedID == "salvoGrid",

        missed: hasMissed,
        hit: hasHit,
        explosion: hasHit
      };
      let idStyle = {
        width: this.cellSize + "px",
        height: this.cellSize + "px"
      };
      return {
        class: idClass,
        style: idStyle
      };
      // fireHit: hitTp.locType == "hit" ? true : false
    },
    isInObject(hit_obj, location) {
      const hit_turns = Object.keys(hit_obj);
      for (let turn of hit_turns) {
        let hitLoc = hit_obj[turn].hitsLoc;
        let missLoc = hit_obj[turn].missLoc;
        if (hitLoc.includes(location)) {
          return {
            locType: "hit",
            turnNumber: turn
          };
        }
        if (missLoc.includes(location)) {
          return {
            locType: "missed",
            turnNumber: turn
          };
        }
      }
      return { locType: null, turnNumber: null };
    },
    getTurnNumber(i, j) {
      let id = this.getIdFromCoord(i, j);
      let hitTp = this.isInObject(this.hits, id);

      //When in display mode, display round number.
      if (hitTp.turnNumber) return hitTp.turnNumber;
      return "";
    },
    cellIsEmpty(i, j) {
      let id = this.getIdFromCoord(i, j);
      let hitTp = this.isInObject(this.hits, id);
      let hasLockedClass = this.isSalvoLocked.includes(id);
      if (hitTp.turnNumber && !hasLockedClass) return false;
      return true;
    },
    getMissileCount(i, j) {
      let id = this.getIdFromCoord(i, j);

      let targetTp = this.isSalvoTarget.includes(id);

      //When in target selection mode, display salvo number
      if (targetTp) return this.isSalvoTarget.indexOf(id) + 1;
      return "";
    },
    getIdFromCoord(row, col) {
      return this.toRowName(row) + "" + col;
    },
    toRowName(num) {
      //Get String value for a number. Excel's style.
      for (var ret = "", a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
      }
      return ret;
    }
  }
};
</script>

<style scoped>
:root {
  --delay-anim: 1s;
}

.numberOverEverything {
  position: absolute;
}
.numberInCorner {
  position: relative;
  width: inherit;
  height: inherit;
  font-size: 1vw;
  top: 0.6vw;
  transform: translate(-50% -50%);
}

.fire {
  /* cursor: url("http://www.gravatar.com/avatar/06ededb95f1c0b1f4f9d987e06d7d82b?s=32&d=identicon&r=PG"),auto; */
  cursor: url("../assets/cursor_AimTarget.png") 25 25, auto;
}
.wait {
  cursor: wait;
}
.loading {
  cursor: wait;
  width: inherit;
  height: inherit;
  position: absolute;
  top: 0;
  left: 0;
}
.loading:before {
  position: absolute;
  content: " ";
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  background-color: grey;
}
.grid {
  white-space: nowrap;
  display: block;
  position: relative;
  /* background-color: #d0dfeb44; */

  line-height: 0;
  /* background-image: url("../assets/ocean_top_view.jpg");
  background-size: fill; */
}
.grid:before {
  content: " ";
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  z-index: -1;
  background-image: url("../assets/textures/water_seamless.jpg");
  background-repeat: repeat;
  background-size: 100% 100%;
}
.gameGrid {
  position: relative;
}
.grid-cell {
  display: inline-flex;
  border: 1px solid rgba(9, 9, 10, 0.3);
  vertical-align: bottom;
  align-items: center;
  justify-content: center;
}
.cell-header {
  background-color: grey;
}
.top-header {
  border-top: 0;
}
.left-header {
  border-left: 0;
}
.hit {
  background-color: crimson !important;
}
.hasShip {
  background-color: green;
}
.isOverlapping {
  background-color: orange;
}
.missed {
  content: " ";
  background-color: #64b5f6 !important;
  width: inherit;
  height: inherit;
  z-index: 2;
}
.missed::before {
  position: absolute;
  content: " ";
  width: inherit;
  height: inherit;
  background-image: url("../assets/explosion/water-splash.png");
  background-size: 4500%;
  animation-fill-mode: forwards;
  animation: runWater 2s 1 steps(45);
}
@keyframes runWater {
  0% {
    background-position: 4500%;
  }
  100% {
    background-position: 0;
  }
}

.explosion {
  content: " ";
  width: inherit;
  height: inherit;
  z-index: 2;
}
.explosion::before {
  position: absolute;
  content: " ";
  width: inherit;
  height: inherit;
  background-image: url("../assets/explosion/explosion_sprite_2_100px.png");
  background-size: 900% 900%;
  animation: moveX 0.15s steps(9) 1, moveY 1.35s steps(9) 1;
}
@keyframes moveX {
  0% {
    background-position-x: 900%;
  }
  100% {
    background-position-x: 0;
  }
}
@keyframes moveY {
  0% {
    background-position-y: 900%;
  }
  100% {
    background-position-y: 0;
  }
}

.explosion::after {
  position: absolute;
  content: " ";
  width: inherit;
  height: inherit;
  display: block;
  background-image: url("../assets/explosion/damage_explosion.png");
  background-position: center;
  background-size: 100%;
  /* animation: run-x-2 0.4s infinite steps(8), run-y-2 1.6s infinite steps(4); */
}
/* Salvo Locked*/
.targetLocked {
  background-color: blueviolet;
  z-index: 0;
}
/*SalvoTarget*/
.targetHover:hover {
  background-color: blueviolet;
}
.isSalvoTarget {
  position: relative;
  content: " ";
  background-color: blueviolet;
}
.isSalvoTarget:after {
  position: absolute;
  content: " ";
  display: block;
  width: 80%;
  height: 80%;
  margin: 1px;
  border-radius: 50%;
  border: 2px solid;
  border-color: transparent #fff transparent #fff;
  animation: expand 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) 1;
  /* animation: rotate 1.8s linear infinite; */
}
@keyframes expand {
  0% {
    transform: scale(0.4);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(90deg) scale(0.9);
  }
  50% {
    transform: rotate(180deg) scale(1);
  }
  75% {
    transform: rotate(270deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
.pulse {
  content: "";
}
.pulse::before {
  content: " ";
  height: 100%;
  width: 100%;

  opacity: 0;
  border: 2px solid whitesmoke;
  border-radius: 100%;
  animation: pulsate 1s infinite ease-out;
}

@keyframes pulsate {
  0% {
    transform: scale(0.1, 0.1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.3, 1.3);
    opacity: 0;
  }
}
</style>
