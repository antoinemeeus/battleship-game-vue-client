import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { Howl, Howler } from "howler";
Vue.use(Vuex);
const qs = require("querystring");

export default new Vuex.Store({
  state: {
    webUrl: process.env.VUE_APP_BASE_URI,
    gamesInfo: [],
    gameDisplayed: {},
    defaultAnonymousPlayer: {
      avatarID: 1,
      id: null,
      userName: "Anonymous ",
      email: "anonymous@anonymous",
      score: { total: 0, won: 0, lost: 0, tied: 0 }
    },
    players: [],
    userInfo: null,
    loggedIn: false,
    status: "",
    restricted: false,
    loading: false,
    pageIsRestricted: false,
    serverMessage: "",
    musicPlaying: true,
    soundEffects: new Howl({
      src: [require("@/assets/sounds/game_sounds_sprite.mp3")],
      sprite: {
        abandonShip: [0, 1907],
        explosion: [1907, 5125],
        fireMissile: [7032, 6269],
        loserTheme: [13301, 11076],
        menuEnter: [24377, 1714],
        menuHover: [26091, 412],
        menuSelect: [26503, 337],
        registrationTick: [26840, 108],
        shipMoving: [26948, 196],
        shotFired: [27144, 1490],
        startGame: [28633, 5564],
        targetDestroyed: [34197, 1358],
        targetSelect: [35556, 733],
        timerEnd: [36289, 611],
        voiceReady: [37202, 878],
        timerTick: [36901, 302],
        enemyShipDestroyed: [38080, 1933],
        winnerTheme: [40013, 11964],
        enemyDestroyedOrSunk: [52010, 1593],
        enemyHeavilyDamaged: [53603, 1593],
        farAwayShot: [55197, 2090],
        loadAndFire1: [57287, 5695],
        loadAndFire2: [62981, 4467],
        loadAndFire3: [67448, 5068],
        waterSplash: [72516, 2064],
        userShipDestroyed1: [74580, 1698],
        userShipDestroyed2: [76278, 1019],
        userShipDestroyed3: [77296, 1646],
        underAttack1: [78942, 1330],
        underAttack2: [80272, 1382],
        underAttack3: [81654, 1028],
        errorIllegalPos: [82682, 751]
      }
    }),
    bgMusic: new Howl({
      src: [require("@/assets/sounds/menu_music_rf.mp3")],
      loop: true,
      autoUnlock: true,
      autoplay: true
    }),
    bgEpicIntro: new Howl({
      src: [require("@/assets/sounds/epic_music_intro.mp3")],
      loop: true
      // autoplay: true,
    }),
    alreadyVisited: false,
    avatarComputer: {
      src: require("./assets/avatars/computer_avatar-min.png"),
      alt: "avatar computer",
      name: "Computer",
      id: 11
    },
    avatarList: [
      {
        src: require("./assets/avatars/anonymous_male_captain-min.png"),
        alt: "avatar",
        name: "Anonymous",
        id: 1
      },
      {
        src: require("./assets/avatars/anonymous_female_captain-min.png"),
        alt: "avatar",
        name: "Anonymous",
        id: 2
      },
      {
        src: require("./assets/avatars/captain_crunch-min.png"),
        alt: "avatar",
        name: "Crunch",
        id: 3
      },
      {
        src: require("./assets/avatars/captain_haddock-min.png"),
        alt: "avatar",
        name: "Haddock",
        id: 4
      },
      {
        src: require("./assets/avatars/captain_hook_avatar-min.png"),
        alt: "avatar",
        name: "Hook",
        id: 5
      },
      {
        src: require("./assets/avatars/captain-jack-sparrow-min.png"),
        alt: "avatar",
        name: "Jack Sparrow",
        id: 6
      },
      {
        src: require("./assets/avatars/popeye_avatar-min.png"),
        alt: "avatar",
        name: "Popeye",
        id: 7
      },
      {
        src: require("./assets/avatars/simson_old_sea_avatar-min.png"),
        alt: "avatar",
        name: "Horatio McCallister",
        id: 8
      }
    ]
  },
  getters: {
    gameStateCode(state) {
      if (state.gameDisplayed.gameState) {
        return state.gameDisplayed.gameState.code;
      }
      return "-2";
    },
    currentUser(state) {
      if (state.userInfo) {
        return state.userInfo;
      } else if (state.gamesInfo && state.gamesInfo.player != null) {
        return state.gamesInfo.player;
      } else return state.defaultAnonymousPlayer;
    },
    isAuthenticated(state) {
      return state.loggedIn;
    },
    isPageRestricted(state) {
      return state.restricted;
    },
    authStatus(state) {
      return state.status;
    },
    getServerMessage(state) {
      return state.serverMessage;
    }
  },
  mutations: {
    setAlreadyVisited(state, payload) {
      state.alreadyVisited = payload;
    },
    playMusic(state) {
      if (!state.musicPlaying) {
        Howler.mute(false);
        state.musicPlaying = true;
      }
    },
    stopMusic(state) {
      Howler.mute(true);
      state.musicPlaying = false;
    },
    setGames(state, payload) {
      state.gamesInfo = payload;
    },
    setGameDisplayed(state, payload) {
      state.gameDisplayed = payload;
    },
    setPlayers(state, payload) {
      state.players = payload;
    },
    setUserInfo(state, payload) {
      state.userInfo = payload;
    },
    setRestrictedAccess(state, payload) {
      state.restricted = payload;
      state.pageIsRestricted = payload;
    },
    setServerMessage(state, payload) {
      state.serverMessage = payload;
    },
    dataIsLoading(state) {
      state.loading = true;
    },
    dataIsReady(state) {
      state.loading = false;
    },
    userAuthorized(state) {
      state.pageIsRestricted = false;
    },
    userUnauthorized(state) {
      state.pageIsRestricted = true;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    userIsLoggedIn(state) {
      state.loggedIn = true;
    },
    authSuccess(state) {
      // state.loggedIn = true;
      state.status = "success";
    },
    authLogOut(state) {
      state.loggedIn = false;
      state.status = "logout";
      state.userInfo = null;
      state.gamesInfo.player = null;
    },
    authRequest(state) {
      state.status = "loading";
    },
    authError(state) {
      state.loggedIn = false;
      state.status = "error";
      state.userInfo = null;
    }
  },
  actions: {
    //Login / Logout logic
    authRequest({ commit, state }, payload) {
      commit("authRequest");
      let requestUrl = state.webUrl + payload.rqUrl;
      const options = {
        method: "POST",
        data: qs.stringify(payload.data),
        headers: { "content-type": "application/x-www-form-urlencoded" },
        withCredentials: true,
        url: requestUrl
      };
      return new Promise((resolve, reject) => {
        axios(options)
          .then(function(res) {
            if (payload.rqUrl.includes("logout")) {
              commit("authLogOut");
            } else {
              commit("authSuccess");
              commit("setRestrictedAccess", false);
            }
            resolve(res);
          })
          .catch(function(err) {
            commit("authError");
            commit("authLogOut");
            commit("setRestrictedAccess", true);
            commit("setUserInfo", null);
            reject(err);
          });
      });
    },
    getData({ state, commit }, payload) {
      commit("dataIsLoading");
      let requestUrl = state.webUrl + payload.url;
      const options = {
        method: "GET",
        withCredentials: true,
        url: requestUrl
      };
      return new Promise((resolve, reject) => {
        axios(options)
          .then(res => {
            if (state.status == "success") commit("userIsLoggedIn");
            commit(payload.mutation, res.data);
            commit("dataIsReady");
            commit("userAuthorized");
            commit("setServerMessage", res.status + " :: User authorized");
            resolve(res.status);
          })
          .catch(err => {
            commit("dataIsReady");
            if (err.response) {
              if (err.response.status == 401) {
                commit("authLogOut");
              }
              commit("setServerMessage", err.response.data.error);
              commit("userUnauthorized");
              reject(err.response);
            }
            reject(err);
          });
      });
    },
    postData({ state, commit }, payload) {
      commit("setLoading", true);
      let requestUrl = state.webUrl + payload.rqUrl;
      const options = {
        method: "POST",
        data: payload.data,
        withCredentials: true,
        url: requestUrl
      };
      return new Promise((resolve, reject) => {
        axios(options)
          .then(function(res) {
            commit("setLoading", false);
            commit("userAuthorized");
            resolve(res);
          })
          .catch(function(err) {
            commit("setLoading", false);
            if (err.response) {
              commit("setServerMessage", err.response.data.error);
              if (err.response.status == 401) {
                commit("userUnauthorized");
                commit("authLogOut");
              }
            }
            reject(err.config);
          });
      });
    }
  }
});
