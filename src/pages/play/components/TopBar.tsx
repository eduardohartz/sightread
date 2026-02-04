import { Tooltip } from '@/components'
import { useFullscreen } from '@/hooks'
import { ArrowLeft, BarChart2, KeyboardMusic, Settings } from '@/icons'
import clsx from 'clsx'
import { Maximize, Minimize } from 'lucide-react'
import React, { MouseEvent, PropsWithChildren } from 'react'
import { Button, TooltipTrigger } from 'react-aria-components'

type TopBarProps = {
  title?: string
  subtitle?: string
  onClickBack: () => void
  onClickMidi: (e: MouseEvent<any>) => void
  onClickStats: (e: MouseEvent<any>) => void
  statsVisible: boolean
  isSettingsOpen: boolean
  onToggleSettings: () => void
}

export default function TopBar({
  onClickBack,
  title,
  subtitle,
  onClickMidi,
  statsVisible,
  onClickStats,
  isSettingsOpen,
  onToggleSettings,
}: TopBarProps) {
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen()

  const handleBack = () => {
    exitFullscreen()
    onClickBack()
  }

  return (
    <div className="z-10 relative bg-[#15161b] px-4 border-[#20222a] border-b w-screen h-14">
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center gap-3">
          <ButtonWithTooltip tooltip="Back" onClick={handleBack}>
            <ArrowLeft size={24} />
          </ButtonWithTooltip>
          <div className="flex flex-col">
            {title && (
              <span
                className="max-w-[320px] font-semibold text-white text-sm truncate"
                title={title}
              >
                {title}
              </span>
            )}
            {subtitle && (
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <ButtonWithTooltip
            tooltip={statsVisible ? 'Hide Stats' : 'Show Stats'}
            isActive={statsVisible}
            onClick={onClickStats}
          >
            <BarChart2 size={20} />
          </ButtonWithTooltip>
          <ButtonWithTooltip tooltip="Choose a MIDI device" onClick={onClickMidi}>
            <KeyboardMusic size={24} />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            tooltip={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            isActive={isFullscreen}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </ButtonWithTooltip>
          <ButtonWithTooltip
            tooltip="Settings"
            isActive={isSettingsOpen}
            onClick={onToggleSettings}
          >
            <Settings size={24} />
          </ButtonWithTooltip>
        </div>
      </div>
    </div>
  )
}

type ButtonWithTooltipProps = PropsWithChildren<
  React.ComponentProps<typeof Button> & { tooltip: string; isActive?: boolean }
>

export function ButtonWithTooltip({
  tooltip,
  children,
  isActive,
  className,
  ...rest
}: ButtonWithTooltipProps) {
  return (
    <TooltipTrigger delay={0}>
      <Button
        {...rest}
        aria-label={rest['aria-label'] ?? tooltip}
        aria-pressed={typeof isActive === 'boolean' ? isActive : undefined}
        className={clsx(
          className,
          isActive ? 'fill-purple-primary text-purple-primary' : 'fill-white text-white',
          'hover:fill-purple-hover hover:text-purple-hover',
        )}
      >
        {children}
      </Button>
      <Tooltip> {tooltip} </Tooltip>
    </TooltipTrigger>
  )
}
