import type { IWorld } from 'bitecs'
import Matter from 'matter-js'
import type { indexToTexture, TextureKey, textureToIndex } from '../game'
import { GlobalState, KeyboardService } from '../game/services'

export interface Size {
  width: number
  height: number
}
export interface GameConfig {
  dimensions: {
    world: Size
    brick: Size
    ball: Size
    paddle: Size
  }
  assets: AssetsData
  layout: number[][]
}

export type GameContext = {
  config: GameConfig
  globalState: GlobalState
  textureToIndex: TextureToIndexFunc
  indexToTexture: IndexToTextureFunc
  physicsEngine: Matter.Engine
  keyboard: KeyboardService
}

export type GameSystem = (world: ECSWorld) => ECSWorld

export type RuntimeContext = GameContext & {
  world: ECSWorld
  update: (world: ECSWorld) => void
  start: (world: ECSWorld) => void
}

export interface ECSWorld extends IWorld {
  dt: number
}
export type ECSPipeline = (...input: unknown[]) => unknown

interface AssetDefinition {
  key: TextureKey
  path: string
}

export interface AssetsData {
  ball: AssetDefinition
  paddle: AssetDefinition
  brick: AssetDefinition
}

export type IndexToTextureFunc = typeof indexToTexture
export type TextureToIndexFunc = typeof textureToIndex
