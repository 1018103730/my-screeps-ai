import {buildBodyFromConfig, goMyWay} from "./tools";

let spawn = "Spawn18";
let spawnTime = 1000;
let logTime = 500;
let bodys = {"move": 1}

export function sharder() {
    let sharders = Object.values(Game.creeps).filter(creep => creep.name.split(' ')[0] == 'sharder')
    //位面漫步者
    if (Game.shard.name == 'shard3') {
        if (Game.time % spawnTime == 0) {
            Game.spawns[spawn].spawnCreep(buildBodyFromConfig(bodys), 'sharder ' + Game.time / spawnTime)
        }
    }

    for (let sharder of sharders) {
        sharder.say(sharder.name);
        if (sharder.ticksToLive % logTime == 0) {
            sharder.log('当前位置:' + sharder.pos)
        }
        if (Game.shard.name == 'shard3') {
            goMyWay(sharder, Game.flags['door']);
        } else {
            goMyWay(sharder, new RoomPosition(25, 25, 'W50S20'));
        }
    }
}
