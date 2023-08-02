import { createGame, GameContext } from '../engine'
import {
  createBall,
  createBricks,
  createLauncher,
  createPaddle,
  createWalls,
  indexToTexture,
  textureToIndex,
  update,
} from '../game'
import { GlobalState } from '../game/services'
import { config } from './config'
import { render } from './systems'

const initialState = {
  global: new GlobalState(),
  utils: {
    textureToIndex: textureToIndex,
    indexToTexture: indexToTexture,
  },
} as const

export type GameCtx = GameContext<typeof initialState, typeof config>

export const run = createGame({
  config,
  initialState,
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
