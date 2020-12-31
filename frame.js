// 查看当前终端资源
let resources = ['XZHO2', 'XZH2O', "XLHO2", "XKHO2", 'XGHO2', "XGH2O", "energy"];
let titles = ['房间', '终端占用', '仓库占用']
let result = [];
result.push(titles.join("\t") + "\t" + resources.join("\t"))

for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.controller) continue;
    if (!room.controller.my) continue;
    if (!room.terminal) {
        continue
    }
    if (!room.terminal.my) {
        continue
    }
    let roomInfo = [room.name, room.terminal.store.getUsedCapacity(), room.storage.store.getUsedCapacity()];

    let resourceValues = [];
    for (let resource of resources) {
        resourceValues.push(room.terminal.store[resource])
    }
    result.push(roomInfo.join("\t") + "\t" + resourceValues.join("\t"))
}
console.log(result.join("\n"))

// 重置终端自动任务
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.terminal) {
        continue;
    }
    room.memory.terminalTasks = [];

    if (!room.controller) continue
    if (!room.controller.my) continue

    room.terminal.add('H', 1000, 0, 1);
    room.terminal.add('O', 1000, 0, 1);
    room.terminal.add('L', 1000, 0, 1);
    room.terminal.add('K', 1000, 0, 1);
    room.terminal.add('Z', 1000, 0, 1);
    room.terminal.add('U', 1000, 0, 1);
    room.terminal.add('X', 1000, 0, 1);
    room.terminal.add('XGH2O', 10000, 0, 1);

    if (room.controller.level < 8) {
        room.terminal.add('energy', 100000, 0, 1);
        room.terminal.add('energy', 100000, 0, 0);
    } else {
        room.terminal.add('energy', 60000, 0, 1)
    }
}

// 查看creep参数
let room = Game.rooms.W15S18;
let roomInfo = ['Room:' + room.name, "Level:" + room.controller.level, "Ext:" + room.energyAvailable, "Timeout:" + room.memory['boostUpgradeTimeout']];
console.log(roomInfo.join("\t"))
let creeps = room.find(FIND_MY_CREEPS).filter(creep => creep.room.name == room.name)
for (let creep of creeps) {
    let name = creep.name.padEnd(20, " ")
    let ticksToLive = creep.ticksToLive
    let workBodyAmount = 0;
    let carryBodyAmount = 0;
    let isBoost = 'x';

    for (let body of creep.body) {
        switch (body.type) {
            case "carry":
                carryBodyAmount += 50;
                break;
            case "work":
                workBodyAmount++;
                break;
        }
        if (body.boost) {
            isBoost = '√';
        }
    }

    console.log([name, carryBodyAmount, workBodyAmount, ticksToLive, isBoost].join("\t"))
}

// 每个房间的工程数量
let rooms = {};
let builders = {}
for (let r in Game.rooms) {
    rooms[Game.rooms[r].name] = 0;
    builders[Game.rooms[r].name] = 0;
}

for (let c in Game.constructionSites) {
    c = Game.constructionSites[c];

    rooms[c.room.name] += 1;
}

for (let c in Game.creeps) {
    let creep = Game.creeps[c];
    if (creep.memory.role == "builder" || creep.memory.role == "remoteBuilder") {
        builders[creep.room.name]++;
    }
}

for (let room in rooms) {
    if (!rooms[room]) continue;
    console.log(room + '\t' + rooms[room] + '\t' + builders[room])
}

//creep差别
for (let c in Memory.creepConfigs) {
    if (!Memory.creeps[c]) {
        console.log(c)
    }
}

//清除无用房间内存
let rooms = [];
Object.values(Game.rooms).filter(room => room.controller.my).map(room => rooms.push(room.name));
for (let r in Memory.rooms) {
    if (rooms.indexOf(r) < 0) {
        console.log(r);
        delete Memory.rooms[r];
    }
}

//生成补给搬运工
let tasks = [
    {from: 'W15S18', to: 'W14S18'}
];
for (let t of tasks) {
    let fromRoom = Game.rooms[t.from];
    let toRoom = Game.rooms[t.to];
    let flagName = t.from + ' to ' + t.to + ' supply reiver';
    fromRoom.storage.pos.createFlag(flagName);

    fromRoom.spawnReiver(flagName, toRoom.storage.id)
}

// shard2 寻路
let routeKey = '36/7/W19S17 21/14/W17S17';
let posData = routeKey.split(' ');
let fromPos = new RoomPosition(...posData[0].split('/'));
let toPos = new RoomPosition(...posData[1].split('/'));

let result = PathFinder.search(fromPos, toPos, {plainCost: 2, swampCost: 10, maxOps: 100000, maxRooms: 40});
if (result.incomplete) {
    console.log('数据不完整,请增加maxOps')
} else {
    positions = result.path
    wayRoute = positions.map((pos, index) => {
        // 最后一个位置就不用再移动
        if (index >= positions.length - 1) return null
        // 由于房间边缘地块会有重叠，所以这里筛除掉重叠的步骤
        if (pos.roomName != positions[index + 1].roomName) return null
        // 获取到下个位置的方向
        return pos.getDirectionTo(positions[index + 1])
    }).join('')
    global.routeCache[routeKey] = wayRoute
}


//清除房间里不属于自己的建筑
let builds = Game.rooms.W14S18.find(FIND_HOSTILE_STRUCTURES);
for (let b in builds) {
    if (builds[b].structureType == 'controller') continue
    Game.flags['W16S19 to W14S18 soldier'].setPosition(builds[b].pos)
    break
}

let room = Game.rooms.W15S18;
let cs = room.find(FIND_MY_CONSTRUCTION_SITES).filter(c => {
    return c.progress == 0 && [STRUCTURE_ROAD].indexOf(c.structureType) >= 0;
});
console.log('共清理工地:' + cs.length)
for (let c of cs) {
    c.remove();
}