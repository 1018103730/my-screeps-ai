import mountWork from './mount'
import {doing, stateScanner, generatePixel} from './utils'
import creepNumberListener, {creepApi} from './modules/creepController'
import {ErrorMapper} from './modules/errorMapper'
import {DEFAULT_FLAG_NAME} from "./setting";

export const loop = ErrorMapper.wrapLoop(() => {
    if (Memory.showCost) console.log(`-------------------------- [${Game.time}] -------------------------- `)

    // 挂载拓展
    mountWork()

    // creep 数量控制
    creepNumberListener()

    // 所有建筑、creep、powerCreep 执行工作
    doing(Game.structures, Game.creeps, Game.powerCreeps)

    // 搓 pixel
    generatePixel()

    // 统计全局资源使用
    stateScanner()

    //位面漫步者
    if (Game.shard.name == 'shard3') {
        if (Game.time % 1000 == 0) {
            console.log('发布位面漫步者~');
            creepApi.add(`door` + (new Date).getTime(), 'soldier', {
                targetFlagName: "door",
                keepSpawn: false
            }, "W18S18")
        }
    }

    if (Game.shard.name == 'shard2') {
        for (let creep in Game.creeps) {
            let c = Game.creeps[creep]
            if (c.pos.roomName == Game.flags['door_address1'].pos.roomName) {
                return
            }
            if (c.room.name.slice(0, 3) != "W30") {
                c.moveTo(Game.flags['door_address0'], {reusePath: 20});
            } else {
                c.moveTo(Game.flags['door_address1'], {reusePath: 20});
            }
        }
    }
})
