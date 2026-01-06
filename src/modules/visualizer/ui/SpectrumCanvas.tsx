import { useRef, useEffect } from 'react'
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer'

export const SpectrumCanvas = ({ className }: { className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { getFrequencyData } = useAudioAnalyzer()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number

        const render = () => {
            const data = getFrequencyData()

            // Resize canvas to match display size for sharpness
            const dpr = window.devicePixelRatio || 1
            const rect = canvas.getBoundingClientRect()

            // If completely hidden or offscreen, skip (but rect width might be 0 if hidden)
            if (rect.width === 0) {
                animationId = requestAnimationFrame(render)
                return
            }

            canvas.width = rect.width * dpr
            canvas.height = rect.height * dpr
            ctx.scale(dpr, dpr)

            const width = rect.width
            const height = rect.height

            ctx.clearRect(0, 0, width, height)

            if (!data) {
                // If no data, maybe show a flat line or logo breathing?
                // Let's draw a subtle centerline
                ctx.beginPath()
                ctx.moveTo(0, height / 2)
                ctx.lineTo(width, height / 2)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
                ctx.stroke()
            } else {
                // Draw bars
                const barWidth = (width / data.length) * 2.5
                let x = 0

                for (let i = 0; i < data.length; i++) {
                    const barHeight = (data[i] / 255) * height

                    // Gradient fill based on height
                    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
                    // Neon colors: purple to blue
                    gradient.addColorStop(0, '#A855F7') // Purple-500
                    gradient.addColorStop(1, '#3B82F6') // Blue-500

                    ctx.fillStyle = gradient

                    // Rounded top bars?
                    // ctx.fillRect(x, height - barHeight, barWidth, barHeight)

                    // Smoother path?
                    // Let's stick to bars for "Spectrum" look
                    ctx.fillRect(x, height - barHeight, barWidth, barHeight)

                    x += barWidth + 1
                }
            }

            animationId = requestAnimationFrame(render)
        }

        render()

        return () => cancelAnimationFrame(animationId)
    }, [getFrequencyData])

    return (
        <canvas ref={canvasRef} className={`w-full h-full ${className}`} />
    )
}
