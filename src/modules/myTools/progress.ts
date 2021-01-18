let recordNum = 100;

export function showProgress() {
    if (!Memory.stats['progress'] || Game.gcl.progress <= 100) {
        Memory.stats['progress'] = {progressRecord: [], avg: null}
    }
    let progress = Memory.stats['progress'];

    if (progress.progressRecord.length >= recordNum) {
        progress.progressRecord = progress.progressRecord.slice(progress.progressRecord.length - recordNum)
    }

    progress.progressRecord.push(Game.gcl.progress)
    if (progress.progressRecord.length > 1) {
        progress.avg = ((
            progress.progressRecord[progress.progressRecord.length - 1] -
            progress.progressRecord[0]
        ) / (progress.progressRecord.length - 1)).toFixed(2)
    }
}