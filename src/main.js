//VueJs
import Vue from "vue";
import "./plugins/vuetify";
import Vuetify from "vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import colors from "vuetify/es5/util/colors";
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure you are using css-loader

// Helpers
import moment from "moment";

Vue.prototype.moment = moment;

Vue.config.productionTip = false;

Vue.use(Vuetify, {
    iconfont: "fa"
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
