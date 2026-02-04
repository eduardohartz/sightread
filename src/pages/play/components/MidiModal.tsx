import { Modal, Select, Switch } from '@/components'
import { SelectItem } from '@/components/Select'
import {
  disableInputMidiDevice,
  disableOutputMidiDevice,
  enabledInputIdsAtom,
  enabledOutputIdsAtom,
  enableInputMidiDevice,
  enableOutputMidiDevice,
  keyboardRangeAtom,
  MIDI_NOTE_A0,
  MIDI_NOTE_C8,
  setKeyboardRange,
} from '@/features/midi'
import {
  audioContextEnabledAtom,
  disableAudioContext,
  enableAudioContext,
} from '@/features/synth/utils'
import { getKey, getOctave } from '@/features/theory'
import { useMidiInputs, useMidiOutputs } from '@/hooks'
import { KeyboardMusic, RefreshCw, Speaker } from '@/icons'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { Piano } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface MidiModalProps {
  isOpen: boolean
  onClose: () => void
}

// TODO: reduce duplication between the inputs and the outputs.
export function MidiModal(props: MidiModalProps) {
  const { isOpen, onClose } = props
  const { inputs, refreshInput } = useMidiInputs()
  const { outputs, refreshOutput } = useMidiOutputs()
  const [refreshing, setRefreshing] = useState(false)
  const refreshMidiDevices = () => {
    refreshInput()
    refreshOutput()
  }
  const audioContextEnabled = useAtomValue(audioContextEnabledAtom)
  const enabledInputIds = useAtomValue(enabledInputIdsAtom)
  const enabledOutputIds = useAtomValue(enabledOutputIdsAtom)

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      className="[&>button]:hidden bg-[#231e29] shadow-[0_24px_80px_rgba(0,0,0,0.55)] rounded-2xl w-[min(100vw,560px)] text-white/90"
      modalClassName="bg-transparent border-none shadow-none"
      overlayClassName="bg-black/45 backdrop-blur-[2px]"
    >
      <div className="relative flex flex-col text-base">
        <MidiModalHeader
          refreshing={refreshing}
          onRefresh={() => {
            refreshMidiDevices()
            setRefreshing(true)
          }}
          onRefreshEnd={() => {
            setRefreshing(false)
          }}
        />
        <div className="flex flex-col gap-6 px-6 pt-5 pb-6">
          <MidiSection label="Inputs" icon={<KeyboardMusic className="w-4 h-4 text-white/40" />}>
            <DeviceList
              emptyState={{
                icon: <KeyboardMusic className="w-5 h-5 text-white/45" />,
                title: 'No MIDI Input Devices Found',
                body: 'Ensure devices are connected and powered on, then refresh.',
              }}
              devices={
                inputs
                  ? Array.from(inputs.values()).map((device: MIDIInput) => ({
                      id: device.id,
                      name: device.name ?? 'Unknown device',
                      sublabel: device.manufacturer ? device.manufacturer : 'USB Connection',
                      enabled: enabledInputIds.has(device.id),
                      onToggle: async () => {
                        if (enabledInputIds.has(device.id)) {
                          disableInputMidiDevice(device)
                        } else {
                          enableInputMidiDevice(device)
                        }
                      },
                    }))
                  : []
              }
            />
          </MidiSection>
          <MidiSection label="Outputs" icon={<Speaker className="w-4 h-4 text-white/40" />}>
            <DeviceList
              emptyState={{
                icon: <Speaker className="w-5 h-5 text-white/45" />,
                title: 'No MIDI Output Devices Detected',
                body: 'Verify connections or check device drivers.',
              }}
              devices={
                outputs
                  ? [
                      {
                        id: 'local',
                        name: 'This Device',
                        sublabel: 'Internal Synth',
                        enabled: audioContextEnabled,
                        onToggle: async () => {
                          if (audioContextEnabled) {
                            disableAudioContext()
                          } else {
                            enableAudioContext()
                          }
                        },
                      },
                      ...Array.from(outputs.values()).map((device) => ({
                        id: device.id,
                        name: device.name ?? 'Unknown device',
                        sublabel: device.manufacturer ? device.manufacturer : 'Hardware Port',
                        enabled: enabledOutputIds.has(device.id),
                        onToggle: async () => {
                          if (enabledOutputIds.has(device.id)) {
                            disableOutputMidiDevice(device as any)
                          } else {
                            enableOutputMidiDevice(device as any)
                          }
                        },
                      })),
                    ]
                  : []
              }
            />
          </MidiSection>
          <KeyboardRangeSection />
        </div>
        <ModalFooter onClose={onClose} />
      </div>
    </Modal>
  )
}

function MidiModalHeader({
  refreshing,
  onRefresh,
  onRefreshEnd,
}: {
  refreshing: boolean
  onRefresh: () => void
  onRefreshEnd: () => void
}) {
  return (
    <div className="flex justify-between items-center px-6 py-5 border-white/5 border-b">
      <h1 className="font-semibold text-white text-2xl">MIDI Settings</h1>
      <button
        className="group flex items-center gap-2 font-medium text-white/50 hover:text-white/80 text-sm transition"
        onClick={onRefresh}
      >
        <RefreshCw
          style={{ animationIterationCount: 0.5 }}
          onAnimationEnd={onRefreshEnd}
          className={clsx('w-4 h-4', refreshing && 'animate-spin')}
        />
        Refresh Devices
      </button>
    </div>
  )
}

function MidiSection({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2 font-semibold text-white/50 text-xs uppercase tracking-[0.18em]">
        <span className="flex justify-center items-center w-4 h-4">{icon}</span>
        {label}
      </div>
      {children}
    </section>
  )
}

