import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
Vue.use(Vuex);
const qs = require("querystring");

export default new Vuex.Store({
  state: {
    // webUrl: "http://localhost:8080/api",
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
    avatarComputer: {
      src: require("./assets/avatars/computer_avatar.png"),
      alt: "avatar computer",
      name: "Computer",
      id: 11
    },
    avatarList: [
      {
        src: require("./assets/avatars/anonymous_male_captain.png"),
        alt: "avatar",
        name: "Anonymous",
        id: 1
      },
      {
        src: require("./assets/avatars/anonymous_female_captain.png"),
        alt: "avatar",
        name: "Anonymous",
        id: 2
      },
      {
        src: require("./assets/avatars/captain_crunch.png"),
        alt: "avatar",
        name: "Crunch",
        id: 3
      },
      {
        src: require("./assets/avatars/captain_haddock.png"),
        alt: "avatar",
        name: "Haddock",
        id: 4
      },
      {
        src: require("./assets/avatars/captain_hook_avatar.png"),
        alt: "avatar",
        name: "Hook",
        id: 5
      },
      {
        src: require("./assets/avatars/captain-jack-sparrow.png"),
        alt: "avatar",
        name: "Jack Sparrow",
        id: 6
      },
      {
        src: require("./assets/avatars/popeye_avatar.png"),
        alt: "avatar",
        name: "Popeye",
        id: 7
      },
      {
        src: require("./assets/avatars/simson_old_sea_avatar.png"),
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
      if (state.userInfo && state.userInfo != null) {
        return state.userInfo;
      } else if (state.gamesInfo && state.gamesInfo.player != null) {
        return state.gamesInfo.player;
      } else return state.defaultAnonymousPlayer;
    },
    isAuthenticated(state) {
      return state.loggedIn;
    },
    isPageRestricted(state) {
      state.restricted;
    },
    authStatus(state) {
      return state.status;
    },
    getServerMessage(state) {
      return state.serverMessage;
    }
  },
  mutations: {
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
    authSuccess(state) {
      state.loggedIn = true;
      state.status = "success";
    },
    authLogOut(state) {
      state.loggedIn = false;
      state.status = "logout";
      state.userInfo = null;
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
    authRequest({ commit, state }, payload) {
      commit("authRequest");
      let requestUrl = state.webUrl + payload.rqUrl;
      const options = {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data: qs.stringify(payload.data),
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
            commit(payload.mutation, res.data);
            commit("dataIsReady");
            commit("userAuthorized");
            commit("setServerMessage", res.status + " :: User authorized");
            resolve(res.status);
          })
          .catch(err => {
            commit("dataIsReady");
            commit("userUnauthorized");
            if (err.response) {
              commit("setServerMessage", err.response.data.error);
              commit("userUnauthorized");
              if (err.response.status == 401) {
                commit("authLogOut");
              }
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
            reject(err);
          });
      });
    }
  }
});
