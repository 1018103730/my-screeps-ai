import mountWork from './mount'
import {doing, stateScanner, generatePixel} from './utils'
import creepNumberListener, {creepApi} from './modules/creepController'
import {ErrorMapper} from './modules/errorMapper'
import {DEFAULT_FLAG_NAME} from "./setting";

import {buildRoad} from "./modules/myTools/buildRoad";
import {dataShow} from "./modules/myTools/dataShow";
import {showProgress} from "./modules/myTools/progress";
import {autoPowerTask} from "./modules/myTools/autoPowerTask";
import {autoEnergy} from "./modules/myTools/autoEnergy";
import {dealPixel} from "./modules/myTools/dealPixel";

export const loop = ErrorMapper.wrapLoop(() => {
    if (Memory.showCost) console.log(`-------------------------- [${Game.time}] -------------------------- `)
    // 挂载拓展
    mountWork()

    // creep 数量控制
    creepNumberListener()

    // 所有建筑、creep、powerCreep 执行工作
    doing(Game.structures, Game.creeps, Game.powerCreeps)

    autoEnergy();

    // 造路机
    buildRoad();

    autoPowerTask();

    //房间数据展示
    dataShow()
    dealPixel()
    // 搓 pixel
    generatePixel()
    // 统计全局资源使用
    stateScanner()
    showProgress();
})
