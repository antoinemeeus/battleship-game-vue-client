import Vue from "vue";
import Router from "vue-router";
import Lobby from "./views/Lobby.vue";
import LandingPage from "./views/LandingPage.vue";
import GameView from "./views/GameView.vue";
import GameComputer from "./views/GameComputer";
import About from "./views/About.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            name: "landingPage",
            component: LandingPage
        },
        {
            path: "/lobby",
            name: "lobby",
            component: Lobby
        },
        {
            path: "/game",
            name: "game",
            component: GameView,
            props: route => ({gp: route.query.gp})
        },
        {
            path: "/game_vs_computer",
            name: "computer",
            component: GameComputer,
            props: true
        },
        {
            path: "/about",
            name: "about",
            component: About,
        }
    ]
});
