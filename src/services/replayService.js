/**
 * FUTURE: Replay / Timeline — gravação e reprodução de snapshots.
 *
 * Fluxo planejado:
 * 1. replayService.startRecording(layerManager, planDocument)
 * 2. A cada mutação, gravar { timestamp, layerSnapshot, planSnapshot }
 * 3. replayService.seek(time) aplica snapshots acumulados
 */

export const replayService = {
  startRecording() {
    throw new Error('Replay não implementado.');
  },
  stopRecording() {},
  seek() {},
  getTimeline() {
    return [];
  },
};
