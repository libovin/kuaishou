import { setup, createMachine, fromCallback, fromPromise, assign, fromTransition, createActor, AnyActorLogic, sendTo, raise, fromObservable } from "xstate"
import earnStateActor from "./earn";

const kuaishouMachine = setup({
    types: {
        context: {
        } as {
            isLaunch: boolean,
            currentMenu: string
        },
        events: {} as
            | { type: 'LAUNCH' }
            | { type: 'CLOSE' }
            | { type: 'SUCCESS' }
            | { type: 'FAIL' }
            | { type: 'FRIEND' }
            | { type: 'HOME' }
            | { type: 'EARN' }
            | { type: 'SELF' }
    },
    delays: {
        next: 1000,
    },
    actions: {
        launchAction: (params) => {
            var launchState = launch("com.kuaishou.nebula")
            toast(launchState ? "启动成功" : "启动失败")
        },
        currentMenuAction: (params) => {
            const menus = className("androidx.appcompat.app.ActionBar$c").find();
            for (let w of menus) {
                if (w.selected()) {
                    console.log(`当前菜单: ${w.desc()}`);
                    assign({ currentMenu: w.desc() });
                    return
                }
            }
            console.log("未找到菜单");
        }
    },
    guards: {
        isLaunchGuard: ({ context, event }) => {

            className("androidx.appcompat.app.ActionBar$c").untilFind()
            const launch = className("androidx.appcompat.app.ActionBar$c").exists()
            launch && console.log("启动成功");
            return launch;
        },
    },
    actors: {
        earnStateActor,
    },

}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGsCuBDAlrAFge1QGUAXdYsAOkwgBswBiAGQEEBVAOQGEAJAbQAYAuolAAHPLEzFMeAHYiQAD0QBGAOwA2CioCcetQBYATAGYja-gA4DlgDQgAnqstGKJk3p0BWAwf46DExUDAF8Q+zQsXAISMkpqOnpORgB5QgBRAWEkEHFJaTkFZQR1LV19YzMLaztHRHM1Cg0dfn4VDSNrdUtDMIiMbHwiUnIKGnRUWQBjHExZKHoshTypGXkc4q8jeycSoyMvCh0Vdt1jHQOvPpBIwZiRynHJmch6CDlKWAeKW+jhuLGE2mOEgSxyKwK61AxQ6O0QPUa6i8lksJw0Gi8mg011+Q1ioyewMgFHwAFsGAAxABKAEl0uwACJgsQSVaFDaIDxaPytKxeLblWq7E5qSxNFoGZpGHQdDT8NQ4gZ-fGPIEvCAkvDk+jpZhU9jM3KsyFFTkyig81qWflGQVwhAy1z8UyaA7HVoK8I3JV476E9Wa7UZRgUw0QtamhBci28vkCvRCxAaFRi6xtEw9UxBIzYr24+4A-0gjVkhjJNKZITLY0RjlR82WuO2hP2lQCijStT8lOBVq6RVRX2FtXFigAMwATpgwLIIPRuCkALKV7Is-K16FJnwUFxefj8zGBXet6U6Cj8PwGLxSywaEwXgd3f4EkfEyfT2c6vUGqvgmvszcEAxM8DC7fh3C8EwfFPe1vDFAIL3lZp5R0ExH2VP1Xw1d8ZznYNQ1-Nc2ShJREGOLQ1AOPsbAxNsVBPKCKDUCVdGCLMVDQvMfQLF9nlHHDP3LDIw3-EjinIpiqLaGivDo1sMzPAIuxle8vB0NQoPQodeKJDUwHQCdZHnJcV2rdcANIhBLyaDp+XdSijBsNRYJUVwzAzWTZOaPcVC0njVT44l9MM+hqTpRkRPMsSk0lChryonzUMPVsrSaPwM2lA8zCMPznwC3SKGCoz8Mi4jIw0WL4r3RKoMMWD-A7S8ZWTDQNOTXKVUBQK9IMoyhNMv8ovKyrbP3NokrquoSn3MUTD8HxkQWjSri4wd-K6grYDAGgx2M5dSpNOsLgMI4ehtC82z8bYpo0s9dDaHMoOvFwctWp9OqLYktp20LaXpJlCKNIajvaSS92k29PPoqbXOtC0Wi2cDdHi3N+jWvKNoDb7dt1fUDo3SyLjPO8u3vVoDh6DR7VFVMWk6C4fEo9wOsw7qKGxpJUmEwHwws4oTmOHcegMdTvBMVrzBPZo4vUiqkMsAIVq9WQ8AgOAFHzPKzLKusAFoqam7xzw8TxTc8V60fe74EjAbXDsA4x7RzLRjj3dEVHla0909S2MOHPi5igO2CeKdwVDi1zZLG9o5v5J39w7Cr1N8ciZRsFn-d04O+fqC8O15OaggCY5JamyDw58K1bSTzQM50gNS2z6KEAOVwjALwIzhL5zDbUpoXRFtQOIMdQ6-ygMBIgJvI2Y1wtj3cwDgzfh0RPOG1IvTRkQ91rUe9dGPqwwreunutZLc2z71FdEbB0WDrziy8cxaa1fAt-erczrHtrHU-AI9yiTQzounbmna6wpn7ii7EnKCHsFZj0xqOAARugKYyA-6WQ4hxJiwtZLtAvNaVsbs3CgT3NaFEqIcwIKmDQCQkAMGhyCBHA4HsfJ3ivF4J2mg4omxtIrBWoQwghCAA */
    id: 'kuaishouState',
    initial: 'idle',
    context: {
        isLaunch: false,
        currentMenu: ""
    },
    states: {
        idle: {
            on: {
                LAUNCH: {
                    actions: [{ type: 'launchAction' }],
                    target: 'launching'
                },
                CLOSE: { target: 'closed' }
            }
        },
        launching: {
            always: {
                guard: 'isLaunchGuard',
                target: 'launched'
            }
        },
        launched: {
            initial: 'checkingMenu',
            states: {
                checkingMenu: {
                    always: [
                        {
                            guard: ({ context }) => context.currentMenu === "首页",
                            target: 'home'
                        },
                        {
                            guard: ({ context }) => context.currentMenu === "朋友",
                            target: 'friend'
                        },
                        {
                            guard: ({ context }) => context.currentMenu === "去赚钱",
                            target: 'earn'
                        },
                        {
                            guard: ({ context }) => context.currentMenu === "我",
                            target: 'self'
                        },
                        {
                            target: 'home'
                        }
                    ]
                },
                home: {
                    on: {
                        'FRIEND': { target: 'friend' },
                        'EARN': { target: 'earn' },
                        'SELF': { target: 'self' },
                        'CLOSE': { target: 'back' },
                    },
                    after: {
                        1000: {
                            target: 'earn',
                        },
                    },
                },
                friend: {
                    on: {
                        'HOME': { target: 'home' },
                        'EARN': { target: 'earn' },
                        'SELF': { target: 'self' },
                        'CLOSE': { target: 'back' },
                    },
                },
                earn: {
                    invoke: {
                        src: "earnStateActor",
                    },
                    on: {
                        'HOME': { target: 'home' },
                        'FRIEND': { target: 'friend' },
                        'SELF': { target: 'self' },
                        'CLOSE': { target: 'back' },
                    },
                },
                self: {
                    on: {
                        'HOME': { target: 'home' },
                        'FRIEND': { target: 'friend' },
                        'EARN': { target: 'earn' },
                        'CLOSE': { target: 'back' },
                    }
                },
                back: {
                    type: 'final'
                }
            },
            onDone: {
                target: 'idle'
            },
        },
        closed: {
            type: 'final',
        }
    }
});



export default kuaishouMachine;
