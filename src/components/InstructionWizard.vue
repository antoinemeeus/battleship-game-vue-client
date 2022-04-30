<template>
  <v-layout
    justify-center
    row
  >
    <v-dialog
      v-model="dialog"
      max-width="800"
    >
      <template #activator="{ on }">
        <v-btn
          icon
          v-on="on"
        >
          <v-icon large>
            help_outline
          </v-icon>
        </v-btn>
      </template>
      <v-card
        class="roundCorners"
        elevation="8"
      >
        <v-card-title class="headline">
          How to play
        </v-card-title>
        <v-card-text>
          <v-flex>
            <ul>
              <li>
                <p>
                  The game the game proceeds in a series of rounds. In each
                  round, you have {{ nbOfShots }} missile(s) in a salvo to place
                  in the opponent's grid, which is to be shot at.
                </p>
              </li>
              <li>
                <p>
                  Using your mouse, click on the enemy grid cells where to place
                  a salvo.
                  <img
                    alt="aim cursor"
                    class="aim-img px-2"
                    src="../assets/tutorial/cursor_AimTarget.png"
                  >. If you change your mind on a shot position, just click
                  again on the selected cell to cancel the selection.
                </p>
              </li>
              <li>
                <p>
                  <img
                    alt="possible launch buttons"
                    class="aim-img px-2"
                    src="../assets/tutorial/launchBtnSB.png"
                  >
                  Once at least one shot is placed on the enemy grid, you can
                  send your salvo by clicking the button fire that is in the
                  middle or by pressing the space key of the keyboard. Of course, it
                  is better if you place all available missiles on the enemy
                  grid to increase the chance to hit a ship.
                </p>
              </li>
              <li>
                <p>
                  After a few second you can see the result of your shots on the
                  enemy grid.
                  <img
                    alt="missed cell"
                    class="aim-img px-2"
                    src="../assets/tutorial/missedCell.png"
                  >
                  blue cell means you missed,
                  <img
                    alt="hit cell"
                    class="aim-img px-2"
                    src="../assets/tutorial/hitCell.png"
                  > red
                  cell means you hit a ship
                </p>
              </li>
              <li>
                <p>
                  The number in the top left corner of a shot cell
                  <img
                    alt="hit cell with turn hit"
                    class="aim-img px-2"
                    src="../assets/tutorial/hitCell.png"
                  > is
                  the round in which the salvo was fired.
                </p>
              </li>
              <li>
                <p>
                  To the side of the grids is the fleet status of each player.
                  The fleet status will show you the damage receive by each ship
                  and if it's sunk or not. Of course, you can't see which
                  opponent's ship you hit until you sink it.
                </p>
              </li>
              <li>
                <p>
                  <img
                    alt="timer"
                    class="aim-img px-2"
                    src="../assets/tutorial/timerImg.png"
                  >
                  The time counter in the middle is the time that is left for you to
                  place your salvo and fire it. If you don't fire your salvo in
                  the time allocated, the already placed shot will be fired
                  automatically, even if your salvo count is 0.
                </p>
              </li>
            </ul>
          </v-flex>
        </v-card-text>
        <v-card-actions>
          <v-checkbox
            v-model="showAgain"
            class="px-2"
            label="Don`t show me this next"
          />
          <v-spacer />
          <v-btn
            color="primary"
            flat
            @click="dialog = !dialog"
          >
            Let's play
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
    components: {},
    props: {
        nbOfShots: {
            type: Number,
            default: 0
        },
    },
    data() {
        return {
            dialog: false,
            showAgain: false
        };
    },
    watch: {
        dialog(newVal) {
            if (newVal === false) {
                let showHelp = !this.showAgain
                localStorage.setItem("showHelp", showHelp.toString());
                this.$emit("pauseTimer", false);
            }
        }
    },
    created() {
        this.getShowHelp();
    },
    methods: {
        getShowHelp() {
            let showHelpBool = localStorage.getItem("showHelp");
            if (showHelpBool === "false") {
                this.dialog = false;
                this.showAgain = true;
                this.$emit("pauseTimer", false);
            } else {
                this.dialog = true;
                this.showAgain = false;
                this.$emit("pauseTimer", true);
            }
        }
    }
};
</script>

<style scoped>
.roundCorners {
    border-radius: 1em;
}

.aim-img {
    height: 2em;
    vertical-align: middle;
}
</style>
