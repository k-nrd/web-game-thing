import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  removeComponent,
} from 'bitecs'
import Matter from 'matter-js'

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

export const getPhysicsBody = (eid: number) => bodies[eid]

export const setBodyVelocity = (body: Matter.Body, x: number, y: number) => {
  Matter.Body.setVelocity(body, Matter.Vector.create(x, y))
}

export const setBodyPosition = (body: Matter.Body, x: number, y: number) => {
  Matter.Body.setPosition(body, Matter.Vector.create(x, y))
}

export const createPhysicsUpdate =
  ({ physicsEngine }: GameContext) =>
  () => {
    Matter.Engine.update(physicsEngine, 1000 / 60)
  }

export const circleCollider = ({ physicsEngine }: GameContext) => {
  const query = defineQuery([PhysicsBody, CircleCollider])
  const enter = enterQuery(query)
  const exit = exitQuery(query)

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
    for (const eid of enterEntities) {
      const radius = CircleCollider.radius[eid]
      const body = Matter.Bodies.circle(1, 1, radius, {
        // there's a bug here where if mass is not set to something other than 0
        // the update stick will result in NaN
        // https://github.com/liabru/matter-js/blob/master/src/body/Body.js#L643
        mass: 1,
      })
      Matter.Composite.add(physicsEngine.world, body)
      bodies[eid] = body
      bodyIdToEid[body.id] = eid
    }

    const exitEntities = exit(world)
    for (const eid of exitEntities) {
      const body = bodies[eid]
      Matter.Composite.remove(physicsEngine.world, body)
    }
    return world
  }
}

export const boxCollider = ({ physicsEngine }: GameContext) => {
  const query = defineQuery([PhysicsBody, BoxCollider])
  const enter = enterQuery(query)
  const exit = exitQuery(query)

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
    for (const eid of enterEntities) {
      const width = BoxCollider.width[eid]
      const height = BoxCollider.height[eid]
      const body = Matter.Bodies.rectangle(0, 0, width, height, {
        chamfer: {
          radius: BoxCollider.chamferRadius[eid],
        },
      })
      Matter.Composite.add(physicsEngine.world, body)
      bodies[eid] = body
      bodyIdToEid[body.id] = eid
    }

    const exitEntities = exit(world)
    for (const eid of exitEntities) {
      const body = bodies[eid]
      Matter.Composite.remove(physicsEngine.world, body)
    }

    return world
  }
}

export const friction = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, Friction])
  const enter = enterQuery(query)

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
    for (const eid of enterEntities) {
      const body = bodies[eid]
      if (!body) {
        continue
      }
      body.friction = Friction.friction[eid]
      body.frictionAir = Friction.frictionAir[eid]
    }

    const entities = query(world)
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
    return world
  }
}

export const bouncy = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, Bouncy])
  const enter = enterQuery(query)
  const exit = exitQuery(query)

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
    for (const eid of enterEntities) {
      const body = bodies[eid]
      if (!body) {
        continue
      }

      body.restitution = 1
    }

    const exitEntities = exit(world)
    for (const eid of exitEntities) {
      const body = bodies[eid]
      if (!body) {
        continue
      }

      body.restitution = 0
    }

    return world
  }
}

export const staticBody = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, Static])
  const enter = enterQuery(query)
  const exit = exitQuery(query)

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
    for (const eid of enterEntities) {
      const body = bodies[eid]
      if (!body) {
        continue
      }
      Matter.Body.setStatic(body, true)
    }

    const exitEntities = exit(world)
    for (const eid of exitEntities) {
      const body = bodies[eid]
      if (!body) {
        continue
      }

      Matter.Body.setStatic(body, false)
    }
    return world
  }
}

export const fixedRotation = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, FixedRotation])
  const enter = enterQuery(query)
  const exit = exitQuery(query)
  const previousInertia: number[] = []

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
    for (const eid of enterEntities) {
      const body = getPhysicsBody(eid)
      if (!body) {
        continue
      }

      previousInertia[eid] = body.inertia
      Matter.Body.setInertia(body, Infinity)
    }

    const exitEntities = exit(world)
    for (const eid of exitEntities) {
      const body = getPhysicsBody(eid)
      if (!body) {
        continue
      }

      Matter.Body.setInertia(body, previousInertia[eid] ?? 1)
    }
    return world
  }
}

export const initPositionPhysicsBody = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, Position])
  const enter = enterQuery(query)

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
    for (const eid of enterEntities) {
      const body = bodies[eid]
      if (!body) {
        continue
      }

      setBodyPosition(body, Position.x[eid], Position.y[eid])
    }

    return world
  }
}

export const changeVelocity = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, ChangeVelocity])
  const enter = enterQuery(query)

  return (world: ECSWorld) => {
    const enterEntities = enter(world)
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
    return world
  }
}

export const syncPositionPhysicsBody = (_context: GameContext) => {
  const query = defineQuery([PhysicsBody, Position])

  return (world: ECSWorld) => {
    const entities = query(world)
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
    return world
  }
}

export const handleCollisions = ({ physicsEngine }: GameContext) => {
  const collisionPairs: Matter.IPair[] = []
  Matter.Events.on(physicsEngine, 'collisionStart', (e) => {
    for (const data of e.pairs) {
      collisionPairs.push(data)
    }
  })

  return (world: ECSWorld) => {
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
    return world
  }
}
