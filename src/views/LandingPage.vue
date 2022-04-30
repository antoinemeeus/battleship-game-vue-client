<template>
  <v-container
    fluid
    ma-0
    pa-0
  >
    <v-layout
      align-center
      column
      justify-space-around
    >
      <v-flex
        :class="$vuetify.breakpoint.smAndDown ? 'display-2' : 'display-4'"
        pa-4
        text-xs-center
        xs12
      >
        <div class="game-title px-3 tex-carve">
          BattleWreck
        </div>
      </v-flex>
    </v-layout>
    <v-expand-transition>
      <v-layout
        v-show="!alreadyVisited"
        align-center
        class="height-box"
        column
        justify-center
      >
        <v-btn
          class="btn-pulse"
          color="orange"
          large
          light
          @click.prevent="startPlaying()"
        >
          Start Playing!
        </v-btn>
      </v-layout>
    </v-expand-transition>
    <v-expand-transition>
      <v-layout
        v-show="alreadyVisited"
        justify-space-around
        row
        wrap
      >
        <v-flex
          class="box"
          md5
        >
          <v-layout
            column
            justify-center
            px-2
          >
            <v-flex
              class="subheading text-xs-center"
              pb-1
            >
              <div class="display-1 text-xs-center  pa-3">
                Welcome aboard, budding captain!
              </div>
              <p>Dive into the classic battleship game!</p>
              <p>
                Challenge yourself to find your opponent ships and sink them by
                shooting them with truckloads of missiles!
              </p>
              <p>
                You can play online and clash with others players in an epic
                battle of wits!
              </p>
              <p>
                Or you can play alone to hone your skills before diving back in
                the multiplayer mode.
              </p>
            </v-flex>
            <v-divider
              dark
              py-3
            />
            <v-flex
              v-if="$vuetify.breakpoint.mdAndUp"
              py-3
              text-xs-center
            >
              <div class="py-3 title">
                Game screen shots
              </div>
              <VueperSlides
                :arrows-outside="false"
                :slide-ratio="1 / 4"
                :visible-slides="2"
                slide-multiple
              >
                <VueperSlide
                  v-for="i in 6"
                  :key="i"
                  :image="
                    require(`../assets/landingImages/in_game_image00${i}.jpg`)
                  "
                />
              </VueperSlides>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex
          class="box"
          md5
        >
          <v-layout
            align-center
            fill-height
            justify-center
            row
            wrap
          >
            <v-flex
              v-if="!isAuthenticated"
              pa-3
              text-xs-center
              xs12
            >
              <h3 class="display-1">
                Battle Mode:
              </h3>
            </v-flex>
            <v-flex
              text-xs-center
              xs12
            >
              <v-layout
                justify-space-around
                row
              >
                <v-hover>
                  <v-flex
                    slot-scope="{ hover }"
                    :class="[`elevation-${hover ? 12 : 0}`]"
                    class="modebox"
                    pa-2
                    xs5
                    @mouseenter="soundEffects.play('menuHover',true)"
                  >
                    <v-layout
                      fill-height
                      justify-center
                      row
                      wrap
                    >
                      <v-flex
                        class="title"
                        xs12
                      >
                        Play against the computer
                      </v-flex>
                      <v-flex xs5>
                        <v-radio-group
                          v-model="radios"
                          dark
                          hide-details
                        >
                          <v-radio
                            v-for="(item, i) in difficultyItems"
                            :key="i"
                            :color="item.color"
                            :label="item.display"
                            :value="item"
                          />
                        </v-radio-group>
                      </v-flex>
                      <v-flex
                        align-self-center
                        shrink
                      >
                        <v-btn
                          :color="radios.color"
                          @click="gameVsComputer()"
                        >
                          {{ $vuetify.breakpoint.mdAndDown ? "" : "Solo - " }}
                          PLAY
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-hover>
                <v-hover>
                  <v-flex
                    slot-scope="{ hover }"
                    :class="[`elevation-${hover ? 12 : 0}`]"
                    class="modebox"
                    pa-2
                    xs5
                    @mouseenter="soundEffects.play('menuHover',true)"
                  >
                    <v-layout
                      fill-height
                      justify-center
                      row
                      wrap
                    >
                      <v-flex
                        class="title"
                        xs12
                      >
                        Play against other players
                      </v-flex>
                      <v-flex xs12>
                        <v-btn
                          color="#ffe241"
                          @click="multiplayerSelected()"
                        >
                          Multiplayer
                        </v-btn>
                      </v-flex>
                      <v-flex
                        v-if="!isAuthenticated"
                        xs12
                      >
                        You need to be logged in to play online
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-hover>
              </v-layout>
            </v-flex>

            <v-flex
              ma-3
              xs8
            >
              <v-layout justify-center>
                <!-- <Registration
            v-if="!isAuthenticated"
            class="card-box"
            /> -->
                <v-dialog
                  v-if="!isAuthenticated"
                  v-model="dialog"
                  max-width="500"
                >
                  <v-flex shrink>
                    <v-flex
                      class=" title white black--text"
                      py-2
                      text-xs-center
                    >
                      <span>Identify yourself before playing in multiplayer
                        mode</span>
                    </v-flex>
                    <Registration @loginSuccess="closeModal" />
                  </v-flex>
                </v-dialog>
                <UserOverview
                  v-if="isAuthenticated"
                  :user="currentUser"
                />
              </v-layout>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-expand-transition>
  </v-container>
