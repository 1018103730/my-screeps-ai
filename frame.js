// 查看当前终端资源
let resources = ['XZHO2', 'XZH2O', "XLHO2", "XKHO2", 'XGHO2', 'energy', 'power'];
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.terminal) {
        continue
    }
    if (!room.terminal.my) {
        continue
    }
    console.log('-------------' + r + ':' + room.terminal.store.getUsedCapacity() + '|' + room.storage.store.getUsedCapacity() + '---------------')
    for (let resource in room.terminal.store) {
        if (resources.indexOf(resource) < 0) {
            continue
        }
        let resourceValue = room.terminal.store[resource];
        console.log(resource + '\t' + resourceValue)
        // if (resource == 'XKHO2' && r != 'W16S18') {
        //     console.log(room.name + "发送了" + resourceValue + '的' + resource)
        //     room.terminal.send(resource, resourceValue, 'W16S18')
        // }
    }
}

// 重置终端自动任务
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.terminal) {
        continue;
    }
    room.memory.terminalTasks = [];

    room.terminal.add('H', 1000, 0, 1);
    room.terminal.add('O', 1000, 0, 1);
    room.terminal.add('L', 1000, 0, 1);
    room.terminal.add('K', 1000, 0, 1);
    room.terminal.add('Z', 1000, 0, 1);
    room.terminal.add('U', 1000, 0, 1);
    room.terminal.add('X', 1000, 0, 1);

    if (room.controller.level < 8) {
        room.terminal.add('XGH2O', 10000, 0, 1);
        room.terminal.add('energy', 100000, 0, 1);
    } else {
        room.terminal.add('energy', 60000, 0, 1);
    }
}


// 查看creep参数
let room = "W16S17"
let rooms = {};
for (let c in Game.creeps) {
    let creep = Game.creeps[c];
    if (creep.room.name != room) {
        continue;
    }
    if (!rooms[creep.room.name]) {
        rooms[creep.room.name] = []
    }
    let name = creep.name.padEnd(25, ' ');
    let isBoost = 'x';
    for (let b in creep.body) {
        let body = creep.body[b];
        if (body.boost) {
            isBoost = '√'
            break;
        }
    }

    rooms[creep.room.name].push([name, creep.store.getCapacity(), creep.ticksToLive, isBoost])
}

for (let r in rooms) {
    console.log('------------' + r + '-' + Game.rooms[r].controller.level + ':' + Game.rooms[r].energyAvailable + '-' + Game.rooms[r].memory['boostUpgradeTimeout'] + '--------------');
    for (let record of rooms[r]) {
        console.log(record.join('\t'))
    }
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
    if (creep.memory.role == "builder") {
        builders[creep.room.name]++;
    }
}

for (let room in rooms) {
    console.log(room + '\t' + rooms[room] + '\t' + builders[room])
}

//creep差别
for (let c in Memory.creepConfigs) {
    if (!Memory.creeps[c]) {
        console.log(c)
    }
}

//清除无用房间内存
let rooms = Object.keys(Game.rooms)
for (let r in Memory.rooms) {
    if (rooms.indexOf(r) < 0) {
        console.log(r)
        delete Memory.rooms[r]
    }
}

//生成补给搬运工
let tasks = [
    // {from: "W16S19", to: 'W15S18'},
    {from: 'W17S17', to: 'W19S17'}
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
