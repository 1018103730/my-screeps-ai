const storageMinStore = 150000;
const terminalMinStore = 50000;

export function autoEnergy() {
    if (Game.time % 10) return;

    for (let r in Game.rooms) {
        let room = Game.rooms[r];
        if (!room) continue
        if (!room.controller) continue

        energyPoise(room)
    }
}

function energyPoise(room: Room) {
    if (room.controller.level < 8) return

    if (room.storage.store[RESOURCE_ENERGY] <= storageMinStore) {
        let amount = Math.min(room.terminal.store[RESOURCE_ENERGY], room.storage.store.getFreeCapacity(), storageMinStore - room.storage.store[RESOURCE_ENERGY]);
        if (amount <= 9000) return
        let result = room.addCenterTask({
            submit: 999,
            source: STRUCTURE_TERMINAL,
            target: STRUCTURE_STORAGE,
            resourceType: RESOURCE_ENERGY,
            amount: amount,
        })
        if (result >= 0) {
            console.log(room.name, 'terminal->storage', amount)
        }

        return
    }

    if (room.terminal.store[RESOURCE_ENERGY] <= terminalMinStore) {
        let amount = Math.min(room.storage.store[RESOURCE_ENERGY] - storageMinStore, 2 * terminalMinStore, room.terminal.store.getFreeCapacity());
        if ((amount + room.terminal.store[RESOURCE_ENERGY]) <= terminalMinStore) return
        if (amount <= terminalMinStore) return
        let result = room.addCenterTask({
            submit: 666,
            source: STRUCTURE_STORAGE,
            target: STRUCTURE_TERMINAL,
            resourceType: RESOURCE_ENERGY,
            amount: amount,
        })

        if (result >= 0) {
            console.log(room.name, 'storage->terminal', amount)
        }
    }
}