import { run } from './runner'

const elt = document.getElementById('app')

if (elt == null) {
  throw new Error("No element with ID 'app' was found.")
}

run(elt)
