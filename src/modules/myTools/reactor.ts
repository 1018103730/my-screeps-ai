//帮助反应的房间
import {buildBodyFromConfig, ignoreRange, maintainStatus, selectSpawn} from "./tools";
import {creepApi} from "../creepController";

const helpRooms = ['W16S18', 'W15S18', 'W16S19'];
//目标房间
const targetRoomName = 'W15S19';
//外部能量来源
const externalEnergySourceRoom = 'W16S19';
//生成upgrader间隔
let spawnIntervalTicks = 150;
//upgrader配置
const upgraderBodyConfigWithoutEnergy = {
    'work': 20, 'carry': 20, 'move': 10
}
const upgraderBodyConfigWithEnergy = {
    'work': 20, 'carry': 20, 'move': 10
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
    if (Game.time % spawnIntervalTicks) return;

    let num = Math.ceil(1500 / spawnIntervalTicks);
    for (let i = 0; i < num; i++) {
        let creepName = 'catalyze ' + roomName + ' ' + i;
        if (!(creepName in Memory.creeps)) {
            let room = Game.rooms[roomName];
            let spawn = selectSpawn(room);
            if (spawn) {
                console.log('生成 ' + creepName)
                spawn.spawnCreep(bodys, creepName)
            }
            break;
        }
    }
}

//获取能量
function getEnergy(creep: Creep, targetRoom: Room) {
    if (creep.ticksToLive <= 20) return;
    let energySource = null
    if (targetRoom.terminal && targetRoom.terminal.store['energy'] > 0) {
        energySource = targetRoom.terminal;
    } else if (targetRoom.storage && targetRoom.storage.store['energy'] > 0 && creep.room.name == targetRoom.name) {
        energySource = targetRoom.storage;
    } else {
        let sourceRoom = Game.rooms[externalEnergySourceRoom];
        if (sourceRoom.terminal.store['energy'] > 0) {
            energySource = sourceRoom.terminal;
        } else {
            energySource = sourceRoom.storage;
        }
    }

    if (creep.withdraw(energySource, 'energy') == ERR_NOT_IN_RANGE) {
        creep.moveTo(energySource.pos, {visualizePathStyle: {stroke: '#ffffff'}})
    }
}

// reclaimer
function reClaimer(targetRoomName) {
    let targetRoom = Game.rooms[targetRoomName];
    let claimCreepName = `${targetRoomName} Claimer`;
    if (targetRoom.controller && targetRoom.controller.my) {
        if ((targetRoom.controller.level >= 8) && !creepApi.has(claimCreepName)) {
            creepApi.add(claimCreepName, 'claimer', {
                targetRoomName,
                spawnRoom: targetRoomName,
                signText: "Luerdog的反应堆~" + (new Date).toString().split(" GMT")[0]
            }, targetRoomName);
        }

        let claimCreep = Game.creeps[claimCreepName];
        if (claimCreep && claimCreep.ticksToLive <= 600) {
            targetRoom.controller.unclaim()
        }
    }

}

//terminal不可用时,添加搬运工
function hamal(targetRoom) {
    let hamalNum = 6;
    let task = {'from': 'W16S19', 'to': 'W15S19'};
    let fromRoom = Game.rooms[task.from];
    let toRoom = Game.rooms[task.to];
    if (!targetRoom.terminal.isActive() && targetRoom.storage.isActive() && targetRoom.storage.store['energy'] < 800000) {
        let flagName = task.from + ' to ' + task.to + ' hamal';
        fromRoom.storage.pos.createFlag(flagName);

        for (let num = 1; num <= hamalNum; num++) {
            let hamalName = 'hamal ' + num;
            if (creepApi.has(hamalName)) continue
            creepApi.add(hamalName, 'reiver', {
                flagName: flagName,
                targetId: toRoom.storage.id
            }, fromRoom.name);
        }
    }
    if (targetRoom.terminal.isActive()) {
        for (let num = 1; num <= hamalNum; num++) {
            let hamalName = 'hamal ' + num;
            if (!creepApi.has(hamalName)) continue
            creepApi.remove('hamal ' + num);
            let creep = Game.creeps[hamalName];
            if (creep.store.getUsedCapacity() == 0) {
                creep.suicide()
            }
        }
    }
}

//得到需要维修的道路
function getNeedRepairRoad(targetRoom: Room, rate = 60) {
    let needRepairRoad = null;
    const terrain = new Room.Terrain(targetRoomName);
    let roads = targetRoom.find(FIND_STRUCTURES, {
        filter: object => {
            let isRoad = object.structureType == "road";
            let attritionRateNotEnough = (object.hits / object.hitsMax * 100 <= rate);
            let notPlain = terrain.get(object.pos.x, object.pos.y) != 0;

            return isRoad && attritionRateNotEnough && notPlain;
        }
    }).sort((a, b) => {
        return a.hits - b.hits;
    });
    if (roads.length > 0) {
        needRepairRoad = roads[0]
    }
    return needRepairRoad;
}

