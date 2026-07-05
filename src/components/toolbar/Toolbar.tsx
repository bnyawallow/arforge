import React, { useState } from 'react';
import { Box, Play, Settings, Youtube } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { SceneObject } from '../../types';
import { ExportModal } from './ExportModal';

export function Toolbar() {
  const { objects, addObject, selectedObjectId } = useEditorStore();
  const [showExport, setShowExport] = useState(false);

  const handleAddObject = (type: SceneObject['type']) => {
    const newObj: SceneObject = {
      id: uuidv4(),
      name: `New ${type}`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {}
    };

    if (type === 'box') {
      newObj.properties = { color: '#ffffff' };
    } else if (type === 'button') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', url: 'https://example.com' };
      newObj.scale = [1, 0.3, 0.05];
    } else if (type === 'youtube') {
      newObj.properties = { videoId: 'dQw4w9WgXcQ' };
      newObj.scale = [1.6, 0.9, 1];
    }

    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    newObj.parentId = parentId || null;
    addObject(newObj, parentId || undefined);
  };

  return (
    <>
      <div className="h-14 border-b border-[#2A2A2A] bg-[#141414] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">AF</div>
            <span className="font-bold tracking-tight text-lg">ARForge <span className="text-blue-500 font-mono text-xs opacity-70">v1.0</span></span>
          </div>
          <div className="flex items-center gap-1 border-l border-[#2A2A2A] pl-6">
            <button onClick={() => handleAddObject('box')} className="p-2 hover:bg-[#1A1A1A] rounded text-[#888] hover:text-white transition-colors" title="Add Box">
              <Box size={18} />
            </button>
            <button onClick={() => handleAddObject('button')} className="p-2 hover:bg-[#1A1A1A] rounded text-[#888] hover:text-white transition-colors" title="Add Button">
              <div className="w-[18px] h-[18px] border-2 border-current rounded-sm flex items-center justify-center text-[10px] font-bold">B</div>
            </button>
            <button onClick={() => handleAddObject('youtube')} className="p-2 hover:bg-[#1A1A1A] rounded text-[#888] hover:text-white transition-colors" title="Add YouTube Video">
              <Youtube size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#1A1A1A] border border-[#333] rounded text-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Live Preview: Active
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded text-sm font-medium transition-colors">
            <Settings size={16} />
            Settings
          </button>
          <button 
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors text-white"
          >
            <Play size={16} />
            Export / Preview
          </button>
        </div>
      </div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}
