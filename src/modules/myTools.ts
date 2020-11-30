import {creepApi} from "./creepController";

export function sharder() {
    //位面漫步者
    if (Game.shard.name == 'shard3') {
        if (Game.time % 1000 == 0) {
            console.log((new Date).getTime() + '号位面漫步者正在生成~');
            creepApi.add(`door` + (new Date).getTime(), 'soldier', {
                targetFlagName: "door",
                keepSpawn: false
            }, "W18S18")
        }
        if (Memory['showCpuUsed']) {
            console.log(Game.cpu.getUsed())
        }
    }

    if (Game.shard.name == 'shard2') {
        let reusePath = Memory['reusePath'] ?? 500;
        for (let creep in Game.creeps) {
            let c = Game.creeps[creep]
            if (c.pos.roomName == Game.flags['door_address1'].pos.roomName) {
                continue
            }
            // c.moveByPath(Memory['path'])
            if (c.room.name.slice(0, 3) != "W30") {
                c.moveTo(Game.flags['door_address0'], {
                    reusePath: reusePath, visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .1
                    }
                });
            } else {
                c.moveTo(Game.flags['door_address1'], {
                    reusePath: reusePath, visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .1
                    }
                });
            }
        }
        if (Memory['showCpuUsed']) {
            console.log(Game.cpu.getUsed())
        }
    }
}

export function buildUpdaterRoad() {
    if (Object.keys(Game.constructionSites).length >= 100 || !(Memory['buildUpdaterRoad'])) return
    for (let c in Game.creeps) {
        let creep = Game.creeps[c];
        let creepRole = Memory.creeps[creep.name]['role'];
        if (creepRole == "upgrader" && creep.room.controller.level > 6) {
            if (
                creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length == 0 //不存在施工点
                && creep.pos.lookFor(LOOK_STRUCTURES).length == 0 //不存在建筑
            ) {
                console.log(creep.name + " 在 " + creep.pos + ' 新建道路~')
                creep.pos.createConstructionSite(STRUCTURE_ROAD)
            }
        }
    }
}