<template>
  <div>
    <span class="headline" :style="timerStyleObject">{{
      prettyTime | prettify
    }}</span>
  </div>
</template>

<script>
export default {
  components: {},
  filters: {
    prettify: function(value) {
      let data = value.split(":");
      let minutes = data[0];
      let secondes = data[1];
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (secondes < 10) {
        secondes = "0" + secondes;
      }
      return minutes + ":" + secondes;
    }
  },
  props: {
    soundEnabled: { type: Boolean, default: true },
    pause: { type: Boolean, default: false }
  },
  data() {
    return {
      isRunning: false,
      minutes: 0,
      secondes: 0,
      time: 0,
      timer: null,
      sound: new Audio(require("../assets/sounds/timer_end.wav")),
      tick_sound: new Audio(require("../assets/sounds/timer_tick.wav"))
    };
  },
  computed: {
    prettyTime() {
      let time = this.time / 60;
      let minutes = parseInt(time);
      let secondes = Math.round((time - minutes) * 60);
      return minutes + ":" + secondes;
    },
    timerStyleObject() {
      if (this.time <= 0) {
        return { color: "#db143c" };
      } else if (this.time < 20) {
        return { color: "#ffa500" };
      } else return {};
    },
    classObject() {
      switch (this.$vuetify.breakpoint.name) {
        case "xs":
          return "30";
        case "sm":
          return "40";
        case "md":
          return "55";
        case "lg":
          return "60";
        case "xl":
          return "70";
      }
    }
  },
  watch: {
    pause(newBool) {
      if (newBool) this.stop();
      else this.start();
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    start() {
      if (this.pause) return;
      this.isRunning = true;

      if (!this.timer) {
        this.timer = setInterval(() => {
          if (this.time > 1) {
            this.time--;
            this.time < 6 && this.soundEnabled ? this.tick_sound.play() : null;
          } else {
            clearInterval(this.timer);
            this.$emit("timerFinish");
            this.soundEnabled ? this.sound.play() : null;
            this.reset();
          }
        }, 1000);
      }
    },
    stop() {
      this.isRunning = false;
      clearInterval(this.timer);
      this.timer = null;
    },
    reset() {
      this.stop();
      this.time = 0;
      this.secondes = 0;
      this.minutes = 0;
    },
    setTime(payload) {
      let m = 2,
        s = 0;
      if (payload && payload.minutes != undefined) m = payload.minutes;
      if (payload && payload.secondes != undefined) s = payload.secondes;
      this.time = m * 60 + s;
    }
  }
};
</script>

<style scoped>
.finished {
  color: #db143c;
}
.warning {
  color: #ffa500;
}
</style>
