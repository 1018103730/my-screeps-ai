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

