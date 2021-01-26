export function dataShow() {
    for (let r in Game.rooms) {
        let room = Game.rooms[r];
        if (!room.controller) continue;
        if (!room.controller.my) continue;
        // 数据展示区
        room.visual.rect(0, 0, 15, 5, {fill: '#000000', opacity: .3})

        // let x = 1;
        // let y = 1;

        //当前gcl增速
        room.visual.text('当前gcl增速:' + Memory.stats['progress'].avg + '/tick', 1, 1, {font: .8, align: "left"})
        let catalyzeNum = Object.values(Game.creeps).filter(creep => creep.name.split(' ')[0] == 'catalyze').length
        room.visual.text('当前催化者:' + catalyzeNum, 1, 2, {font: .8, align: "left"})
        room.visual.text('当前cpu使用:' + Game.cpu.getUsed().toFixed(4), 1, 3, {font: .8, align: "left"})
        room.visual.text('当前bucket:' + Game.cpu.bucket, 1, 4, {font: .8, align: "left"})

        // //房间概要
        // let roomData = {
        //     '等级': room.controller.level,
        //     'spawn能量': room.energyAvailable,
        //     '冷却时间': room.memory['boostUpgradeTimeout']
        // };
        // for (let title in roomData) {
        //     room.visual.text(title + ':' + roomData[title], x, y, {font: .8, align: "left"})
        //     y += 2
        // }
        //
        // //分割线
        // room.visual.line(1, y, 14, y, {color: '#ffffff', opacity: .3, width: .05})
        // y++
        //
        // // 展示creep情况
        // for (let creep of room.find(FIND_MY_CREEPS)) {
        //     let isBoost = '';
        //     let color = '#ffffff';
        //     if (creep.memory.role == 'upgrader' || creep.memory.role == 'remoteUpgrader') {
        //         color = '#ff552e';
        //         isBoost = 'x';
        //         for (let body of creep.body) {
        //             if (body.boost) {
        //                 isBoost = '√';
        //                 break;
        //             }
        //         }
        //     }
        //     let data = [creep.name.split(' ')[1].padEnd(12), creep.ticksToLive.toString().padEnd(4), creep.getActiveBodyparts(WORK).toString().padEnd(2), isBoost].join(' ');
        //     room.visual.text(data, x, y, {align: "left", font: .7, color: color})
        //     y++
        // }
        //
        //
        // //终端资源
        // if (room.terminal) {
        //     //分割线
        //     room.visual.line(1, y, 14, y, {color: '#ffffff', opacity: .3, width: .05})
        //     y++
        //
        //     let resourceTypes = ['XGH2O', 'energy'];
        //     for (let resourceType of resourceTypes) {
        //         room.visual.text(resourceType + ':' + room.terminal.store[resourceType], x, y, {
        //             align: "left",
        //             font: .7
        //         })
        //         y++
        //     }
        // }
        //
        // //物流任务
        // if (room.memory.transferTasks && room.memory.transferTasks.length > 0) {
        //     //分割线
        //     room.visual.line(1, y, 14, y, {color: '#ffffff', opacity: .3, width: .05})
        //     y++
        //     let tasks = room.memory.transferTasks
        //     for (let task of tasks) {
        //         room.visual.text(task.type, x, y, {align: 'left', font: .7})
        //         y++
        //     }
        // }

        //正在建造的建筑提示
        if (room.memory.constructionSiteId) {
            let site: ConstructionSite = Game.getObjectById(room.memory.constructionSiteId);
            if (site) {
                room.visual.text(
                    site.progress + '(' + (site.progress / site.progressTotal * 100).toFixed(2) + '%)',
                    site.pos.x + 1,
                    site.pos.y,
                    {align: "left"}
                )

                room.visual.circle(site.pos.x, site.pos.y, {radius: .4, fill: "transparent", stroke: 'rgb(205,127,50)'})
            }
        }

        //控制器信息
        if (room.controller.level < 8) {
            let c = room.controller;
            room.visual.text(c.progress + '(' + (c.progress / c.progressTotal * 100).toFixed(2) + '%)', c.pos.x + 1, c.pos.y, {
                align: "left",
                font: .7
            })
        }
    }
}