import React from 'react'

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden relative text-white font-sans selection:bg-purple-500/30">
      {/* Content */}
      <div className="relative z-10 w-full h-full flex">{children}</div>
    </div>
  )
}
