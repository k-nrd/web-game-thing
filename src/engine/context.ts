import { ApiContext, GameAPI } from '.'

const contexts = new Map<string, GameAPI<any>>()

const defaultContext = '@@default'

export const createContext = (name?: string): ApiContext => {
  const n = name ?? defaultContext

  if (contexts.has(n)) {
    if (n === defaultContext) {
      throw new Error('Trying to instantiate two default contexts.')
    }

    throw new Error(
      `Game instances need to have unique names. Please use another name instead of ${name}`
    )
  }

  const api = instantiateApi(n)

  contexts.set(n, api)

  return { name: n }
}

export const getContext = (ctx?: ApiContext) => {
  const n = ctx?.name ?? defaultContext
  return contexts.get(n)
}
