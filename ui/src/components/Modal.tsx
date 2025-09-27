import React from 'react'
import Card from './Card'
import { Button } from './Button'

export default function Modal({
  title, onClose, children, footer
}: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
        <Card className="w-full rounded-2xl p-0 overflow-hidden flex flex-col max-h-full">
          {/* Fixed Header */}
          <div className="p-4 pb-0 flex items-center justify-between flex-shrink-0">
            <div className="text-white font-semibold text-lg">{title}</div>
            <button onClick={onClose} className="text-white/60 hover:text-white rounded-full p-2 bg-black/20">✕</button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 pt-2">
            {children}
          </div>
          
          {/* Fixed Footer */}
          <div className="p-4 pt-0 flex items-center justify-end gap-2 flex-shrink-0">
            {footer ?? <Button onClick={onClose}>Close</Button>}
          </div>
        </Card>
      </div>
    </div>
  )
}
