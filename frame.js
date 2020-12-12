// 查看当前终端资源
let resources = ['XZHO2', 'XZH2O', "XLHO2", "XKHO2", 'XGHO2', 'energy'];
for (let r in Game.rooms) {
    let room = Game.rooms[r];
    if (!room.terminal) {
        continue
    }
    if (!room.terminal.my) {
        continue
    }
    console.log('-------------' + r + ':' + room.terminal.store.getUsedCapacity() + '---------------')
    for (let res in room.terminal.store) {
        if (resources.indexOf(res) < 0) {
            continue
        }
        let resource = room.terminal.store[res];
        console.log(res + '\t' + resource)
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

    room.terminal.add('energy', 90000, 0, 1);
    room.terminal.add('energy', 90000, 0, 0);
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