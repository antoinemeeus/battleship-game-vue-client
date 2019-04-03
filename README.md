# BattleWreck

## Welcome to my battleship game.

This is and adaptation of the classic board game "Battleship". You can play against the computer or against other players!
You can give it a try here: https://battleship-battlewreck-game.netlify.com/

_The game has sound enable, you can disabled it by clicking the volumen icon to the top right of the web page_

### About the Project

This project was made with [Vue.js](https://vuejs.org/) and [Vuetify](https://vuetifyjs.com/en/) for the front-end part and hosted on [Netlify](https://netlify.com).
The back-end par, that is responsible to handle the RestApi web that service the client is made Java/[SpringBoot](https://spring.io/projects/spring-boot),and it is hosted on [Heroku](https://www.heroku.com/).
You can get the source code and learn more about it on the corresponding repository: https://github.com/antoinemeeus/battleship-game-java-server-api .

### Gameplay and other additional info

To play against other players in multiplayer mode you will need to sign-up, but don't worry, any email that is considered valid (basic regex validation) will do to identificate yourself. You can create a new game and wait for other players to join, or you can join other games if any is available.

You can also play against the [computer](https://battleship-battlewreck-game.netlify.com/game_vs_computer)! No need to register, this is just pure JS code.
The algorithm for the enemy "AI" is based on simple weight probabilities and some randomness.
I was greatly helped by [this paper](http://www.datagenetics.com/blog/december32011/) to develop the idea of the "AI" logic.

## Vue CLI project setup

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your tests

```
npm run test
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
