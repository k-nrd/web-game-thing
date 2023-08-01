import { addComponent, addEntity, createWorld } from 'bitecs'
import Matter from 'matter-js'
import {
  Ball,
  Bouncy,
  BoxCollider,
  Brick,
  CircleCollider,
  createGameUpdate,
  FixedRotation,
  Follow,
  Friction,
  indexToTexture,
  Launcher,
  MovementInput,
  Paddle,
  PhysicsBody,
  Position,
  Sprite,
  Static,
  Texture,
  textureToIndex,
  Tint,
} from '.'
import { GameConfig, GameContext, ECSWorld, RuntimeContext } from '../types'
import { GlobalState, KeyboardService } from './services'

export const createECSWorld = (): ECSWorld => createWorld({ dt: 0 })

export const createPhysicsEngine = () =>
  Matter.Engine.create({
    gravity: { x: 0, y: 0 },
  })

export const createBricks = ({ config, textureToIndex }: GameContext) => {
  const brickWidth = config.dimensions.brick.width
  const halfBrickWidth = brickWidth * 0.5

  const brickHeight = config.dimensions.brick.height
  const halfBrickHeight = brickHeight * 0.5

  return (world: ECSWorld) => {
    for (let i = 0; i < config.layout.length; ++i) {
      for (let j = 0; j < config.layout[i].length; ++j) {
        const space = config.layout[i][j]
        if (space <= 0) {
          continue
        }

        const eid = addEntity(world)
        addComponent(world, Brick, eid)
        addComponent(world, PhysicsBody, eid)
        addComponent(world, BoxCollider, eid)
        BoxCollider.width[eid] = config.dimensions.brick.width
        BoxCollider.height[eid] = config.dimensions.brick.height

        addComponent(world, Static, eid)
        addComponent(world, Friction, eid)
        addComponent(world, Bouncy, eid)

        addComponent(world, Sprite, eid)
        Sprite.texture[eid] = textureToIndex(Texture.brick)

        addComponent(world, Tint, eid)
        switch (space) {
          case 1:
            Tint.color[eid] = 0xc73e3e
            break
          case 2:
            Tint.color[eid] = 0x80be1e
            break
          case 3:
            Tint.color[eid] = 0x1da7e2
            break
          case 4:
            Tint.color[eid] = 0xab1de2
            break
          case 5:
            Tint.color[eid] = 0xffcc00
            break
          case 6:
            Tint.color[eid] = 0xffffff
            break
          default:
            break
        }

        addComponent(world, Position, eid)
        Position.x[eid] = j * brickWidth + halfBrickWidth
        Position.y[eid] = i * brickHeight + halfBrickHeight
      }
    }
  }
}

export const createPaddle = ({
  config,
  textureToIndex,
  globalState,
}: GameContext) => {
  return (world: ECSWorld) => {
    const eid = addEntity(world)
    addComponent(world, Paddle, eid)
    addComponent(world, Sprite, eid)
    Sprite.texture[eid] = textureToIndex(Texture.paddle)

    addComponent(world, PhysicsBody, eid)
    addComponent(world, BoxCollider, eid)
    BoxCollider.width[eid] = config.dimensions.paddle.width
    BoxCollider.height[eid] = config.dimensions.paddle.height
    BoxCollider.chamferRadius[eid] = 10

    addComponent(world, Static, eid)
    addComponent(world, Friction, eid)
    addComponent(world, Bouncy, eid)

    addComponent(world, Position, eid)
    Position.x[eid] = config.dimensions.world.width * 0.5
    Position.y[eid] = config.dimensions.world.height - 50

    addComponent(world, MovementInput, eid)

    globalState.setPaddleEntityId(eid)
  }
}

