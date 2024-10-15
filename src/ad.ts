
function ad() {

    if (id("video_ad_description").exists()) {
        // 广告
        var complete = id("video_countdown").findOne()

        var text = complete.text()
        if (!text.includes("已成功领取奖励")) {
            setTimeout(ad, 1000)
            return
        }
        complete.clickBounds()
        setTimeout(ad, 1000)
    } else if (id("live_follow_text").exists()) {
        // 直播
        console.log("开始直播")

    } else if (id("again_medium_icon_dialog_ensure_text").exists()) {
        var again = id("again_medium_icon_dialog_ensure_text").findOne()
        again.clickBounds()
        setTimeout(ad, 1000)
    }
}

export default ad
