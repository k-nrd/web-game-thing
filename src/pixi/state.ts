import { indexToTexture, textureToIndex } from '../game'
import { GlobalState } from '../game/services'

export const state = {
  global: new GlobalState(),
  utils: {
    textureToIndex: textureToIndex,
    indexToTexture: indexToTexture,
  },
} as const
