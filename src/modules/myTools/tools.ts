//绕着走
function ignoreRange(pos: RoomPosition, range = 5) {
    let {x, y} = pos;
    let ignorePos = [];
    for (let i = -1 * range; i <= range; i++) {
        ignorePos.push([x + i, y + range]);
        ignorePos.push([x + i, y - range]);
        ignorePos.push([x + range, y + i]);
        ignorePos.push([x - range, y + i]);
    }
    return ignorePos;
}

export {ignoreRange}

// 生成部件数组
function buildBodyFromConfig(config) {
    let bodys = [];
    for (let body in config) {
        for (let i = 0; i < config[body]; i++) {
            bodys.push(body)
        }
    }
    return bodys;
}

export {buildBodyFromConfig}

let defaultOpts = {
    visualizePathStyle: {stroke: '#ffffff'},
    maxRooms: 40,
    maxOps: 10000,
    costCallback(roomName: string, costMatrix: CostMatrix): void | CostMatrix {
        return costMatrix
    },
    roomCallback(roomName: string): boolean | CostMatrix {
        // 强调了不许走就不走
        if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return false

        const room = Game.rooms[roomName]
        // 房间没有视野
        if (!room) return

        let costs = new PathFinder.CostMatrix;

        return costs;
    }
}
//规避范围
let runRange = 3;


export function goMyWay(creep: Creep, pos: RoomPosition | Flag, opts = defaultOpts) {
    //查看当前房间中敌方攻击单位
    let hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS).filter(creep => {
        return creep.getActiveBodyparts(ATTACK) != 0 || creep.getActiveBodyparts(RANGED_ATTACK) != 0;
    });

    if (hostileCreeps.length) {
        // creep.log('附近有危险,注意避让~', 'red')
        let ignorePoss = [];
        for (let hostile of hostileCreeps) {
            //绘制危险区域
            hostile.room.visual.rect(
                hostile.pos.x - runRange,
                hostile.pos.y - runRange,
                2 * runRange + 1,
                2 * runRange + 1,
                {stroke: 'red', opacity: .3}
            )

            //设置禁止通行点
            for (let pos of ignoreRange(hostile.pos, runRange)) {
                ignorePoss.push(pos)
            }
        }
        opts = {
            ...opts,
            visualizePathStyle: {stroke: 'red'},
            costCallback(roomName: string, costMatrix: CostMatrix): void | CostMatrix {
                for (let pos of ignorePoss) {
                    costMatrix.set(pos[0], pos[1], 255)
                }

                return costMatrix
            }
        }

        creep.moveTo(pos, opts)
    } else {
        creep.moveTo(pos, opts)
    }
}

//指定房间空闲spawn
function selectSpawn(room: Room) {
    return room.find(FIND_MY_SPAWNS, {filter: object => object.spawning == null})[0]
}

export {selectSpawn}

//切换工作状态
function maintainStatus(creep: Creep) {
    if (creep.memory['building'] && creep.store.getUsedCapacity() == 0) {
        creep.memory['building'] = false;
        creep.say('🔄 harvest');
    }
    if (!creep.memory['building'] && creep.store.getFreeCapacity() == 0) {
        creep.memory['building'] = true;
        creep.say('🚧 working');
    }
}

export {maintainStatus}