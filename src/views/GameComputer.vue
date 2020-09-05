<template>
  <v-container
    ma-0
    pa-0
    fluid
  >
    <v-layout justify-space-between>
      <v-flex
        xs12
        sm6
        md5
        xl4
        class="user-bg-color"
      >
        <UserOverview :user="currentUser"/>
      </v-flex>
      <v-flex
        v-if="$vuetify.breakpoint.mdAndUp"
        xs12
        sm6
        md5
        xl4
        class="user-bg-color"
      >
        <UserOverview :is-user="false"/>
      </v-flex>
    </v-layout>
    <v-layout
      justify-space-between
      align-content-space-around
      row
      :wrap="!placingShips"
      class="pa-3 elevation-8 game-box"
    >
      <!-- Ship Placement Grid -->
      <v-flex>
        <v-layout
          row
          :wrap="placingShips"
          justify-center
        >
          <v-flex
            v-if="!placingShips && $vuetify.breakpoint.smAndUp"
            grow
          >
            <v-layout px-1>
              <FleetStatus
                :key="resetKey"
                :fleet-state="homeFleetState"
                :image-base-width="cellSize"
                :fleet-name="'Your Fleet'"
              />
            </v-layout>
          </v-flex>
          <v-flex shrink>
            <h3 class="title">
              Your Grid
            </h3>
            <Grid
              :has-ship-list="homeShipsPositionList"
              :duplicate-location="getShipOverlappingPositions"
              :turn="salvoTurn"
              :hits="userGridHits"
              :grid-size="gridSize"
              :cell-size="cellSize"
              :probabilities="makeProbabilitiesDTO"
            >
              <Ship
                v-for="ship in homeShips"
                :ref="`ship_${ship.type}`"
                :key="ship.type"
                :grid-cell-size="cellSize"
                :grid-size="gridSize"
                :ship-selected="selectedShip"
                :first-location="ship.initPosition"
                :type="ship.type"
                :ship-length="ship.shipLength"
                :img-src="ship.imgSrc"
                :all-ships-positions="shipPositions"
                :can-move="placingShips"
                @updateShipPos="updatePositions"
                @updateInitPos="updateInitPositions"
              />
            </Grid>
          </v-flex>
          <v-flex
            v-if="placingShips"
            xs12
            sm6
            px-2
            mx-1
          >
            <h3 class="title">
              Your Fleet
            </h3>
            <v-layout
              column
              fill-height
              justify-center
            >
              <h4 class="subheading">
                Ship grid positions
              </h4>
              <table class="py-2">
                <tr
                  v-for="(location, ship) in shipPositions"
                  :key="ship"
                  class="py-2 subheading"
                  justify-space-between
                  row
                >
                  <td
                    class="text-capitalize pr-2"
                    :class="ship === selectedShip ? 'blue-grey darken-1' : ''"
                  >
                    <span>{{ ship }}</span>
                  </td>
                  <td class="id-row">
                    <div
                      v-for="id in location"
                      :key="ship + id"
                      class="px-2 id-indv"
                      :class="ship === selectedShip ? 'blue-grey darken-1' : ''"
                      :style="
                        getShipOverlappingPositions.includes(id)
                          ? { color: 'orange' }
                          : { color: '' }
                      "
                    >
                      {{ id }}
                    </div>
                  </td>
                </tr>
              </table>

              <div class="py-3">
                <v-btn
                  :disabled="!placingShips"
                  @click="placeShipRandomly(homeShips)"
                >
                  <v-icon>fa-random</v-icon>
                  <span class="pl-2">Random</span>
                </v-btn>
                <!-- <v-btn @click="placeShipRandomly(computerShips)">PlaceCOMPUTERShipRandomly</v-btn> -->
                <v-btn
                  :disabled="!placingShips"
                  @click="ready()"
                >
                  <v-icon>fa-play</v-icon>
                  <span class="pl-2">Start!</span>
                </v-btn>
              </div>
              <div class="py-3 px-2 mx-1 instruction-box">
                <div class="subheading">
                  Instruction:
                </div>
                <div>
                  <p>
                    Arrange your ships by dragging them on your grid. To rotate
                    a ship, click on the
                    <v-icon color="blue px-1">
                      cached
                    </v-icon>
                    button.
                  </p>
                  <p>
                    You can also decide to place all ships randomly by click the
                    <v-icon class="px-1">
                      fa-random
                    </v-icon>
                    random button.
                  </p>
                  <p>
                    When you are ready, go to battle by clicking the
                    <v-icon class="px-1">
                      fa-play
                    </v-icon>
                    start button.
                  </p>
                  <p>
                    <v-icon color="red px-1">
                      warning
                    </v-icon>
                    You will not be
                    able to rotate a ship if the the next position contains an
                    obstacle or is outside the grid.
                  </p>
                </div>
              </div>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex
        v-show="!placingShips"
        px-2
      >
        <v-layout
          justify-center
          fill-height
          column
        >
          <SalvoMissiles
            ref=""
            :salvo-size="homeNextSalvoPositions.length"
            :missile-number="maxSalvoSize"
          />
          <v-flex
            pa-1
            class="title font-weight-bold text-xs-center"
          >
            Round {{ salvoTurn }}
          </v-flex>
          <v-flex class="text-xs-center">
            <span v-if="homeTurn">It's your turn</span>
            <span v-else>Computer turn</span>
            <CountDownTimer
              ref="timer"
              @timerFinish="timerEnd()"
            />
          </v-flex>
          <v-flex class="text-xs-center">
            <div>Launch button</div>
            <v-btn
              ripple
              class="fire-button"
              :disabled="
                !canFireSalvo || gameFinished || homeNextSalvoPositions <= 0
              "
              :color="fireButtonColor"
              :large="$vuetify.breakpoint.mdAndUp"
              :small="$vuetify.breakpoint.smAndDown"
              :fab="$vuetify.breakpoint.smAndDown"
              @click="fireSalvo()"
            >
              <span
                v-show="allMissilePlaced || !$vuetify.breakpoint.smAndDown"
              >FIRE!</span>
            </v-btn>
          </v-flex>
          <v-flex
            class="text-xs-center spaceBar"
            :class="{ 'spaceBar-opaque': homeNextSalvoPositions.length === 0 }"
          >
            <span>or press</span>
            <v-img :src="require('../assets/tutorial/spaceBar.png')"/>
          </v-flex>
          <v-flex>
            <v-layout
              align-content-end
              row
              justify-center
            >
              <InstructionWizard
                v-if="!placingShips"
                :nb-of-shots="maxSalvoSize"
                @pauseTimer="wizardUnpausedTimer"
              />
              <v-flex text-xs-center>
                <v-btn
                  icon
                  @click="pauseTimer = !pauseTimer"
                >
                  <v-icon
                    v-show="pauseTimer"
                    large
                    color="white"
                  >
                    timer
                  </v-icon>
                  <v-icon
                    v-show="!pauseTimer"
                    large
                    color="white"
                  >
                    timer_off
                  </v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
      <!-- Salvo Placement Grid -->
      <v-expand-x-transition>
        <v-flex v-show="!placingShips">
          <v-layout row>
            <v-flex shrink>
              <span class="title">Enemy Grid</span>
              <Grid
                v-show="showSalvo"
                ref="salvoGrid"
                assigned-i-d="salvoGrid"
                :turn="salvoTurn"
                :has-ship-list="gameFinished ? computerShipsPositionList : []"
                :grid-size="gridSize"
                :cell-size="cellSize"
                :is-salvo-target="homeNextSalvoPositions"
                :hits="opponentGridHits"
                :can-fire="canFireSalvo && !gameFinished"
                @salvoGridClicked="salvoTarget"
              />
            </v-flex>
            <v-flex
              grow
              px-1
            >
              <FleetStatus
                v-show="showSalvo"
                :fleet-state="computerFleetState"
                :fleet-name="'Enemy Fleet'"
                :image-base-width="cellSize * 0.8"
              />
            </v-flex>
          </v-layout>
        </v-flex>
      </v-expand-x-transition>
    </v-layout>

    <v-layout
      v-show="gameFinished"
      class="popup"
      column
    >
      <span
        v-if="gameState === 'TIE'"
        class="display-3"
      >YOU TIED</span>
      <span
        v-if="gameState === 'HOME_WINS'"
        class="display-3"
      >YOU WIN!</span>
      <span
        v-if="gameState === 'COMPUTER_WINS'"
        class="display-3"
      >YOU LOSE</span>
      <span
        v-if="gameState === 'PROGRESS'"
        class="display-3"
      >TEST PROGRESS</span>
      <v-flex>
        <v-btn @click="forceResetComponent()">
          Play again?
        </v-btn>
        <v-btn @click="$router.push('/')">
          Back to Menu
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Ship from "../components/Ship.vue";
import Grid from "../components/Grid.vue";
import FleetStatus from "../components/FleetStatus.vue";
import SalvoMissiles from "../components/SalvoMissiles.vue";
import CountDownTimer from "../components/CountDownTimer.vue";
import InstructionWizard from "../components/InstructionWizard.vue";
import UserOverview from "../components/UserOverview.vue";
import {mapState, mapGetters, mapActions} from "vuex";

