import { ApiContext } from '.'
import { getContext } from './context'

export const useKeyboard = (ctx?: ApiContext) => {
  const api = getContext(ctx)

  if (api == null) {
    throw new Error(
      `Could not find a context named ${ctx?.name}. Try creating one.`
    )
  }

  return api.keyboard
}
