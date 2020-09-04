<template>
  <v-card
    max-width="500"
    min-width="200"
    :light="!isAuthenticated"
    :flat="isAuthenticated"
  >
    <v-card-title
      v-if="!isAuthenticated"
      primary-title
    >
      <v-flex class="title text-xs-center">
        <span v-if="!choiceSignIn">Login</span>
        <span v-if="choiceSignIn">Register</span>
      </v-flex>
    </v-card-title>

    <v-flex
      v-if="!isAuthenticated"
      class="text-xs-center"
    >
      <v-btn
        v-if="choiceSignIn"
        small
        color="primary"
        @click="
          choiceSignIn = !choiceSignIn;
          lastEmailTaken = '';
          soundEffects.play('registrationTick');
        "
      >
        {{
          $vuetify.breakpoint.smAndDown ? "Login" : "Already have an account?"
        }}
      </v-btn>
      <v-btn
        v-if="!choiceSignIn"
        color="primary"
        small
        @click="
          choiceSignIn = !choiceSignIn;
          soundEffects.play('registrationTick');
        "
      >
        Create new account
      </v-btn>
    </v-flex>

    <v-card-text>
      <v-alert
        :value="alert"
        :type="alertType"
        transition="scale-transition"
      >
        {{ alertMsg }}
      </v-alert>
      <v-flex
        v-if="isAuthenticated"
        text-xs-center
      >
        <AvatarsSelection
          v-model="currentUser.avatarID"
          :fixed="true"
        />
      </v-flex>
      <div v-if="!isAuthenticated">
        <v-form
          ref="form"
          v-model="valid"
          method="post"
          lazy-validation
          @submit.prevent="logIn"
        >
          <v-container fluid>
            <v-layout column>
              <v-layout
                v-if="choiceSignIn"
                row
                align-center
              >
                <AvatarsSelection v-model="avatarID" />
                <div class="subheading">
                  Select an avatar.
                </div>
              </v-layout>
              <v-flex
                v-if="choiceSignIn"
                xs12
                md4
              >
                <v-text-field
                  v-model="userName"
                  clearable
                  label="In Game Name"
                  :rules="nameRules"
                  :counter="15"
                  required
                />
              </v-flex>
              <v-flex
                xs12
                md4
              >
                <v-text-field
                  v-model="email"
                  clearable
                  :rules="emailRules"
                  label="Email address"
                  :error-messages="emailIsTaken ? 'E-mail already in use' : ''"
                  :append-icon="emailIsTaken ? 'warning' : ''"
                  required
                />
              </v-flex>
              <v-flex
                xs12
                md4
              >
                <v-text-field
                  v-model="password"
                  label="Password"
                  required
                  :append-icon="showPwd ? 'visibility' : 'visibility_off'"
                  :type="showPwd ? 'text' : 'password'"
                  @click:append="showPwd = !showPwd"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </div>
    </v-card-text>
    <v-flex
      v-if="isAuthenticated"
      pb-3
      class="title text-xs-center"
    >
      <span>Connected as: {{ currentUser.userName }} !</span>
    </v-flex>

    <v-card-actions>
      <v-layout
        v-if="isAuthenticated"
        justify-center
      >
        <v-expand-transition>
          <v-btn
            color="red"
            type="submit"
            :loading="status === 'loading'"
            @click="logOut"
          >
            <v-icon>exit_to_app</v-icon>
            <span class="px-2">Log out</span>
          </v-btn>
        </v-expand-transition>
      </v-layout>
      <v-layout
        v-if="!isAuthenticated"
        align-center
        justify-center
      >
        <v-btn
          v-if="!choiceSignIn && !isAuthenticated"
          :loading="status === 'loading'"
          :disabled="status === 'loading' || !valid"
          color="success"
          type="submit"
          @click="logIn"
        >
          Login
        </v-btn>
        <v-btn
          v-if="choiceSignIn && !isAuthenticated"
          :loading="status === 'loading'"
          :disabled="!valid || status === 'loading'"
          color="primary"
          @click="signUp"
        >
          Register
        </v-btn>
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script>
import AvatarsSelection from "../components/AvatarsSelection.vue";
import axios from "axios";
import { mapState, mapActions, mapGetters } from "vuex";
import { reject } from "q";
const qs = require("querystring");
export default {
  components: {
    AvatarsSelection,
  },
  data: () => ({
    showBtn: false,
    showPwd: false,
    choiceSignIn: true,
    valid: true,
    avatarID: 1,
    userName: "Anonymous",
    lastEmailTaken: "",
    alert: false,
    alertMsg: "",
    alertType: "info",
    password: "",
    nameRules: [
      v => !!v || "User name is required",
      v =>
        (v != null && v.length <= 15) ||
        "User name must be less than 15 characters"
    ],
    emailRules: [
      v => !!v || "E-mail is required",
      v => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(v) || "E-mail is invalid";
      }
    ],
    email: null
  }),
  created() {
    let payload = {
      data: {},
      rqUrl: "/checkLog"
    };
    this.authRequest(payload).then(
      res => {
        let playerPayload = { url: "/player", mutation: "setUserInfo" };
        this.getData(playerPayload);
      },
      err => {
        this.$store.commit("authLogOut");
      }
    );
  },
  mounted() {
    this.valid = false;
  },
  computed: {
    ...mapState([
      "status",
      "gamesInfo",
      "loading",
      "status",
      "avatarList",
      "soundEffects"
    ]),
    ...mapGetters(["currentUser", "isAuthenticated"]),
    selectedAvatar() {
      return this.avatarList.find(av => av.id === this.currentUser.avatarID);
    },
    emailIsTaken() {
      return this.email === this.lastEmailTaken && this.email !== "";
    }
  },
  methods: {
    ...mapActions(["authRequest", "postData", "getData"]),
    handleAuthSuccess(requestType, response) {
      this.alert = true;
      this.alertType = "success";
      this.alertMsg = requestType + " successful";
      this.$emit("loginSuccess", true);
      setTimeout(() => {
        this.alert = false;
        this.alertMsg = "";
      }, 3000);
    },
    handleAuthErrors(requestType, error) {
      this.alertType = "error";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401)
          this.alertMsg = requestType + " failed : Invalid Email or Password";
        else {
          if (error.response.data)
            this.alertMsg =
              requestType + " failed : " + error.response.data.error;
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        this.alertMsg = requestType + " failed : Request Error: Server is busy";
      } else {
        // Something happened in setting up the request that triggered an Error
        this.alertMsg =
          requestType + " failed : Settings error:" + error.message;
      }
      this.alert = true;
      this.$refs.form.validate();
      setTimeout(() => {
        this.alert = false;
        this.alertMsg = "";
      }, 5000);
    },
    logIn(e) {
      if (this.valid || this.$refs.form.validate()) {
        let payload = {
          data: {
            email: this.email,
            password: this.password
          },
          rqUrl: "/login"
        };
        this.authRequest(payload).then(
          res => {
            this.handleAuthSuccess("Login", res);
            let playerPayload = { url: "/player", mutation: "setUserInfo" };
            this.getData(playerPayload);
          },
          err => {
            this.handleAuthErrors("Login", err);
          }
        );
      } else {
        return false;
      }
    },
    logOut(e) {
      let payload = {
        data: {},
        rqUrl: "/logout"
      };
      this.authRequest(payload).then(
        res => {
          this.handleAuthSuccess("Logout", res);
          this.$router.push("/");
        },
        err => {
          this.handleAuthErrors("Logout", err);
        }
      );
      e.preventDefault();
    },
    signUp() {
      if (this.$refs.form.validate()) {
        let payload = {
          data: {
            avatarID: this.avatarID,
            userName: this.userName,
            email: this.email,
            password: this.password
          },
          rqUrl: "/players"
        };
        this.authRequest(payload).then(
          res => {
            this.logIn();
            this.handleAuthSuccess("SignUp", res);
            this.lastEmailTaken = "";
          },
          err => {
            if (
              err.response &&
              err.response.data.error === "Email already taken"
            ) {
              this.lastEmailTaken = this.email;
            } else this.handleAuthErrors("SignUp", err);
          }
        );
      } else {
        return false;
      }
    }
  }
};
</script>

<style scoped>
.bg-col {
  background-color: rgb(250, 252, 255);
}
.bg-transparent {
  background-color: rgba(58, 82, 110, 0.11);
}
</style>
