export function autoPute() {
    if (Game.time % 100) return

    for (let r in Game.rooms) {
        let room = Game.rooms[r];
        if (!room.controller) continue
        if (!room.storage) continue
        if (!room.terminal) continue

        let storageEnergyThreshold = 1100000 - room.controller.level * 100000;
        let terminalEnergyThreshold = 110000;
        // 兜底
        if (room.storage.store['energy'] <= storageEnergyThreshold) continue;
        if (room.terminal.store['energy'] >= terminalEnergyThreshold) continue;
        // 为零取消
        let minPutEnergy: number = Math.min(
            terminalEnergyThreshold - room.terminal.store['energy'],
            room.storage.store['energy'] - storageEnergyThreshold
        );
        if (!minPutEnergy) continue

        room.addCenterTask({
            submit: room.memory.centerTransferTasks.length,
            target: STRUCTURE_TERMINAL,
            source: STRUCTURE_STORAGE,
            resourceType: RESOURCE_ENERGY,
            amount: minPutEnergy
        })
    }
}

