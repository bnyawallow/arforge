import React from 'react';
import { Toolbar } from '../toolbar/Toolbar';
import { HierarchyPanel } from '../hierarchy/HierarchyPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { Viewport } from '../viewport/Viewport';

export function EditorLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#0F0F0F] text-[#E0E0E0] font-sans overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <HierarchyPanel />
        <div className="flex-1 relative bg-[#1E1E1E]">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#666 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <Viewport />
        </div>
        <InspectorPanel />
      </div>
    </div>
  );
}
