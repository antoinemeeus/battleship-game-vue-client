<template>
  <v-container ma-0 pa-0 fluid>
    <v-layout row wrap justify-center align-center>
      <v-flex xs12 md10 pa-2>
        <h2 class="display-2 text-xs-center">Game List</h2>
      </v-flex>
      <v-flex xs12 md10 pa-3>
        <GamesTable />
      </v-flex>
      <v-flex xs12 md10 pa-3>
        <h2 class="display-2 text-xs-center">Leader Board</h2>
      </v-flex>
      <v-flex xs12 md10 pa-3>
        <LeaderBoard />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import GamesTable from "../components/GamesTable.vue";
import LeaderBoard from "../components/LeaderBoard.vue";
export default {
  name: "Lobby",
  components: {
    GamesTable,
    LeaderBoard
  },
  data() {
    return {
      //
    };
  }
};
</script>
<style scoped>
.bg-box {
  background-color: #3a4e5ec2;

  box-shadow: 0px 0px 53px 11px rgba(32, 46, 77, 0.8);
}
</style>