export default {
  name: "AgainstComputer",
  components: {
    Grid,
    Ship,
    FleetStatus,
    SalvoMissiles,
    CountDownTimer,
    InstructionWizard,
    UserOverview
  },
  props: {
    difficulty: {
      type: Object,
      default: () => ({display: "Normal", diff: "normal", color: "green"})
    }
  },
  data() {
    return {
      // countDownTime: 90,
      gameStart: false,
      pauseTimer: false,
      dialog: false,
      selectedShip: "",
      resetKey: 0,
      // gridSize: 10,
      maxSalvoSize: 5,
      shipPositions: {},
      gameFinished: false,
      homeNextSalvoPositions: [],
      homeAllSalvoResult: {},
      homeAllSalvoesPositionsList: [],
      homeSalvoPositions: {},
      computerSalvoPositions: {},
      coordinatesComputerSalvo: [],
      computerCoordinatesHit: [],
      computerAllSalvoResult: {},
      computerAllSalvoesPositionsList: [],
      placingShips: true,
      showSalvo: true,
      canFireSalvo: false,
      salvoTurn: 1,
      homeTurn: true,
      homeShips: [
        {
          type: "carrier",
          hits: [],
          shipLength: 5,
          initPosition: ["A2", "A3", "A4", "A5", "A6"],
          imgSrc: "/ships/carrier/ShipCarrierHull"
        },
        {
          type: "battleship",
          hits: [],
          shipLength: 4,
          initPosition: ["I5", "I6", "I7", "I8"],
          imgSrc: "/ships/battleship/ShipBattleshipHull"
        },
        {
          type: "destroyer",
          hits: [],
          shipLength: 3,
          initPosition: ["C7", "C8", "C9"],
          imgSrc: "/ships/destroyer/ShipDestroyerHull"
        },
        {
          type: "submarine",
          hits: [],
          shipLength: 3,
          initPosition: ["D2", "E2", "F2"],
          imgSrc: "/ships/submarine/ShipSubMarineHull"
        },
        {
          type: "patrolboat",
          hits: [],
          shipLength: 2,
          initPosition: ["E5", "F5"],
          imgSrc: "/ships/patrolBoat/ShipPatrolHull"
        }
      ],
      computerShips: [
        {
          type: "carrier",
          hits: [],
          shipLength: 5,
          initPosition: ["A2", "A3", "A4", "A5", "A6"]
        },
        {
          type: "battleship",
          hits: [],
          shipLength: 4,
          initPosition: ["I5", "I6", "I7", "I8"]
        },
        {
          type: "destroyer",
          hits: [],
          shipLength: 3,
          initPosition: ["C7", "C8", "C9"]
        },
        {
          type: "submarine",
          hits: [],
          shipLength: 3,
          initPosition: ["D2", "E2", "F2"]
        },
        {
          type: "patrolboat",
          hits: [],
          shipLength: 2,
          initPosition: ["E5", "F5"]
        }
      ]
    };
  },
  computed: {
    ...mapState([
      "serverMessage",
      "loading",
      "pageIsRestricted",
      "gamesInfo",
      "soundEffects",
      "musicPlaying",
      "bgMusic",
      "bgEpicIntro"
    ]),
    ...mapGetters(["currentUser", "isAuthenticated"]),
    countDownTime() {
      switch (this.difficulty.diff) {
        case "normal":
          return 90;
        case "hard":
          return 12;
        case "insane":
          return 7;
        case "troll":
          return 5;
        default:
          return 90;
      }
    },
    gridSize() {
      switch (this.difficulty.diff) {
        case "normal":
          return 10;
        case "hard":
          return 12;
        case "insane":
          return 14;
        case "troll":
          return 18;
        default:
          return 10;
      }
    },
    showHelp() {
      let showHelp = localStorage.getItem("showHelp");
      return showHelp === "true";
    },
    cellSize() {
      let innerWidth = window.innerWidth;
      if (this.$vuetify.breakpoint) innerWidth = this.$vuetify.breakpoint.width;
      let newPixelValue = +((innerWidth * 0.3) / (this.gridSize + 1)).toFixed(
        0
      );
      if (!this.$vuetify.breakpoint.smAndUp)
        newPixelValue = +((innerWidth * 0.8) / (this.gridSize + 1)).toFixed(0);
      if (!isNaN(newPixelValue)) return newPixelValue;
      return 40;
    },
    fireButtonColor() {
      if (this.allMissilePlaced)
        // return "#3abc12";
        return "#dc3b3b";
      if (this.homeNextSalvoPositions.length > 0 && !this.allMissilePlaced)
        return "#ffe419";
      else return "#616163";
    },
    player() {
      if (this.gamesInfo.player != null) {
        return this.gamesInfo.player;
      }
      return {userName: "Anonymous"};
    },
    probabilityMap() {
      let map = [];
      //reset probabilities
      for (let i = 0; i < this.gridSize; i++) {
        map[i] = [];
        for (let j = 0; j < this.gridSize; j++) {
          map[i][j] = 0;
        }
      }
      //calculate probabilities for each ship
      for (let ship of this.homeShips) {
        //if ship is sunk, pass this ship
        if (ship.hits.length >= ship.shipLength) continue;

        for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
            //horizontal check
            if (this.canShipBePlace(i + 1, j + 1, true, ship.shipLength - 1)) {
              this.increaseProbability(i, j, true, ship, map);
            }
            //vertical check
            if (this.canShipBePlace(i + 1, j + 1, false, ship.shipLength - 1)) {
              this.increaseProbability(i, j, false, ship, map);
            }
            if (map[i].length < 10) alert("ALERT HERE MAP GOT NAN OR 11");
          }
        }
      }
      //Skew probability around hits
      let adjacentCells = [];
      for (let hitcell of this.computerCoordinatesHit) {
        adjacentCells = adjacentCells.concat(
          this.getAdjacentPositions(hitcell.x, hitcell.y)
        );
      }
      let uniquesAdjacentCells = adjacentCells.filter((obj, pos, arr) => {
        return (
          arr.map(mapObj => mapObj["cellID"]).indexOf(obj["cellID"]) === pos
        );
      });
      for (let uniqueAdjacentCell of uniquesAdjacentCells) {
        map[uniqueAdjacentCell.x - 1][uniqueAdjacentCell.y - 1] *= 3; //arbitrary skew factor
      }

      return map;
    },

    makeProbabilitiesDTO() {
      let obj = {};
      for (let i = 1; i <= this.gridSize; i++) {
        for (let j = 1; j <= this.gridSize; j++) {
          let prob = this.probabilityMap[i - 1][j - 1];
          obj[this.getIdFromCoord(i, j)] = {prob: prob, x: i, y: j};
        }
      }
      return obj;
    },

    gameState() {
      this.gameFinished = false;
      if (!this.homeTurn) return "PROGRESS";
      //Check if allComputerShips are sunk
      let hitsOnComputerShips = this.homeAllSalvoesPositionsList.filter(pos =>
        this.computerShipsPositionList.includes(pos)
      );
      let hitsOnHomeShips = this.computerAllSalvoesPositionsList.filter(pos =>
        this.homeShipsPositionList.includes(pos)
      );
      let homeWins =
        hitsOnComputerShips.length >= this.computerShipsPositionList.length &&
        hitsOnComputerShips.length !== 0;
      let computerWins =
        hitsOnHomeShips.length >= this.homeShipsPositionList.length &&
        hitsOnHomeShips.length !== 0;

      if (homeWins || computerWins) {
        this.gameFinished = true;
        this.canFireSalvo = false;
        if (this.$refs.timer) this.$refs.timer.reset();
      }
      if (homeWins && !computerWins) {
        return "HOME_WINS";
      }
      if (computerWins && !homeWins) {
        return "COMPUTER_WINS";
      }
      if (computerWins && homeWins) {
        return "TIE";
      }

      return "PROGRESS";
    },
    homeFleetState() {
      let obj = {};
      for (let ship of this.homeShips) {
        ship.hits = ship.initPosition.filter(pos =>
          this.computerAllSalvoesPositionsList.includes(pos)
        );
        obj[ship.type] = {
          damage: ship.hits.length,
          sunk: ship.hits.length >= ship.shipLength
        };
      }
      return obj;
    },
    computerFleetState() {
      let obj = {};
      for (let ship of this.computerShips) {
        ship.hits = ship.initPosition.filter(pos =>
          this.homeAllSalvoesPositionsList.includes(pos)
        );
        obj[ship.type] = {
          // damage: ship.hits.length,
          sunk: ship.hits.length >= ship.shipLength
        };
      }
      return obj;
    },
    userGridHits() {
      let obj = {};
      let allMissed = [],
        allHit = [];
      for (let i = 1; i <= this.salvoTurn; i++) {
        let hit = [];
        let missed = [];
        if (this.computerSalvoPositions[i]) {
          hit = this.homeShipsPositionList.filter(pos =>
            this.computerSalvoPositions[i].includes(pos)
          );
          missed = this.computerSalvoPositions[i].filter(
            pos => !hit.includes(pos)
          );
          allHit = [...allHit, ...hit];
          allMissed = [...allMissed, ...missed];
        }
        obj[i] = {
          AllHits: allHit,
          AllMissed: allMissed,
          fleetState: {},
          hitsLoc: hit,
          missLoc: missed
        };
      }
      //Bad practice to update data inside computed()! This is a hacky way of forcing update of opponent info in the same vue $tick.
      this.$set(this.computerAllSalvoResult, "missed", allMissed);
      this.$set(this.computerAllSalvoResult, "hit", allHit);
      this.computerCoordinatesHit = this.coordinatesComputerSalvo.filter(obj =>
        allHit.includes(obj.cellID)
      );
      return obj;
    },
    opponentGridHits() {
      let obj = {};
      let allMissed = [],
        allHit = [];
      for (let i = 1; i <= this.salvoTurn; i++) {
        let hit = [];
        let missed = [];
        if (this.homeSalvoPositions[i]) {
          hit = this.computerShipsPositionList.filter(pos =>
            this.homeSalvoPositions[i].includes(pos)
          );
          missed = this.homeSalvoPositions[i].filter(pos => !hit.includes(pos));
          allHit = [...allHit, ...hit];
          allMissed = [...allMissed, ...missed];
        }
        obj[i] = {
          AllHits: allHit,
          AllMissed: allMissed,
          fleetState: {},
          hitsLoc: hit,
          missLoc: missed
        };
      }
      //Bad practice to update data inside computed()! This is a hacky way of forcing update of user info in the same vue $tick.
      this.$set(this.homeAllSalvoResult, "missed", allMissed);
      this.$set(this.homeAllSalvoResult, "hit", allHit);
      return obj;
    },
    homeShipsPositionList() {
      let listOfList = Object.values(this.shipPositions);
      return [].concat.apply([], listOfList);
    },
    computerShipsPositionList() {
      let listOfList = this.computerShips.map(ship => ship.initPosition);
      return [].concat.apply([], listOfList);
    },
    allMissilePlaced() {
      return this.homeNextSalvoPositions.length >= this.maxSalvoSize;
    },
    getShipOverlappingPositions() {
      return this.getDuplicates(this.homeShipsPositionList);
    }
  },
  watch: {
    pauseTimer(newVal) {
      if (newVal && this.gameStart) {
        this.$refs.timer.start();
      } else this.$refs.timer.stop();
    },
    gameState(newVal, oldVal) {
      if (newVal !== oldVal && oldVal !== null) {
        if (newVal === "HOME_WINS") this.soundEffects.play("winnerTheme", true);
        if (newVal === "COMPUTER_WINS") this.soundEffects.play("loserTheme", true);
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    this.bgEpicIntro.fade(0.3, 0.0, 1500);
    next();
  },
  created() {
    this.placeShipRandomly(this.homeShips);
    this.placeShipRandomly(this.computerShips);
  },
  mounted() {
    this.bgMusic.fade(0.6, 0.0, 1000);
    this.bgEpicIntro.fade(0.0, 0.3, 1500);
    if (!this.bgEpicIntro.playing()) this.bgEpicIntro.play();
    this.getUserData();
    //Prevent space default behavior
    window.onkeydown = function (event) {
      if (event.keyCode === 32) {
        event.preventDefault();
      }
    };
    //Prevent text selection
    document.onselectstart = function () {
      return false;
    };
    this.$nextTick(() => {
      window.addEventListener("keydown", this.gameKeyDownEvent, false);
    });
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.gameKeyDownEvent, false);
    window.onkeydown = null;
  },
  methods: {
    ...mapActions(["authRequest", "getData", "postData"]),
    getUserData() {
      if (this.currentUser.id == null || !this.isAuthenticated) {
        //Quick post to server to check if user was already logged in and still have permission to access.
        //We can get user info, like avatar and name from server and displayed it when playing against computer.
        let payload = {
          data: {},
          rqUrl: "/checkLog"
        };
        this.authRequest(payload).then(
          res => {
            //User has still has a valid session cookie.
            this.getData({url: "/player", mutation: "setUserInfo"});
          },
          err => {
            //Was not logged in
            this.$store.commit("authLogOut");
          }
        );
      }
    },
    wizardUnpausedTimer(val) {
      //Event triggered when user finished to read the instruction. Start countdown timer when first salvo is fired.
      this.pauseTimer = val;
    },
    timerEnd() {
      //timer end emitted event
      //pass automatically user turn by sending his current salvo list locations! Possible to send a empty list.
      this.fireSalvo();
    },
    forceResetComponent() {
      Object.assign(this.$data, this.$options.data());
      this.resetKey += 1;
      this.placeShipRandomly(this.computerShips);
    },
    gameKeyDownEvent(event) {
      //Fire salvo when space is pressed and we are in placing ship mode.
      if (!this.placingShips && event.keyCode === 32) {
        this.fireSalvo();
      }
    },
    getDuplicates(arr) {
      let object = {};
      let result = [];

      arr.forEach(function (item) {
        if (!object[item]) object[item] = 0;
        object[item] += 1;
      });

      for (let prop in object) {
        if (object[prop] >= 2) {
          result.push(prop);
        }
      }
      return result;
    },
    placeShipRandomly(shipFleet) {
      //init gameShipFleet positions.
      this.soundEffects.play("registrationTick", true);
      shipFleet.forEach(ship => {
        ship.initPosition = [];
      });
      for (let ship of shipFleet) {
        let illegalPlacement = true;
        while (illegalPlacement) {
          let randomX = Math.floor(this.gridSize * Math.random()) + 1;
          let randomY = Math.floor(this.gridSize * Math.random()) + 1;
          let randomDirection = Math.random() >= 0.5;
          if (
            this.isLegal(randomX, randomY, randomDirection, ship, shipFleet)
          ) {
            ship.initPosition = this.getShipIdList(
              randomX,
              randomY,
              ship.shipLength,
              randomDirection
            );
            illegalPlacement = false;
          }
        }
      }
    },
    getShipIdList(x, y, length, rotation) {
      let listLoc = [];
      for (let i = 0; i < length; i++) {
        if (rotation) {
          listLoc.push(this.getIdFromCoord(x + i, y));
        } else {
          listLoc.push(this.getIdFromCoord(x, y + i));
        }
      }
      return listLoc;
    },
    isLegal(x, y, rotation, ship, shipFleet) {
      // first, check if the ship is within the grid...
      if (this.isWithinBounds(x, y, rotation, ship.shipLength)) {
        // ...then check to make sure it doesn't collide with another ship
        let otherShipLocationList = [].concat.apply(
          [],
          shipFleet.map(s => {
            if (s.type !== ship.type) return s.initPosition;
            else return [];
          })
        );
        let shipLoc = this.getShipIdList(x, y, ship.shipLength, rotation);
        return !otherShipLocationList.some(r => shipLoc.indexOf(r) >= 0);
      } else return false;
    },
    increaseProbability(i, j, rotation, ship, map) {
      //increase ship length horizontally
      for (let l = 0; l < ship.shipLength; l++) {
        if (rotation) map[i + l][j]++;
        else map[i][j + l]++;
      }
    },
    getAdjacentPositions(x, y) {
      let adj = [];

      if (y + 1 <= this.gridSize)
        adj.push({cellID: this.getIdFromCoord(x, y + 1), x: x, y: y + 1});
      if (y - 1 > 0)
        adj.push({cellID: this.getIdFromCoord(x, y - 1), x: x, y: y - 1});
      if (x + 1 <= this.gridSize)
        adj.push({cellID: this.getIdFromCoord(x + 1, y), x: x + 1, y: y});
      if (x - 1 > 0)
        adj.push({cellID: this.getIdFromCoord(x - 1, y), x: x - 1, y: y});

      return adj;
    },
    getMaxProbCellID(obj) {
      let arr = Object.values(obj);
      // arr = arr.map(obj => obj.prob);
      let max = Math.max(...arr.map(obj => obj.prob));
      return Object.keys(obj).find(key => obj[key].prob === max);
    },
    getIdFromCoord(row, col) {
      return this.toRowName(row) + "" + col;
    },
    isWithinBounds(x, y, rotation, L) {
      if (rotation) {
        return x + L <= this.gridSize;
      } else {
        return y + L <= this.gridSize;
      }
    },
    canShipBePlace(x, y, rotation, L) {
      let z = rotation ? x : y;
      let endOfShip = z + L;
      //ship is outside of grid
      if (endOfShip > this.gridSize) return false;

      //check if ship position hit obstacle (hit)
      for (let i = z; i <= endOfShip; i++) {
        let idPos = rotation
          ? this.getIdFromCoord(i, y)
          : this.getIdFromCoord(x, i);
        if (this.computerAllSalvoResult.missed.includes(idPos)) return false;
      }

      return true;
    },
    updatePositions(value) {
      this.$set(this.shipPositions, value.type, value.positions);
      this.selectedShip = value.type;
    },
    updateInitPositions(value) {
      for (let ship of this.homeShips) {
        if (value.type === ship.type) {
          ship.initPosition = value.initPosition;
        }
      }
    },
    salvoTarget(target) {
      if (!this.canFireSalvo) {
        return;
      }
      let newPosition =
        this.toRowName(target.dataset.row) + "" + target.dataset.col;

      if (!newPosition.match(/^[A-Z0-9]+$/)) {
        //Check if id of targets correspond to id regex A1 C4...
        return;
      }
      let playerSalvoes = this.homeSalvoPositions;

      if (playerSalvoes[this.salvoTurn] === undefined)
        playerSalvoes[this.salvoTurn] = [];
      //check if newPosition is not already fired at
      let alreadyFiredPosition = false;
      for (const key of Object.keys(playerSalvoes)) {
        if (playerSalvoes[key].includes(newPosition) && key !== this.salvoTurn) {
          alreadyFiredPosition = true;
          break;
        }
      }

      if (alreadyFiredPosition) {
        return;
      }

      let currentSalvoesPositions = this.homeNextSalvoPositions;

      //Check if arrays of homeNextSalvoPositions doesn't contain already new position
      if (!currentSalvoesPositions.includes(newPosition)) {
        currentSalvoesPositions.push(newPosition);
        if (currentSalvoesPositions.length > this.maxSalvoSize) {
          //if salvo is superior to maximum number of salvoes, remove first array item
          currentSalvoesPositions.shift();
        }
      } else {
        let index = currentSalvoesPositions.indexOf(newPosition);
        if (index !== -1) {
          currentSalvoesPositions.splice(index, 1);
        }
      }
      //CanFire
      this.soundEffects.play("targetSelect", true);

      this.homeNextSalvoPositions = currentSalvoesPositions;
    },
    objIsEmpty(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    },
    overlappingShips() {
      //Flatten all the ships positions to an array
      let shipsPos = this.shipPositions;
      let arrays = Object.values(shipsPos);
      let newFlattenArray = [];
      for (let arrayOfPos of arrays) {
        newFlattenArray.push(arrayOfPos);
      }
      newFlattenArray = newFlattenArray.flat();
      //find duplicates:
      return new Set(newFlattenArray).size !== newFlattenArray.length;
    },
    toRowName(num) {
      //Get String value for a number. Excel's style.
      let ret = "", a = 1, b = 26;
      for (; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(Math.floor((num % b) / a) + 65) + ret;
      }
      return ret;
    },
    ready() {
      if (Object.keys(this.shipPositions).length < this.homeShips.length) {
        //Ship position missing
        this.placingShips = true;
        this.showSalvo = false;

        return;
      }
      if (this.overlappingShips()) {
        //Ships are overlapping
        this.placingShips = true;
        this.showSalvo = false;
        return;
      }
      this.soundEffects.play("startGame", false);
      this.placingShips = false;
      this.showSalvo = true;
      this.canFireSalvo = true;
      this.selectedShip = "";
      this.$refs.timer.setTime({minutes: 0, seconds: this.countDownTime});
    },
    fireSalvo() {
      //Method to fireSalvo to computer ships.
      function applySalvo(self) {
        //Method to update salvoes positions and and force reactivity of Vue (as these are object value to update)
        self.$set(
          self.homeSalvoPositions,
          self.salvoTurn,
          self.homeNextSalvoPositions
        );
        self.homeAllSalvoesPositionsList = [
          ...self.homeAllSalvoesPositionsList,
          ...self.homeNextSalvoPositions
        ];
        self.homeNextSalvoPositions = [];

        //Reset timer and flags
        self.$refs.timer.reset();
        self.gameStart = true;
        self.homeTurn = false;
      }

      //If firing is permitted, fire salvo procedure
      if (this.canFireSalvo) {
        this.canFireSalvo = false;
        //If music enable, method to update salvo position is in sound callback to avoid overlapping sounds
        if (this.musicPlaying) {
          let randomNb = Math.floor(Math.random() * 3) + 1;
          let soundId = this.soundEffects.play("loadAndFire" + randomNb, true);
          let self = this;
          this.soundEffects.rate(2.0, soundId);
          this.soundEffects.on(
            "end",
            function () {
              applySalvo(self); //->function to update inside callback
              setTimeout(() => {
                self.computerTurn();
              }, 1000);
            },
            soundId,
            null,
          );
        } else {
          //If music not enable, we don't have to wait for music to update salvo position.
          applySalvo(this);
          //wait 1 s before computer turns for a more paced game (too much happening otherwise)
          setTimeout(() => {
            this.computerTurn();
          }, 1000);
        }
        //We add a turn. to counter
        this.salvoTurn += 1;
      }
    },
    getRandomPositions(size) {
      let list = [];
      let coordList = [];

      //If salvoList length is same size as all the grid positions, (sanity check but normally the game finishes).
      while (
        list.length < size &&
        this.computerAllSalvoesPositionsList.length <
        this.gridSize * this.gridSize
        ) {
        let obj = {};
        let randomX = Math.floor(this.gridSize * Math.random()) + 1;
        let randomY = Math.floor(this.gridSize * Math.random()) + 1;
        //if position already in salvo list, generate new one.
        let idPos = this.getIdFromCoord(randomX, randomY);

        //get cell with max probabilities of having a ship
        if (this.salvoTurn > 1) {
          idPos = this.getMaxProbCellID(this.makeProbabilitiesDTO);
          randomX = this.makeProbabilitiesDTO[idPos].x;
          randomY = this.makeProbabilitiesDTO[idPos].y;
        }
        //check if cell isn't already included in list
        if (
          !this.computerAllSalvoesPositionsList.includes(idPos) &&
          !list.includes(idPos)
        ) {
          list.push(idPos);
          obj["cellID"] = idPos;
          obj["x"] = randomX;
          obj["y"] = randomY;
          coordList.push(obj);
        }
        //delete from probability stack the cell that was jut included
        delete this.makeProbabilitiesDTO[idPos];
      }
      //Concat new list to array of position
      this.coordinatesComputerSalvo = [
        ...this.coordinatesComputerSalvo,
        ...coordList
      ];

      return list;
    },
    computerTurn() {
      //Get random positions. Useful when no probabilities were calculated .
      this.computerNextSalvoPositions = this.getRandomPositions(
        this.maxSalvoSize
      );
      this.computerFireSalvo();
    },
    computerFireSalvo() {
      this.$set(
        this.computerSalvoPositions,
        this.salvoTurn,
        this.computerNextSalvoPositions
      );
      this.computerAllSalvoesPositionsList = [
        ...this.computerAllSalvoesPositionsList,
        ...this.computerNextSalvoPositions
      ];
      //Reset timer and flags
      this.$refs.timer.reset();
      this.$refs.timer.setTime({minutes: 0, seconds: this.countDownTime});
      this.$refs.timer.start();
      this.pauseTimer = true;
      this.canFireSalvo = true;
      this.homeTurn = true;
    }
  }
};
</script>

