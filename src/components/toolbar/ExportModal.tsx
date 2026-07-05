import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { X, Copy, Check, Download, ExternalLink } from 'lucide-react';
import { SceneObject } from '../../types';

export function ExportModal({ onClose }: { onClose: () => void }) {
  const { objects, rootObjects, settings, updateSettings } = useEditorStore();
  const [copied, setCopied] = useState(false);

  const generateAFrameScene = () => {
    let entitiesHtml = '';

    const buildEntity = (id: string, depth = 0): string => {
      const obj = objects[id];
      if (!obj || !obj.visible) return '';

      const indent = '  '.repeat(depth + 3);
      let entity = `${indent}<a-entity id="${obj.id}" position="${obj.position.join(' ')}" rotation="${obj.rotation.join(' ')}" scale="${obj.scale.join(' ')}">\n`;

      if (obj.type === 'box') {
        entity += `${indent}  <a-box color="${obj.properties.color}"></a-box>\n`;
      } else if (obj.type === 'button') {
        entity += `${indent}  <a-box color="${obj.properties.color}" class="clickable" xrextras-haptics onclick="window.open('${obj.properties.url}', '_blank')"></a-box>\n`;
      } else if (obj.type === 'youtube') {
        // Simple representation for export, normally needs a custom component
        entity += `${indent}  <a-plane color="#ff0000" material="src: url(https://img.youtube.com/vi/${obj.properties.videoId}/0.jpg)"></a-plane>\n`;
      }

      for (const childId of obj.children) {
        entity += buildEntity(childId, depth + 1);
      }

      entity += `${indent}</a-entity>\n`;
      return entity;
    };

    rootObjects.forEach(id => {
      const obj = objects[id];
      if (obj && obj.type === 'imageTarget') {
        entitiesHtml += `      <a-entity mindar-image-target="targetIndex: 0">\n`;
        obj.children.forEach(childId => {
          entitiesHtml += buildEntity(childId, 2);
        });
        entitiesHtml += `      </a-entity>\n`;
      } else if (obj && obj.type !== 'imageTarget') {
        entitiesHtml += buildEntity(id, 1);
      }
    });

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>${settings.projectName} - ARForge</title>
    <!-- A-Frame -->
    <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
    <!-- MindAR for A-Frame -->
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js"></script>
  </head>
  <body>
    <a-scene
      mindar-image="imageTargetSrc: ${settings.imageTargetSrc || 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/image-tracking/assets/card-example/card.mind'};"
      color-space="sRGB"
      renderer="colorManagement: true, physicallyCorrectLights"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false">
      
      <a-camera position="0 0 0" look-controls="enabled: false" raycaster="objects: .clickable" cursor="fuse: false; rayOrigin: mouse;"></a-camera>
      
      <a-light type="directional" intensity="0.5" position="1 1 1"></a-light>
      <a-light type="ambient" intensity="1"></a-light>

${entitiesHtml}
    </a-scene>
  </body>
</html>`;

    return html;
  };

  const htmlContent = generateAFrameScene();

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h2 className="text-sm font-bold tracking-widest uppercase text-white">Export AR Experience</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#1A1A1A] rounded text-[#888] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#888]">Project Name</label>
                <input 
                  type="text" 
                  value={settings.projectName}
                  onChange={(e) => updateSettings({ projectName: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#888]">MindAR Target URL (.mind)</label>
                <input 
                  type="text" 
                  value={settings.imageTargetSrc || ''}
                  placeholder="Leave empty for default card.mind"
                  onChange={(e) => updateSettings({ imageTargetSrc: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Generated HTML</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded text-[10px] uppercase font-bold transition-colors text-white"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-[10px] uppercase font-bold transition-colors text-white"
                >
                  <Download size={14} />
                  Download HTML
                </button>
              </div>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-[#E0E0E0] font-mono">
                {htmlContent}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
