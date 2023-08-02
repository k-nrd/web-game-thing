import { Texture } from '../game'

export const config = {
  inputs: {
    left: ['arrowleft', 'a'],
    right: ['arrowright', 'd'],
    space: [' '],
  },
  physics: {
    gravity: { x: 0, y: 0 },
  },
  app: {
    width: 960,
    height: 540,
  },
  layout: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 6, 3, 3, 3, 3, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 1, 6, 3, 5, 5, 5, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 1, 6, 3, 4, 4, 4, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 6, 3, 3, 3, 3, 0, 0, 0],
  ],
  dimensions: {
    world: {
      width: 960,
      height: 540,
    },
    brick: {
      width: 64,
      height: 32,
    },
    ball: {
      width: 24,
      height: 24,
    },
    paddle: {
      width: 100,
      height: 24,
    },
  },
  assets: {
    ball: {
      key: Texture.ball,
      path: 'assets/ball.png',
    },
    paddle: {
      key: Texture.paddle,
      path: 'assets/paddle.png',
    },
    brick: {
      key: Texture.brick,
      path: 'assets/brick.png',
    },
  },
} as const