export const createBall = ({
  config,
  textureToIndex,
  globalState,
}: GameContext) => {
  return (world: ECSWorld) => {
    const eid = addEntity(world)
    addComponent(world, Ball, eid)
    Ball.startX[eid] = config.dimensions.world.width * 0.5
    Ball.startY[eid] =
      config.dimensions.world.height -
      50 -
      config.dimensions.paddle.height * 0.5 -
      config.dimensions.ball.height * 0.5
    addComponent(world, Sprite, eid)
    Sprite.texture[eid] = textureToIndex(Texture.ball)

    addComponent(world, Position, eid)
    Position.x[eid] = Ball.startX[eid]
    Position.y[eid] = Ball.startY[eid]

    addComponent(world, PhysicsBody, eid)
    addComponent(world, CircleCollider, eid)
    CircleCollider.radius[eid] = 12

    addComponent(world, Friction, eid)
    addComponent(world, Bouncy, eid)
    addComponent(world, FixedRotation, eid)

    const paddleEid = globalState.paddleEntityId
    if (paddleEid >= 0) {
      addComponent(world, Follow, eid)
      Follow.entityId[eid] = paddleEid
      Follow.offsetX[eid] = 0
      Follow.offsetY[eid] = -config.dimensions.ball.height * 0.5
    }

    globalState.setBallEntityId(eid)
  }
}

export const createWalls = ({ config }: GameContext) => {
  return (world: ECSWorld) => {
    const leftWall = addEntity(world)
    addComponent(world, PhysicsBody, leftWall)
    addComponent(world, BoxCollider, leftWall)
    BoxCollider.width[leftWall] = 100
    BoxCollider.height[leftWall] = config.dimensions.world.height

    addComponent(world, Static, leftWall)
    addComponent(world, Friction, leftWall)
    addComponent(world, Bouncy, leftWall)
    addComponent(world, Position, leftWall)
    Position.x[leftWall] = -50
    Position.y[leftWall] = config.dimensions.world.height * 0.5

    const topWall = addEntity(world)
    addComponent(world, PhysicsBody, topWall)
    addComponent(world, BoxCollider, topWall)
    BoxCollider.width[topWall] = config.dimensions.world.width
    BoxCollider.height[topWall] = 100

    addComponent(world, Static, topWall)
    addComponent(world, Friction, topWall)
    addComponent(world, Bouncy, topWall)
    addComponent(world, Position, topWall)
    Position.x[topWall] = config.dimensions.world.width * 0.5
    Position.y[topWall] = -50

    const rightWall = addEntity(world)
    addComponent(world, PhysicsBody, rightWall)
    addComponent(world, BoxCollider, rightWall)
    BoxCollider.width[rightWall] = 100
    BoxCollider.height[rightWall] = config.dimensions.world.height

    addComponent(world, Static, rightWall)
    addComponent(world, Friction, rightWall)
    addComponent(world, Bouncy, rightWall)
    addComponent(world, Position, rightWall)
    Position.x[rightWall] = config.dimensions.world.width + 50
    Position.y[rightWall] = config.dimensions.world.height * 0.5
  }
}

export const createLauncher = ({ globalState }: GameContext) => {
  return (world: ECSWorld) => {
    const eid = addEntity(world)
    addComponent(world, Launcher, eid)

    globalState.setLauncherEntityId(eid)
  }
}

export const createGameStarter = (context: GameContext) => {
  const bricks = createBricks(context)
  const ball = createBall(context)
  const paddle = createPaddle(context)
  const walls = createWalls(context)
  const launcher = createLauncher(context)

  return (world: ECSWorld) => {
    bricks(world)
    ball(world)
    paddle(world)
    walls(world)
    launcher(world)
  }
}

export const createGame = (config: GameConfig) => {
  const gameContext: GameContext = {
    globalState: new GlobalState(),
    textureToIndex: textureToIndex,
    indexToTexture: indexToTexture,
    physicsEngine: createPhysicsEngine(),
    keyboard: new KeyboardService(),
    config,
  }

  const world = createECSWorld()

  const update = createGameUpdate(gameContext)

  const start = createGameStarter(gameContext)

  return (initializer: (runCtx: RuntimeContext) => void) => {
    initializer({ ...gameContext, world, update, start })
  }
}
