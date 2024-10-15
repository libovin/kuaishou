import { setup, createMachine, fromCallback, fromPromise, assign, fromTransition, createActor, AnyActorLogic } from "xstate"



const callbackLogic = fromCallback(({ sendBack, receive }) => {
    const interval = setInterval(() => {
        sendBack({ type: 'TICK' });
    }, 10);
    return () => clearInterval(interval);
});

let actions = assign({
    elapsed: ({ context }) => context.elapsed + 1
})

const adState = {
    initial: 'loading',
    states: {
        loading: {
            on: {
                SUCCESS: { target: 'playing' },
            }
        },
        playing: {
            on: {
                PAUSE: {
                    actions: actions,
                    target: 'pause'
                },
                END: { target: 'end' }
            }
        },
        pause: {
            on: {
                PLAY: { target: 'playing' },
                END: { target: 'end' }
            }
        },
        end: {

        },
    }
}


const earnStateMachine = setup({
    types: {
        context: {} as {},
        events: {} as
            | { type: 'SUCCESS' }
            | { type: 'EXIT' }
            | { type: 'AD.TASK' }
            | { type: 'LIVE.TASK' }
            | { type: 'VIEDO.TASK' }
    },
    actions: {
        someAction: () => { }
    },
    guards: {
        earnLoaded: ({ context }) => { return className("android.view.View").text("任务中心").exists() }
    },
    actors: {
        adStateActor: setup({}).createMachine({})
    },
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5RgIYCcB2BlALinYAdADYD2KEAlhlAMQDaADALqKgAOpslOlpGbEAA9EAJgCsATkKSJjAIzyAHBIDs8yQBoQAT0RKAzIQAsxyZKXilq0QYBskqwF8n21Jlz4ilCMTC0AQQARQgAVAKwAaSZWJBBObl5+QREEUUtCcVVxRlFRO2txHNVtPTTVVUJReTs7cWNFRgLZFzd0bDwCQh8-WgAZAEkANQBRMIjolkEEnj4BONTRVWNCRgNsxibVR2M7Y1LEeQMVxVrjJUYlRVUlc9bwds8unv8hgZGggHlxqJjprlmyQWiCKdlWciOolyTXk4gOaTyhHkDTq2Tq8gk8nu7g6Xm6vn84SihAAwp8ALIABT6I1CIz+cRmSXmoFSoPBOUh0LssPhS3khFuNR5Blkhlq2MenSIFFoEH4RFg0sIOKeMogDI4AOZKTEUhkEOUag0fIMjEywvEZsYkhukjsoklHmVxEoADd-PKMIrlaqXe6wJr4tq5rq0vrZJyjVkTbpDoZBZaNJclJInbium7KJBSHKFYQlXi-Xiszmg0zQ8CEHYzRaJAZ1rd8st4fJsiYUeI9ns8vVVC5XCAMKQIHBBMWCP9EpXWYgALR2eFz8Qycxr9frgzptUkchUGhTwEs4SHAwrmw5JqNm3mUTwq6Ea2bDHrGvWbfKl6HnVV4zVQVyIwFT1KYtglHGCBGiYwo8lkz5AeIH54hQ34zieCB-ny-5SOYFyqGsBQFEhXSuh6qFArOkFnoQF6bDWNw3rIraijRa6GAoDr2rcxFEKW8rkceqTLCs6w5EsEjGNsqatioSKiGYkibGekiNnYPGEAAxqQAC27B+JOjIhhR6HCY+GziX2FhaBBSzmg4NQKY40KIQOQA */
    id: 'earnState',
    initial: "loading",
    states: {
        loading: {
            always: {
                guard: 'earnLoaded',
                target: 'idle',
            }
        },
        idle: {
            on: {
                'AD.TASK': { target: 'ad' },
                'LIVE.TASK': { target: 'live' },
                'VIEDO.TASK': { target: 'viedo' },
                'TASK.COMPLETE': { target: 'complete' },
            }
        },
        ad: {
            invoke: {
                src: 'adStateActor',
            },
            onDone: {
                target: 'idle'
            },
        },
        live: {
            onDone: {
                target: 'idle'
            },
        },
        viedo: {
            onDone: {
                target: 'idle'
            },
        },
        complete: {
            type: 'final',
        }
    },
})

export default earnStateMachine