//由tower负责维护沼泽和墙上的道路
function repairRoad(targetRoom: Room) {
    let towers = targetRoom.find<StructureTower>(FIND_STRUCTURES, {
        filter: object => {
            return object.structureType == 'tower' && object.isActive()
        }
    });
    let hostileCreep = targetRoom.find(FIND_HOSTILE_CREEPS);
    let needRepairRoad = getNeedRepairRoad(targetRoom, 65);
    if (hostileCreep.length == 0 && needRepairRoad) {
        for (let tower of towers) {
            tower.repair(needRepairRoad);
        }
    }

    let filler = targetRoom.name + ' tower filler';
    if (!creepApi.has(filler)) {
        creepApi.add(filler, 'manager', {
            sourceId: targetRoom.storage.id
        }, targetRoom.name)
    }
    let towerEnergyNotEnough = towers.sort((a, b) => {
        return a.store['energy'] - b.store['energy'];
    })
    let fillCreep = Game.creeps[filler];
    if (fillCreep && towerEnergyNotEnough.length > 0) {
        Game.creeps[filler].memory.fillStructureId = towerEnergyNotEnough[0].id;
    }
}

//给控制器的可upgrade范围添加道路工地
function setConstructionSiteForController(targetRoom: Room) {
    if (Game.time % 1000 == 0) {
        let posArray = [];
        posArray = posArray.concat(ignoreRange(targetRoom.controller.pos, 1))
        posArray = posArray.concat(ignoreRange(targetRoom.controller.pos, 2))
        posArray = posArray.concat(ignoreRange(targetRoom.controller.pos, 3))
        for (let pos of posArray) {
            (new RoomPosition(pos[0], pos[1], targetRoomName)).createConstructionSite('road')
        }
    }
}

//反应堆房间自动填充storage
function fillStorage(targetRoom: Room) {
    if (!targetRoom.terminal || !targetRoom.terminal.isActive()) return;
    if (!targetRoom.storage || !targetRoom.storage.isActive()) return;
    if (targetRoom.storage.store.getFreeCapacity() == 0) return;
    let amount = Math.min(targetRoom.storage.store.getFreeCapacity(), targetRoom.terminal.store['energy']);
    targetRoom.addCenterTask({
        submit: 7,
        target: STRUCTURE_STORAGE,
        source: STRUCTURE_TERMINAL,
        resourceType: RESOURCE_ENERGY,
        amount
    });
}

function fillSourceRoomStorage() {
    if (Game.time % 100) return
    for (let r of helpRooms) {
        let room = Game.rooms[r];
        if (room.storage.store['energy'] > 300000) {
            continue;
        }
        let amount = Math.min(room.storage.store.getFreeCapacity(), room.terminal.store['energy']);
        room.addCenterTask({
            submit: 10,
            target: STRUCTURE_STORAGE,
            source: STRUCTURE_TERMINAL,
            resourceType: RESOURCE_ENERGY,
            amount
        })
    }
}

export function reactor() {
    if (Game.shard.name != "shard3") return;
    if (Game.cpu.bucket <= 100) return;
    fillSourceRoomStorage()
    reClaimer(targetRoomName);

    const targetRoom = Game.rooms[targetRoomName];
    // if (Game.time % 50 == 0) {
    //     targetRoom.memory.restrictedPos = {}
    // }
    if (!targetRoom.controller || !targetRoom.controller.my) return
    hamal(targetRoom);
    fillStorage(targetRoom);

    setConstructionSiteForController(targetRoom)

    //维护道路
    let needRepairRoad = getNeedRepairRoad(targetRoom);
    repairRoad(targetRoom);

    //生成催化者
    const bodys = buildUpgraderBodys(targetRoom);
    for (const roomName of helpRooms) {
        spawnUpgrader(roomName, bodys)
    }

    let catalyzers: Array<Creep> = Object.values(Game.creeps).filter(creep => {
        return creep.name.split(' ')[0] == 'catalyze';
    });
    let creepIndex = 0;
    for (let creep of catalyzers) {
        //boost
        let needBoost = true;
        for (let b in creep.body) {
            let body = creep.body[b];
            if (body.boost) {
                needBoost = false;
                break;
            }
        }
        //目标房间能量不足
        if (!targetRoom.storage || targetRoom.storage.store['energy'] <= 100000) {
            needBoost = false;
        }
        if (needBoost && creep.room.memory['boostUpgradeLabId']) {
            let labId = creep.room.memory['boostUpgradeLabId'];
            let lab: StructureLab = Game.getObjectById(labId);
            if (!lab) {
                console.log(creep.room.name + '未找到Boost Lab ,请设置');
                continue;
            }
            if (
                lab &&
                (
                    lab.store['XGH2O'] >= 30 ||
                    lab.store['GH'] >= 30 ||
                    lab.store['GH2O'] >= 30
                ) &&
                lab.store['energy'] > 0
            ) {
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
                        object.structureType == 'road' ||
                        object.structureType == 'tower'
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

                let destination = targetRoom.controller.pos;
                let creepData = creep.name.split(' ');
                let num = parseInt(creepData[2]);
                let range = null;
                if (num <= 1) {
                    range = 1;
                } else if (num <= 6) {
                    range = 2;
                } else {
                    range = 3;
                    destination = new RoomPosition(19, 9, targetRoomName)
                }
                if (!creep.pos.inRangeTo(destination, range)) {
                    creep.goTo(destination)
                } else {
                    creep.room.addRestrictedPos(creep.name, creep.pos)
                }
            }
        } else {
            creep.room.removeRestrictedPos(creep.name);
            getEnergy(creep, targetRoom)
        }
        creepIndex++;
    }
}