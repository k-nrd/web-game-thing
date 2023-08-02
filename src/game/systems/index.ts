import {
  addComponent,
  defineQuery,
  getEntityComponents,
  removeComponent,
  removeEntity,
} from 'bitecs'
import { GameCtx } from '../../pixi/runner'
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

const movementInputQuery = defineQuery([MovementInput])
const physicsMovementInputQuery = defineQuery([PhysicsBody, MovementInput])
const launcherQuery = defineQuery([Launcher])
const ballPositionQuery = defineQuery([Ball, Position])
const removeAllQuery = defineQuery([RemoveAll])
const followQuery = defineQuery([PhysicsBody, Follow])

export const keyboardInput = ({ keyboard, world }: GameCtx) => {
  const entities = movementInputQuery(world)
  for (const eid of entities) {
    let directions = 0
    if (keyboard.pressed('left')) {
      directions |= Direction.Left
    } else if (keyboard.pressed('right')) {
      directions |= Direction.Right
    }
    MovementInput.directions[eid] = directions
  }
}

export const launcher = ({
  config,
  keyboard,
  state: { global },
  world,
}: GameCtx) => {
  const entities = launcherQuery(world)
  for (const eid of entities) {
    if (Launcher.state[eid] === ActiveState.Disabled) {
      continue
    }

    if (!keyboard.pressed('space')) {
      continue
    }

    const ballEid = global.ballEntityId
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
}

export const loseBall = ({ config, state: { global }, world }: GameCtx) => {
  const entities = ballPositionQuery(world)
  for (const eid of entities) {
    const y = Position.y[eid]
    if (y > config.dimensions.world.height + 50) {
      const body = getPhysicsBody(eid)
      if (!body) {
        console.error('loseBall: missing phyiscs body')
        continue
      }

      setBodyVelocity(body, 0, 0)

      const paddleEid = global.paddleEntityId
      const x = Position.x[paddleEid] ?? Ball.startX[eid]
      const y = Position.y[paddleEid]
        ? Position.y[paddleEid] - config.dimensions.ball.height * 0.5
        : Ball.startY[eid]
      setBodyPosition(body, x, y)

      if (global.launcherEntityId >= 0) {
        Launcher.state[global.launcherEntityId] = ActiveState.Enabled
      }
      if (global.ballEntityId >= 0) {
        Follow.state[global.ballEntityId] = ActiveState.Enabled
      }
    }
  }
}

export const removeAll = ({ world }: GameCtx) => {
  const entities = removeAllQuery(world)
  for (const eid of entities) {
    const components = getEntityComponents(world, eid)
    for (const comp of components) {
      removeComponent(world, comp, eid)
    }
    removeEntity(world, eid)
  }
}

const isDirectionActive = (mask: number, bit: Direction) => (mask & bit) === bit

export const movement = ({ world }: GameCtx) => {
  const speed = 12
  const entities = physicsMovementInputQuery(world)
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
}

export const follow = ({ world }: GameCtx) => {
  const entities = followQuery(world)
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
}

export const update = (ctx: GameCtx) => {
  const prePhysics = [
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
  ]

  const postPhysics = [
    handleCollisions,
    syncPositionPhysicsBody,
    loseBall,
    removeAll,
  ]

  for (const system of prePhysics) {
    system(ctx)
  }

  ctx.physics.update(ctx.world.dt)

  for (const system of postPhysics) {
    system(ctx)
  }
}
