<template>
  <v-container
    ma-0
    pa-0
    fluid
  >
    <v-layout
      row
      wrap
    >
      <v-flex
        xs12
        md10
        pa-2
      >
        <div>GAME STATE: {{ gameState }}</div>

      </v-flex>
    </v-layout>
    <v-layout justify-space-between>
      <v-flex
        xs6
        md5
        xl4
      >
        <UserOverview :user="currentUser" />
      </v-flex>
      <v-flex
        xs6
        md5
        xl4
      >
        <UserOverview :is-user="false" />
      </v-flex>
    </v-layout>
    <v-layout
      justify-space-between
      align-content-space-around
      row
      class="pa-3 elevation-8 game-box"
    >
      <!-- Ship Placement Grid -->
      <v-flex>
        <v-layout
          row
          justify-center
        >
          <v-flex
            v-if="!placingShips"
            grow
          >
            <v-layout
              column
              px-1
            >
              <FleetStatus
                :key="resetKey"
                :fleet-state="homeFleetState"
                :image-base-width="cellSize"
                :fleet-name="'Your Fleet'"
              ></FleetStatus>
            </v-layout>
          </v-flex>
          <v-flex shrink>
            <h3 class="title">Your Grid</h3>
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
            xs6
            px-2
            mx-1
          >
            <h3 class="title">Your Fleet</h3>
            <v-layout
              column
              fill-height
              justify-center
            >
              <h4 class="subheading">Ship grid positions</h4>
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
                    :class="ship == selectedShip ? 'blue-grey darken-1' : ''"
                  >
                    <span>{{ ship }}</span>
                  </td>
                  <td class="id-row">
                    <div
                      v-for="id in location"
                      :key="ship + id"
                      class="px-2 id-indv"
                      :class="ship == selectedShip ? 'blue-grey darken-1' : ''"
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
                    <v-icon color="blue px-1">cached</v-icon>
                    button.
                  </p>
                  <p>
                    You can also decide to place all ships randomly by click the
                    <v-icon class="px-1">fa-random</v-icon> random button.
                  </p>
                  <p>
                    When you are ready, go to battle by clicking the
                    <v-icon class="px-1">fa-play</v-icon> start button.
                  </p>
                  <p>
                    <v-icon color="red px-1">warning</v-icon> You will not be
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
          ></SalvoMissiles>
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
              :sound-enabled="playSound"
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
              <span v-show="allMissilePlaced || !$vuetify.breakpoint.smAndDown">FIRE!</span>
            </v-btn>
          </v-flex>
          <v-flex
            class="text-xs-center spaceBar"
            :class="{ 'spaceBar-opaque': homeNextSalvoPositions.length == 0 }"
          >
            <span> or press</span>
            <v-img :src="require('../assets/spaceBar.png')"></v-img>
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
                  >timer</v-icon>
                  <v-icon
                    v-show="!pauseTimer"
                    large
                    color="white"
                  >timer_off</v-icon>
                </v-btn>
              </v-flex>
              <v-flex text-xs-center>
                <v-btn
                  icon
                  @click="playSound = !playSound"
                >
                  <v-icon
                    v-show="playSound"
                    large
                    color="white"
                  >volume_up</v-icon>
                  <v-icon
                    v-show="!playSound"
                    large
                    color="white"
                  >volume_off</v-icon>
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
              >
              </Grid>
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
              ></FleetStatus>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-expand-x-transition>
    </v-layout>

    <v-layout
      v-show="gameFinished"
      class="popup "
      column
    >
      <span
        v-if="gameState == 'TIE'"
        class="display-3"
      >YOU TIED</span>
      <span
        v-if="gameState == 'HOME_WINS'"
        class="display-3"
      >YOU WIN!</span>
      <span
        v-if="gameState == 'COMPUTER_WINS'"
        class="display-3"
      >YOU LOSE</span>
      <span
        v-if="gameState == 'PROGRESS'"
        class="display-3"
      >TEST PROGRESS</span>
      <v-flex>
        <v-btn @click="forceResetComponent()"> Play again?</v-btn>
        <v-btn @click="$router.push('/')">Back to Menu</v-btn>
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
import { mapState, mapGetters, mapActions } from "vuex";

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
      default: () => ({ display: "Normal", diff: "normal", color: "green" })
    }
  },
  data() {
    return {
      // countDownTime: 90,
      gameStart: false,
      pauseTimer: false,
      playSound: true,
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
          imgSrc: "/Carrier/ShipCarrierHull"
        },
        {
          type: "battleship",
          hits: [],
          shipLength: 4,
          initPosition: ["I5", "I6", "I7", "I8"],
          imgSrc: "/Battleship/ShipBattleshipHull"
        },
        {
          type: "destroyer",
          hits: [],
          shipLength: 3,
          initPosition: ["C7", "C8", "C9"],
          imgSrc: "/Destroyer/ShipDestroyerHull"
        },
        {
          type: "submarine",
          hits: [],
          shipLength: 3,
          initPosition: ["D2", "E2", "F2"],
          imgSrc: "/Submarine/ShipSubMarineHull"
        },
        {
          type: "patrolboat",
          hits: [],
          shipLength: 2,
          initPosition: ["E5", "F5"],
          imgSrc: "/PatrolBoat/ShipPatrolHull"
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
  watch: {
    pauseTimer(newVal) {
      console.log("PauseTImer:", newVal);
      if (newVal && this.gameStart) {
        this.$refs.timer.start();
      } else this.$refs.timer.stop();
    }
  },
  created() {
    this.placeShipRandomly(this.homeShips);
    this.placeShipRandomly(this.computerShips);
  },

  mounted() {
    this.getUserData();
    //Prevent space default behavior
    window.onkeydown = function(event) {
      if (event.keyCode === 32) {
        event.preventDefault();
      }
    };
    //Prevent text selection
    document.onselectstart = function() {
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
  computed: {
    ...mapState(["serverMessage", "loading", "pageIsRestricted", "gamesInfo"]),
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
      if (showHelp == "true") return true;
      else return false;
    },
    cellSize() {
      let innerWidth = window.innerWidth;
      if (this.$vuetify.breakpoint) innerWidth = this.$vuetify.breakpoint.width;
      let newPixelValue = +((innerWidth * 0.28) / (this.gridSize + 1)).toFixed(
        0
      );
      if (newPixelValue != NaN) return newPixelValue;
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
      return { userName: "Anonymous" };
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
        //console.log(ship);
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
          obj[this.getIdfromCoord(i, j)] = { prob: prob, x: i, y: j };
        }
      }
      return obj;
    },

    gameState() {
      this.gameFinished = false;
      if (!this.homeTurn) return "PROGRESS";
      //allComputerShips are sunk?
      let hitsOnComputerShips = this.homeAllSalvoesPositionsList.filter(pos =>
        this.computerShipsPositionList.includes(pos)
      );
      let hitsOnHomeShips = this.computerAllSalvoesPositionsList.filter(pos =>
        this.homeShipsPositionList.includes(pos)
      );
      let homeWins =
        hitsOnComputerShips.length >= this.computerShipsPositionList.length;
      let computerWins =
        hitsOnHomeShips.length >= this.homeShipsPositionList.length;

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
        // let shipPositions = this.shipPositions[ship.type];
        // //console.log("shipPositions", shipPositions);

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
          AllHits: [],
          AllMissed: [],
          fleetState: {},
          hitsLoc: hit,
          missLoc: missed
        };
      }
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
          AllHits: [],
          AllMissed: [],
          fleetState: {},
          hitsLoc: hit,
          missLoc: missed
        };
      }
      this.$set(this.homeAllSalvoResult, "missed", allMissed);
      this.$set(this.homeAllSalvoResult, "hit", allHit);
      // this.homeAllSalvoResult = { missed: allMissed, hit: allHit };
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
  methods: {
    ...mapActions(["authRequest", "getData", "postData"]),
    getUserData() {
      if (this.currentUser.id == null || !this.isAuthenticated) {
        //console.log("gameComputer no userInfo, try to logged in and get data");
        let payload = {
          data: {},
          rqUrl: "/checkLog"
        };
        this.authRequest(payload).then(
          res => {
            //console.log("loggedIn");
            //console.log(res);
            //console.log("Trying to get player data");
            this.getData({ url: "/player", mutation: "setUserInfo" });
          },
          err => {
            //console.log("Not logged in");
            console.error(err);
            this.$store.commit("authLogOut");
          }
        );
      }
    },
    wizardUnpausedTimer(val) {
      //console.log("WIZARD UNPAUSED", val);
      this.pauseTimer = val;
    },
    timerEnd() {
      //timer end emitted event
      //pass turn by sending current salvo locations
      //console.log("TIMER ENDED! Pass salvo");
      this.fireSalvo();
    },
    forceResetComponent() {
      Object.assign(this.$data, this.$options.data());
      this.resetKey += 1;
      this.placeShipRandomly(this.computerShips);
    },
    gameKeyDownEvent(event) {
      //console.log("KEY EVENT IN GAMECOMPUTER:", event);
      if (!this.placingShips && event.keyCode == 32) {
        this.fireSalvo();
      }
      // if (this.placingShips && event.keyCode == 82) {
      //   let shipRef = "ship_" + this.selectedShip;
      //   console.log(this.$refs, this.$refs.shipRef);
      //   if (this.$refs[shipRef]) this.$refs[shipRef][0].rotateShip();
      // }
    },
    getDuplicates(arr) {
      var object = {};
      var result = [];

      arr.forEach(function(item) {
        if (!object[item]) object[item] = 0;
        object[item] += 1;
      });

      for (var prop in object) {
        if (object[prop] >= 2) {
          result.push(prop);
        }
      }
      return result;
    },
    placeShipRandomly(shipFleet) {
      //reinit gameShipFleet positions.
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
            let shipLocation = this.getShipIdList(
              randomX,
              randomY,
              ship.shipLength,
              randomDirection
            );
            ship.initPosition = shipLocation;
            illegalPlacement = false;
          } else continue;
        }
      }
    },
    getShipIdList(x, y, length, rotation) {
      let listLoc = [];
      for (let i = 0; i < length; i++) {
        if (rotation) {
          listLoc.push(this.getIdfromCoord(x + i, y));
        } else {
          listLoc.push(this.getIdfromCoord(x, y + i));
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
            if (s.type != ship.type) return s.initPosition;
            else return [];
          })
        );
        let shipLoc = this.getShipIdList(x, y, ship.shipLength, rotation);
        if (otherShipLocationList.some(r => shipLoc.indexOf(r) >= 0))
          return false;
        else return true;
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
        adj.push({ cellID: this.getIdfromCoord(x, y + 1), x: x, y: y + 1 });
      if (y - 1 > 0)
        adj.push({ cellID: this.getIdfromCoord(x, y - 1), x: x, y: y - 1 });
      if (x + 1 <= this.gridSize)
        adj.push({ cellID: this.getIdfromCoord(x + 1, y), x: x + 1, y: y });
      if (x - 1 > 0)
        adj.push({ cellID: this.getIdfromCoord(x - 1, y), x: x - 1, y: y });

      return adj;
    },
    getMaxProbCellID(obj) {
      let arr = Object.values(obj);
      // arr = arr.map(obj => obj.prob);
      let max = Math.max(...arr.map(obj => obj.prob));
      return Object.keys(obj).find(key => obj[key].prob === max);
    },
    getIdfromCoord(row, col) {
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
      // console.log("DEBUG: endOfShip: " + endOfShip + " L: " + L + "");
      if (endOfShip > this.gridSize) return false;

      //check if ship position hit obstacle (hit)
      for (let i = z; i <= endOfShip; i++) {
        let idPos = rotation
          ? this.getIdfromCoord(i, y)
          : this.getIdfromCoord(x, i);
        // console.log("Rotation: " + rotation + " idPOs: ", idPos);
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
        if (value.type == ship.type) {
          ship.initPosition = value.initPosition;
        }
      }
    },

    salvoTarget(target) {
      if (!this.canFireSalvo) {
        return;
      }
      // console.log("CLICK EVENT TARGET", target);
      let newPosition =
        this.toRowName(target.dataset.row) + "" + target.dataset.col;

      if (!newPosition.match(/^[A-Z0-9]+$/)) {
        //Check if id of targets correspond to id regex A1 C4...
        //console.log("Not matching a ID, return");
        return;
      }
      let playerSalvoes = this.homeSalvoPositions;

      if (playerSalvoes[this.salvoTurn] == undefined)
        playerSalvoes[this.salvoTurn] = [];

      // console.log("playerSalvoes", playerSalvoes);
      //check if newPosition is not already fired at
      let alreadyFiredPosition = false;
      // console.log("Current turn", this.salvoTurn);
      for (const key of Object.keys(playerSalvoes)) {
        if (playerSalvoes[key].includes(newPosition) && key != this.salvoTurn) {
          alreadyFiredPosition = true;
          break;
        }
      }

      if (alreadyFiredPosition) {
        //console.log("ALREADY FIRED AT THIS POSITION? IGNORE...");
        return;
      }
      // console.log("Already fired at this position?", alreadyFiredPosition);

      let currentSalvoesPositions = this.homeNextSalvoPositions;
      // console.log(currentSalvoesPositions);

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
      this.homeNextSalvoPositions = currentSalvoesPositions;
      // console.log(
      //   "CurrentTurn: " + this.salvoTurn + " - Current salvoes: ",
      //   currentSalvoesPositions
      // );
    },
    objIsEmpty(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    },
    overlappingShips() {
      //flatten all the ships positions to an array
      let shipsPos = this.shipPositions;
      let arrays = Object.values(shipsPos);
      let newFlattenArray = [];
      for (let arrayOfPos of arrays) {
        //console.log(arrayOfPos);
        newFlattenArray.push(arrayOfPos);
      }
      newFlattenArray = newFlattenArray.flat();
      // console.log(newFlattenArray);
      //find duplicates:
      return new Set(newFlattenArray).size !== newFlattenArray.length;
    },
    toRowName(num) {
      //Get String value for a number. Excel's style.
      for (var ret = "", a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
      }
      return ret;
    },
    ready() {
      if (Object.keys(this.shipPositions).length < this.homeShips.length) {
        //console.log("Ships positions missings");
        this.placingShips = true;
        this.showSalvo = false;

        return;
      }
      if (this.overlappingShips()) {
        //console.log("There is overlapping ships!");
        this.placingShips = true;
        this.showSalvo = false;
        return;
      }
      // this.cellSize = 20;
      this.placingShips = false;
      this.showSalvo = true;
      this.canFireSalvo = true;
      this.selectedShip = "";
      // this.$refs.timer.setTime({minutes:2,secondes:0});
      this.$refs.timer.setTime({ minutes: 0, secondes: this.countDownTime });
      //console.log("READY! -> OK");
    },
    fireSalvo() {
      //add some verifications here
      if (this.canFireSalvo) {
        this.canFireSalvo = false;
        this.$set(
          this.homeSalvoPositions,
          this.salvoTurn,
          this.homeNextSalvoPositions
        );
        this.homeAllSalvoesPositionsList = [
          ...this.homeAllSalvoesPositionsList,
          ...this.homeNextSalvoPositions
        ];
        this.homeNextSalvoPositions = [];

        this.$refs.timer.reset();
        //only time initialize for timer to now it can start
        this.gameStart = true;
        this.homeTurn = false;
        //wait 1 s before computer turns for a more paced game;
        setTimeout(() => {
          this.computerTurn();
        }, 1000);

        this.salvoTurn += 1;
      }
      // this.salvoTurn = this.salvoTurn + 1;
    },
    getRandomPositions(size) {
      let list = [],
        coordList = [];

      //if salvoList length is same size as all the grid positions, (sanity check but normally the game finishes).
      while (
        list.length < size &&
        this.computerAllSalvoesPositionsList.length <
          this.gridSize * this.gridSize
      ) {
        let obj = {};
        let randomX = Math.floor(this.gridSize * Math.random()) + 1;
        let randomY = Math.floor(this.gridSize * Math.random()) + 1;
        //if position already in salvo list, generate new one.
        let idpos = this.getIdfromCoord(randomX, randomY);

        //idpos from max
        if (this.salvoTurn > 1) {
          idpos = this.getMaxProbCellID(this.makeProbabilitiesDTO);
          randomX = this.makeProbabilitiesDTO[idpos].x;
          randomY = this.makeProbabilitiesDTO[idpos].y;
        }

        // console.log(idpos);
        // console.log(this.makeProbabilitiesDTO);
        // console.log("size:", Object.keys(this.makeProbabilitiesDTO).length);
        if (
          !this.computerAllSalvoesPositionsList.includes(idpos) &&
          !list.includes(idpos)
        ) {
          list.push(idpos);
          obj["cellID"] = idpos;
          obj["x"] = randomX;
          obj["y"] = randomY;
          coordList.push(obj);
        }

        delete this.makeProbabilitiesDTO[idpos];
      }
      this.coordinatesComputerSalvo = [
        ...this.coordinatesComputerSalvo,
        ...coordList
      ];

      return list;
    },
    computerTurn() {
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
      //console.log("END OF COMPUTER TURN- RESET TIMER");
      this.$refs.timer.reset();
      this.$refs.timer.setTime({ minutes: 0, secondes: this.countDownTime });
      this.$refs.timer.start();
      this.pauseTimer = true;

      this.canFireSalvo = true;
      this.homeTurn = true;
    }
  }
};
</script>

<style scoped>
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
  /* width: inherit; */
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
  -webkit-animation: slide-in-fwd-center 0.4s
    cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
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
    background-position: 0% 50%;
  }
}
@keyframes bg-pan-left {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
