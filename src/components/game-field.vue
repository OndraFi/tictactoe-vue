<template>
  <div id="boardContainer" class="">
    <div class="d-flex game-field ms-auto me-auto" :style="{ width: boardSize + 'px', height: boardSize + 'px'}">
      <div v-for="(fieldrow, col) in fields" class="w-100 m-0 p-0 d-flex flex-column">
        <div v-for="(field,row) in fieldrow" class="bg-transparent game-field" :style="{width: fieldSize + 'px', height: fieldSize + 'px', }">
          <button v-on:click="move(col,row)" class="overflow-hidden bg-transparent w-100 h-100 p-0 m-0 border-0 d-flex justify-content-center align-items-center">
<!--            {{ field }}-->
            <i v-if="field === 'circle'" :class="[
     'fa-regular',
     'fa-circle',
     { 'fa-beat-fade': col === this.i && row === this.j }
]" :style="{color: '#ff5858', fontSize: fieldSize * 0.8 + 'px' }"></i>
            <i v-if="field === 'cross'" :class="[
     'fa-regular',
     'fa-x',
     { 'fa-beat-fade': col === this.i && row === this.j },
     iconClass
]" :style="{color: '#f09819', fontSize: fieldSize * 0.8 + 'px' }"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "game-field.vue",
  props: ['fields', 'socket','i','j', 'uid'],
  data (){
    return {
      boardSize: 0,
      fieldSize: 0,
      iconClass: '',
    }
  },
  mounted() {
    this.updateFieldSize();
    window.addEventListener('resize', this.updateFieldSize); // Add a resize event listener
  },
  methods: {
    move(i, j) {
      this.socket.emit('game:move', {i: i, j: j, uid: this.uid});
    },
    updateFieldSize() {
      // Adjust the fieldSize based on the device screen width
      const width = document.getElementById('boardContainer').offsetWidth;
      console.log(width);
      if (width < 720) {
        this.boardSize = width - 20;
        this.fieldSize = (width - 20) /this.fields[0].length;
      } else {
        this.boardSize = 720; // Set the default size for larger screens
        this.fieldSize = 720/this.fields[0].length;
      }

      console.log("update field size", this.boardSize, window.innerWidth);

      if(this.fieldSize > 10)
        this.iconClass = 'fa-2xs'
      if(this.fieldSize > 14)
        this.iconClass = 'fa-xs'
      if(this.fieldSize > 20)
        this.iconClass = 'fa-sm'
      if(this.fieldSize > 24)
        this.iconClass = 'fa-lg'
      if(this.fieldSize > 32)
        this.iconClass = 'fa-xl'
      if(this.fieldSize > 36)
        this.iconClass = 'fa-2xl'
    }
  },
}
</script>

<style scoped>
.game-field{
  border: 1px solid color-mix(in lch, #ff5858, #f09819);
}

.game-field button:hover{
  /*background-color: color-mix(in lch, rgba(255, 88, 88, 0.5), rgba(240, 152, 25, 0.5)) !important;*/
  /*background-color: rgba(255, 255, 255, 0.15) !important;*/
  box-shadow: 0px 0px 10px 5px color-mix(in lch, #ff5858, #f09819);
}
</style>