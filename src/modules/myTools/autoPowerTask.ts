export function autoPowerTask() {
    if (Game.time % 10) return

    let rooms = ['W19S17', 'W16S17', 'W15S18'];

    let task = PWR_REGEN_SOURCE;
    for (let r of rooms) {
        let room = Game.rooms[r];
        if (!room) return

        if (!room.controller.isPowerEnabled)
            return ERR_INVALID_TARGET;
        // 有相同的就拒绝添加
        let hasPowerTask = room.memory.powerTasks.find(power => power === task) ? true : false;
        if (hasPowerTask)
            return ERR_NAME_EXISTS;

        room.memory.powerTasks.push(task);
    }
}