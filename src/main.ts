import mountWork from './mount'
import {doing, stateScanner, generatePixel} from './utils'
import creepNumberListener, {creepApi} from './modules/creepController'
import {ErrorMapper} from './modules/errorMapper'
import {DEFAULT_FLAG_NAME} from "./setting";
import {
    attactPosChechk,
    buildUpdaterRoad,
    claimNewRoom,
    dispatchGarrison,
    sharder,
    startOp,
    upPrice
} from './modules/myTools'

export const loop = ErrorMapper.wrapLoop(() => {
    if (Game.shard.name == 'shard3') {
        if (Memory.showCost) console.log(`-------------------------- [${Game.time}] -------------------------- `)
        // 挂载拓展
        mountWork()

        // creep 数量控制
        creepNumberListener()

        // 所有建筑、creep、powerCreep 执行工作
        doing(Game.structures, Game.creeps, Game.powerCreeps)

        // 统计全局资源使用
        stateScanner()

        // 造路机
        buildUpdaterRoad();

        // claimer
        // claimNewRoom("W17S16", "W17S17");

        //驻军
        dispatchGarrison()

        //增强power能力
        // startOp()

        //自动抬价
        // upPrice("5fd02fb409cc071d9eb725ba",880) //收pixel

        attactPosChechk();
    }

    //位面漫步者
    sharder()

    // 搓 pixel
    generatePixel()
})
