import { createGame } from '../game'
import { config } from '../game/config'
import { RuntimeContext } from '../types'
import { createApp, createLoop } from './create'
import { createRenderPipeline } from './systems'

const runWith = createGame(config)

const pixiRunner = (ctx: RuntimeContext) => {
  const app = createApp(config)
  const render = createRenderPipeline(ctx, app)
  const loop = createLoop(ctx, render)

  app.ticker.add((dt: number) => {
    loop(dt)
  })

  document.getElementById('app')?.appendChild(app.view)
}

runWith(pixiRunner)
