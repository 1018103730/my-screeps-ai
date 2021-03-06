import {creepApi} from "../creepController";

export function dispatchGarrison(shardName, targetRoomName, sourceRoomName) {
    if (Game.shard.name != shardName) return
    if (Game.time % 1000) return

    let flagName = targetRoomName + ' Garrison';
    if (!Game.flags[flagName]) {
        console.log('请在 ' + targetRoomName + ' 房间插上 ' + flagName + ' 旗帜,迎接驻军的到来~');
    }

    creepApi.add(sourceRoomName + ' to ' + targetRoomName + ` Garrison ${Game.time}`, 'soldier', {
        targetFlagName: flagName,
        keepSpawn: false
    }, sourceRoomName);
    console.log(sourceRoomName + ' 发布驻军成功,守卫一方平安~')
}