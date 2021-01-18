import mountWork from './mount'
import {doing, stateScanner, generatePixel} from './utils'
import creepNumberListener, {creepApi} from './modules/creepController'
import {ErrorMapper} from './modules/errorMapper'
import {DEFAULT_FLAG_NAME} from "./setting";
import {
    claimNewRoom,
    dispatchGarrison,
    startOp,
    upPrice
} from './modules/myTools'
import {sharder} from "./modules/myTools/sharder";
import {shardWorker} from "./modules/myTools/shardWorker";
import {autoPute} from "./modules/myTools/autoPute";
import {boostUpgrader} from "./modules/myTools/boostUpgrader";
import {buildRoad} from "./modules/myTools/buildRoad";
import {dataShow} from "./modules/myTools/dataShow";
import {shardClaimer} from "./modules/myTools/shardClaimer";
import {reactor} from "./modules/myTools/reactor";
import {showProgress} from "./modules/myTools/progress";

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

    // 自动pute
    // autoPute()

    shardClaimer()
    shardWorker()

    //位面漫步者
    // sharder()

    //房间数据展示
    dataShow()

    // 搓 pixel
    if (Game.shard.name != 'shard3') {
        generatePixel()
    }

    reactor()
    showProgress();
})
