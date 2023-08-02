import { createWorld } from 'bitecs'
import { Engine } from 'matter-js'
import { Application } from 'pixi.js'
import { GameKeyboard } from '.'
import { createKeyboard } from './input/keyboard'
import { GameContext, GameOptions, GameConfig } from './types'

export const createGame = <State extends any, Config extends GameConfig>({
  config,
  initialState,
  update,
  start,
  render,
}: GameOptions<State, Config>) => {
  const world = createWorld({ dt: 0 })

  const app = new Application(config.app)

  const physicsEngine = Engine.create(config.physics)

  const physicsUpdate = (dt: number) => {
    Engine.update(physicsEngine, dt)
  }

  const keyboard = createKeyboard(config.inputs) as GameKeyboard<Config>

  const ctx: GameContext<typeof initialState, typeof config> = {
    state: initialState,
    physics: {
      engine: physicsEngine,
      update: physicsUpdate,
    },
    keyboard,
    app,
    world,
    config,
  }

  const run = (elt: HTMLElement) => {
    start(ctx)

    app.ticker.add((dt: number) => {
      ctx.world.dt = dt
      update(ctx)
      render(ctx)
    })

    elt.appendChild(app.view)
  }

  return run
}
