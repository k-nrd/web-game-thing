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

export type GameConfig = {
  inputs: GameInputs
  app?: AppOptions
  physics?: PhysicsOptions
}

export type GameOptions<State extends any, Config extends GameConfig> = {
  config: Config
  initialState: State
  update: (ctx: GameContext<State, Config>) => void
  start: (ctx: GameContext<State, Config>) => void
  render: (ctx: GameContext<State, Config>) => void
}

export type GameContext<State extends any, Config extends GameConfig> = {
  config: Config
  state: State
  app: Application
  physics: {
    engine: Engine
    update: (dt: number) => void
  }
  keyboard: GameKeyboard<Config>
  world: IWorld
}
