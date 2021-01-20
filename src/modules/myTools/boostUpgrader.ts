let BoostResources: Array<ResourceConstant> = ['XGH2O', 'GH2O', 'GH'];

export function boostUpgrader() {
    let canBoostUpgradeRoom = Object.values(Game.rooms).map(room => {
            let labId = room.memory['boostUpgradeLabId'];
            //减少冷却时间
            if (labId) {
                //初始化冷缺时间
                if (!room.memory['boostUpgradeTimeout']) {
                    room.memory['boostUpgradeTimeout'] = 0;
                }
                room.memory['boostUpgradeTimeout']--;
                if (room.memory['boostUpgradeTimeout'] < 0) {
                    room.memory['boostUpgradeTimeout'] = 0;
                }

                //定时发布任务
                if (Game.time % 50 == 0) {
                    let lab: StructureLab = Game.getObjectById(labId);
                    for (let boostResource of BoostResources) {
                        // if (lab.store[boostResource] >= 3000) continue;

                        if (room.terminal.store[boostResource] >= 30) {
                            let needAddTask = true;
                            BoostResources.forEach(resource => {
                                if (resource == boostResource) return
                                if (lab.store[resource] > 0) {
                                    needAddTask = false
                                }
                            })

                            if (needAddTask) {
                                // console.log(room.name + '注入' + boostResource)
                                room.addRoomTransferTask({
                                    type: "labIn",
                                    resource: [
                                        {id: labId, type: 'energy', amount: 900},
                                        {id: labId, type: boostResource, amount: 900},
                                    ]
                                })
                            }
                        }
                        break;
                    }
                }
            }

            return room;
        }
    ).filter(room => {
        if (room['boostUpgradeTimeout'] > 0) return false;
        let labId = room.memory['boostUpgradeLabId'];
        if (!labId) return false;
        let lab: StructureLab = Game.getObjectById(labId);

        if (lab.store['energy'] < 20 && (lab.store['XGH2O'] < 30 || lab.store['GH2O'] < 30 || lab.store['GH'] < 30)) return false;

        return true;
    }).map(room => room.name)

    let rooms = {};

    Object.values(Game.creeps).filter((creep) => {
        // 必须是upgrader
        let isUpgrader;
        if (!creep.room.controller) {
            isUpgrader = false;
        } else {
            if (creep.room.controller.level < 8) {
                isUpgrader = creep.memory.role == "upgrader" || creep.memory.role == "remoteUpgrader";
            } else {
                isUpgrader = creep.memory.role == "remoteUpgrader";
            }
        }

        // 必须在开启了boostUpgrade的房间里
        let inRoom = canBoostUpgradeRoom.indexOf(creep.room.name) >= 0;

        // 寿命悠长
        let liveLong = creep.ticksToLive > 1000;

        // 未曾boost过
        let needBoost = true;
        for (let b in creep.body) {
            let body = creep.body[b];
            if (body.boost) {
                needBoost = false;
                break;
            }
        }

        return isUpgrader && needBoost && inRoom && liveLong;
    }).sort((creep1, creep2) => {
        if (creep1.ticksToLive <= creep2.ticksToLive) {
            return 1;
        } else {
            return -1;
        }
    }).forEach(creep => {
        let room = creep.room;
        //只给每个房间的第一个boost
        if (!rooms[room.name]) {
            rooms[room.name] = creep.name;
            //这个勇士去boost
            let labId = creep.room.memory['boostUpgradeLabId'];
            let lab: StructureLab = Game.getObjectById(labId);
            creep.goTo(lab.pos)
            let result = lab.boostCreep(creep)
            if (result == OK) {
                console.log(creep.name + ' boostupgrade 强化成功');
                //添加冷却时间
                room.memory['boostUpgradeTimeout'] = 50;
            }
        }
    })
}

