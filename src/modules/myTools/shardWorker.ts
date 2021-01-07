import {buildBodyFromConfig, goMyWay} from "./tools";

let ways = {
    'shard0': [
        {pos: new RoomPosition(2, 48, 'W30S39'), range: 0},
        {pos: new RoomPosition(3, 48, 'W50S39'), range: 0},
        {pos: new RoomPosition(35, 14, 'W80S40'), range: 0},
        {pos: new RoomPosition(1, 10, 'W69S30'), range: 0},
        {pos: new RoomPosition(18, 22, 'W70S20'), range: 0},
        {pos: new RoomPosition(48, 37, 'W81S20'), range: 0},
        {pos: new RoomPosition(15, 23, 'W80S70'), range: 0},
    ],
    'shard1': [
        {pos: new RoomPosition(24, 36, 'W20S20'), range: 0},
        {pos: new RoomPosition(15, 39, 'W40S20'), range: 0},
        {pos: new RoomPosition(36, 36, 'W40S10'), range: 0},
        {pos: new RoomPosition(26, 6, 'W40S40'), range: 0},
    ],
    'shard2': [
        {pos: new RoomPosition(44, 16, 'W20S20'), range: 0},
        {pos: new RoomPosition(22, 16, 'W36S41'), range: 1},
    ],
    'shard3': [
        {pos: new RoomPosition(10, 33, 'W20S20'), range: 0},
    ],
}

//claimer报告自己位置的间隔时间
let logTime = 100;
//寻找捷径的最大Ops
let maxOps = 5000;
//参与跨shard工作的creeps以及他们的孵化母巢
let creepsConfig = {
    'shard upgrader': 'Spawn18',
    'shard builder': 'Spawn24',
    'shard garrison': 'Spawn31',
};
//目标shard
let targetShard = 'shard2';
//目标房间
let targetRoom = 'W36S41';
//creeps的组件
let bodys = {
    'shard upgrader': {"work": 17, "move": 17, "carry": 16},
    'shard builder': {"work": 17, "move": 17, "carry": 16},
    'shard garrison': {'move': 20, 'attack': 10, 'ranged_attack': 10},
}

export function shardClaimer() {
    let creepName = 'shard claimer';

    if (Game.creeps[creepName]) {
        let creep: Creep = Game.creeps[creepName];
        creep.say('冲鸭~');
        if (creep.ticksToLive % logTime == 0) {
            creep.log('我现在在' + Game.shard.name + '-' + creep.pos + ',我还能活' + creep.ticksToLive, 'green')
        }
        let way = ways[Game.shard.name];
        let searchResult = PathFinder.search(creep.pos, way, {maxOps: maxOps});
        let lastOne = searchResult.path.length - 1;
        let result = creep.claimController(creep.room.controller);
        if (result == ERR_NOT_IN_RANGE) {
            goMyWay(creep, searchResult.path[lastOne]);
        }
    }
}

