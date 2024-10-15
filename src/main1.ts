import kuaishouMachine from "./state-machine/menu";
import {createActor} from "xstate"

import "core-js/stable/array/flat-map"

console.show()

const actor = createActor(kuaishouMachine)


actor.subscribe(state => {
  console.log(state.value, state.context);
});
actor.start()
actor.send({type: 'LAUNCH'})

setInterval(() => {
}, 10000)