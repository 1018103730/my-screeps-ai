export function buildRoad() {
    if (Object.keys(Game.constructionSites).length >= 100 || !(Memory['buildRoad'])) return
    for (let c in Game.creeps) {
        let creep = Game.creeps[c];
        //不负重不修路
        if (creep.store.getUsedCapacity() <= 0) continue
        if (creep.pos.x == 0 || creep.pos.y == 0) continue
        if (!creep.room.controller) continue
        if (!creep.room.controller.my) continue

        //已经存在施工点
        let lcs = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (lcs.length > 0) continue

        //已经存在road
        let road = creep.pos.lookFor(LOOK_STRUCTURES).filter(object => {
            return object.structureType == 'road'
        })
        if (road.length > 0) continue

        if (creep.name.split(' ')[0] == 'catalyze') {
            creep.pos.createConstructionSite(STRUCTURE_ROAD)
            continue
        }

        // 不需要造路的角色
        let creepRole = creep.memory.role;
        const canBuildRoladRole = ['upgrader1', 'manager1'];
        if (canBuildRoladRole.indexOf(creepRole) < 0) continue

        creep.pos.createConstructionSite(STRUCTURE_ROAD)
    }

    for (let r in Game.rooms) {
        let room = Game.rooms[r];
        if (!room.controller || !room.controller.my) continue;


        let constructionSiteCount = room.find(FIND_CONSTRUCTION_SITES).length;
        if (constructionSiteCount > 0) {
            //判断当前房间是否存在builder 不存在就生成
        }
    }
}
