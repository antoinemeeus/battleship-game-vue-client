<template>
  <VueDragResize
    ref="ship"
    :class="{ grabbable: canMove }"
    :h="battleShipDim.h"
    :w="battleShipDim.w"
    :parent-w="battleShipDim._pw"
    :parent-h="battleShipDim._ph"
    :is-resizable="false"
    :x="initShipPosition.posX"
    :y="initShipPosition.posY"
    :is-draggable="canMove"
    :prevent-active-behavior="!canMove"
    @dragging="onDragging"
    @clicked="onActivated"
    @dragstop="onDragStop"
  >
    <v-btn
      v-show="canMove"
      flat
      icon
      color="blue lighten-2"
      absolute
      left
      top
      small
      class="buttonPos"
      @click="rotateShip()"
    >
      <v-icon>cached</v-icon>
    </v-btn>
    <img
      class="ship "
      :class="{ selected: isShipSelected }"
      :src="getImage()"
    >
  </VueDragResize>
</template>

<script>
import VueDragResize from "vue-drag-resize";
import { mapState, mapActions } from "vuex";
export default {
  components: {
    VueDragResize
  },
  props: [
    "gridCellSize",
    "gridSize",
    "type",
    "shipLength",
    "shipSelected",
    "imgSrc",
    "allShipsPositions",
    "canMove",
    "firstLocation"
  ],
  data() {
    return {
      isDraggable: true,
      isMoving: false,
      rotate: false,
      shipPositions: [],
      shipPositionBeforeMoving: {},
      outOfBounds: true,
      overlapping: false
    };
  },

  computed: {
    ...mapState(["soundEffects"]),
    battleShipDim() {
      let _h = this.gridCellSize * this.shipLength;
      let _w = this.gridCellSize;
      let _parent_square_dim =
        this.gridCellSize * this.gridSize + this.gridCellSize;

      if (this.rotate) {
        _h = this.gridCellSize;
        _w = this.gridCellSize * this.shipLength;
      }

      return { h: _h, w: _w, _ph: _parent_square_dim, _pw: _parent_square_dim };
    },
    isShipSelected() {
      return this.type === this.shipSelected && this.canMove;
    },
    initShipPosition() {
      //Method that takes in the list of string of locations type A1,B1...
      //Check if the location is legal
      //Find bow and orientation of ship
      //Return, bow position in x,y and rotation true/false;
      let columnList = [];
      let rowList = [];
      let x = 0;
      let y = 0;
      for (let shipCellLocation of this.firstLocation) {
        // Find the first occurrence of a digit
        let startIndex = shipCellLocation.search(/[\d+]/);
        // The row is the part from the beginning up until the first digit  A,B...
        let rowString = shipCellLocation.substring(0, startIndex).toUpperCase();
        let row = this.nameRowToNumber(rowString);
        // The column is the remainder of the string,  1,2,3
        let column = parseInt(shipCellLocation.substring(startIndex), 10);

        columnList.push(column);
        rowList.push(row);
      }
      //Case no information, lists are empty,
      if (columnList.length <= 0 || rowList.length <= 0) {
        return { posX: this.gridCellSize, posY: this.gridCellSize };
      }

      if (this.hasDuplicates(columnList)) {
        //column has duplicates, the ship is horizontal
        this.rotate = false;
        x = columnList[0];
        y = Math.min.apply(null, rowList);
      } else {
        //row has duplicates, the ship is horizontal
        y = rowList[0];
        x = Math.min.apply(null, columnList);
        this.rotate = true;
      }
      //Apply new bow position
      return { posX: x * this.gridCellSize, posY: y * this.gridCellSize };
    }
  },
  watch: {
    firstLocation(newVal) {
      this.shipPositions = newVal;
      this.passPositionToParent();
      this.snapShipToGrid({
        left: this.initShipPosition.posX,
        top: this.initShipPosition.posY
      });
      this.saveLastPos({
        left: this.initShipPosition.posX,
        top: this.initShipPosition.posY
      });
    }
  },
  created() {
    this.shipPositions = this.firstLocation;
    this.saveLastPos({
      left: this.initShipPosition.posX,
      top: this.initShipPosition.posY
    });
    this.passPositionToParent();
  },
  methods: {
    getImage() {
      let url = this.rotate ? "_V.png" : ".png";
      url = require("../assets" + this.imgSrc + url);
      return url;
    },
    shakeImage() {
      this.soundEffects.play("errorIllegalPos");
      let element = this.$refs.ship.$el;
      element.classList.add("shake");
      setTimeout(function() {
        element.classList.remove("shake");
      }, 500);
    },

    isShipOverlapping() {
      //flatten all the ships positions to an array
      this.overlapping = false;
      let allShipsPositions = this.allShipsPositions;
      let keys = Object.keys(allShipsPositions);
      for (let key of keys) {
        if (key !== this.type) {
          let found = allShipsPositions[key].some(pos =>
            this.shipPositions.includes(pos)
          );
          if (found) {
            //Forbidden position placement
            this.overlapping = true;
            return true;
          }
        }
      }
      return false;
    },
    rotateShip() {
      let bowPos = { left: this.$refs.ship.left, top: this.$refs.ship.top };
      this.rotate = !this.rotate;
      this.getElementBelowBow(bowPos);
      if (this.outOfBounds === true || this.isShipOverlapping()) {
        //Forbidden position placement
        this.shakeImage();
        this.resetShipPosLastValid();
      } else {
        this.saveLastPos(bowPos);
        this.passPositionToParent();
      }
    },
    getIdFromCoord(row, col) {
      return this.toRowName(row) + "" + col;
    },
    getPositionOfShip(bowElement) {
      let rowIdx = parseInt(bowElement.dataset.row);
      let colIdx = parseInt(bowElement.dataset.col);
      //Arrays of grid indexes representatives of ship position
      let shipIndexArray = [{ row: rowIdx, col: colIdx }];
      this.outOfBounds = false;
      //Infer  position of Ship base on length, rotation and bowPosition and checks if OutOfBounds
      for (let i = 1; i < this.shipLength; i++) {
        if (this.rotate) {
          if (colIdx + i > this.gridSize) {
            this.outOfBounds = true;
          } else {
            shipIndexArray.push({ row: rowIdx, col: colIdx + i });
          }
        } else {
          if (rowIdx + i > this.gridSize) {
            this.outOfBounds = true;
          } else {
            shipIndexArray.push({ row: rowIdx + i, col: colIdx });
          }
        }
      }
      //Format array of grid indexes to array of position string LetterNumber (A1,B1..) and save it
      this.shipPositions = shipIndexArray.map(idx =>
        this.getIdFromCoord(idx.row, idx.col)
      );
    },
    getElementBelowBow(bowPos) {
      let parentElem = this.$refs.ship.parentElement.getBoundingClientRect();
      let elemBelow = document.elementsFromPoint(
        bowPos.left + parentElem.left + this.gridCellSize / 2,
        bowPos.top + parentElem.top + this.gridCellSize / 2
      );
      let closestCellBelowBow = elemBelow.find(el => el.closest(".droppable"));
      if (closestCellBelowBow) {
        this.getPositionOfShip(closestCellBelowBow);
      }
    },
    getNearestGridPos(bowPos) {
      bowPos.left =
        Math.round(bowPos.left / this.gridCellSize) * this.gridCellSize;
      bowPos.top =
        Math.round(bowPos.top / this.gridCellSize) * this.gridCellSize;
      return bowPos;
    },
    onActivated(event) {
      this.isMoving = true;
      this.$refs.ship.limits;
      this.$refs.ship.limits = this.shipBoardLimits();
      this.passPositionToParent();
    },
    onDragging(pos) {
      this.isMoving = true;
      this.$refs.ship.limits = this.shipBoardLimits();
      this.getElementBelowBow(pos);
      this.passPositionToParent();
    },
    onDragStop(pos) {
      this.isMoving = false;
      this.$refs.ship.active = false;

      if (this.isShipOverlapping()) {
        this.resetShipPosLastValid();
        this.shakeImage();
        this.passPositionToParent();
      } else {
        this.snapShipToGrid(pos);
        this.saveLastPos(pos);
        this.passPositionToParent();
        this.passStopPositionToParent();
        if (this.canMove) {
          let idSound = this.soundEffects.play("shipMoving");
          this.soundEffects.volume(0.4, idSound);
        }
      }
    },

    snapShipToGrid(pos) {
      let nearestGridPos = this.getNearestGridPos(pos);
      let shipDragged = this.$refs.ship;
      shipDragged.rawLeft = nearestGridPos.left;
      shipDragged.rawTop = nearestGridPos.top;
      shipDragged.rawRight =
        this.gridCellSize * this.gridSize -
        this.battleShipDim.w -
        nearestGridPos.left +
        this.gridCellSize;
      shipDragged.rawBottom =
        this.gridCellSize * this.gridSize -
        this.battleShipDim.h -
        nearestGridPos.top +
        this.gridCellSize;

      this.getElementBelowBow({
        left: nearestGridPos.left,
        top: nearestGridPos.top
      });
    },
    passPositionToParent() {
      this.$emit("updateShipPos", {
        type: this.type,
        positions: this.shipPositions
      });
    },
    passStopPositionToParent() {
      this.$emit("updateInitPos", {
        type: this.type,
        initPosition: this.shipPositions
      });
    },
    saveLastPos(bowPos) {
      this.shipPositionBeforeMoving = this.getNearestGridPos(bowPos);
      let rotation = "";
      if (this.rotate) rotation = "V";
      else rotation = "H";
      this.shipPositionBeforeMoving.rotation = rotation;
    },
    resetShipPosLastValid() {
      this.rotate = this.shipPositionBeforeMoving.rotation === "V";
      this.snapShipToGrid(this.shipPositionBeforeMoving);
    },
    shipBoardLimits() {
      let cellSize = this.gridCellSize;
      let gridSize = this.gridSize;
      let _w = this.$refs.ship.w;
      let _h = this.$refs.ship.h;
      return {
        minLeft: cellSize,
        minTop: cellSize,
        minBottom: 0,
        minRight: 0,
        maxLeft: cellSize * gridSize - _w + cellSize,
        maxTop: cellSize * gridSize - _h + cellSize,
        maxBottom: cellSize * gridSize - _h,
        maxRight: cellSize * gridSize - _w
      };
    },

    hasDuplicates(array) {
      return new Set(array).size !== array.length;
    },
    /*
     * Takes a positive integer and returns the corresponding column name.
     * @param {number} num  The positive integer to convert to a column name.
     * @return {string}  The column name.
     */
    toRowName(num) {
      let ret, b, a;
      for (; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
      }
      return ret;
    },
    nameRowToNumber(letters) {
      let n, p;
      for (; p < letters.length; p++) {
        n = letters[p].charCodeAt() - 64 + n * 26;
      }
      return n;
    }
  }
};
</script>

<style scoped>
.ship {
  /* border: 1px solid red; */
  width: inherit;
  height: inherit;
  object-fit: contain;
  /* z-index: -1; */
}
.grabbable {
  -webkit-user-select: none;
  cursor: move; /* fallback if grab cursor is unsupported */
}

.buttonPos {
  top: -10px !important;
}
.selected {
  border: 1px solid rgba(87, 221, 93, 0.486);
  box-shadow: 0 0 0 rgba(87, 221, 94, 0.836);
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(87, 221, 94, 0.836);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(87, 221, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(87, 221, 94, 0);
  }
}
.shake {
  animation: shake 0.5s;
  animation-iteration-count: 2;
}
@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}
</style>
