//帮助反应的房间
import {buildBodyFromConfig, ignoreRange, selectSpawn} from "./tools";

const helpRooms = ['W16S18', 'W15S18', 'W16S19'];
//目标房间
const targetRoomName = 'W15S19';
//外部能量来源
const externalEnergySourceRoom = 'W16S19';
//生成upgrader间隔
const spawnIntervalTicks = 250;
//upgrader配置
const upgraderBodyConfigWithoutEnergy = {
    'work': 20, 'carry': 20, 'move': 10
}
const upgraderBodyConfigWithEnergy = {
    'work': 30, 'carry': 10, 'move': 10
}

//生成身体部件
function buildUpgraderBodys(targetRoom) {
    if (
        (targetRoom.storage && targetRoom.storage.store['energy'] > 100000) ||
        (targetRoom.terminal && targetRoom.terminal.store['energy'] > 100000)
    ) {
        return buildBodyFromConfig(upgraderBodyConfigWithEnergy);
    }

    return buildBodyFromConfig(upgraderBodyConfigWithoutEnergy);
}

//孵化creep
function spawnUpgrader(roomName, bodys) {
    if (Game.time % spawnIntervalTicks == 0) {
        let creepName = 'catalyze ' + roomName + ' ' + Game.time;
        let room = Game.rooms[roomName];
        let spawn = selectSpawn(room);
        if (spawn) {
            console.log('生成 ' + creepName)
            spawn.spawnCreep(bodys, creepName)
        }
    }
}

//获取能量
function getEnergy(creep: Creep, targetRoom: Room) {
    if (creep.ticksToLive <= 20) return;
    let energySource = null
    if (targetRoom.terminal && targetRoom.terminal.store['energy'] > 0) {
        energySource = targetRoom.terminal;
    } else if (targetRoom.storage && targetRoom.storage.store['energy'] > 0) {
        energySource = targetRoom.storage;
    } else {
        energySource = Game.rooms[externalEnergySourceRoom].terminal;
    }
    if (creep.withdraw(energySource, 'energy') == ERR_NOT_IN_RANGE) {
        creep.moveTo(energySource.pos, {visualizePathStyle: {stroke: '#ffffff'}})
    }
}

function maintainStatus(creep: Creep) {
    if (creep.memory['building'] && creep.store.getUsedCapacity() == 0) {
        creep.memory['building'] = false;
        creep.say('🔄 harvest');
    }
    if (!creep.memory['building'] && creep.store.getFreeCapacity() == 0) {
        creep.memory['building'] = true;
        creep.say('🚧 working');
    }
}

export function reactor() {
    if (Game.shard.name != "shard3") return

    const targetRoom = Game.rooms[targetRoomName];
    if (Game.time % 50 == 0) {
        targetRoom.memory.restrictedPos = {}
    }

    //建立控制器范围道路工地
    if (Game.time % 1000 == 0) {
        let posArray = [];
        posArray = posArray.concat(ignoreRange(targetRoom.controller.pos, 1))
        posArray = posArray.concat(ignoreRange(targetRoom.controller.pos, 2))
        posArray = posArray.concat(ignoreRange(targetRoom.controller.pos, 3))
        for (let pos of posArray) {
            (new RoomPosition(pos[0], pos[1], targetRoomName)).createConstructionSite('road')
        }
    }

    //定时维护墙上的道路
    let needRepairRoad = null;
    const terrain = new Room.Terrain(targetRoomName);
    let roads = targetRoom.find(FIND_STRUCTURES, {filter: object => object.structureType == "road"})
    for (let r in roads) {
        let road = roads[r];
        if (terrain.get(road.pos.x, road.pos.y) != 0) {
            let attrition_rate = road.hits / road.hitsMax * 100
            if (attrition_rate <= 60) {
                needRepairRoad = road;
                continue;
            }
        }
    }

    const bodys = buildUpgraderBodys(targetRoom);

    //生成催化者
    for (const roomName of helpRooms) {
        spawnUpgrader(roomName, bodys)
    }

    let catalyzers: Array<Creep> = Object.values(Game.creeps).filter(creep => {
        return creep.name.split(' ')[0] == 'catalyze';
    });
    let creepIndex = 0;
    for (let creep of catalyzers) {
        let needBoost = true;
        for (let b in creep.body) {
            let body = creep.body[b];
            if (body.boost) {
                needBoost = false;
                break;
            }
        }
        if (needBoost && creep.room.memory['boostUpgradeLabId']) {
            let labId = creep.room.memory['boostUpgradeLabId'];
            let lab: StructureLab = Game.getObjectById(labId);
            if (!lab) {
                console.log(creep.room.name + '未找到Boost Lab ,请设置');
                continue;
            }
            if (lab && (lab.store['XGH2O'] >= 100 || lab.store['GH'] >= 100 || lab.store['GH2O'] >= 100)) {
                creep.goTo(lab.pos)
                lab.boostCreep(creep)
                continue;
            }
        }

        maintainStatus(creep)

        if (creep.memory['building']) {
            let energySourceCs = Game.rooms[targetRoomName].find(FIND_CONSTRUCTION_SITES, {
                filter: object => {
                    return object.structureType == 'storage' ||
                        object.structureType == 'terminal' ||
                        object.structureType == 'road'
                }
            })
            if (energySourceCs.length > 0 && creepIndex < 3) {
                let result = creep.build(energySourceCs[0]);
                creep.moveTo(energySourceCs[0].pos)
            } else if (needRepairRoad) {
                creep.repair(needRepairRoad)
                creep.moveTo(needRepairRoad.pos)
            } else {
                let controller = targetRoom.controller;
                let result = creep.upgradeController(controller);
                // creep.room.addRestrictedPos(creep.name, creep.pos)
                creep.goTo(new RoomPosition(20, 10, 'W15S19'))
            }
        } else {
            getEnergy(creep, targetRoom)
        }
        creepIndex++;
    }
}