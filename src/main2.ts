import StateMachine from "./fsm/app"
import visualize from "../lib/visualize"


console.show()


const menu_key = {
    "首页": "home",
    "去赚钱": "earn",
    "我": "self",
    "朋友": "friend",
}
const options = {
    init: 'unlaunch',
    transitions: [
        { name: 'launch', from: 'unlaunch', to: 'launched' },
        { name: 'clickHome', from: ['launched', 'friend', 'earn', 'self'], to: 'home' },
        { name: 'clickFriend', from: ['launched', 'home', 'earn', 'self'], to: 'friend' },
        { name: 'clickEarn', from: ['launched', 'home', 'friend', 'self'], to: 'earnLoading' },
        { name: 'clickSelf', from: ['launched', 'home', 'friend', 'earn'], to: 'self' },
        { name: 'loadedEarn', from: ['earnLoading', 'earn'], to: 'earn' },
        { name: 'findAd', from: 'earn', to: 'adFinding' },
        { name: 'findedAd', from: 'adFinding', to: 'earn' },
        { name: 'clickAdTask', from: 'earn', to: 'adTaskClicked' },
        { name: 'matchAdType', from: 'adTaskClicked', to: 'adTypeCheck' },
        { name: 'matchAdType', from: 'adTypeCheck', to: 'adTypeCheck' },
        { name: 'playAd', from: ['adTypeCheck', 'adAgin'], to: 'adPlaying' },
        { name: 'adOk', from: ['adPlaying', 'matchNextType'], to: 'adComplete' },
        {
            name: 'matchComplete',
            from: ['adComplete', 'liveComplete', 'matchNextType', 'liveFollow'],
            to: 'matchNextType'
        },
        { name: 'backEarn', from: 'matchNextType', to: 'earn' },
        { name: 'aginAd', from: 'matchNextType', to: 'adAgin' },
        { name: 'playLive', from: ['adTypeCheck', 'liveAgin'], to: 'livePlaying' },
        { name: 'liveOk', from: 'livePlaying', to: 'liveComplete' },
        { name: 'aginLive', from: 'matchNextType', to: 'liveAgin' },
        { name: 'followLive', from: 'matchNextType', to: 'liveFollow' },
        {
            name: 'goto', from: '*', to: function (s) {
                return s;
            }
        }
    ],
    methods: {
        onBeforeLaunch: beforeLaunch,
        onLaunched: launchedFn,
        onClickEarn: clickEarnFn,
        onEarnLoading: earnLoadingFn,
        onLoadedEarn: loadedEarnFn,
        onAdFinding: adFindingFn,
        onFindedAd: findedAdFn,
        onAdTaskClicked: adTaskClickedFn,
        onMatchAdType: adTypeCheckFn,
        onAdPlaying: adPlayingFn,
        onLivePlaying: livePlayingFn,
        onAdComplete: adCompleteFn,
        onAdAgin: adAginFn,
        onBackEarn: backEarnFn,
        onMatchComplete: matchCompleteFn,
        onLiveComplete: liveOkFn,
        onLiveAgin: liveAginFn,
        onLiveFollow: liveFollowFn
    }
};

let FSM = StateMachine.factory(options)
let fsm = new FSM()

console.log(visualize(fsm, { orientation: 'horizontal' }))

function beforeLaunch() {
    return launch("com.kuaishou.nebula")
}

function launchedFn() {
    setTimeout(function () {
        var menu = readCurrentMenu()
        if (menu) {
            fsm.goto(menu)
            console.log(`当前菜单: ${menu}`)
            setTimeout(function () {
                if (menu !== "earn") {
                    fsm.clickEarn()
                } else {
                    fsm.loadedEarn();
                }
            }, 500)
        } else {
            launchedFn()
        }
    }, 500)
}

function clickEarnFn() {
    switchMenuByName("去赚钱")
}

function earnLoadingFn() {
    setTimeout(function () {
        console.log("加载任务中心...")
        if (className("android.view.View").text("任务中心").exists()) {
            fsm.loadedEarn()
        } else {
            earnLoadingFn()
        }
    }, 500)
}

function loadedEarnFn() {
    // showDailyTask()
    setTimeout(function () {
        fsm.findAd()
    }, 500)
}

function adFindingFn() {
    setTimeout(function () {
        console.log("查找广告...")
        var task = selectDailyTask("看广告")
        if (task) {
            if (task.visibleToUser()) {
                fsm.findedAd()
            } else {
                scoll()
                adFindingFn()
            }
        }
    }, 1000)
}

function findedAdFn() {
    setTimeout(function () {
        fsm.clickAdTask()
    }, 500)
}

function adTaskClickedFn() {
    var task = selectDailyTask("看广告")
    if (task) {
        console.log("点击看广告")
        task.lastChild().clickBounds()
        setTimeout(function () {
            fsm.matchAdType()
        }, 500)
    }
}

