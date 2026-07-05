import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { ChevronRight, ChevronDown, Box, Image as ImageIcon, Link2, Type, Youtube } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SceneObject } from '../../types';

export function HierarchyPanel() {
  const { objects, rootObjects, selectedObjectId, selectObject } = useEditorStore();

  const renderItem = (id: string, depth = 0) => {
    const obj = objects[id];
    if (!obj) return null;

    const isSelected = selectedObjectId === id;
    const hasChildren = obj.children.length > 0;

    let Icon = Box;
    if (obj.type === 'imageTarget') Icon = ImageIcon;
    else if (obj.type === 'youtube') Icon = Youtube;
    else if (obj.type === 'button') Icon = Link2;
    else if (obj.type === 'text') Icon = Type;

    return (
      <div key={id}>
        <div 
          className={cn(
            "flex items-center gap-2 p-2 cursor-pointer text-[11px] font-mono select-none border-l-2",
            isSelected ? "bg-blue-900/30 border-blue-500 text-white" : "border-transparent text-[#666] hover:bg-[#1A1A1A]"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => selectObject(id)}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren && <ChevronDown size={14} />}
          </div>
          <Icon size={14} className={isSelected ? "text-[#FFD93D]" : "text-[#666]"} />
          <span className="truncate">{obj.name}</span>
        </div>
        {obj.children.map(childId => renderItem(childId, depth + 1))}
      </div>
    );
  };

  return (
    <aside className="w-60 border-r border-[#2A2A2A] flex flex-col bg-[#141414] shrink-0">
      <div className="p-3 border-b border-[#2A2A2A] flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Hierarchy</span>
        <span className="text-xl font-light text-[#666] leading-none">+</span>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {rootObjects.map(id => renderItem(id))}
      </div>
    </aside>
  );
}
