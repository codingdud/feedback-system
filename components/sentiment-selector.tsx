"use client"
import { Smile, Meh, Frown } from "lucide-react"

interface SentimentSelectorProps {
  value: "positive" | "neutral" | "negative" | ""
  onChange: (sentiment: "positive" | "neutral" | "negative") => void
  disabled?: boolean
}

export function SentimentSelector({ value, onChange, disabled = false }: SentimentSelectorProps) {
  const sentiments = [
    {
      value: "positive" as const,
      label: "Positive",
      icon: Smile,
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      activeBg: "bg-green-600 text-white border-green-600",
      hoverBg: "hover:bg-green-100 hover:border-green-300",
    },
    {
      value: "neutral" as const,
      label: "Neutral",
      icon: Meh,
      color: "text-yellow-600",
      bg: "bg-yellow-50 border-yellow-200",
      activeBg: "bg-yellow-600 text-white border-yellow-600",
      hoverBg: "hover:bg-yellow-100 hover:border-yellow-300",
    },
    {
      value: "negative" as const,
      label: "Constructive",
      icon: Frown,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
      activeBg: "bg-orange-600 text-white border-orange-600",
      hoverBg: "hover:bg-orange-100 hover:border-orange-300",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {sentiments.map(({ value: sentimentValue, label, icon: Icon, color, bg, activeBg, hoverBg }) => {
        const isActive = value === sentimentValue
        return (
          <button
            key={sentimentValue}
            type="button"
            onClick={() => onChange(sentimentValue)}
            disabled={disabled}
            className={`
              p-4 border-2 rounded-lg transition-all duration-200 
              flex flex-col items-center space-y-2 
              hover:scale-105 active:scale-95 
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${isActive ? activeBg : `${bg} ${hoverBg} hover:shadow-md`}
            `}
          >
            <Icon className={`w-6 h-6 ${isActive ? "text-current" : color}`} />
            <span className={`text-sm font-medium ${isActive ? "text-current" : "text-gray-700"}`}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
