import React, { useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { Image as ImageIcon, Video, Box, FileCode, Upload, Trash2 } from 'lucide-react';
import { Asset, AssetType, SceneObject } from '../../types';

export function AssetBrowser() {
  const { assets, addAsset, removeAsset, addObject, selectedObjectId, objects } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to object URL
    const url = URL.createObjectURL(file);
    const name = file.name;
    
    let type: AssetType = 'script';
    if (name.endsWith('.glb') || name.endsWith('.gltf')) type = 'model';
    else if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';

    const asset: Asset = {
      id: uuidv4(),
      name,
      type,
      url,
    };

    addAsset(asset);
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case 'model': return <Box size={24} className="text-blue-400" />;
      case 'image': return <ImageIcon size={24} className="text-green-400" />;
      case 'video': return <Video size={24} className="text-purple-400" />;
      case 'script': return <FileCode size={24} className="text-yellow-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = (asset: Asset) => {
    // If double clicking a model, add it to scene
    if (asset.type === 'model') {
      let parentId = selectedObjectId;
      if (!parentId) {
        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
        if (imageTarget) parentId = imageTarget.id;
      }
      
      const newObj: SceneObject = {
        id: uuidv4(),
        name: asset.name.split('.')[0],
        type: 'model',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentId || null,
        properties: {
          url: asset.url
        }
      };
      
      addObject(newObj, parentId || undefined);
    }
  };

  return (
    <div className="h-48 border-t border-[#2A2A2A] bg-[#111] flex flex-col">
      <div className="h-8 border-b border-[#2A2A2A] bg-[#1A1A1A] flex items-center px-4 justify-between">
        <span className="text-xs font-semibold text-[#888]">Assets</span>
        <button 
          onClick={handleUploadClick}
          className="p-1 hover:bg-[#2A2A2A] rounded text-[#888] hover:text-white transition-colors"
          title="Upload Asset"
        >
          <Upload size={14} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".glb,.gltf,image/*,video/*,.js"
          onChange={handleFileChange}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-4 content-start">
        {assets.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#555] gap-2">
            <Upload size={32} />
            <p className="text-sm">No assets yet. Click upload to add some.</p>
          </div>
        ) : (
          assets.map(asset => (
            <div 
              key={asset.id}
              draggable
              onDragStart={(e) => handleDragStart(e, asset)}
              onDoubleClick={() => handleDoubleClick(asset)}
              className="w-24 h-24 bg-[#1A1A1A] border border-[#2A2A2A] rounded flex flex-col items-center justify-center gap-2 p-2 cursor-pointer hover:border-blue-500 hover:bg-[#222] transition-colors group relative"
              title={asset.name}
            >
              {asset.type === 'image' ? (
                <img src={asset.url} alt={asset.name} className="w-10 h-10 object-cover rounded" />
              ) : (
                getIcon(asset.type)
              )}
              <span className="text-[10px] text-[#888] text-center w-full truncate group-hover:text-white">
                {asset.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAsset(asset.id);
                }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
