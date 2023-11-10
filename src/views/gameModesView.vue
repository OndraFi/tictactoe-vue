<template>
  <div class="container-md">
    <h1 class="text-center display-1 my-5"><span class="gradient-text">Game Modes</span></h1>
    <hr>
    <span class="gradient-text h2">
    Introduction
    </span>
    <p> Welcome to the Tic-Tac-Toe Game! Test your strategic skills and compete against your friends in this classic
      game of Xs and Os. Place your marks strategically on the grid and aim to achieve a winning pattern before your
      opponent does. Let the battles begin!</p>
    <span class="gradient-text h2">
Board Sizes:
    </span>
    <p>Choose the size of the game board that suits your preference and challenge level:</p>
    <ul>
      <li><span class="fw-bold">3x3 Board</span>
        <ul>
          <li>
            Start with a traditional 3x3 grid, perfect for quick and intense
            matches.
          </li>
        </ul>
      </li>
      <li><span  class="fw-bold">10x10 Board</span>
        <ul>
          <li>
            Step up the complexity with a larger 10x10 grid, offering more
            opportunities for strategic
            moves.
          </li>
        </ul>
      </li>
      <li><span  class="fw-bold">20x20 Board</span>
        <ul>
          <li>
            Ready for the ultimate challenge? Dive into the 20x20 grid, a
            massive playing field that will
            test your tactical thinking.
          </li>
        </ul>
      </li>
    </ul>
    <span class="gradient-text h2">
Game Modes:
    </span>

    <p>Explore different game modes to add excitement and variety to your matches:</p>
    <ul>
      <li><span class="fw-bold">Classic Mode</span>
        <ul>
          <li>
            Engage in the classic mode where you and your opponent take turns placing your marks on the
            board. Aim to create a winning pattern, whether it's three in a row, column, or diagonal. May the best
            strategist prevail!
          </li>
        </ul>

      </li>
      <li><span class="fw-bold">Fast Mode</span>
        <ul>
          <li>Feel the adrenaline rush in the fast mode, where
            time is of the essence. Both players
            have a limited 10-second window to make their moves. Quick thinking and swift decision-making are key to
            outsmart your opponent and claim victory.
          </li>
        </ul>
      </li>
      <li><span class="fw-bold">Double Mode (20x20)</span>
        <ul>
          <li>
            Only available in the 20x20 grid, the double mode
            introduces a thrilling twist. Each
            player gets to play two moves in a single turn, creating even more strategic possibilities. Plan your moves
            carefully, seize opportunities, and outmaneuver your rival to secure triumph.
          </li>
        </ul>
      </li>
    </ul>
    <span class="gradient-text fw-bold"> Choose your preferred board size and game mode, and let the exhilarating battles unfold!
    </span>
  </div>
</template>

<script>
export default {
  name: "game-modes"
}
</script>

<style scoped>

li::marker {
  color: #f09819; /* Set the color of the bullet/dot */
}
</style>