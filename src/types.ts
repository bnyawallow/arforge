export type Vector3Data = [number, number, number];

export interface SceneObject {
  id: string;
  name: string;
  type: 'group' | 'box' | 'plane' | 'sphere' | 'model' | 'text' | 'button' | 'youtube' | 'imageTarget';
  position: Vector3Data;
  rotation: Vector3Data; // Euler angles in degrees
  scale: Vector3Data;
  visible: boolean;
  children: string[]; // IDs of child objects
  parentId: string | null;
  properties: Record<string, any>;
}

export type AssetType = 'model' | 'image' | 'video' | 'script';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
}

export interface ProjectSettings {
  projectName: string;
  imageTargetName: string | null;
}

export interface EditorState {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  selectedObjectId: string | null;
  selectedObjectRef: any | null;
  settings: ProjectSettings;
  transformMode: 'translate' | 'rotate' | 'scale';
  assets: Asset[];
  
  // Actions
  addObject: (obj: SceneObject, parentId?: string) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  selectObject: (id: string | null) => void;
  updateSettings: (updates: Partial<ProjectSettings>) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  moveObject: (draggedId: string, targetId: string) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
}