export function shardWorker() {
    let creeps = Object.keys(creepsConfig);

    // 更新shardWorker们的存活时间,并记录更新时间
    if (Game.shard.name == 'shard2') {
        let data = JSON.parse(InterShardMemory.getLocal() || "{}");
        if (!data.shardSupport) {
            data.shardSupport = {};
        }
        if (!data.shardSupportUpdateTime) {
            data.shardSupportUpdateTime = {};
        }
        for (let creepName of creeps) {
            if (!Game.creeps[creepName]) continue;
            let creep = Game.creeps[creepName];
            data.shardSupport[creepName] = creep.ticksToLive;
            data.shardSupportUpdateTime[creepName] = Game.time;
        }
        data.nowTime = Game.time;
        InterShardMemory.setLocal(JSON.stringify(data));
    }

    if (Game.shard.name == 'shard3') {
        let spawns = creepsConfig;
        let data = JSON.parse(InterShardMemory.getRemote('shard2') || "{}")
        for (let creepName of creeps) {
            if (Game.creeps[creepName]) continue;
            //跨shard等待时间
            if (!Memory['shardWaitTime']) {
                Memory['shardWaitTime'] = 0;
            }
            Memory['shardWaitTime']++;
            if (
                (data.shardSupport[creepName] <= 200) || //woroker tick剩余不足
                ((data.nowTime - data.shardSupportUpdateTime[creepName]) >= 400 && Memory['shardWaitTime'] >= 10) //长时间未更新
            ) {
                let result = Game.spawns[spawns[creepName]].spawnCreep(buildBodyFromConfig(bodys[creepName]), creepName);

                if (result == OK) {
                    console.log('发布位面支援者' + creepName)
                    Memory['shardWaitTime'] = 0
                } else {
                    console.log(creepName + '出问题了' + result)
                }
            }
        }
    }

    // 行为
    for (let creepName of creeps) {
        if (!Game.creeps[creepName]) continue;
        let creep = Game.creeps[creepName];
        if (creep.spawning) continue;

        if (creepName == 'shard upgrader') {
            let needBoost = true;
            for (let b in creep.body) {
                let body = creep.body[b];
                if (body.boost) {
                    needBoost = false;
                    break;
                }
            }
            if (needBoost) {
                let labId = creep.room.memory['boostUpgradeLabId'];
                let lab: StructureLab = Game.getObjectById(labId);
                if (lab.store['XGH2O'] >= 100) {
                    creep.goTo(lab.pos)
                    lab.boostCreep(creep)
                    continue;
                }
            }
        }

        if (creep.room.name != targetRoom || Game.shard.name != targetShard) {
            let way = ways[Game.shard.name];
            let searchResult = PathFinder.search(creep.pos, way, {maxOps: 5000});
            let lastOne = searchResult.path.length - 1;
            goMyWay(creep, searchResult.path[lastOne])
            if (creep.ticksToLive % logTime == 0) {
                creep.log('当前位置:\t' + creep.pos + '\t当前tick\t' + creep.ticksToLive)
            }
            creep.say('前往目标房间~')
        } else {
            if (creep.memory['building'] && creep.store.getUsedCapacity() == 0) {
                creep.memory['building'] = false;
                creep.say('🔄 harvest');
            }
            if (!creep.memory['building'] && creep.store.getFreeCapacity() == 0) {
                creep.memory['building'] = true;
                creep.say('🚧 working');
            }

            creep.say('working');
            let containers = creep.room.find(FIND_STRUCTURES, {
                filter: object => {
                    return object.structureType == 'container'
                }
            })

            let sources = creep.room.find(FIND_SOURCES);

            if (creepName == 'shard upgrader') {
                let shardUpgraderEnergyIndex = 1;
                if (creep.memory['building']) {
                    let target = creep.room.controller;
                    if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                        creep.goTo(target.pos);
                    }
                } else {
                    if (containers.length) {
                        if (creep.withdraw(containers[shardUpgraderEnergyIndex], 'energy') == ERR_NOT_IN_RANGE) {
                            creep.goTo(containers[shardUpgraderEnergyIndex].pos);
                        }
                    } else {
                        if (creep.harvest(sources[shardUpgraderEnergyIndex]) == ERR_NOT_IN_RANGE) {
                            creep.goTo(sources[shardUpgraderEnergyIndex].pos);
                        }
                    }
                }
            }

            if (creepName == 'shard builder') {
                let shardBuilderEnergyIndex = 0;
                if (creep.memory['building']) {
                    let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if (targets.length) {
                        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.goTo(targets[0].pos);
                        }
                    } else {
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.goTo(creep.room.controller.pos);
                        }
                    }
                } else {
                    if (containers.length) {
                        if (creep.withdraw(containers[shardBuilderEnergyIndex], 'energy') == ERR_NOT_IN_RANGE) {
                            creep.goTo(containers[shardBuilderEnergyIndex].pos);
                        }
                    } else {
                        if (creep.harvest(sources[shardBuilderEnergyIndex]) == ERR_NOT_IN_RANGE) {
                            creep.goTo(sources[shardBuilderEnergyIndex].pos);
                        }
                    }
                }
            }
        }
    }
}

