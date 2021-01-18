//claimer报告自己位置的间隔时间
let logTime = 10;
//寻找捷径的最大Ops
let maxOps = 5000;
//目标shard
let targetShard = 'shard2';
//目标房间
let targetRoom = 'W36S41';
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
        {pos: new RoomPosition(41, 16, 'W37S42'), range: 0},
    ],
    'shard3': [
        {pos: new RoomPosition(10, 33, 'W20S20'), range: 0},
    ],
}

import {goMyWay} from "./tools";

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
        if (Game.shard.name != targetShard || creep.room.name != targetRoom) {
            goMyWay(creep, searchResult.path[lastOne]);
        } else {
            let result = creep.claimController(creep.room.controller);
            if (result == ERR_NOT_IN_RANGE) {
                goMyWay(creep, searchResult.path[lastOne]);
            }
        }
    }
}
