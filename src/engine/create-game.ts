import {
  addComponent,
  addEntity,
  ComponentType,
  createWorld,
  defineComponent,
  ISchema,
} from 'bitecs'
import { Engine } from 'matter-js'
import { Application } from 'pixi.js'
import { GameKeyboard } from '.'
import { createKeyboard } from './input/keyboard'
import { GameContext, GameOptions, GameConfig } from './types'

export const createGame = <Config extends GameConfig>({
  name,
  config,
  update,
  start,
  render,
}: GameOptions<Config>) => {
  const world = createWorld({ dt: 0 })

  const app = new Application(config.app)

  const physicsEngine = Engine.create(config.physics)

  const physicsUpdate = (dt: number) => {
    Engine.update(physicsEngine, dt)
  }

  const keyboard = createKeyboard(config.inputs) as GameKeyboard<Config>

  const ctx: GameContext<typeof config> = {
    physics: {
      engine: physicsEngine,
      update: physicsUpdate,
    },
    keyboard,
    app,
    world,
    config,
  }

  type ComponentSetter<S extends ISchema> = (args?: {
    [K in keyof S]: number
  }) => (eid: number) => void

  const createComponent = <S extends ISchema>(
    schema?: S,
    size?: number
  ): [ComponentType<S>, ComponentSetter<S>] => {
    const component: ComponentType<S> = defineComponent<S>(schema, size)

    const setter: ComponentSetter<S> = (args) => (eid) => {
      if (args == null) return
      for (const [prop, value] of Object.entries(args) as [keyof S, number][]) {
        const compProp = component[prop]

        if (compProp == null) {
          throw new Error(`Component does not have prop '${prop}'`)
        }

        // @ts-expect-error: this is fine
        if (compProp[eid] == null) {
          addComponent(world, component, eid)
        }

        // @ts-expect-error: this is fine
        compProp[eid] = value
      }
    }

    return [component, setter]
  }

  const node = (setters: ReadonlyArray<(eid: number) => void>) => {
    const eid = addEntity(world)
    for (const set of setters) {
      set(eid)
    }
    return eid
  }

  /**
   const something = node([
      pos({ x: 1, y : 0 })
   ])
   */

  const run = (elt: HTMLElement) => {
    start(ctx)

    app.ticker.add((dt: number) => {
      ctx.world.dt = dt
      update(ctx)
      render(ctx)
    })

    elt.appendChild(app.view)
  }

  return { run, node, createComponent }
}
