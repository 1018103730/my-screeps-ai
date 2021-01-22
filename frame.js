// 查看当前终端资源
let resources = ["G", "GH", "GH2O", "XGH2O", "energy", "metal", "tube", "fixtures", "frame", "hydraulics"];
let titles = ['房间', '等级', '终端占用', '仓库占用']
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
    let roomInfo = [room.name, room.controller.level, room.terminal.store.getUsedCapacity(), room.storage.store.getUsedCapacity()];

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

    if (!room.controller) continue
    if (!room.controller.my) continue

    room.terminal.add('H', 1000, 0, 2);
    room.terminal.add('O', 1000, 0, 2);
    room.terminal.add('L', 1000, 0, 2);
    room.terminal.add('K', 1000, 0, 2);
    room.terminal.add('Z', 1000, 0, 2);
    room.terminal.add('U', 1000, 0, 2);
    room.terminal.add('X', 1000, 0, 2);
    room.terminal.add('H', 1000, 0, 2);
    room.terminal.add('O', 1000, 0, 1);
    room.terminal.add('L', 1000, 0, 1);
    room.terminal.add('K', 1000, 0, 1);
    room.terminal.add('Z', 1000, 0, 1);
    room.terminal.add('U', 1000, 0, 1);
    room.terminal.add('X', 1000, 0, 1);

    if (room.controller.level < 8) {
        room.terminal.add('energy', 100000, 0, 1);
        room.terminal.add('energy', 100000, 0, 0);
    } else {
        room.terminal.add('energy', 60000, 0, 1)
    }
}

// 查看creep参数
let room = Game.rooms.W36S41;
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

    console.log([name.padEnd(30), carryBodyAmount, workBodyAmount, ticksToLive, isBoost].join("\t"))
}

// 每个房间的工程数量
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.controller || !room.controller.my) continue;

    let constructionSiteCount = room.find(FIND_CONSTRUCTION_SITES).length;
    let builderCount = room.find(FIND_MY_CREEPS, {
        filter: object => {
            return object.memory.role == 'builder'
        }
    }).length

    console.log(room.name + '\t' + constructionSiteCount + '\t' + builderCount)
}

//creep差别
for (let c in Memory.creepConfigs) {
    if (!Memory.creeps[c]) {
        console.log(c)
    }
}

//清除无用房间内存
let rooms = [];
Object.values(Game.rooms).filter(room => {
    return room.controller && room.controller.my;
}).map(room => rooms.push(room.name));
for (let r in Memory.rooms) {
    if (rooms.indexOf(r) < 0) {
        console.log(r);
        delete Memory.rooms[r];
    }
}

//生成补给搬运工
let tasks = [
    {from: 'W16S19', to: 'W15S19'}
];
for (let t of tasks) {
    let fromRoom = Game.rooms[t.from];
    let toRoom = Game.rooms[t.to];
    let flagName = t.from + ' to ' + t.to + ' supply reiver';
    fromRoom.storage.pos.createFlag(flagName);

    fromRoom.spawnReiver(flagName, toRoom.storage.id)
}

//清除道路工地
let roadcs = Object.values(Game.constructionSites).filter(object => {
    return object.structureType == 'road' && object.room.name == 'W16S19';
})
for (let road of roadcs) {
    road.remove();
}

//重置upgrader
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.controller) continue

    room.releaseCreep('upgrader')
}

//共享bar
let bars = {
    'O': "oxidant",
    'H': 'reductant',
    'Z': 'zynthium_bar',
    'L': 'lemergium_bar',
    'U': 'utrium_bar',
    'K': 'keanium_bar',
    'X': 'purifier'
}
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.controller || !room.controller.my) continue;

    let mt = room.mineral.mineralType
    console.log(room.name, mt)
    room.shareAddSource(mt)
    room.shareAddSource(bars[mt])
}

//统计资源
let resourceType = 'XGH2O';
let count = 0;
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.controller || !room.controller.my) continue;
    if (!room.terminal || !room.storage) continue;

    count += room.storage.store[resourceType];
    count += room.terminal.store[resourceType];
}
console.log(resourceType + '数量:' + count)