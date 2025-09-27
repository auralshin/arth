import React from 'react'

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`rounded-2xl bg-black/78 backdrop-blur border border-white/30 ring-1 ring-white/3 p-4 shadow-sm isolate ${className}`}>
      {children}
    </div>
  )
}

export default Card
