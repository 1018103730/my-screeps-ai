// 修改能量源
Memory.creeps['W21S16 RemoteBuilder']['data']['sourceId'] = "5fb5227da3a294adc633f7ed";
Memory.creeps['W21S16 RemoteBuilder from W17S18']['data']['sourceId'] = "5fb5227da3a294adc633f7ed";
Memory.creeps['W21S16 RemoteBuilder from W18S18']['data']['sourceId'] = "5fb5227da3a294adc633f7ed";

Memory.creeps['W21S16 RemoteBuilder']['sourceId'] = "5fb5227da3a294adc633f7ed";
Memory.creeps['W21S16 RemoteBuilder from W17S18']['sourceId'] = "5fb5227da3a294adc633f7ed";
Memory.creeps['W21S16 RemoteBuilder from W18S18']['sourceId'] = "5fb5227da3a294adc633f7ed";

// 发来贺电
Game.rooms.W16S18.terminal.send('energy', 50000, "W21S16");
Game.rooms.W17S18.terminal.send('energy', 50000, "W21S16");
Game.rooms.W16S19.terminal.send('energy', 50000, "W21S16");
Game.rooms.W17S17.terminal.send('energy', 50000, "W21S16");
Game.rooms.W18S18.terminal.send('energy', 50000, "W21S16");


for (let c of ['W16S18', 'W16S19', 'W18S18', 'W17S17', "W17S18"]) {
    let creep = Game.creeps[c + " reiver 23634929"];
    console.log(creep.pos, creep.store.getUsedCapacity());
}

// 清除内存中的无用房间
for (let r of [
    "W19S18", "W20S18", "W18S17", "W15S20", "W17S20",
    "W16S20", "W18S20", "W18S19", "W20S20", "W19S20",
    "W20S19", "W14S20", "W20S17", "W21S17", "W20S16",
    "W13S20", "W19S16", "W18S16", "W19S15", "W20S15",
    "W15S19", "W17S16", "W19S19", "W16S16"
]) {
    delete Memory.rooms[r];
}

// 挂单
Game.rooms.W21S16.terminal.add('H', 1000, 0, 1);
Game.rooms.W21S16.terminal.add('O', 1000, 0, 1);
Game.rooms.W21S16.terminal.add('U', 1000, 0, 1);
Game.rooms.W21S16.terminal.add('L', 1000, 0, 1);
Game.rooms.W21S16.terminal.add('K', 1000, 0, 1);
Game.rooms.W21S16.terminal.add('Z', 1000, 0, 1);
Game.rooms.W21S16.terminal.add('X', 1000, 0, 1);
Game.rooms.W21S16.terminal.add('energy', 150000, 0, 1);

// 报废
for (let i of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
    let creepName = 'W21S16 upgrader' + i;
    Game.creeps[creepName].suicide();
}


for (let c of ['W16S18', "W17S18", "W16S19", "W17S17", "W18S18"]) {
    creepApi.remove(c + " reiver 23634929")
}

// 发布远程支援
for (let c of ['W16S18', "W17S18", "W16S19", "W17S17", "W18S18"]) {
    creepApi.add(`W21S16 RemoteUpgrader from ` + c, 'remoteUpgrader', {
        targetRoomName: "W21S16",
        sourceId: Game.rooms.W21S16.terminal.id
    }, c);
    creepApi.add(`W21S16 RemoteBuilder from ` + c, 'remoteBuilder', {
        targetRoomName: "W21S16",
        sourceId: Game.rooms.W21S16.terminal.id
    }, c);
}

// 查看当前工地
for (let c in Game.constructionSites) {
    // let cs = Game.constructionSites[c];
    // let bs = cs.pos.look();
    // console.log(cs.pos, bs.length)
    Game.constructionSites[c].remove()
}

for (let c in Memory.creepConfigs) {
    if (!Memory.creeps[c]) {
        console.log(c)
    }
}

for (let r in global.resourcePrice) {
    console.log(r, global.resourcePrice[r])
}