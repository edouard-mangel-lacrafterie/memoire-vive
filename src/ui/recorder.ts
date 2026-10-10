// Enregistreur simulé (prototype) : aucun son n'est capté, seul l'état et le chronomètre existent.
export type Recorder = { status: 'idle' | 'recording' | 'paused'; seconds: number }
export type RecorderEvent = 'record' | 'pause' | 'stop' | 'tick' | 'newQuestion'

export const idleRecorder: Recorder = { status: 'idle', seconds: 0 }

export function reduceRecorder(r: Recorder, event: RecorderEvent): Recorder {
  switch (event) {
    case 'record':
      return { ...r, status: 'recording' }
    case 'pause':
      return r.status === 'recording' ? { ...r, status: 'paused' } : r
    case 'stop':
      return idleRecorder
    case 'tick':
      return r.status === 'recording' ? { ...r, seconds: r.seconds + 1 } : r
    case 'newQuestion':
      // Par défaut, chaque question ouvre une nouvelle prise : la précédente part « en transmission ».
      return { status: 'recording', seconds: 0 }
  }
}

export const formatTime = (seconds: number): string =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
