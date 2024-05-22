import { createGame, GameContext } from '../engine'
import {
  createBall,
  createBricks,
  createLauncher,
  createPaddle,
  createWalls,
  update,
} from '../game'
import { config } from './config'
import { render } from './systems'

export type GameCtx = GameContext<typeof config>

export const { run, node, createComponent } = createGame({
  config,
  update,
  start: (ctx: GameCtx) => {
    createBricks(ctx)
    createBall(ctx)
    createPaddle(ctx)
    createWalls(ctx)
    createLauncher(ctx)
  },
  render,
})
