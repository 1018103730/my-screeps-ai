let intervalTicks = 10;

export function showProgress() {
    if (!Memory.stats['progress'] || Game.gcl.progress <= 100) {
        Memory.stats['progress'] = {progressRecord: [], avg: null}
    }
    let progress = Memory.stats['progress'];

    if (Game.time % intervalTicks) return

    let nowProgressRecord = [progress.progressRecord[progress.progressRecord.length - 1], Game.gcl.progress];
    progress.progressRecord = nowProgressRecord;

    if (progress.progressRecord.length > 1) {
        progress.avg = ((
            progress.progressRecord[1] -
            progress.progressRecord[0]
        ) / intervalTicks).toFixed(2)
    }
}