<style scoped>
.user-bg-color {
  background-color: #373d5598;
}

.game-box {
  background-color: #373d5598;
  border: 2px #363a49 solid;
  border-radius: 0 1em;
}

.instruction-box {
  max-width: 700px;
  background-color: rgba(73, 69, 69, 0.61);
  border-radius: 1em;
  border: 2px white solid;
}

.id-indv {
  width: 3em;
}

.id-row {
  display: flex;
  justify-content: flex-start;
}

.middle-flex {
  width: 10vw;
}

.fire-button {
  align-self: center;
  justify-self: center;
}

.spaceBar {
  align-self: center;
  justify-self: center;
  width: 60%;
}

.spaceBar-opaque {
  opacity: 0.4;
}

.popup {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    153deg,
    rgba(2, 0, 36, 0.9248074229691877) 0%,
    rgba(156, 10, 10, 0.7707457983193278) 44%,
    rgba(255, 29, 0, 1) 100%
  );
  background-size: 300%;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 25vh;
  top: 40%;
  left: 0;
  -webkit-animation: slide-in-fwd-center 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-in-hor-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both,
  bg-pan-left 2s infinite both alternate;
}

@-webkit-keyframes scale-in-hor-center {
  0% {
    -webkit-transform: scaleX(0);
    transform: scaleX(0);
    opacity: 0;
  }
  100% {
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
    opacity: 1;
  }
}

@keyframes scale-in-hor-center {
  0% {
    -webkit-transform: scaleX(0);
    transform: scaleX(0);
    opacity: 0;
  }
  100% {
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
    opacity: 1;
  }
}

.bg-pan {
  -webkit-animation: bg-pan-left infinite both;
  animation: bg-pan-left infinite both;
}

@-webkit-keyframes bg-pan-left {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@keyframes bg-pan-left {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
