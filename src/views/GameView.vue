<template>
  <v-container
    ma-0
    pa-0
    fluid
  >
    <v-layout
      v-if="pageIsRestricted"
      class="fillHeight"
      justify-center
      align-center
    >
      <v-flex xs6>
        <v-alert
          :value="pageIsRestricted"
          type="warning"
          transition="scale-transition"
          d-block
        >
          <div class="title">Acces Denied</div>
          <div>{{ serverMessage }}</div>
        </v-alert>
      </v-flex>
    </v-layout>
    <div v-if="!pageIsRestricted">
      <v-layout>
        <v-flex>
          <v-snackbar
            v-model="snackbar"
            :timeout="4000"
            top
            vertical
          >
            <h4 class="title">
              Player <span class="orange--text">{{ opponentPlayer.userName }}</span> has joined the battle!
            </h4>
            <v-btn
              color="pink"
              flat
              @click="snackbar = false"
            >
              Close
            </v-btn>
          </v-snackbar>
        </v-flex>
      </v-layout>
      <v-layout justify-space-between>
        <v-flex
          xs6
          md5
          xl4
          class="user-bg-color"
        >
          <UserOverview :user="currentPlayer" />
        </v-flex>
        <v-flex
          xs6
          md5
          xl4
          class="user-bg-color"
        >
          <UserOverview
            :is-user="false"
            :user="opponentPlayer"
            :isUserConnected="isOpponentConnected"
          />
        </v-flex>
      </v-layout>
      <v-layout
        v-show="!gameDisplayed.ships"
        justify-center
        align-center
        class="pa-3 elevation-8 game-box"
      >
        <v-flex
          xs5
          text-xs-center
        >
          <v-progress-circular
            indeterminate
            :size="100"
            color="primary"
          ></v-progress-circular>
        </v-flex>
      </v-layout>
      <v-layout
        v-show="gameDisplayed.ships"
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
              v-show="!placingShips"
              grow
            >
              <v-layout
                column
                px-1
              >
                <FleetStatus
                  :fleet-state="lastUserFleet"
                  :image-base-width="cellSize"
                  :fleet-name="'Your Fleet'"
                ></FleetStatus>
              </v-layout>
            </v-flex>
            <v-flex shrink>
              <h3 class="title">Your Grid</h3>
              <Grid
                :has-ship-list="userShipsPositionList"
                :duplicate-location="getShipOverlappingPositions"
                :turn="salvoTurn"
                :hits="userGridHits"
                :grid-size="gridSize"
                :cell-size="cellSize"
              >
                <Ship
                  v-for="ship in ships"
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
              v-show="placingShips"
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
                        :class="
                          ship == selectedShip ? 'blue-grey darken-1' : ''
                        "
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
                    @click="placeShipRandomly(ships)"
                  >
                    <v-icon>fa-random</v-icon>
                    <span class="pl-2">Random</span>
                  </v-btn>
                  <!-- <v-btn @click="placeShipRandomly(computerShips)">PlaceCOMPUTERShipRandomly</v-btn> -->
                  <v-btn
                    :disabled="!placingShips"
                    :loading="sendingShips"
                    @click.prevent="ready()"
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
                      Arrange your ships by dragging them on your grid. To
                      rotate a ship, click on the
                      <v-icon color="blue px-1">cached</v-icon>
                      button.
                    </p>
                    <p>
                      You can also decide to place all ships randomly by click
                      the <v-icon class="px-1">fa-random</v-icon> random button.
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
              :salvo-size="salvoPositions.length"
              :missile-number="maxSalvoSize"
            ></SalvoMissiles>
            <v-flex
              pa-1
              pt-2
              class="title font-weight-bold text-xs-center"
            >
              Round {{ salvoTurn }}
            </v-flex>
            <v-flex class="subheading text-xs-center">
              <span
                v-if="canFireSalvo"
                class="green--text"
              >It's your turn</span>
              <span
                v-else
                class="red--text"
              >Opponent turn</span>
            </v-flex>
            <v-flex class="text-xs-center">
              <div>Launch button</div>
              <v-btn
                ripple
                class="fire-button"
                :disabled="
                  !canFireSalvo || isGameFinished || salvoPositions <= 0
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
              :class="{ 'spaceBar-opaque': salvoPositions.length == 0 }"
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
                  v-if="!placingShips && displayWizard"
                  :nb-of-shots="maxSalvoSize"
                />
                <v-flex text-xs-center>
                  <v-btn
                    icon
                    @click="soundOnOff()"
                  >
                    <v-icon
                      v-show="musicPlaying"
                      large
                      color="white"
                    >volume_up</v-icon>
                    <v-icon
                      v-show="!musicPlaying"
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
                  ref="salvoGrid"
                  :assignedID="'salvoGrid'"
                  :turn="salvoTurn"
                  :has-ship-list="isGameFinished ? [] : []"
                  :grid-size="gridSize"
                  :cell-size="cellSize"
                  :is-salvo-target="salvoPositions"
                  :isSalvoLocked="lockedSalvo"
                  :hits="opponentGridHits"
                  :can-fire="canFireSalvo && !isGameFinished"
                  :waiting-for-opponent="waitingOpponent"
                  @salvoGridClicked="salvoTarget"
                >
                </Grid>
              </v-flex>
              <v-flex
                grow
                px-1
              >
                <FleetStatus
                  :fleet-state="lastOpponentFleet"
                  :fleet-name="'Enemy Fleet'"
                  :image-base-width="cellSize * 0.8"
                ></FleetStatus>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-expand-x-transition>
      </v-layout>

      <v-layout
        v-show="isGameFinished"
        class="popup "
        column
      >
        <span class="display-3">{{ gameResult }}</span>
        <span class="title"> {{ resultMsg }} </span>
        <v-flex>
          <v-btn @click="$router.push('/lobby')">Back to Menu</v-btn>
        </v-flex>
      </v-layout>
    </div>
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
  name: "GameView",
  components: {
    Grid,
    Ship,
    FleetStatus,
    SalvoMissiles,
    CountDownTimer,
    InstructionWizard,
    UserOverview
  },
  props: ["gp"],
  data() {
    return {
      snackbar: false,
      userIsReady: false,
      passedRoundCounter: 0,
      alertMsg: "",
      resultMsg: "",
      maxSalvoSize: 5,
      countDownTime: 180,
      timerStartStop: true,
      dialog: false,
      selectedShip: "",
      gridSize: 10,
      autoRefresh: null,
      shipPositions: {},
      salvoPositions: [],
      salvoTurn: 1,
      sendingSalvo: false,
      sendingShips: false,
      lockedSalvo: [],
      ships: [
        {
          type: "carrier",
          shipLength: 5,
          initPosition: ["A2", "A3", "A4", "A5", "A6"],
          imgSrc: "/Carrier/ShipCarrierHull"
        },
        {
          type: "battleship",
          shipLength: 4,
          initPosition: ["I5", "I6", "I7", "I8"],
          imgSrc: "/Battleship/ShipBattleshipHull"
        },
        {
          type: "destroyer",
          shipLength: 3,
          initPosition: ["C7", "C8", "C9"],
          imgSrc: "/Destroyer/ShipDestroyerHull"
        },
        {
          type: "submarine",
          shipLength: 3,
          initPosition: ["D2", "E2", "F2"],
          imgSrc: "/Submarine/ShipSubMarineHull"
        },
        {
          type: "patrolboat",
          shipLength: 2,
          initPosition: ["E5", "F5"],
          imgSrc: "/PatrolBoat/ShipPatrolHull"
        }
      ]
    };
  },
  watch: {
    isAuthenticated(newVal) {
      if (newVal) {
        this.getGame();
      }
    },
    playerSalvoes(newObj, oldObj) {
      if (Object.keys(newObj).length > Object.keys(oldObj).length)
        this.lockedSalvo = [];
    },
    opponentPlayer(newOpponent, oldOpponent) {
      if (newOpponent.id != null && oldOpponent.id == null) {
        // alert(newOpponent.userName + " joined the game!");
        this.snackbar = true;
      }
    },
    gameResult(newVal, oldVal) {
      if (newVal != oldVal) {
        newVal == "WON"
          ? this.soundEffects.play("winnerTheme")
          : this.soundEffects.play("loserTheme");
      }
    },
    gameState(newGameState, oldGameState) {
      if (newGameState.Info) this.resultMsg = newGameState.Info;
      if (newGameState.code > 1) {
        this.userIsReady = true;
      }
      if (this.isGameFinished) {
        this.stopAutoRefresh();
      } else {
        this.setAutoRefresh();
      }
    }
  },
  created() {
    this.placeShipRandomly();
  },
  mounted() {
    this.bgMusic.fade(0.6, 0.0, 1000);
    this.bgEpicIntro.fade(0.0, 0.3, 1500);
    if (!this.bgEpicIntro.playing()) {
      this.bgEpicIntro.play();
    }
    this.sendingSalvo = false;
    window.onkeydown = function(event) {
      if (event.keyCode === 32) {
        event.preventDefault();
      }
    };
    // //Prevent text selection
    // document.onselectstart = function() {
    //   return false;
    // };
    this.$nextTick(() => {
      this.getGame();
      window.addEventListener("keydown", this.gameKeyDownEvent, false);
    });
  },
  beforeRouteLeave(to, from, next) {
    this.bgEpicIntro.fade(0.3, 0.0, 1500);
    this.stopAutoRefresh();
    next();
  },
  beforeDestroy() {
    this.stopAutoRefresh();
    window.removeEventListener("keydown", this.gameKeyDownEvent, false);
    window.onkeydown = null;
  },
  computed: {
    ...mapState([
      "serverMessage",
      "loading",
      "pageIsRestricted",
      "gameDisplayed",
      "defaultAnonymousPlayer",
      "musicPlaying",
      "soundEffects",
      "bgMusic",
      "bgEpicIntro"
    ]),
    ...mapGetters(["currentUser", "isAuthenticated"]),
    lastUpdate() {
      if (this.gameDisplayed) return this.gameDisplayed.lastPlayed;
      return 0;
    },
    displayWizard() {
      return this.userIsReady || !this.placingShips;
    },
    timeLeftToPlayInSec() {
      let now = this.moment.utc();
      let timeSinceLastUpdate = now.diff(this.lastUpdate, "seconds");
      let timeLeftInSec = this.countDownTime - timeSinceLastUpdate;

      return timeLeftInSec;
    },
    allMissilePlaced() {
      return this.salvoPositions.length >= this.maxSalvoSize;
    },
    fireButtonColor() {
      //Dynamic color button depending of number of missile place in a Salvo
      if (this.allMissilePlaced) return "#dc3b3b";
      if (this.salvoPositions.length > 0 && !this.allMissilePlaced)
        return "#ffe419";
      else return "#616163";
    },
    getShipOverlappingPositions() {
      return this.getDuplicates(this.userShipsPositionList);
    },
    cellSize() {
      //Important method for reactivity!
      //Compute the cellSize depending of the window breakpoint with the vuetify.breakpoint helper class.
      //Grid is made of cells that need to be a fixed size.
      let innerWidth = window.innerWidth;
      if (this.$vuetify.breakpoint) innerWidth = this.$vuetify.breakpoint.width;
      let newPixelValue = +((innerWidth * 0.28) / (this.gridSize + 1)).toFixed(
        0
      );
      if (newPixelValue != NaN) return newPixelValue;
      return 40;
    },
    gameResult() {
      //Return String with the result message
      if (this.gameDisplayed && this.gameDisplayed.gameState) {
        switch (this.gameDisplayed.gameState.Status) {
          case "WON":
            return "YOU WON";
          case "TIED":
            return "YOU TIED";
          case "LOST":
            return "YOU LOST";
        }
      }
      return "IN PROGRESS";
    },
    waitingOpToJoin() {
      if (this.gameDisplayed && this.gameDisplayed.gameState) {
        let stateCode = this.gameDisplayed.gameState.code;
        if (stateCode == "0") {
          return true;
        } else return false;
      }
      return true;
    },
    waitingOpponent() {
      if (this.gameDisplayed && this.gameDisplayed.gameState) {
        let stateCode = this.gameDisplayed.gameState.code;
        if (stateCode == "0" || stateCode == "1" || stateCode == "2") {
          return true;
        } else return false;
      }
      return true;
    },

    gameState() {
      //Computed property to handle undefined cases.
      if (this.gameDisplayed) {
        return this.gameDisplayed.gameState;
      }
      return null;
    },
    isGameFinished() {
      if (this.gameState != null) {
        if (this.gameState.code == "5") {
          this.stopAutoRefresh();
          return true;
        }
      }
      return false;
    },
    areShipsPlaced() {
      if (this.gameDisplayed) {
        return this.gameDisplayed.ships.length >= 5;
      }
      return false;
    },
    lastUserFleet() {
      //Get the last turn fleet state from user game to send to fleetStatus component
      if (!this.objIsEmpty(this.userGridHits)) {
        let turns = Object.keys(this.userGridHits);
        let cu_turn = turns.length;
        if (this.userGridHits[cu_turn])
          return this.userGridHits[cu_turn].fleetState;
      }
      return null;
    },
    lastOpponentFleet() {
      //Get the last turn fleet state from opponent game to send to fleetStatus component
      if (!this.objIsEmpty(this.opponentGridHits)) {
        let turns = Object.keys(this.opponentGridHits);
        let cu_turn = turns.length;
        if (this.opponentGridHits[cu_turn])
          return this.opponentGridHits[cu_turn].fleetState;
      }
      return null;
    },
    userGridHits() {
      //Computed property to handle undefined cases.
      if (this.gameDisplayed.hits) {
        let hits = this.gameDisplayed.hits.user;
        if (hits) return hits;
      }
      return {};
    },
    opponentGridHits() {
      //Computed property to handle undefined cases.
      if (this.gameDisplayed.hits) {
        let hits = this.gameDisplayed.hits.opponent;
        if (hits) return hits;
      }
      return {};
    },
    userShipsPositionList() {
      //Get all the ship position from object.
      //Convert object to array.
      let shipLocList = this.shipPositions;
      let listOfList = Object.values(shipLocList);
      return [].concat.apply([], listOfList);
    },
    showSalvo() {
      //Return if opponent has joined the game session.
      if (this.gameDisplayed.gamePlayers) {
        if (this.gameDisplayed.gamePlayers.length < 2) {
          //Waiting for opponent then
          //Return false;
          return true;
        }
      }
      return true;
    },
    placingShips() {
      //Check if user has finished placing ships. Get info from server, no from local.
      if (
        this.gameDisplayed.ships &&
        this.gameDisplayed.ships.length <= 0 &&
        this.gameDisplayed.gameState.code <= 1
      ) {
        return true;
      }
      return false;
    },
    canFireSalvo() {
      //Check if user can fire a salvo.
      if (this.gameState != null) {
        return this.gameState.code == "4" && !this.sendingSalvo;
      }
      return false;
    },
    currentPlayer() {
      //Return the current player from server info
      //Add 2 properties from gamePlayer server info:
      // -LastPlayedDate
      // -LastConenctedDate
      let gamePlayers = this.gameDisplayed.gamePlayers;
      if (gamePlayers) {
        let cur_gp = gamePlayers.find(gameP => gameP.id == this.gp);
        if (cur_gp) {
          let obj = cur_gp.player;
          obj["lastPlayedDate"] = cur_gp.lastPlayedDate;
          obj["lastConnectedDate"] = cur_gp.lastConnectedDate;
          return obj;
        }
      }
      return this.defaultAnonymousPlayer;
    },
    isOpponentConnected() {
      //Return the opponent connection status for visual info to the user
      //False if opponent didn't execute a action (like firing a salvo) since an arbitrary amounnt of time (300s)
      //True if opponent is considered connected
      if (this.opponentPlayer.lastConnectedDate) {
        let now = this.moment();
        let timeDiff = now.diff(
          this.opponentPlayer.lastConnectedDate,
          "seconds"
        );
        return timeDiff < 300;
      }
      return false;
    },
    opponentPlayer() {
      //Return the opponent player from server info
      //Add 2 properties from gamePlayer server info:
      // -LastPlayedDate
      // -LastConenctedDate
      let gamePlayers = this.gameDisplayed.gamePlayers;
      if (gamePlayers) {
        let cur_gp = gamePlayers.find(gameP => gameP.id != this.gp);
        if (cur_gp) {
          let obj = cur_gp.player;
          obj["lastPlayedDate"] = cur_gp.lastPlayedDate;
          obj["lastConnectedDate"] = cur_gp.lastConnectedDate;
          return obj;
        }
      }
      return this.defaultAnonymousPlayer;
    },
    playerSalvoes() {
      if (this.gameDisplayed.salvoes)
        return this.gameDisplayed.salvoes[this.currentPlayer.id];
      return {};
    },
    opponentSalvoes() {
      if (this.opponentPlayer.id != undefined && this.opponentPlayer.id != null)
        return this.gameDisplayed.salvoes[this.opponentPlayer.id];
      return null;
    }
  },
  methods: {
    ...mapActions(["getData", "postData"]),
    soundOnOff() {
      if (this.musicPlaying) {
        this.$store.commit("stopMusic");
      } else {
        this.$store.commit("playMusic");
      }
    },
    gameKeyDownEvent(event) {
      if (event.keyCode == 32) {
        if (!this.placingShips && this.canFireSalvo) this.fireSalvo();
      }
    },
    sendOffLineStatus() {
      let payload = {
        data: "",
        rqUrl: "/games/players/" + this.gp + "/is_OFFLINE"
      };
      //console.log("OFFLINE PAYLOAD: ", payload);
      this.postData(payload).then(
        res => {
          //console.log(res);
          this.alertMsg = "You went inactive";
          //TODO: do something with t
        },
        error => {
          //console.log(error);
          let msg = "update status to offline";
          if (error.response) {
            this.alertMsg = msg + " failed: " + error.response.data.error;
            console.log(error.response.data);
            //console.log(error.response.status);
            //console.log(error.response.headers);
          } else if (error.request) {
            this.alertMsg = msg + " failed : Request Error: " + error.request;
            console.log(error.request);
          } else {
            this.alertMsg =
              requestType + msg + "failed : Settings error:" + error.message;
            console.log("Error message", error.message);
          }
          console.log("Error config", error.config);
        }
      );
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
    placeShipRandomly() {
      this.soundEffects.play("registrationTick");
      let shipCoord;
      //reinit ships positions.
      this.ships.forEach(ship => {
        ship.initPosition = [];
      });
      for (let ship of this.ships) {
        let illegalPlacement = true;
        while (illegalPlacement) {
          let randomX = Math.floor(this.gridSize * Math.random()) + 1;
          let randomY = Math.floor(this.gridSize * Math.random()) + 1;
          let randomDirection = Math.random() >= 0.5;
          if (this.isLegal(randomX, randomY, randomDirection, ship)) {
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
      for (let i = 1; i <= length; i++) {
        if (rotation) {
          listLoc.push(this.getIdfromCoord(x + i, y));
        } else {
          listLoc.push(this.getIdfromCoord(x, y + i));
        }
      }
      return listLoc;
    },
    isLegal(x, y, rotation, ship) {
      // first, check if the ship is within the grid...
      if (this.isWithinBounds(x, y, rotation, ship.shipLength)) {
        // ...then check to make sure it doesn't collide with another ship
        let otherShipLocationList = [].concat.apply(
          [],
          this.ships.map(s => {
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
    getIdfromCoord(row, col) {
      return this.toRowName(row) + "" + col;
    },
    toRowName(num) {
      //Get String value for a number. Excel's style.
      for (var ret = "", a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
      }
      return ret;
    },

    isWithinBounds(x, y, rotation, L) {
      if (rotation) {
        return x + L <= this.gridSize;
      } else {
        return y + L <= this.gridSize;
      }
    },

    setBoardFromServer() {
      if (this.playerSalvoes != undefined) {
        let playerSalvoesTurnsList = Object.keys(this.playerSalvoes);
        this.salvoTurn = Math.max(
          Math.max(...playerSalvoesTurnsList) + 1,
          playerSalvoesTurnsList.length + 1
        );
      } else this.salvoTurn = 1;
      // this.salvoTurn = Object.keys(this.playerSalvoes).length + 1;
      if (this.gameDisplayed.ships) {
        for (let server_ship of this.gameDisplayed.ships) {
          let gridShip = this.ships.find(ship => ship.type == server_ship.type);
          gridShip.initPosition = server_ship.locations;
        }
      }
    },
    setAutoRefresh() {
      var self = this;
      if (this.autoRefresh == null && !this.isGameFinished) {
        this.autoRefresh = setInterval(
          function() {
            if (this.$route.name == "game") self.getGame();
            else this.stopAutoRefresh();
          }.bind(this),
          5000
        );
      }
    },
    stopAutoRefresh() {
      clearInterval(this.autoRefresh);
      this.autoRefresh = null;
    },
    updatePositions(value) {
      this.$set(this.shipPositions, value.type, value.positions);
      this.selectedShip = value.type;
      // this.shipPositions[value.type] = value.positions;
    },
    updateInitPositions(value) {
      for (let ship of this.ships) {
        if (value.type == ship.type) {
          ship.initPosition = value.initPosition;
        }
      }
    },
    salvoTarget(target) {
      //Player is supposed to have click, so it's still alive; Reset passedRoundCounter
      this.passedRoundCounter = 0;
      if (!this.canFireSalvo) {
        return;
      }
      let newPosition =
        this.toRowName(target.dataset.row) + "" + target.dataset.col;

      if (!newPosition.match(/^[A-Z0-9]+$/)) {
        //Check if id of targets correspond to id regex A1 C4...
        //console.log("Not matching a ID, return");
        return;
      }

      let gameD = this.gameDisplayed;
      let playerSalvoes = this.playerSalvoes;
      if (playerSalvoes[this.salvoTurn] == undefined)
        playerSalvoes[this.salvoTurn] = [];

      //check if newPosition is not already fired at
      let alreadyFiredPosition = false;
      for (const key of Object.keys(playerSalvoes)) {
        if (playerSalvoes[key].includes(newPosition) && key != this.salvoTurn) {
          alreadyFiredPosition = true;
          break;
        }
      }
      if (alreadyFiredPosition) {
        return;
      }
      //CanFire
      this.soundEffects.play("targetSelect");
      let currentSalvoesPositions = this.salvoPositions;
      //Check if arrays of salvoPositions doesn't contain duplicates
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
      this.salvoPositions = currentSalvoesPositions;
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
      //find duplicates:
      return new Set(newFlattenArray).size !== newFlattenArray.length;
    },
    sendShipToServer() {
      this.sendingShips = true;
      let entries = Object.entries(this.shipPositions);
      let listOfShip = [];
      for (let [key, value] of entries) {
        //console.log(key, value);
        listOfShip.push({ type: key, locations: value });
      }
      let payload = {
        data: listOfShip,
        rqUrl: "/games/players/" + this.gp + "/ships"
      };
      //console.log("Payload before sending: ", payload);
      // let msgIntro = "Sending ships positions";
      this.postData(payload).then(
        res => {
          //console.log(res);
          this.getData({
            mutation: "setGameDisplayed",
            url: "/game_view/" + this.gp
          }).then(
            res => {
              this.sendingShips = false;
            },
            reject => {
              console.warn("Failed to getGames gameView", reject);
            }
          );
          // this.handleSuccessAlertMsgs(res, msgIntro);
        },
        error => {
          //console.log(error);
          let msg = "post ship";
          if (error.response) {
            this.alertMsg = msg + " failed: " + error.response.data.error;
            console.log(error.response.data);
            //console.log(error.response.status);
            //console.log(error.response.headers);
          } else if (error.request) {
            this.alertMsg = msg + " failed : Request Error: " + error.request;
            console.log(error.request);
          } else {
            this.alertMsg =
              requestType + msg + "failed : Settings error:" + error.message;
            console.log("Error", error.message);
          }
        }
      );
    },
    sendSalvoToServer() {
      if (this.sendingSalvo) return;
      this.sendingSalvo = true;
      this.lockedSalvo = this.salvoPositions;
      let currentSalvo = {
        turnNumber: this.salvoTurn,
        salvoLocations: this.salvoPositions
      };

      let payload = {
        data: currentSalvo,
        rqUrl: "/games/players/" + this.gp + "/salvos"
      };
      //console.log("Payload before sending: ", payload);
      this.salvoPositions = [];
      this.postData(payload).then(
        res => {
          this.getData({
            mutation: "setGameDisplayed",
            url: "/game_view/" + this.gp
          }).then(
            res => {
              this.sendingSalvo = false;
              this.lockedSalvo = [];
            },
            reject => {
              console.warn("Failed to getGames gameView", reject);
            }
          );
        },
        error => {
          this.sendingSalvo = false;
          let msg = "post salvo";
          if (error.response) {
            this.alertMsg = msg + " failed: " + error.response.data.error;
            console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
          } else if (error.request) {
            this.alertMsg = msg + " failed : Request Error: " + error.request;
            console.log(error.request);
          } else {
            this.alertMsg =
              requestType + msg + "failed : Settings error:" + error.message;
            console.log(error.message);
          }
          // this.handleErrorAlertMsgs(err, msgIntro);
        }
      );
    },

    ready() {
      if (Object.keys(this.shipPositions).length < this.ships.length) {
        //console.log("Ships positions missings");
        return;
      }
      if (this.overlappingShips()) {
        //console.log("There is overlapping ships!");
        return;
      }
      console.log("Starting game...");
      this.soundEffects.play("startGame");
      this.userIsReady = true;
      this.sendShipToServer();
      this.selectedShip = "";
      // this.$refs.timer.setTime({minutes:2,secondes:0});
      // this.$refs.timer.setTime({ minutes: 0, secondes: this.countDownTime });

      //console.log("READY! -> OK");
    },
    fireSalvo() {
      let randomNb = Math.floor(Math.random() * 3) + 1;
      let soundId = this.soundEffects.play("loadAndFire" + randomNb);
      this.soundEffects.rate(2.0, soundId);
      this.sendSalvoToServer();
    },
    getGame() {
      this.getData({
        mutation: "setGameDisplayed",
        url: "/game_view/" + this.gp
      }).then(
        res => {
          this.setBoardFromServer();
        },
        reject => {
          console.warn("Failed to getGames gameView", reject);
          //console.log("Failed to getGames gameView", reject);
        }
      );
    }
  }
};
</script>

<style scoped>
.game-box {
  background-color: #373d5598;
  border: 2px #363a49 solid;
  border-radius: 0 0 1em 1em;
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
  min-height: 150px;
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
.fillHeight {
  height: 100vh;
}

.user-bg-color {
  background-color: #373d5598;
}
</style>
