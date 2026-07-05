import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Trash2 } from 'lucide-react';
import { Vector3Data } from '../../types';

export function InspectorPanel() {
  const { objects, selectedObjectId, updateObject, removeObject, selectObject } = useEditorStore();

  if (!selectedObjectId || !objects[selectedObjectId]) {
    return (
      <aside className="w-72 border-l border-[#2A2A2A] bg-[#141414] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#2A2A2A]">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Inspector</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-[#666]">
          No object selected
        </div>
      </aside>
    );
  }

  const obj = objects[selectedObjectId];

  const handleVectorChange = (prop: 'position' | 'rotation' | 'scale', index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newVec = [...obj[prop]] as Vector3Data;
    newVec[index] = numValue;
    updateObject(selectedObjectId, { [prop]: newVec });
  };

  const handlePropertyChange = (key: string, value: any) => {
    updateObject(selectedObjectId, {
      properties: { ...obj.properties, [key]: value }
    });
  };

  const handleDelete = () => {
    removeObject(selectedObjectId);
  };

  return (
    <aside className="w-72 border-l border-[#2A2A2A] bg-[#141414] flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-[#2A2A2A] flex items-center justify-between shrink-0">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Inspector</span>
        {obj.type !== 'imageTarget' && (
          <button onClick={handleDelete} className="text-red-400 hover:text-red-300">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Entity Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F1F1F] rounded flex items-center justify-center border border-[#333] text-blue-400">
            <div className="font-mono text-lg">◈</div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <input 
              type="text" 
              value={obj.name}
              onChange={(e) => updateObject(selectedObjectId, { name: e.target.value })}
              className="bg-transparent text-xs font-bold text-white border-b border-transparent focus:border-blue-500 outline-none w-full"
            />
            <div className="text-[10px] text-[#666] font-mono capitalize">{obj.type}</div>
          </div>
        </div>

        {/* Transform Component */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#888] uppercase">Transform</span>
            <span className="text-[#444]">⋮</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
            <span className="text-[#666] flex items-center">POS</span>
            <input type="number" step="1" value={obj.position[0]} onChange={(e) => handleVectorChange('position', 0, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-red-400 outline-none focus:border-blue-500" />
            <input type="number" step="1" value={obj.position[1]} onChange={(e) => handleVectorChange('position', 1, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-green-400 outline-none focus:border-blue-500" />
            <input type="number" step="1" value={obj.position[2]} onChange={(e) => handleVectorChange('position', 2, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-blue-400 outline-none focus:border-blue-500" />

            <span className="text-[#666] flex items-center">ROT</span>
            <input type="number" step="1" value={obj.rotation[0]} onChange={(e) => handleVectorChange('rotation', 0, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-white outline-none focus:border-blue-500" />
            <input type="number" step="1" value={obj.rotation[1]} onChange={(e) => handleVectorChange('rotation', 1, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-white outline-none focus:border-blue-500" />
            <input type="number" step="1" value={obj.rotation[2]} onChange={(e) => handleVectorChange('rotation', 2, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-white outline-none focus:border-blue-500" />

            <span className="text-[#666] flex items-center">SCL</span>
            <input type="number" step="0.1" value={obj.scale[0]} onChange={(e) => handleVectorChange('scale', 0, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-white outline-none focus:border-blue-500" />
            <input type="number" step="0.1" value={obj.scale[1]} onChange={(e) => handleVectorChange('scale', 1, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-white outline-none focus:border-blue-500" />
            <input type="number" step="0.1" value={obj.scale[2]} onChange={(e) => handleVectorChange('scale', 2, e.target.value)} className="bg-[#0A0A0A] p-1 rounded border border-[#2A2A2A] text-center text-white outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Specific Properties */}
        {Object.keys(obj.properties).length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-[#888] uppercase">Properties</span>
            <div className="flex flex-col gap-3">
              {Object.entries(obj.properties).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#888] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  {typeof value === 'boolean' ? (
                    <input 
                      type="checkbox" 
                      checked={value}
                      onChange={(e) => handlePropertyChange(key, e.target.checked)}
                      className="accent-blue-500 self-start"
                    />
                  ) : key.toLowerCase().includes('color') ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={value}
                        onChange={(e) => handlePropertyChange(key, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-[#0A0A0A] border border-[#2A2A2A]"
                      />
                      <input 
                        type="text" 
                        value={value}
                        onChange={(e) => handlePropertyChange(key, e.target.value)}
                        className="bg-[#0A0A0A] text-[10px] p-2 rounded flex-1 border border-[#2A2A2A] outline-none font-mono text-white focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <input 
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value}
                      onChange={(e) => handlePropertyChange(key, typeof value === 'number' ? parseFloat(e.target.value) : e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#2A2A2A] focus:border-blue-500 text-white outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
