import { IWorld } from 'bitecs'
import { Engine, IEngineDefinition } from 'matter-js'
import { Application, IApplicationOptions } from 'pixi.js'

type AppOptions = IApplicationOptions

type PhysicsOptions = IEngineDefinition

export type GameInputs = {
  [input: string]: ReadonlyArray<string>
}

export type GameKeyboard<Config extends GameConfig> = {
  destroy: () => void
  pressed: (i: keyof Config['inputs']) => boolean
}

export type GameAPI<Config extends GameConfig> = {
  keyboard: GameKeyboard<Config>
}

export type GameConfig = {
  inputs: GameInputs
  app?: AppOptions
  physics?: PhysicsOptions
}

export type ApiContext = {
  name: string
}

export type GameOptions<Config extends GameConfig> = {
  config: Config
  update: (ctx: GameContext<Config>) => void
  start: (ctx: GameContext<Config>) => void
  render: (ctx: GameContext<Config>) => void
}

export type GameContext<Config extends GameConfig> = {
  config: Config
  app: Application
  physics: {
    engine: Engine
    update: (dt: number) => void
  }
  keyboard: GameKeyboard<Config>
  world: IWorld
}
