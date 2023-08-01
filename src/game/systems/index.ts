import {
  addComponent,
  defineQuery,
  getEntityComponents,
  pipe,
  removeComponent,
  removeEntity,
} from 'bitecs'
import { GameContext, ECSWorld } from '../../types'
import {
  Ball,
  ChangeVelocity,
  Direction,
  Follow,
  Launcher,
  ActiveState,
  MovementInput,
  Position,
  RemoveAll,
  PhysicsBody,
} from '../components'

import {
  staticBody,
  circleCollider,
  createPhysicsUpdate,
  changeVelocity,
  boxCollider,
  syncPositionPhysicsBody,
  initPositionPhysicsBody,
  friction,
  bouncy,
  getPhysicsBody,
  setBodyVelocity,
  setBodyPosition,
  fixedRotation,
  handleCollisions,
} from './physics'

export const keyboardInput = ({ keyboard }: GameContext) => {
  const query = defineQuery([MovementInput])

  return (world: ECSWorld) => {
    const entities = query(world)
    for (const eid of entities) {
      let directions = 0
      if (keyboard.left) {
        directions |= Direction.Left
      } else if (keyboard.right) {
        directions |= Direction.Right
      }
      MovementInput.directions[eid] = directions
    }
    return world
  }
}

export const launcher = ({ config, keyboard, globalState }: GameContext) => {
  const query = defineQuery([Launcher])

  return (world: ECSWorld) => {
    const entities = query(world)
    for (const eid of entities) {
      if (Launcher.state[eid] === ActiveState.Disabled) {
        continue
      }

      if (!keyboard.space) {
        continue
      }

      const ballEid = globalState.ballEntityId
      if (ballEid < 0) {
        continue
      }

      addComponent(world, ChangeVelocity, ballEid)
      const middleX = config.dimensions.world.width * 0.5
      const x = Position.x[ballEid] ?? middleX
      const diff = middleX - x
      ChangeVelocity.x[ballEid] = Math.abs(diff) < 100 ? 0 : diff > 0 ? -10 : 10
      ChangeVelocity.y[ballEid] = -10

      Follow.state[ballEid] = ActiveState.Disabled
      Launcher.state[eid] = ActiveState.Disabled
    }
    return world
  }
}

export const loseBall = ({ config, globalState }: GameContext) => {
  const query = defineQuery([Ball, Position])

  return (world: ECSWorld) => {
    const entities = query(world)
    for (const eid of entities) {
      const y = Position.y[eid]
      if (y > config.dimensions.world.height + 50) {
        const body = getPhysicsBody(eid)
        if (!body) {
          console.error('loseBall: missing phyiscs body')
          continue
        }

        setBodyVelocity(body, 0, 0)

        const paddleEid = globalState.paddleEntityId
        const x = Position.x[paddleEid] ?? Ball.startX[eid]
        const y = Position.y[paddleEid]
          ? Position.y[paddleEid] - config.dimensions.ball.height * 0.5
          : Ball.startY[eid]
        setBodyPosition(body, x, y)

        if (globalState.launcherEntityId >= 0) {
          Launcher.state[globalState.launcherEntityId] = ActiveState.Enabled
        }
        if (globalState.ballEntityId >= 0) {
          Follow.state[globalState.ballEntityId] = ActiveState.Enabled
        }
      }
    }
    return world
  }
}

export const removeAll = (_context: GameContext) => {
  const query = defineQuery([RemoveAll])

  return (world: ECSWorld) => {
    const entities = query(world)
    for (const eid of entities) {
      const components = getEntityComponents(world, eid)
      for (const comp of components) {
        removeComponent(world, comp, eid)
      }
      removeEntity(world, eid)
    }
    return world
  }
}

const isDirectionActive = (mask: number, bit: Direction) => (mask & bit) === bit

export const movement = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, MovementInput])
  const speed = 12

  return (world: ECSWorld) => {
    const entities = query(world)
    for (const eid of entities) {
      const body = getPhysicsBody(eid)
      if (!body) {
        continue
      }

      const mask = MovementInput.directions[eid]
      const { x, y } = body.position
      if (isDirectionActive(mask, Direction.Left)) {
        setBodyPosition(body, x - speed, y)
      } else if (isDirectionActive(mask, Direction.Right)) {
        setBodyPosition(body, x + speed, y)
      }
    }
    return world
  }
}

export const follow = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, Follow])

  return (world: ECSWorld) => {
    const entities = query(world)
    for (const eid of entities) {
      if (Follow.state[eid] === ActiveState.Disabled) {
        continue
      }

      const body = getPhysicsBody(eid)
      if (!body) {
        continue
      }

      const bodyToFollow = getPhysicsBody(Follow.entityId[eid])
      if (!bodyToFollow) {
        continue
      }

      setBodyPosition(
        body,
        bodyToFollow.position.x + Follow.offsetX[eid],
        bodyToFollow.position.y + Follow.offsetY[eid]
      )
    }
    return world
  }
}

export const createGameUpdate = (context: GameContext) => {
  const prePhysics = pipe(
    ...[
      circleCollider,
      boxCollider,
      staticBody,
      initPositionPhysicsBody,
      friction,
      bouncy,
      fixedRotation,

      keyboardInput,
      launcher,
      changeVelocity,
      movement,
      follow,
    ].map((s) => s(context))
  )

  const postPhysics = pipe(
    ...[handleCollisions, syncPositionPhysicsBody, loseBall, removeAll].map(
      (s) => s(context)
    )
  )

  const physicsUpdate = createPhysicsUpdate(context)

  return (world: ECSWorld) => {
    prePhysics(world)
    physicsUpdate()
    postPhysics(world)
  }
}
