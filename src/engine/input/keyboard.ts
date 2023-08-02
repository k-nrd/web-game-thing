import { GameInputs } from '../types'

export const createKeyboard = <I extends GameInputs>(inputConfig: I) => {
  type Input = keyof I

  const keysPressed = new Set<string>()

  const handleKeyDown = (evt: KeyboardEvent) => {
    keysPressed.add(evt.key.toLowerCase())
  }

  const handleKeyUp = (evt: KeyboardEvent) => {
    keysPressed.delete(evt.key.toLowerCase())
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  const destroy = () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }

  const pressed = (input: Input): boolean => {
    let result = false
    for (const k of inputConfig[input]) {
      result = result || keysPressed.has(k)
    }
    return result
  }

  return {
    destroy,
    pressed,
  }
}
