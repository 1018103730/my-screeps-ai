import {creepApi} from "../creepController";

// let r = 'W16S17';
// Game.rooms[r].loff()
// creepApi.add(r+` lab clear`, 'manager', {sourceId: Game.rooms[r].terminal.id}, r);

export function labClear() {
    for (let r in Game.rooms) {
        let room = Game.rooms[r];
        let clearCreepName = room.name + ' lab clear';
        if (!creepApi.has(clearCreepName)) {
            continue;
        }

        if (Game.creeps[clearCreepName] && Game.creeps[clearCreepName].spawning) {
            continue;
        }
        let clearCreep = Game.creeps[clearCreepName];
        if (!clearCreep) {
            continue;
        }

        let labs = room.find<StructureLab>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LAB}})
        let killClearCreep = true;
        for (let lab of labs) {
            if (!lab.mineralType) {
                continue;
            }
            let resourceCount = lab.store.getUsedCapacity();
            if (resourceCount == 0) {
                continue;
            } else {
                killClearCreep = false;
            }

            if (clearCreep.store['energy'] > 0) {
                clearCreep.drop('energy');
                continue;
            }
            if (clearCreep.store.getUsedCapacity() != 0) {
                let amount = Math.min(clearCreep.store[lab.mineralType], room.terminal.store.getFreeCapacity())
                let result = clearCreep.transfer(room.terminal, lab.mineralType, amount)
                console.log(clearCreep.name, '放资源', lab.mineralType, result);
                if (result == ERR_NOT_IN_RANGE) {
                    clearCreep.moveTo(room.terminal.pos)
                }
            } else {
                let amount = Math.min(clearCreep.store.getFreeCapacity(), lab.store[lab.mineralType])
                let result = clearCreep.withdraw(lab, lab.mineralType, amount)
                console.log(clearCreep.name, '取资源', lab.mineralType, result);
                if (result == ERR_NOT_IN_RANGE) {
                    clearCreep.moveTo(lab.pos)
                }
            }

            break;
        }

        if (killClearCreep && clearCreep.store.getUsedCapacity() == 0) {
            clearCreep.suicide()
            creepApi.remove(clearCreepName)
            room.memory.lab.pause = false
            console.log(room.name + "Lab 清理完毕~ Lab重新开始工作");
        }
    }
}