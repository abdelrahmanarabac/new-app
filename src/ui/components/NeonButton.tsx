import { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../utils'

interface NeonButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  glowColor?: string
  className?: string
}

export const NeonButton = ({
  children,
  variant = 'primary',
  glowColor = '#22d3ee', // Cyan-400
  className,
  ...props
}: NeonButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative group px-6 py-2 rounded-lg font-medium transition-all duration-300',
        'bg-white/5 border border-white/10 backdrop-blur-md',
        'hover:bg-white/10 hover:border-white/20',
        className
      )}
      style={{
        boxShadow: `0 0 10px ${glowColor}20` // 20% opacity
      }}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: glowColor, opacity: 0.15 }}
      />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children as ReactNode}
      </span>

      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  )
}
