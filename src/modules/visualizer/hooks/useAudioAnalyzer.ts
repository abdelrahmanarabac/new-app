import { useRef, useEffect } from 'react'
import { player } from '../../player/playerEngine'
import { Howler } from 'howler'

export const useAudioAnalyzer = () => {
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const isSetupRef = useRef(false)

  // Function to initialize analyzer
  const setupAnalyzer = () => {
    const ctx = player.getAudioContext()
    if (!ctx || isSetupRef.current) return

    // Create analyzer node
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    
    // Connect Howler master gain to analyser
    // Note: Howler.masterGain is internal but usually accessible or we connect to destination
    // Howler connects masterGain -> ctx.destination
    // We want masterGain -> analyser -> ctx.destination
    // But modifying the graph might be tricky if Howler manages it.
    // Safest way: Howler.masterGain.connect(analyser)
    // Analyzer doesn't need to connect to destination if it's just a tap (but signal flow must continue)
    // Actually, AnalyserNode passes audio through.
    
    // Howler.masterGain is likely of type GainNode
    try {
        const masterGain = Howler.masterGain as GainNode
        if(masterGain) {
            masterGain.connect(analyser)
            analyserRef.current = analyser
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
            isSetupRef.current = true
        }
    } catch (e) {
        console.error("Audio Analyzer Setup Failed", e)
    }
  }

  // Attempt setup on mount, but might need to wait for user interaction/context resume
  useEffect(() => {
    // Retry setup periodically if context not ready or masterGain not available
    const interval = setInterval(() => {
        if(isSetupRef.current) {
            clearInterval(interval)
            return
        }
        setupAnalyzer()
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getFrequencyData = () => {
     if (analyserRef.current && dataArrayRef.current) {
         analyserRef.current.getByteFrequencyData(dataArrayRef.current as any)
         return dataArrayRef.current
     }
     return null
  }

  return { getFrequencyData }
}
