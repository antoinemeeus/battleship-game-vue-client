<template>
  <div>
    <span
      :style="timerStyleObject"
      class="headline"
    >{{ prettyTime | prettify }}</span>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
    components: {},
    filters: {
        prettify: function (value) {
            let data = value.split(":");
            let minutes = data[0];
            let seconds = data[1];
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return minutes + ":" + seconds;
        }
    },
    data() {
        return {
            isRunning: false,
            minutes: 0,
            seconds: 0,
            time: 0,
            timer: null
        };
    },
    computed: {
        ...mapState(["soundEffects"]),
        prettyTime() {
            let minutes = Math.floor(this.time / 60);
            let seconds = this.time - minutes * 60;
            return minutes + ":" + seconds;
        },
        timerStyleObject() {
            if (this.time <= 0) {
                return {color: "#db143c"};
            } else if (this.time < 20) {
                return {color: "#ffa500"};
            } else return {};
        }
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            if (!this.timer) {
                this.timer = setInterval(() => {
                    if (this.time > 1) {
                        this.time--;
                        this.time < 6 ? this.soundEffects.play("timerTick", true) : null;
                    } else {
                        clearInterval(this.timer);
                        this.$emit("timerFinish");
                        this.soundEffects.play("timerEnd", true);
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
            this.seconds = 0;
            this.minutes = 0;
        },
        setTime(payload) {
            let m = 2,
                s = 0;
            if (payload && payload.minutes !== undefined) m = payload.minutes;
            if (payload && payload.seconds !== undefined) s = payload.seconds;
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
