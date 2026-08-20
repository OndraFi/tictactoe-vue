<template>
  <div class="d-flex justify-content-center w-100">
    <!-- Nativní element, do kterého PixiJS vloží svůj <canvas> -->
    <div ref="pixiContainer" class="pixi-wrapper"></div>
  </div>
</template>

<script>
import * as PIXI from 'pixi.js';

export default {
  name: "game-field",
  props: ['fields'],
  data() {
    return {
      dimension: 3,
      cellSize: 100
    }
  },
  created() {
    // Definujeme Pixi objekty mimo reaktivní data()! 
    // Kdyby byly v data(), Vue by je obalilo do Proxy a PixiJS by spadlo na native Canvas API.
    this.app = null;
    this.marks = [];
  },
  watch: {
    // Reaktivně posloucháme změny od Colysea a přenášíme je do WebGL canvasu
    fields: {
      handler(newFields) {
        this.updateBoard(newFields);
      },
      deep: true
    }
  },
  async mounted() {
    await this.initPixi();
    if (this.fields && this.fields.length > 0) {
      this.updateBoard(this.fields);
    }
  },
  beforeUnmount() {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
  },
  methods: {
    async initPixi(fieldsArray) {
      // Vypočítáme velikost plátna
      const length = fieldsArray ? fieldsArray.length : (this.fields ? this.fields.length : 9);
      this.dimension = Math.sqrt(length) || 3;
      const size = Math.min(window.innerWidth - 40, 600);
      this.cellSize = size / this.dimension;

      // Inicializace Pixi v8 (S průhledným pozadím)
      this.app = new PIXI.Application();
      await this.app.init({ 
        width: size, 
        height: size, 
        backgroundAlpha: 0, // Zprůhlední samotný <canvas>
        resolution: window.devicePixelRatio || 1,
        autoDensity: true 
      });
      
      // Vložení canvasu do Vue ref containeru
      this.$refs.pixiContainer.appendChild(this.app.canvas);

      // Nakreslíme mřížku
      const grid = new PIXI.Graphics();
      const lineColor = 0xff5858; // Colyseus red pro mřížku
      
      for (let i = 0; i < length; i++) {
        const x = (i % this.dimension) * this.cellSize;
        const y = Math.floor(i / this.dimension) * this.cellSize;
        
        // Buňka (pozadí pro detekci kliknutí)
        const cell = new PIXI.Graphics();
        cell.rect(x, y, this.cellSize, this.cellSize);
        // alpha: 0.001 zaručí, že je buňka průhledná, ale stále "existuje" pro kliknutí
        cell.fill({ color: 0x000000, alpha: 0.001 });
        cell.stroke({ width: 2, color: lineColor }); // Rámeček buňky
        
        // Interaktivita v Pixi
        cell.eventMode = 'static';
        cell.cursor = 'pointer';
        cell.on('pointerdown', () => this.$emit('player-move', i));
        
        // Přidání hover efektu
        cell.on('pointerover', () => cell.alpha = 0.8 );
        cell.on('pointerout', () => cell.alpha = 1 );
        
        this.app.stage.addChild(cell);
        
        // Připravíme prázdný text pro každé pole
        const text = new PIXI.Text({
          text: ' ', 
          style: { 
            fill: '#ffffff', 
            fontSize: this.cellSize * 0.6,
            fontFamily: 'Arial',
            fontWeight: 'bold'
          }
        });
        text.anchor.set(0.5);
        text.x = x + this.cellSize / 2;
        text.y = y + this.cellSize / 2;
        
        this.app.stage.addChild(text);
        this.marks.push(text); // Uložíme si referenci pro budoucí reaktivní update
      }
    },
    async updateBoard(newFields) {
      if (!this.app || !newFields) return;
      
      // Pokud se změnila velikost pole (např. server poslal 100 místo úvodních 9)
      if (newFields.length > 0 && newFields.length !== this.marks.length) {
        this.app.destroy(true, { children: true, texture: true, baseTexture: true });
        this.marks = [];
        // Odebereme starý canvas z DOM, metoda appendChild v initPixi přidá nový
        this.$refs.pixiContainer.innerHTML = '';
        await this.initPixi(newFields);
      }
      
      if (newFields.length !== this.marks.length) return;
      
      for (let i = 0; i < newFields.length; i++) {
        const mark = newFields[i];
        if (mark === 'X') {
          this.marks[i].text = 'X';
          this.marks[i].style.fill = '#f09819'; // Colyseus orange
        } else if (mark === 'O') {
          this.marks[i].text = 'O';
          this.marks[i].style.fill = '#ff5858'; // Colyseus red
        } else {
          this.marks[i].text = ' ';
        }
      }
    }
  }
}
</script>

<style scoped>
.pixi-wrapper {
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-radius: 8px;
  overflow: hidden;
}
</style>