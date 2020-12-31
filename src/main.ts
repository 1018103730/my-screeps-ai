import mountWork from './mount'
import {doing, stateScanner, generatePixel} from './utils'
import creepNumberListener, {creepApi} from './modules/creepController'
import {ErrorMapper} from './modules/errorMapper'
import {DEFAULT_FLAG_NAME} from "./setting";
import {
    autoPute,
    boostUpgrader,
    buildRoad,
    claimNewRoom, clearRoomRestrictedPos,
    dispatchGarrison, shardClaimer,
    sharder,
    startOp,
    upPrice
} from './modules/myTools'

export const loop = ErrorMapper.wrapLoop(() => {
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
    buildRoad();

    // claimer
    //claimNewRoom("W14S18", "W16S19");

    //驻军
    dispatchGarrison()

    //增强upgrader
    boostUpgrader();

    //清除禁止通行点
    clearRoomRestrictedPos();

    // 自动pute
    autoPute()

    shardClaimer()

    //位面漫步者
    sharder()

    // 搓 pixel
    generatePixel()
})
