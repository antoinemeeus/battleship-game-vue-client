<template>
  <v-card
    :flat="isAuthenticated"
    :light="!isAuthenticated"
    max-width="500"
    min-width="200"
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
        color="primary"
        small
        @click="
          choiceSignIn = !choiceSignIn;
          lastEmailTaken = '';
          soundEffects.play('registrationTick',true);
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
          soundEffects.play('registrationTick',true);
        "
      >
        Create new account
      </v-btn>
    </v-flex>

    <v-card-text>
      <v-alert
        :type="alertType"
        :value="alert"
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
          lazy-validation
          method="post"
          @submit.prevent="logIn"
        >
          <v-container fluid>
            <v-layout column>
              <v-layout
                v-if="choiceSignIn"
                align-center
                row
              >
                <AvatarsSelection v-model="avatarID" />
                <div class="subheading">
                  Select an avatar.
                </div>
              </v-layout>
              <v-flex
                v-if="choiceSignIn"
                md4
                xs12
              >
                <v-text-field
                  v-model="userName"
                  :counter="15"
                  :rules="nameRules"
                  clearable
                  label="In Game Name"
                  required
                />
              </v-flex>
              <v-flex
                md4
                xs12
              >
                <v-text-field
                  v-model="email"
                  :append-icon="emailIsTaken ? 'warning' : ''"
                  :error-messages="emailIsTaken ? 'E-mail already in use' : ''"
                  :rules="emailRules"
                  clearable
                  label="Email address"
                  required
                />
              </v-flex>
              <v-flex
                md4
                xs12
              >
                <v-text-field
                  v-model="password"
                  :append-icon="showPwd ? 'visibility' : 'visibility_off'"
                  :type="showPwd ? 'text' : 'password'"
                  label="Password"
                  required
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
      class="title text-xs-center"
      pb-3
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
            :loading="status === 'loading'"
            color="red"
            type="submit"
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
          :disabled="status === 'loading' || !valid"
          :loading="status === 'loading'"
          color="success"
          type="submit"
          @click="logIn"
        >
          Login
        </v-btn>
        <v-btn
          v-if="choiceSignIn && !isAuthenticated"
          :disabled="!valid || status === 'loading'"
          :loading="status === 'loading'"
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
import {mapActions, mapGetters, mapState} from "vuex";

export default {
    name: "RegistrationComponent",
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
    created() {
        let payload = {
            data: {},
            rqUrl: "/checkLog"
        };
        this.authRequest(payload).then(
            res => {
                let playerPayload = {url: "/player", mutation: "setUserInfo"};
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
                switch (error.response.status) {
                    case 401:
                        this.alertMsg = requestType + " failed : Invalid Email or Password";
                        break;
                    case 406:
                        this.alertMsg = requestType + " failed : Couldn't receive JSESSIONID Cookie from server. This may due to your browser blocking third-party cookies. Check your cookie settings.";
                        break;
                    default:
                        error.response.data ? this.alertMsg = requestType + " failed : " + error.response.data.error : null;
                }
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                this.alertMsg = requestType + " failed : Request Error: Server is busy";
            } else {
                // Something happened in setting up the request that triggered an Error
                this.alertMsg = requestType + " failed : Settings error: " + error.message;
            }
            this.alert = true;
            this.$refs.form.validate();
            setTimeout(() => {
                this.alert = false;
                this.alertMsg = "";
            }, 5000);
        },
        logIn() {
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
                        let playerPayload = {url: "/player", mutation: "setUserInfo"};
                        this.getData(playerPayload);
                    },
                    err => {
                        this.handleAuthErrors("Login", err);
                    }
                );
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
                    this.$router.push("/").catch(err => {
                    })
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
        },
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
