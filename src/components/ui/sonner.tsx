"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const toastStyle = {
    "--normal-bg": "oklch(0.99 0.004 95)",
    "--normal-text": "oklch(0.22 0.018 250)",
    "--normal-border": "oklch(0.9 0.012 95)",
    "--success-bg": "oklch(0.97 0.035 145)",
    "--success-border": "oklch(0.88 0.08 145)",
    "--success-text": "oklch(0.34 0.12 145)",
    "--info-bg": "oklch(0.97 0.025 250)",
    "--info-border": "oklch(0.87 0.055 250)",
    "--info-text": "oklch(0.34 0.13 250)",
    "--warning-bg": "oklch(0.97 0.045 90)",
    "--warning-border": "oklch(0.86 0.095 85)",
    "--warning-text": "oklch(0.34 0.1 80)",
    "--error-bg": "oklch(0.97 0.035 25)",
    "--error-border": "oklch(0.87 0.08 25)",
    "--error-text": "oklch(0.38 0.14 25)",
    "--border-radius": "12px",
    ...props.style,
  } as React.CSSProperties

  return (
    <Sonner
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      {...props}
      theme="light"
      style={toastStyle}
      toastOptions={{
        ...props.toastOptions,
        classNames: {
          toast: "shadow-lg",
          title: "font-bold",
          description: "font-medium",
          closeButton: "shadow-sm",
          ...props.toastOptions?.classNames,
        },
      }}
    />
  )
}

export { Toaster }
