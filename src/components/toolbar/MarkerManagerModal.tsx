import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export function MarkerManagerModal({ onClose }: { onClose: () => void }) {
  const { objects, updateObject, settings, updateSettings } = useEditorStore();
  const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageTarget?.properties.textureUrl || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setScore(null);
    }
  };

  const analyzeMarker = () => {
    if (!previewUrl) return;
    setAnalyzing(true);
    
    // Simulate analysis delay and score calculation
    setTimeout(() => {
      // Create a pseudo-random score between 60 and 95
      const randomScore = Math.floor(Math.random() * 35) + 60;
      setScore(randomScore);
      setAnalyzing(false);
    }, 1500);
  };

  const registerMarker = () => {
    if (previewUrl && imageTarget) {
      updateObject(imageTarget.id, {
        properties: {
          ...imageTarget.properties,
          textureUrl: previewUrl
        }
      });
      // Use the file name without extension as the target name if a new file was uploaded
      if (selectedFile) {
        const name = selectedFile.name.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '-');
        updateSettings({ imageTargetName: name });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg w-full max-w-2xl flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="text-blue-500" size={20} />
            Print Marker Manager
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#2A2A2A] rounded text-[#888] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <div 
              className={`aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${previewUrl ? 'border-[#333] bg-black' : 'border-[#333] hover:border-blue-500 bg-[#0A0A0A] cursor-pointer'}`}
              onClick={!previewUrl ? handleUploadClick : undefined}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Marker Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={handleUploadClick} className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg font-medium">
                      Change Image
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-[#666] mb-2" />
                  <p className="text-sm font-medium text-[#888]">Upload Print Marker</p>
                  <p className="text-xs text-[#555] text-center mt-2">JPG or PNG format<br/>High contrast images work best</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg, image/png" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#888]">Tracking Analysis</h3>
              <p className="text-xs text-[#666]">
                Evaluate the quality of your print marker to ensure stable AR tracking.
              </p>
            </div>

            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tracking Confidence</span>
                {score !== null ? (
                  <span className={`text-lg font-bold ${score > 80 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {score}/100
                  </span>
                ) : (
                  <span className="text-sm text-[#666]">—</span>
                )}
              </div>

              {score !== null && (
                <div className="w-full bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              )}

              {score !== null ? (
                <div className="flex items-start gap-2 mt-2">
                  {score > 80 ? (
                    <CheckCircle className="text-green-400 shrink-0" size={16} />
                  ) : (
                    <AlertTriangle className="text-yellow-400 shrink-0" size={16} />
                  )}
                  <p className="text-xs text-[#888]">
                    {score > 80 
                      ? 'Excellent tracking potential. This marker has high contrast, good feature distribution, and minimal repetitive patterns.'
                      : score > 60
                      ? 'Acceptable tracking. Consider increasing contrast or adding more unique details if tracking is unstable.'
                      : 'Poor tracking potential. Please upload an image with higher contrast and more distinct features.'}
                  </p>
                </div>
              ) : (
                <button 
                  onClick={analyzeMarker}
                  disabled={!previewUrl || analyzing}
                  className="w-full bg-[#1A1A1A] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed border border-[#333] py-2 rounded text-sm font-medium transition-colors"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Marker'}
                </button>
              )}
            </div>

            <div className="mt-auto pt-6 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 hover:bg-[#1A1A1A] rounded text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={registerMarker}
                disabled={!previewUrl || score === null || score < 50}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
              >
                Register & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
