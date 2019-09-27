declare module NodeJS {
    // 全局对象
    interface Global {
        // 是否已经挂载拓展
        hasExtension: boolean
    }
}

/**
 * Memory 内存拓展
 * @property {array} spawnList 要生成的 creep 队列
 * @property {object} expansionList 扩张计划列表
 */
interface Memory {
    spawnList: string[]
}

/**
 * 建筑拓展
 * 有可能有自定义的 work 方法
 */
interface Structure {
    work?(): void
}

/**
 * Spawn 拓展
 */
interface StructureSpawn {
    addTask(taskName: string): number
}

/**
 * Creep 拓展
 * 来自于 mount.creep.ts
 */
interface Creep {
    work(): void
    updateState(workingMsg?: string, onStateChange?: Function): boolean
    checkEnemy(): boolean
    standBy(): void
    defense(): void
    fillSpawnEngry(backupStorageId?: string): boolean
    fillTower(): boolean
    upgrade(): void
    buildStructure(): boolean
    moveToRoom(roomName: string): boolean
    repairStructure(): boolean
    fillDefenseStructure(expectHits?: number): boolean
    claim(): boolean
    getEngryFrom(target: Structure, getFunc: string, ...args: any[]): void
    transferTo(target: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode
    attackFlag()
    healTo(creeps: Creep[]): void
    isHealth(): boolean
}

/**
 * spawn 内存拓展
 * 
 * @property {string[]} spawnList 生产队列，元素为 creepConfig 的键名
 */
interface SpawnMemory {
    spawnList?: string[]
}

/**
 * creep 内存拓展
 * @property role crep的角色
 * @property working 是否在工作
 * @property hasSendRebirth 是否已经往 spwan 队列中推送了自己的重生任务
 * @property constructionSiteId 建筑工特有 当前缓存的建筑工地
 * @property expectHits 城墙填充特有，标志当前期望的城墙生命值
 */
interface CreepMemory {
    role: string
    working: boolean
    hasSendRebirth: boolean
    constructionSiteId?: string
    expectHits?: number
    squad?: number
}

/**
 * creep 的配置项
 * @property source creep非工作(收集能量时)执行的方法
 * @property target creep工作时执行的方法
 * @property switch 更新状态时触发的方法, 该方法必须位于 Creep 上, 且可以返回 true/false
 * @property spawn 要进行生产的出生点
 */
interface ICreepConfig {
    target: (creep: Creep) => any
    source?: (creep: Creep) => any
    switch?: (creep: Creep) => boolean
    spawn: string
    bodys: BodyPartConstant[]
}

/**
 * creep 的配置项列表
 */
interface ICreepConfigs {
    [creepName: string]: ICreepConfig
}

/**
 * link 配置项
 * @property target link在准备好了的时候执行的方法
 */
interface ILinkConfig {
    target: (link: StructureLink) => any
}

/**
 * link 配置项列表
 */
interface ILinkConfigs {
    [linkId: string]: ILinkConfig
}

/**
 * 从路径名到颜色的映射表
 */
interface IPathMap {
    [propName: string]: string
}

/**
 * 对 Flag 的原型拓展
 * @see file ./src/mount.flag.ts
 */
interface Flag {
    getStructureByFlag(): Structure<StructureConstant>[]
}