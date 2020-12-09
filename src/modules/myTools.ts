import {creepApi} from "./creepController";

export function claimNewRoom(roomName, claimRoomName) {
    if (Game.time % 50) return

    if (!Memory.creeps[roomName + ' Claimer']) {
        console.log('发布Claimer占领' + roomName)
        Game.rooms[claimRoomName].claimRoom(roomName)
    }
}

export function sharder() {
    //位面漫步者
    if (Game.shard.name == 'shard3') {
        if (Game.time % 1000 == 0) {
            console.log((new Date).getTime() + '号位面漫步者正在生成~');
            creepApi.add(`door` + (new Date).getTime(), 'soldier', {
                targetFlagName: "door",
                keepSpawn: false
            }, "W18S18")
        }
        if (Memory['showCpuUsed']) {
            console.log(Game.cpu.getUsed())
        }
    }

    if (Game.shard.name == 'shard2') {
        let reusePath = Memory['reusePath'] ?? 500;
        for (let creep in Game.creeps) {
            let c = Game.creeps[creep]
            if (c.pos.roomName == Game.flags['door_address1'].pos.roomName) {
                continue
            }
            // c.moveByPath(Memory['path'])
            if (c.room.name.slice(0, 3) != "W30") {
                c.moveTo(Game.flags['door_address0'], {
                    reusePath: reusePath, visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .1
                    }
                });
            } else {
                c.moveTo(Game.flags['door_address1'], {
                    reusePath: reusePath, visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .1
                    }
                });
            }
        }
        if (Memory['showCpuUsed']) {
            console.log(Game.cpu.getUsed())
        }
    }
}

export function buildUpdaterRoad() {
    if (Object.keys(Game.constructionSites).length >= 100 || !(Memory['buildUpdaterRoad'])) return
    for (let c in Game.creeps) {
        let creep = Game.creeps[c];
        if (creep.pos.x == 0 || creep.pos.y == 0) continue
        let creepRole = Memory.creeps[creep.name]['role'];
        if (
            (creepRole == "upgrader" && creep.room.controller && creep.room.controller.level >= 5)
            || (creep.room.controller && creep.room.controller.level == 8)
        ) {
            let ls = creep.pos.lookFor(LOOK_STRUCTURES);
            if (
                creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).length == 0 //不存在施工点
                && (
                    (ls.length == 0)//不存在建筑
                    || (ls.length == 1 && ls[0].structureType == 'rampart') // 存在墙
                )
            ) {
                console.log(creep.name + " 在 " + creep.pos + ' 新建道路~')
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

        let roomName = Memory.creepConfigs[c].spawnRoom
        let flagName = roomName + ' to ' + targetRoomName + ' garrison';
        if (!Game.flags[flagName]) {
            console.log('请在 ' + targetRoomName + ' 房间插上 ' + flagName + ' 旗帜,迎接驻军的到来!');
        }

        creepApi.add(targetRoomName + ` Garrison ${Game.time}`, 'soldier', {
            targetFlagName: flagName,
            keepSpawn: false
        }, roomName);
        console.log('发布驻军成功,守卫一方平安~')
    }
}

//加速power合成
export function startOp() {
    if (Game.time % 20) return
    let rooms = ['W16S18', 'W16S19'];
    for (let room of rooms) {
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