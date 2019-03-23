<template>
  <v-container
    ma-0
    pa-0
    fluid
  >
    <v-layout
      justify-space-around
      align-center
    >
      <v-flex
        xs12
        class="display-4"
        pa-4
        text-xs-center
      >
        <div class="game-title px-3 tex-carve">BattleWreck</div>
      </v-flex>
    </v-layout>
    <v-layout
      row
      justify-space-around
    >
      <v-flex
        xs5
        class="box"
      >
        <v-layout
          column
          justify-center
          px-2
        >
          <v-flex
            pb-1
            class="subheading text-xs-center"
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
          ></v-divider>
          <v-flex
            py-3
            text-xs-center
          >
            <div class="py-3 title">Game screen shots</div>
            <VueperSlides
              :visible-slides="2"
              slide-multiple
              :slide-ratio="1 / 4"
              :arrows-outside="false"
            >
              <VueperSlide
                v-for="i in 7"
                :key="i"
                :image="
                  require(`../assets/landingImages/in_game_image00${i}.jpg`)
                "
              ></VueperSlide>
            </VueperSlides>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex
        xs5
        class="box"
      >
        <v-layout
          row
          wrap
          justify-center
          align-center
          fill-height
        >
          <v-flex
            v-if="!isAuthenticated"
            xs12
            text-xs-center
            pa-3
          >
            <h3 class="display-1">Identify yourself before playing</h3>
          </v-flex>

          <v-flex
            v-if="isAuthenticated"
            xs12
            text-xs-center
          >
            <h3 class=" pa-3 display-1">Battle Mode:</h3>
            <v-layout
              row
              justify-space-around
            >
              <v-hover>
                <v-flex
                  slot-scope="{ hover }"
                  :class="[`elevation-${hover ? 12 : 0}`]"
                  class="modebox"
                  xs5
                  pa-2
                >
                  <v-layout
                    justify-center
                    fill-height
                    row
                    wrap
                  >
                    <v-flex xs12>
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
                          :label="item.display"
                          :value="item"
                          :color="item.color"
                        ></v-radio>
                      </v-radio-group>
                    </v-flex>
                    <v-flex
                      shrink
                      align-self-center
                    >
                      <v-btn
                        :color="radios.color"
                        @click="gameVsComputer()"
                      >{{
                        $vuetify.breakpoint.mdAndDown ? "" : "Solo - "
                        }}
                        PLAY</v-btn>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-hover>
              <v-hover>
                <v-flex
                  slot-scope="{ hover }"
                  pa-2
                  :class="[`elevation-${hover ? 12 : 0}`]"
                  class="modebox"
                  xs5
                >
                  <v-layout
                    justify-center
                    fill-height
                    row
                    wrap
                  >
                    <v-flex xs12>
                      Play against other players
                    </v-flex>
                    <v-flex xs12>
                      <v-btn
                        color="#ffe241"
                        to="/lobby"
                      >Multiplayer</v-btn>
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
            <Registration
              v-if="!isAuthenticated"
              class="card-box"
            />
            <UserOverview
              v-if="isAuthenticated"
              :user="currentUser"
            />
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Registration from "../components/Registration.vue";
import UserOverview from "../components/UserOverview.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { VueperSlides, VueperSlide } from "vueperslides";

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
      radios: { display: "Normal", diff: "normal", color: "green" },
      difficultyItems: [
        { display: "Normal", diff: "normal", color: "green" },
        { display: "Hard", diff: "hard", color: "orange" },
        { display: "Insane", diff: "insane", color: "red" },
        { display: "Troll", diff: "troll", color: "purple" }
      ]
    };
  },
  computed: {
    ...mapGetters(["currentUser", "isAuthenticated"])
  },
  methods: {
    gameVsComputer() {
      this.$store.commit("setGameDisplayed", {});
      this.$router.push({
        name: "computer",
        params: { difficulty: this.radios }
      });
    }
  }
};
</script>
<style scoped>
.box {
  background-color: #3a4e5ec2;
  border: 2px solid #ffe241;
  border-radius: 0.5em;
  box-shadow: 0px 0px 53px 11px rgba(102, 88, 51, 0.8);
}
.modebox {
  border: 1px solid #ffe241;
  border-radius: 0.5em;
}

.game-title {
  font-family: "Black Ops One", cursive;
  transform: rotate(
    -3deg
  ); /* background-image: url("../assets/textures/metal_rivets_h.jpg");
  background-size: contain;
  background-repeat: repeat-x; */
  text-shadow: 3px 5px 2px #474747;
}
</style>
