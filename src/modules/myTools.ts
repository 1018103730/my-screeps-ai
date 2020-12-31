import {creepApi} from "./creepController";
import {unwatchFile} from "fs";
import {DEFAULT_FLAG_NAME, ROOM_TRANSFER_TASK} from "../setting";

export function claimNewRoom(roomName, claimRoomName) {
    if (Game.time % 500) return
    // if (Game.rooms[roomName] && Game.rooms[roomName].controller.my) return; //房间已经占领的情况下直接取消操作

    if (!Memory.creeps[roomName + ' Claimer']) {
        // if (!Game.rooms[roomName]) return; //房间里没有抗塔的 就取消操作
        // if (Game.rooms[roomName].controller.upgradeBlocked > 550) return; //距离下次claim还有会儿  就取消操作
        console.log('发布Claimer占领' + roomName)
        Game.rooms[claimRoomName].claimRoom(roomName, '星星之火可以燎原~')
    }
}

export function sharder() {
    //位面漫步者
    if (Game.shard.name == 'shard3') {
        if (Game.time % 1000 == 0) {
            console.log(Game.time / 1000 + '号位面漫步者正在生成~');
            creepApi.add(`door` + Game.time, 'soldier', {
                targetFlagName: "door",
                keepSpawn: false
            }, "W16S19")
        }
        if (Memory['showCpuUsed']) {
            console.log(Game.cpu.getUsed())
        }
    }

    if (Game.shard.name == 'shard2') {
        if (Game.time % 1500 == 0) {
            Memory.creeps = {}
        }

        let reusePath = Memory['reusePath'] ?? 500;
        for (let creep in Game.creeps) {
            let c = Game.creeps[creep]
            if (c.name == 'shard claimer') {
                continue
            }
            if (c.pos.roomName == Game.flags['door_address1'].pos.roomName) {
                continue
            }
            if (c.room.name.slice(0, 3) != "W30") {
                c.moveTo(Game.flags['door_address0'], {reusePath: reusePath, maxOps: 1000});
            } else {
                c.moveTo(Game.flags['door_address1'], {reusePath: reusePath, maxOps: 1000});
            }
        }
    }
}

//修路
export function buildRoad() {
    if (Object.keys(Game.constructionSites).length >= 100 || !(Memory['buildRoad'])) return
    for (let c in Game.creeps) {
        let creep = Game.creeps[c];
        //不负重不修路
        if (creep.store.getUsedCapacity() <= 0) continue
        if (creep.pos.x == 0 || creep.pos.y == 0) continue
        if (!creep.room.controller) continue
        if (!creep.room.controller.my) continue

        let creepRole = Memory.creeps[creep.name]['role'];
        // 不需要造路的角色
        const filterRole = ['builder', 'miner', 'collector', 'soldier'];

        if (filterRole.indexOf(creepRole) < 0) {
            let ls = creep.pos.lookFor(LOOK_STRUCTURES);
            let lcs = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (
                (lcs.length == 0) //不存在施工点
                && (
                    (ls.length == 0)//不存在建筑
                    || (ls.length == 1 && ls[0].structureType == 'rampart') // 存在墙
                )
            ) {
                // console.log(creep.name + " 在 " + creep.pos + ' 新建道路~')
                creep.pos.createConstructionSite(STRUCTURE_ROAD)
            }
        }
    }
}

// 派遣驻军
export function dispatchGarrison() {
    if (Game.time % 1000) return
    for (let c in Memory.creeps) {
        if (Memory.creeps[c].role != "remoteBuilder") continue;
        let targetRoomName = Memory.creeps[c].data['targetRoomName'];
        if (c != targetRoomName + ' RemoteBuilder') continue;
        if (targetRoomName == 'W19S17') continue;

        let roomName = Memory.creepConfigs[c].spawnRoom
        let flagName = roomName + ' to ' + targetRoomName + ' garrison';
        if (!Game.flags[flagName]) {
            console.log('请在 ' + targetRoomName + ' 房间插上 ' + flagName + ' 旗帜,迎接驻军的到来!');
        }

        creepApi.add(targetRoomName + ` Garrison ${Game.time}`, 'soldier', {
            targetFlagName: flagName,
            keepSpawn: false
        }, roomName);
        console.log(c + ' 发布驻军成功,守卫一方平安~')
    }
}

//加速power合成
export function startOp() {
    if (Game.time % 20) return
    let rooms = ['W16S18', 'W16S19'];
    for (let room of rooms) {
        if (Game.rooms[room].terminal.store['power'] <= 500) continue
        let psId = Game.rooms[room].memory.powerSpawnId
        let ps = Game.getObjectById(psId);
        if (ps['effects'].length == 0 || (ps['effects'][0].ticksRemaining <= 20)) {
            console.log(room + "power 加速开启~");
            Game.rooms[room].addPowerTask(PWR_OPERATE_POWER)
        }
    }
}

