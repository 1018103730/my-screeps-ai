//填充间隔时间
const fillIntervalTime = 50
//填充资源列表
const resourceList = ['XGH2O', 'GH2O', 'GH']

//选择需要填充的资源
function selectResource(room: Room) {
    let terminal = room.terminal;
    let lab: StructureLab = Game.getObjectById(room.memory['boostUpgradeLabId']);
    let labResourceNull = true;
    let labResource = null;
    let terminalResourceEnough = {};
    for (let resource of resourceList) {
        terminalResourceEnough[resource] = (terminal.store[resource] >= 30);
        if (lab.store[resource] > 0) {
            labResourceNull = false;
            labResource = resource;
        }
    }
    // console.log(room.name, labResourceNull, labResource, JSON.stringify(terminalResourceEnough))
    //如果lab中没有资源列表中的资源,则选择terminal有的第一种资源
    if (labResourceNull) {
        for (let key in terminalResourceEnough) {
            if (terminalResourceEnough[key]) return key;
        }
    }

    //如果lab中已经存在资源
    if (labResource) {
        //terminal中资源充足
        if (terminalResourceEnough[labResource]) {
            return labResource;
        }
        //terminal中资源不足,单独填充能量,消耗完lab剩余资源
        return false;
    }
}

function fillBoostLabWithRoom(room: Room) {
    let labId = room.memory['boostUpgradeLabId'];
    if (!labId || !Game.getObjectById(labId)) return
    let boostResource = selectResource(room)
    // console.log(room.name + ':' + boostResource)
    if (boostResource) {
        room.addRoomTransferTask({
            type: "labIn",
            resource: [
                {id: labId, type: 'energy', amount: 900},
                {id: labId, type: boostResource, amount: 900},
            ]
        })
    } else {
        room.addRoomTransferTask({
            type: "labIn",
            resource: [
                {id: labId, type: 'energy', amount: 900},
            ]
        })
    }
}

export function fillBoostLab() {
    let rooms = Object.values(Game.rooms).filter(room => {
        return room.controller && room.memory['boostUpgradeLabId'];
    });

    for (let room of rooms) {
        if (Game.time % fillIntervalTime) return
        //如果当前房间已经存在labIn任务 就放弃
        for (let task of room.memory.transferTasks) {
            if (task.type == "labIn") {
                continue;
            }
        }
        fillBoostLabWithRoom(room)
    }
}