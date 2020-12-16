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
    console.log('-------------' + r + ':' + room.terminal.store.getUsedCapacity() + '---------------')
    for (let resource in room.terminal.store) {
        if (resources.indexOf(resource) < 0) {
            continue
        }
        let resourceValue = room.terminal.store[resource];
        console.log(resource + '\t' + resourceValue)
    }
}

// 重置终端自动任务
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    let warResourceRoom = "W16S18";
    if (!room.terminal) {
        continue;
    }
    room.memory.terminalTasks = [];

    if (r != warResourceRoom) {
        room.terminal.add('H', 1000, 0, 1);
        room.terminal.add('O', 1000, 0, 1);
        room.terminal.add('L', 1000, 0, 1);
        room.terminal.add('K', 1000, 0, 1);
        room.terminal.add('Z', 1000, 0, 1);
        room.terminal.add('U', 1000, 0, 1);
        room.terminal.add('X', 1000, 0, 1);
    }

    if (room.controller.level < 8) {
        room.terminal.add('energy', 100000, 0, 1);
        room.terminal.add('energy', 100000, 0, 0);
    } else {
        room.terminal.add('energy', 60000, 0, 1);
        room.terminal.add('energy', 60000, 0, 0);
    }
}


// 查看creep参数
let rooms = {};
for (let c in Game.creeps) {
    let creep = Game.creeps[c];
    if (!rooms[creep.room.name]) {
        rooms[creep.room.name] = []
    }
    let name = creep.name.padEnd(25, ' ');
    rooms[creep.room.name].push([name, creep.store.getCapacity(), creep.ticksToLive])
}

for (let r in rooms) {
    console.log('------------' + r + ':' + Game.rooms[r].energyAvailable + '--------------');
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
