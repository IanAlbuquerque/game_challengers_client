import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GameClientService } from '../game-client/game-client.service';
import * as Msg from '../game-client/msg';

interface Point {
  x: number,
  y: number
}

interface Size {
  w: number,
  h: number
}

interface GameState {
  size: Size;
  walls: Point[];
  food: Point[];
  position: Point;
  enemy: Point;
  score: number;
  turn: number;
}

enum Action {
  HOLD = 'HOLD',
  UP = 'UP',
  RIGHT = 'RIGHT',
  DOWN = 'DOWN',
  LEFT = 'LEFT'
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit {

  private gameState: GameState = {
    size: { w: 1, h: 1 },
    walls: [],
    food: [],
    position: { x: 0, y: 0 },
    enemy: { x: 0, y: 0 },
    score: 0,
    turn: 0,
  }

  private endGameMsg: Msg.SCGameOver = undefined;

  public context: CanvasRenderingContext2D;
  private canvasWidth = 0;
  private canvasHeight = 0;
  @ViewChild('canvas') myCanvas: ElementRef;

  constructor(private gameClientService: GameClientService) {
    this.gameClientService.onGameOver.subscribe((msg: Msg.SCGameOver) => {
      this.endGameMsg = msg;
      this.gameState = msg.state as GameState
    })
    this.gameClientService.onWait.subscribe((msg: Msg.SCWait) => {
      this.gameState = msg.state as GameState;
    })
    this.gameClientService.onRequestAction.subscribe((msg: Msg.SCRequestAction) => {
      this.gameState = msg.state as GameState;
      const action: Action = this.computeAction(msg.state);
      this.gameClientService.sendAction(action, msg.key)
    })
  }

  private computeAction(state: GameState): Action {
    return Action.UP;
  }

  private onWindowResize(): void {
    let canvas = this.myCanvas.nativeElement;
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;  
  }

  ngAfterViewInit() {
    const self = this;
    let canvas = this.myCanvas.nativeElement;
    window.addEventListener('resize', () => {
      self.onWindowResize();
    }, true);
    this.context = canvas.getContext("2d");
    this.onWindowResize();
    this.tick();
  }

  private tick() {
    requestAnimationFrame(()=> {
      this.tick()
    });

    var ctx = this.context;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.fillStyle = '#ff0000';

    let dx = 0;
    let dy = 0;
    let boardSize = 500.0
    if ( this.gameState.size.w > this.gameState.size.h ) {
      dx = boardSize/ this.gameState.size.w;
      dy = dx;
    } else {
      dy = boardSize / this.gameState.size.h;
      dx = dy;
    }

    for (let x = 0; x < this.gameState.size.w; x++) {
      for (let y = 0; y < this.gameState.size.h; y++) {
        ctx.fillStyle = '#ff0000';
        ctx.strokeRect(x * dx, y * dy, dx, dy);
      }
    }

    for (const wall of this.gameState.walls) {
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(wall.x * dx, wall.y * dy, dx, dy);
      ctx.fillStyle = '#000000';
      ctx.strokeRect(wall.x * dx, wall.y * dy, dx, dy);
    }

    for (const food of this.gameState.food) {
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(food.x * dx + (dx / 4.0), food.y * dy+ (dy / 4.0), dx / 2.0, dy / 2.0);
      ctx.fillStyle = '#000000';
      ctx.strokeRect(food.x * dx + (dx / 4.0), food.y * dy+ (dy / 4.0), dx / 2.0, dy / 2.0);
    }

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.gameState.position.x * dx + (dx / 8.0), this.gameState.position.y * dy+ (dy / 8.0), 6.0 * dx / 8.0, 6.0 * dy / 8.0);
    ctx.fillStyle = '#000000';
    ctx.strokeRect(this.gameState.position.x * dx + (dx / 8.0), this.gameState.position.y * dy+ (dy / 8.0), 6.0 * dx / 8.0, 6.0 * dy / 8.0);

    ctx.fillStyle = '#0000bb';
    ctx.fillRect(this.gameState.enemy.x * dx + (dx / 8.0), this.gameState.enemy.y * dy+ (dy / 8.0), 6.0 * dx / 8.0, 6.0 * dy / 8.0);
    ctx.fillStyle = '#000000';
    ctx.strokeRect(this.gameState.enemy.x * dx + (dx / 8.0), this.gameState.enemy.y * dy+ (dy / 8.0), 6.0 * dx / 8.0, 6.0 * dy / 8.0);

    ctx.fillStyle = '#000000';
    ctx.font = "30px Arial";
    ctx.fillText(`Score: ${this.gameState.score}`, 20.0, boardSize + 50.0);
    ctx.fillText(`Turn: ${this.gameState.turn}`, 20.0, boardSize + 50.0 + 30.0);
    if (this.endGameMsg !== undefined && this.endGameMsg.tie === false) {
      ctx.fillText(`Game Over! "${this.endGameMsg.winner}" won!`, 20.0, boardSize + 50.0 + 60.0);
    }
    if (this.endGameMsg !== undefined && this.endGameMsg.tie === true) {
      ctx.fillText(`Game Over! Tie!`, 20.0, boardSize + 50.0 + 60.0);
    }
  }

}
