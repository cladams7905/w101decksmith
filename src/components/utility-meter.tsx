import { Progress } from "@/components/ui/progress"

interface UtilityMeterProps {
  label: string
  value: number
  maxValue: number
  description?: string
}

export default function UtilityMeter({ label, value, maxValue, description }: UtilityMeterProps) {
  // Calculate percentage, capped at 100%
  const percentage = Math.min(100, (value / maxValue) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="text-xs font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{value.toFixed(1)}</div>
      </div>
      <Progress value={percentage} className="h-1.5" />
      {description && <div className="text-[10px] text-muted-foreground">{description}</div>}
    </div>
  )
}