</template>

<script>
import Registration from "../components/Registration.vue";
import UserOverview from "../components/UserOverview.vue";
import {mapGetters, mapState} from "vuex";
import {VueperSlide, VueperSlides} from "vueperslides";
import "vueperslides/dist/vueperslides.css";

export default {
    name: "LandingPage",
    components: {
        Registration,
        UserOverview,
        VueperSlides,
        VueperSlide
    },
    data() {
        return {
            dialog: false,
            radios: {display: "Normal", diff: "normal", color: "green"},
            difficultyItems: [
                {display: "Normal", diff: "normal", color: "green"},
                {display: "Hard", diff: "hard", color: "orange"},
                {display: "Insane", diff: "insane", color: "red"},
                {display: "Troll", diff: "troll", color: "purple"}
            ]
        };
    },
    computed: {
        ...mapGetters(["currentUser", "isAuthenticated"]),
        ...mapState(["musicPlaying", "soundEffects", "bgMusic", "alreadyVisited"])
    },
    watch: {
        radios() {
            this.soundEffects.play("menuSelect", true);
        }
    },
    mounted() {
        if (!this.bgMusic.playing()) this.bgMusic.fade(0.0, 0.6, 1500);
    },
    methods: {
        multiplayerSelected() {
            if (this.isAuthenticated) {
                this.$router.push("/lobby");
                this.soundEffects.play("menuEnter", false);
            } else {
                this.soundEffects.play("registrationTick", true);
                this.dialog = true;
            }
        },
        startPlaying() {
            if (!this.bgMusic.playing()) this.bgMusic.fade(0.0, 0.6, 1500);
            this.$store.commit("setAlreadyVisited", true);
        },
        gameVsComputer() {
            this.soundEffects.play("menuEnter", false);
            this.$store.commit("setGameDisplayed", {});
            this.$router.push({
                name: "computer",
                params: {difficulty: this.radios}
            });
        },
        closeModal(value) {
            if (value)
                setTimeout(() => {
                    this.dialog = false;
                    this.soundEffects.play("menuEnter", false);
                    this.$router.push("/lobby");
                }, 3500);
        }
    }
};
</script>
<style scoped>
.box {
    background-color: #3a4e5ec2;
    border: 2px solid #ffe241;
    border-radius: 0.5em;
    box-shadow: 0 0 53px 11px rgba(102, 88, 51, 0.8);
}

.modebox {
    border: 1px solid #ffe241;
    border-radius: 0.5em;
}

.game-title {
    font-family: "Black Ops One", cursive;
    transform: rotate(-3deg);
    text-shadow: 3px 5px 2px #474747;
}

.height-box {
    height: 50vh;
}

.btn-pulse {
    border: 1px solid rgba(255, 237, 77, 0.486);
    box-shadow: 0 0 0 rgba(233, 197, 40, 0.836);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(233, 197, 40, 0.836);
    }
    70% {
        box-shadow: 0 0 0 20px rgba(233, 197, 40, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(233, 197, 40, 0);
    }
}
</style>
