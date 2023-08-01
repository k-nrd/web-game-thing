import { IWorld } from 'bitecs'
import * as PIXI from 'pixi.js'

import type { GameConfig, RuntimeContext } from '../types'

export const createApp = (config: GameConfig) => {
  const app = new PIXI.Application({
    width: config.dimensions.world.width,
    height: config.dimensions.world.height,
  })

  return app
}

export const createLoop = (
  { world, gameUpdate, startGame }: RuntimeContext,
  render: (w: IWorld) => void
) => {
  startGame(world)

  return (dt: number) => {
    world.dt = dt

    gameUpdate(world)
    render(world)
  }
}