type DeviceItem = {
  id: string
  name: string
  sublabel: string
  enabled: boolean
  onToggle: () => void
}

function DeviceList({
  devices,
  emptyState,
}: {
  devices: DeviceItem[]
  emptyState: { icon: ReactNode; title: string; body: string }
}) {
  if (!devices.length) {
    return <NoDeviceFound icon={emptyState.icon} title={emptyState.title} body={emptyState.body} />
  }

  return (
    <div className="flex flex-col gap-2">
      {devices.map((device) => (
        <DeviceRow key={device.id} device={device} />
      ))}
    </div>
  )
}

function DeviceRow({ device }: { device: DeviceItem }) {
  return (
    <div className="flex justify-between items-center bg-white/[0.04] px-4 py-3 border border-white/5 rounded-xl">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-white/90 text-base">{device.name}</span>
        <span className="text-white/40 text-xs">{device.sublabel}</span>
      </div>
      <Switch
        isSelected={device.enabled}
        onChange={() => {
          device.onToggle()
        }}
        size="lg"
        className="text-white/60"
      >
        <span className="sr-only">Toggle {device.name}</span>
      </Switch>
    </div>
  )
}

function NoDeviceFound({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col justify-center items-center gap-2 bg-white/[0.03] px-6 py-8 border border-white/5 rounded-xl text-center">
      <div className="flex justify-center items-center bg-white/5 rounded-full w-10 h-10">
        {icon}
      </div>
      <p className="font-medium text-white/80 text-sm">{title}</p>
      <p className="text-white/45 text-xs">{body}</p>
    </div>
  )
}

// Common keyboard size presets
const KEYBOARD_PRESETS = [
  { id: '88', name: '88 Keys (Full)', start: 21, end: 108 }, // A0 to C8
  { id: '76', name: '76 Keys', start: 28, end: 103 }, // E1 to G7
  { id: '73', name: '73 Keys', start: 28, end: 100 }, // E1 to E7
  { id: '61', name: '61 Keys', start: 36, end: 96 }, // C2 to C7
  { id: '49', name: '49 Keys', start: 36, end: 84 }, // C2 to C6
  { id: '37', name: '37 Keys', start: 48, end: 84 }, // C3 to C6
  { id: '25', name: '25 Keys', start: 48, end: 72 }, // C3 to C5
  { id: 'custom', name: 'Custom Range', start: -1, end: -1 },
]

// Generate options for all MIDI notes (A0 to C8)
function generateNoteOptions() {
  const options: { id: string; name: string; midiNote: number }[] = []
  for (let note = MIDI_NOTE_A0; note <= MIDI_NOTE_C8; note++) {
    const key = getKey(note)
    const octave = getOctave(note)
    options.push({
      id: note.toString(),
      name: `${key}${octave}`,
      midiNote: note,
    })
  }
  return options
}

const NOTE_OPTIONS = generateNoteOptions()

function KeyboardRangeSection() {
  const keyboardRange = useAtomValue(keyboardRangeAtom)
  const { start, end } = keyboardRange

  // Determine which preset matches current range
  const currentPreset =
    KEYBOARD_PRESETS.find((p) => p.start === start && p.end === end) ??
    KEYBOARD_PRESETS.find((p) => p.id === 'custom')!

  const handlePresetChange = (presetId: string) => {
    const preset = KEYBOARD_PRESETS.find((p) => p.id === presetId)
    if (preset && preset.id !== 'custom') {
      setKeyboardRange({ start: preset.start, end: preset.end })
    }
  }

  const handleStartNoteChange = (noteId: string) => {
    const newStart = parseInt(noteId)
    if (newStart < end) {
      setKeyboardRange({ start: newStart, end })
    }
  }

  const handleEndNoteChange = (noteId: string) => {
    const newEnd = parseInt(noteId)
    if (newEnd > start) {
      setKeyboardRange({ start, end: newEnd })
    }
  }

  const keyCount = end - start + 1

  return (
    <MidiSection label="Keyboard Range" icon={<Piano className="w-4 h-4 text-white/40" />}>
      <div className="flex flex-col gap-3 bg-white/[0.04] px-4 py-3 border border-white/5 rounded-xl">
        <div className="flex flex-col gap-1">
          <span className="text-white/40 text-xs">
            Notes outside your keyboard range will be greyed out and won't affect your score.
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-16 text-white/60 text-sm">Preset</span>
            <Select
              selectedKey={currentPreset.id}
              onSelectionChange={(key) => handlePresetChange(key as string)}
              className="flex-1"
              aria-label="Keyboard preset"
            >
              {KEYBOARD_PRESETS.map((preset) => (
                <SelectItem key={preset.id} id={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-white/60 text-sm">Low</span>
            <Select
              selectedKey={start.toString()}
              onSelectionChange={(key) => handleStartNoteChange(key as string)}
              className="flex-1"
              aria-label="Lowest note"
            >
              {NOTE_OPTIONS.filter((n) => n.midiNote < end).map((note) => (
                <SelectItem key={note.id} id={note.id}>
                  {note.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-white/60 text-sm">High</span>
            <Select
              selectedKey={end.toString()}
              onSelectionChange={(key) => handleEndNoteChange(key as string)}
              className="flex-1"
              aria-label="Highest note"
            >
              {NOTE_OPTIONS.filter((n) => n.midiNote > start).map((note) => (
                <SelectItem key={note.id} id={note.id}>
                  {note.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="text-white/40 text-xs">
            Current range: {keyCount} keys ({getKey(start)}
            {getOctave(start)} to {getKey(end)}
            {getOctave(end)})
          </div>
        </div>
      </div>
    </MidiSection>
  )
}

function ModalFooter({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-6 py-4 border-white/5 border-t">
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium text-white/80 text-sm transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}