function adPlayingFn() {
    setTimeout(function () {
        if (!id("video_countdown").exists()) {
            adPlayingFn()
            return
        }
        if (!id("video_countdown").findOnce().text().includes("已成功领取")) {
            adPlayingFn()
            return
        }
        fsm.adOk()
    }, 1000)
}

function livePlayingFn() {
    setTimeout(function () {
        console.log("观看直播中...")
        pickup(id("neo_count_down_text"), 'text', (o) => {
            if (o === '已领取') {
                fsm.liveOk()
            } else {
                livePlayingFn()
            }
        })
    }, 1000)
}

function liveOkFn() {
    setTimeout(function () {
        pickup(id("live_audience_clearable_close_container"), (o) => {
            if (o !== null) {
                press(o.centerX(), o.centerY(), 10)
                fsm.matchComplete()
            } else {
                console.log("未找到领取奖励按钮")
            }
        })
    }, 500)
}

function adCompleteFn() {
    setTimeout(function () {
        if (!id("video_countdown").exists()) {
            adCompleteFn()
            return
        }
        pickup(id("video_countdown"), 'p', (o) => {
            if (o !== null) {
                press(o.centerX(), o.centerY(), 10)
                fsm.matchComplete()
            } else {
                console.log("未找到领取奖励按钮")
            }
        })
    }, 500)
}

function matchCompleteFn() {
    setTimeout(function () {
        if (className("android.view.View").text("任务中心").exists()) {
            fsm.backEarn()
        } else if (id("again_medium_icon_dialog_ensure_text").exists()) {
            fsm.aginAd()
        } else if (id("close_dialog_ensure_button").exists()) {

        } else if (id("again_dialog_ensure_text").exists()) {
            fsm.aginLive();
        } else if (id("video_countdown").exists()) {
            fsm.adOk()
        } else if (className("android.widget.TextView").text("退出直播间").exists()) {
            fsm.followLive()
        } else {
            console.log("未匹配类型，重新匹配中...")
            fsm.matchComplete()
        }
    }, 500)
}


function adTypeCheckFn() {
    setTimeout(function () {
        if (id("video_countdown").exists()) {
            fsm.playAd()
        } else if (id("live_follow_text").exists()) {
            fsm.playLive()
        } else {
            console.log("广告任务类型,匹配中...")
            fsm.matchAdType()
        }
    }, 1000)
}

function adAginFn() {
    console.log("再次观看广告")
    id("again_medium_icon_dialog_ensure_text").findOnce().clickBounds()
    setTimeout(function () {
        fsm.playAd()
    }, 500)
}

function liveFollowFn() {
    className("android.widget.TextView").text("退出直播间").findOnce().clickBounds()
    setTimeout(function () {
        fsm.matchComplete()
    }, 500)
}

function liveAginFn() {
    console.log("再次观看直播");
    id("again_dialog_ensure_text").findOnce().clickBounds();
    setTimeout(function () {
        fsm.playLive();
    }, 500);
}

function backEarnFn() {
    setTimeout(function () {
        fsm.clickAdTask()
    }, 500)
}


// zhuanqian_action()
function scoll() {
    swipe(device.width * 0.5, device.height * 0.8, device.width * 0.5, device.height * 0.2, 500)
}

function showDailyTask() {
    let tasks = id("dailyTask").findOnce().children()
    for (let i = 0; i < tasks.size(); i++) {
        let w = tasks.get(i);
        showTask(w)
    }
}

function selectDailyTask(name) {
    var tasks = id("dailyTask").findOnce().children()
    for (let i = 0; i < tasks.size(); i++) {
        let w = tasks.get(i);
        if (selectTask(w, name)) {
            return w
        }
    }
}

function showTask(w) {
    if (w.id()) {
        w.children().forEach(function (a) {
            if (a.childCount() > 0 && a.indexInParent() === 1) {
                console.log(`${w.id() + " " + a.child(0).text()}`)
            }
        })
    }
}

function selectTask(w, name) {
    if (w.id()) {
        var childs = w.children()
        for (let a of childs) {
            if (a.childCount() > 0 && a.indexInParent() === 1) {
                var text = a.child(0).text()
                if (text.includes(name)) {
                    return true;
                }
            }
        }
    }
}

// console.log(task_center.exists() ? "找到任务中心" : "未找到任务中心")

// buttom.clickBounds()

function readCurrentMenu() {
    if (className("androidx.appcompat.app.ActionBar$c").exists()) {
        const menus = className("androidx.appcompat.app.ActionBar$c").find();
        for (let w of menus) {
            if (w.selected()) {
                return menu_key[w.desc()];
            }
        }
    }
    return false
}

function switchMenuByName(name) {
    var menus = className("androidx.appcompat.app.ActionBar$c").untilFind()
    for (let w of menus) {
        if (w.desc() === name) {
            console.log(`点击 ${w.desc()}`)
            w.clickBounds()
        }
    }
}

function getMenus() {
    return className("androidx.appcompat.app.ActionBar$c").waitFor()
}

function waitSwitch(s) {
    setTimeout(s, 1000)
}

// fsm.launch()
