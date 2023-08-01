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
  { world, update, start }: RuntimeContext,
  render: (w: IWorld) => void
) => {
  start(world)

  return (dt: number) => {
    world.dt = dt

    update(world)
    render(world)
  }
}
