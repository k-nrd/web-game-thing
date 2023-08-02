import * as PIXI from 'pixi.js'
import { defineQuery, enterQuery, exitQuery } from 'bitecs'
import { Position, Sprite, Tint } from '../../game'
import { GameCtx } from '../runner'

const sprites: PIXI.Sprite[] = []

const spriteQuery = defineQuery([Sprite])
const enterSprite = enterQuery(spriteQuery)
const exitSprite = exitQuery(spriteQuery)
const spritePositionQuery = defineQuery([Sprite, Position])
const tintQuery = defineQuery([Sprite, Tint])

export const createSprite = ({
  config,
  state: {
    utils: { indexToTexture },
  },
  app,
  world,
}: GameCtx) => {
  const enterEntities = enterSprite(world)
  for (const eid of enterEntities) {
    const texId = Sprite.texture[eid]
    const key = indexToTexture(texId)
    const path = config.assets[key].path
    const sprite = PIXI.Sprite.from(path)
    sprite.anchor.set(0.5, 0.5)
    app.stage.addChild(sprite)
    sprites[eid] = sprite
  }

  const exitEntities = exitSprite(world)
  for (const eid of exitEntities) {
    const sprite = sprites[eid]
    sprite.destroy({
      children: true,
    })
  }
}

const positionSprite = ({ world }: GameCtx) => {
  const entities = spritePositionQuery(world)
  for (const eid of entities) {
    const sprite = sprites[eid]
    if (!sprite) {
      continue
    }

    sprite.x = Position.x[eid]
    sprite.y = Position.y[eid]
  }
}

const tintSprite = ({ world }: GameCtx) => {
  const entities = tintQuery(world)
  for (const eid of entities) {
    const sprite = sprites[eid]
    if (!sprite) {
      continue
    }

    const tint = Tint.color[eid]
    sprite.tint = tint
  }
}

export const render = (ctx: GameCtx) => {
  createSprite(ctx)
  positionSprite(ctx)
  tintSprite(ctx)
}
