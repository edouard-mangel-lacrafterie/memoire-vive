import { expect, test } from 'vitest'
import { formatTime, idleRecorder, reduceRecorder, type Recorder } from './recorder'

const run = (r: Recorder, ...events: Parameters<typeof reduceRecorder>[1][]) => events.reduce(reduceRecorder, r)

test('démarre à l\'arrêt', () => {
  expect(idleRecorder).toEqual({ status: 'idle', seconds: 0 })
})

test('enregistrer démarre, le temps avance à chaque tick', () => {
  expect(run(idleRecorder, 'record', 'tick', 'tick')).toEqual({ status: 'recording', seconds: 2 })
})

test('pause fige le temps, reprendre le fait repartir', () => {
  const paused = run(idleRecorder, 'record', 'tick', 'pause', 'tick')
  expect(paused).toEqual({ status: 'paused', seconds: 1 })
  expect(run(paused, 'record', 'tick')).toEqual({ status: 'recording', seconds: 2 })
})

test('stop revient à l\'arrêt et remet le temps à zéro', () => {
  expect(run(idleRecorder, 'record', 'tick', 'stop')).toEqual(idleRecorder)
})

test('un changement de question remet le temps à zéro sans interrompre l\'enregistrement', () => {
  expect(run(idleRecorder, 'record', 'tick', 'tick', 'newQuestion')).toEqual({ status: 'recording', seconds: 0 })
  expect(run(idleRecorder, 'record', 'pause', 'newQuestion')).toEqual({ status: 'paused', seconds: 0 })
})

test('tick et pause sont ignorés à l\'arrêt', () => {
  expect(run(idleRecorder, 'tick', 'pause')).toEqual(idleRecorder)
})

test.each([
  [0, '00:00'],
  [7, '00:07'],
  [65, '01:05'],
  [3600, '60:00'],
])('formatTime(%i) = %s', (s, expected) => {
  expect(formatTime(s)).toBe(expected)
})
