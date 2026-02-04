import { Tooltip } from '@/components'
import { PickInstrument } from '@/features/controls'
import { InstrumentName } from '@/features/synth'
import { useFullscreen } from '@/hooks'
import { ArrowLeft, KeyboardMusic, StartRecord, StopRecord } from '@/icons'
import { ButtonWithTooltip } from '@/pages/play/components/TopBar'
import clsx from 'clsx'
import { Maximize, Minimize } from 'lucide-react'
import React, { MouseEvent } from 'react'
import { TooltipTrigger } from 'react-aria-components'
import { Link } from 'react-router'

type TopBarProps = {
  isError: boolean
  isLoading: boolean
  isRecordingAudio: boolean
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
  onClickMidi: (e: MouseEvent<any>) => void
  onClickRecord: (e: MouseEvent<any>) => void
}

export default function TopBar({
  isError,
  isLoading,
  isRecordingAudio,
  value,
  onChange,
  onClickMidi,
  onClickRecord,
}: TopBarProps) {
  const recordTooltip = isRecordingAudio ? 'Stop recording' : 'Start recording audio'
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen()

  return (
    <div className="z-10 relative bg-[#15161b] px-4 border-[#20222a] border-b w-screen h-14">
      <div className="flex items-center gap-4 h-full text-white">
        <ButtonWithTooltip tooltip="Back">
          <Link to="/songs" onClick={exitFullscreen}>
            <ArrowLeft size={24} />
          </Link>
        </ButtonWithTooltip>
        <RecordPillButton
          className="ml-auto"
          isRecording={isRecordingAudio}
          tooltip={recordTooltip}
          onClick={onClickRecord}
        />
        <PillActionButton
          tooltip="Choose a MIDI device"
          onClick={onClickMidi}
          icon={<KeyboardMusic />}
        >
          MIDI
        </PillActionButton>
        <ButtonWithTooltip
          tooltip={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          isActive={isFullscreen}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </ButtonWithTooltip>
        <PickInstrument
          className="w-auto min-w-40"
          isLoading={isLoading}
          errorMessage={isError ? 'Error loading instruments' : undefined}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

type RecordPillButtonProps = {
  isRecording: boolean
  tooltip: string
  onClick: (e: MouseEvent<any>) => void
  className?: string
}

function RecordPillButton({ isRecording, tooltip, onClick, className }: RecordPillButtonProps) {
  return (
    <TooltipTrigger>
      <button
        type="button"
        className={clsx(
          className,
          'flex h-8 items-center gap-2 rounded px-3 text-sm font-medium transition',
          isRecording
            ? 'border border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20'
            : 'border border-transparent bg-[#1e2028] text-gray-300 hover:bg-[#232633]',
        )}
        onClick={onClick}
        onMouseDown={(event) => event.preventDefault()}
      >
        {isRecording ? (
          <StopRecord size={14} />
        ) : (
          <StartRecord size={14} className="text-red-500" />
        )}
        <span>Record</span>
      </button>
      <Tooltip>{tooltip}</Tooltip>
    </TooltipTrigger>
  )
}

type PillActionButtonProps = {
  tooltip: string
  onClick: (e: MouseEvent<any>) => void
  icon: React.ReactElement<{ className?: string }>
  children: React.ReactNode
  className?: string
}

function PillActionButton({ tooltip, onClick, icon, children, className }: PillActionButtonProps) {
  return (
    <TooltipTrigger>
      <button
        type="button"
        className={clsx(
          className,
          'flex h-8 items-center gap-2 rounded px-3 text-sm font-medium text-gray-300 transition',
          'border border-transparent bg-[#1e2028] hover:bg-[#232633]',
        )}
        onClick={onClick}
        onMouseDown={(event) => event.preventDefault()}
      >
        {React.cloneElement(icon, {
          className: 'h-4 w-4 text-gray-300',
        })}
        <span>{children}</span>
      </button>
      <Tooltip>{tooltip}</Tooltip>
    </TooltipTrigger>
  )
}