//自动抬价
export function upPrice(orderId, maxPrice = 10, step = 1) {
    if (Game.time % 10) return

    let myOrderData = Game.market.getOrderById(orderId);
    let myPrice = myOrderData.price;
    let resourceType = myOrderData.resourceType;
    let orderType = myOrderData.type;

    //获取当前市场上所有同类型订单
    let allOrders = Game.market.getAllOrders({type: orderType, resourceType: resourceType});
    let prices = [];
    for (let o in allOrders) {
        let order = allOrders[o];
        if (order.id == orderId) continue

        prices.push(order.price);
    }

    let maxOrderPrice = prices.sort().reverse()[0];
    if (maxOrderPrice >= maxPrice) return //如果价格超出了设置的阀值 就不加价了
    if (maxOrderPrice <= myPrice) return //如果其他人的最高价也没我的价格高 就不加价了
    let newPrice = maxOrderPrice + step
    if (newPrice >= maxPrice) return //如果新的价格超过了阀值 就不加价了

    //价格被人超过了且在合理范围内, 就抬价
    Game.market.changeOrderPrice(orderId, newPrice)
}

export function boostUpgrader() {
    let canBoostUpgradeRoom = Object.values(Game.rooms).map(room => {
        let labId = room.memory['boostUpgradeLabId'];
        //减少冷却时间
        if (labId) {
            //初始化冷缺时间
            if (!room.memory['boostUpgradeTimeout']) {
                room.memory['boostUpgradeTimeout'] = 0;
            }
            room.memory['boostUpgradeTimeout']--;
            if (room.memory['boostUpgradeTimeout'] < 0) {
                room.memory['boostUpgradeTimeout'] = 0;
            }

            //定时发布任务
            if (Game.time % 50 == 0) {
                room.addRoomTransferTask({
                    type: "labIn",
                    resource: [
                        {id: labId, type: 'energy', amount: 900},
                        {id: labId, type: 'XGH2O', amount: 900},
                    ]
                })
            }
        }

        return room;
    }).filter(room => {
        if (room['boostUpgradeTimeout'] > 0) return false;
        let labId = room.memory['boostUpgradeLabId'];
        if (!labId) return false;
        let lab: StructureLab = Game.getObjectById(labId);

        if ((lab.store['energy'] <= 500) || (lab.store['XGH2O'] <= 500)) return false;

        return true;
    }).map(room => room.name)

    let rooms = {};

    Object.values(Game.creeps).filter((creep) => {
        // 必须是upgrader
        let isUpgrader;
        if (!creep.room.controller) {
            isUpgrader = false;
        } else {
            if (creep.room.controller.level < 8) {
                isUpgrader = creep.memory.role == "upgrader" || creep.memory.role == "remoteUpgrader";
            } else {
                isUpgrader = creep.memory.role == "remoteUpgrader";
            }
        }

        // 必须在开启了boostUpgrade的房间里
        let inRoom = canBoostUpgradeRoom.indexOf(creep.room.name) >= 0;

        // 寿命悠长
        let liveLong = creep.ticksToLive > 1000;

        // 未曾boost过
        let needBoost = true;
        for (let b in creep.body) {
            let body = creep.body[b];
            if (body.boost) {
                needBoost = false;
                break;
            }
        }

        return isUpgrader && needBoost && inRoom && liveLong;
    }).sort((creep1, creep2) => {
        if (creep1.ticksToLive <= creep2.ticksToLive) {
            return 1;
        } else {
            return -1;
        }
    }).forEach(creep => {
        let room = creep.room;
        //只给每个房间的第一个boost
        if (!rooms[room.name]) {
            rooms[room.name] = creep.name;
            //这个勇士去boost
            let labId = creep.room.memory['boostUpgradeLabId'];
            let lab: StructureLab = Game.getObjectById(labId);
            creep.goTo(lab.pos)
            let result = lab.boostCreep(creep)
            if (result == OK) {
                console.log(creep.name + ' boostupgrade 强化成功');
                //添加冷却时间
                room.memory['boostUpgradeTimeout'] = 50;
            }
        }
    })
}

export function clearRoomRestrictedPos() {
    // if (Game.time % 100) return;
    //
    // for (let r in Memory.rooms) {
    //     Memory.rooms[r].restrictedPos = {};
    // }
}

export function autoPute() {
    if (Game.time % 100) return

    for (let r in Game.rooms) {
        let room = Game.rooms[r];
        if (!room.controller) continue
        let storageEnergyThreshold = 1100000 - room.controller.level * 100000;
        // 兜底
        if (room.storage.store['energy'] <= storageEnergyThreshold) continue
        // 为零取消
        let minPutEnergy: number = Math.min(room.terminal.store.getFreeCapacity(), room.storage.store['energy'] - storageEnergyThreshold);
        if (!minPutEnergy) continue

        room.addCenterTask({
            submit: room.memory.centerTransferTasks.length,
            target: STRUCTURE_TERMINAL,
            source: STRUCTURE_STORAGE,
            resourceType: RESOURCE_ENERGY,
            amount: minPutEnergy
        })
    }
}

export function shardClaimer() {
    let creepName = 'shard claimer';
    let targetRoom = 'W21S28'
    let controllerPos = new RoomPosition(16, 39, targetRoom)

    if (Game.creeps[creepName]) {
        if (Game.shard.name == 'shard3') {
            Game.creeps[creepName].moveTo(Game.flags['door'])
        } else if (Game.shard.name == 'shard2') {
            Game.creeps[creepName].moveTo(controllerPos, {maxOps: 100000})
            if (Game.rooms[targetRoom]) {
                Game.creeps[creepName].claimController(Game.rooms[targetRoom].controller)
            }
        }
    }
}