import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  removeComponent,
} from 'bitecs'
import Matter from 'matter-js'
import { GameCtx } from '../../pixi/runner'

import { GameContext, ECSWorld } from '../../types'
import {
  Bouncy,
  BoxCollider,
  Brick,
  ChangeVelocity,
  CircleCollider,
  FixedRotation,
  Friction,
  PhysicsBody,
  Position,
  RemoveAll,
  Static,
} from '../components'

const bodies = [] as Matter.Body[]
const bodyIdToEid = [] as number[]
const previousInertia: number[] = []
const collisionPairs: Matter.IPair[] = []

const circleColliderQuery = defineQuery([PhysicsBody, CircleCollider])
const enterCircleCollider = enterQuery(circleColliderQuery)
const exitCircleCollider = exitQuery(circleColliderQuery)

const boxColliderQuery = defineQuery([PhysicsBody, BoxCollider])
const enterBoxCollider = enterQuery(boxColliderQuery)
const exitBoxCollider = exitQuery(boxColliderQuery)

const frictionQuery = defineQuery([PhysicsBody, Friction])
const enterFriction = enterQuery(frictionQuery)

const bouncyQuery = defineQuery([PhysicsBody, Bouncy])
const enterBouncy = enterQuery(bouncyQuery)
const exitBouncy = exitQuery(bouncyQuery)

const staticQuery = defineQuery([PhysicsBody, Static])
const enterStatic = enterQuery(staticQuery)
const exitStatic = exitQuery(staticQuery)

const fixedRotationQuery = defineQuery([PhysicsBody, FixedRotation])
const enterFixedRotation = enterQuery(fixedRotationQuery)
const exitFixedRotation = exitQuery(fixedRotationQuery)

const positionQuery = defineQuery([PhysicsBody, Position])
const enterPosition = enterQuery(positionQuery)

const changeVelocityQuery = defineQuery([PhysicsBody, ChangeVelocity])
const enterChangeVelocity = enterQuery(changeVelocityQuery)

export const getPhysicsBody = (eid: number) => bodies[eid]

export const setBodyVelocity = (body: Matter.Body, x: number, y: number) => {
  Matter.Body.setVelocity(body, Matter.Vector.create(x, y))
}

export const setBodyPosition = (body: Matter.Body, x: number, y: number) => {
  Matter.Body.setPosition(body, Matter.Vector.create(x, y))
}

export const circleCollider = ({ physics: { engine }, world }: GameCtx) => {
  const enterEntities = enterCircleCollider(world)
  for (const eid of enterEntities) {
    const radius = CircleCollider.radius[eid]
    const body = Matter.Bodies.circle(1, 1, radius, {
      // there's a bug here where if mass is not set to something other than 0
      // the update stick will result in NaN
      // https://github.com/liabru/matter-js/blob/master/src/body/Body.js#L643
      mass: 1,
    })
    Matter.Composite.add(engine.world, body)
    bodies[eid] = body
    bodyIdToEid[body.id] = eid
  }

  const exitEntities = exitCircleCollider(world)
  for (const eid of exitEntities) {
    const body = bodies[eid]
    Matter.Composite.remove(engine.world, body)
  }
}

export const boxCollider = ({ physics: { engine }, world }: GameCtx) => {
  const enterEntities = enterBoxCollider(world)
  for (const eid of enterEntities) {
    const width = BoxCollider.width[eid]
    const height = BoxCollider.height[eid]
    const body = Matter.Bodies.rectangle(0, 0, width, height, {
      chamfer: {
        radius: BoxCollider.chamferRadius[eid],
      },
    })
    Matter.Composite.add(engine.world, body)
    bodies[eid] = body
    bodyIdToEid[body.id] = eid
  }

  const exitEntities = exitBoxCollider(world)
  for (const eid of exitEntities) {
    const body = bodies[eid]
    Matter.Composite.remove(engine.world, body)
  }
}

export const friction = ({ world }: GameCtx) => {
  const enterEntities = enterFriction(world)
  for (const eid of enterEntities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }
    body.friction = Friction.friction[eid]
    body.frictionAir = Friction.frictionAir[eid]
  }

  const entities = frictionQuery(world)
  for (const eid of entities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }

    if (body.friction !== Friction.friction[eid]) {
      body.friction = Friction.friction[eid]
    }
    if (body.frictionAir !== Friction.frictionAir[eid]) {
      body.frictionAir = Friction.frictionAir[eid]
    }
  }
}

export const bouncy = ({ world }: GameCtx) => {
  const enterEntities = enterBouncy(world)
  for (const eid of enterEntities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }

    body.restitution = 1
  }

  const exitEntities = exitBouncy(world)
  for (const eid of exitEntities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }

    body.restitution = 0
  }
}

export const staticBody = ({ world }: GameCtx) => {
  const enterEntities = enterStatic(world)
  for (const eid of enterEntities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }
    Matter.Body.setStatic(body, true)
  }

  const exitEntities = exitStatic(world)
  for (const eid of exitEntities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }

    Matter.Body.setStatic(body, false)
  }
}

export const fixedRotation = ({ world }: GameCtx) => {
  const enterEntities = enterFixedRotation(world)
  for (const eid of enterEntities) {
    const body = getPhysicsBody(eid)
    if (!body) {
      continue
    }

    previousInertia[eid] = body.inertia
    Matter.Body.setInertia(body, Infinity)
  }

  const exitEntities = exitFixedRotation(world)
  for (const eid of exitEntities) {
    const body = getPhysicsBody(eid)
    if (!body) {
      continue
    }

    Matter.Body.setInertia(body, previousInertia[eid] ?? 1)
  }
}

export const initPositionPhysicsBody = ({ world }: GameCtx) => {
  const enterEntities = enterPosition(world)
  for (const eid of enterEntities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }

    setBodyPosition(body, Position.x[eid], Position.y[eid])
  }
}

export const changeVelocity = ({ world }: GameCtx) => {
  const enterEntities = enterChangeVelocity(world)
  for (const eid of enterEntities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }

    Matter.Body.setVelocity(
      body,
      Matter.Vector.create(ChangeVelocity.x[eid], ChangeVelocity.y[eid])
    )

    removeComponent(world, ChangeVelocity, eid)
  }
}

export const syncPositionPhysicsBody = ({ world }: GameCtx) => {
  const entities = positionQuery(world)
  for (const eid of entities) {
    const body = bodies[eid]
    if (!body) {
      continue
    }

    const p = body.position
    if (isNaN(p.x)) {
      console.error('NaN detected!')
    }
    Position.x[eid] = p.x
    Position.y[eid] = p.y
  }
}

let collisionListenerStarted = false
export const handleCollisions = ({ physics: { engine }, world }: GameCtx) => {
  if (!collisionListenerStarted) {
    Matter.Events.on(engine, 'collisionStart', (e) => {
      for (const data of e.pairs) {
        collisionPairs.push(data)
      }
    })
    collisionListenerStarted = true
  }

  while (collisionPairs.length > 0) {
    const data = collisionPairs.shift()!
    const { bodyA, bodyB } = data
    const eida = bodyIdToEid[bodyA.id]
    const eidb = bodyIdToEid[bodyB.id]

    if (hasComponent(world, Brick, eida)) {
      addComponent(world, RemoveAll, eida)
    } else if (hasComponent(world, Brick, eidb)) {
      addComponent(world, RemoveAll, eidb)
    }
  }
}
