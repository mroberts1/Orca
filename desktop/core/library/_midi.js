'use strict'

const Operator = require('../operator')

function OperatorMidi (orca, x, y, passive) {
  Operator.call(this, orca, x, y, ':', true)

  this.name = 'midi'
  this.info = 'Sends Midi a midi note.'

  this.ports.haste.channel = { x: 1, y: 0 }
  this.ports.haste.octave = { x: 2, y: 0 }
  this.ports.haste.note = { x: 3, y: 0 }
  this.ports.input.velocity = { x: 4, y: 0 }
  this.ports.input.length = { x: 5, y: 0 }

  this.run = function () {
    if (!this.bang()) { return }

    let rawChannel = this.listen(this.ports.haste.channel)
    let rawOctave = this.listen(this.ports.haste.octave, true)
    let rawNote = this.listen(this.ports.haste.note)
    let rawVelocity = this.listen(this.ports.input.velocity)
    let rawLength = this.listen(this.ports.input.length)

    if (rawChannel === '.' || orca.valueOf(rawChannel) > 15 || rawOctave === 0 || rawOctave > 8 || rawNote === '.' || rawVelocity === '0' || rawLength === '0') { return }

    // 0 - 16
    const channel = clamp(orca.valueOf(rawChannel), 0, 15)
    // 1 - 9
    const octave = clamp(rawNote === 'b' ? rawOctave + 1 : rawOctave, 1, 9)
    // 0 - 11
    const note = ['C', 'c', 'D', 'd', 'E', 'F', 'f', 'G', 'g', 'A', 'a', 'B'].indexOf(rawNote === 'e' ? 'F' : rawNote === 'b' ? 'C' : rawNote)
    // 0 - F(127)
    const velocity = rawVelocity === '.' ? 127 : parseInt((clamp(orca.valueOf(rawVelocity), 1, 15) / 15) * 127)
    // 0 - F(15)
    const length = clamp(orca.valueOf(rawLength), 1, 15)

    if (note < 0) { console.warn(`Unknown note:${rawNote}`); return }

    this.draw = false

    terminal.io.sendMidi(channel, octave, note, velocity, length)
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = OperatorMidi
