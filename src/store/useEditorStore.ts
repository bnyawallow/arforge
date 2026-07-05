import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, SceneObject } from '../types';

const initialImageTargetId = uuidv4();

const defaultScene: Record<string, SceneObject> = {
  [initialImageTargetId]: {
    id: initialImageTargetId,
    name: 'Image Target',
    type: 'imageTarget',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    children: [],
    parentId: null,
    properties: {
      physicalWidth: 0.1, // 10cm default
    }
  }
};

export const useEditorStore = create<EditorState>((set) => ({
  objects: defaultScene,
  rootObjects: [initialImageTargetId],
  selectedObjectId: null,
  selectedObjectRef: null,
  settings: {
    projectName: 'My AR Experience',
    imageTargetName: null,
  },
  transformMode: 'translate',
  assets: [],

  addObject: (obj, parentId) => set((state) => {
    const newObjects = { ...state.objects, [obj.id]: obj };
    let newRootObjects = [...state.rootObjects];

    if (parentId && newObjects[parentId]) {
      newObjects[parentId] = {
        ...newObjects[parentId],
        children: [...newObjects[parentId].children, obj.id]
      };
      newObjects[obj.id].parentId = parentId;
    } else {
      newRootObjects.push(obj.id);
    }

    return { objects: newObjects, rootObjects: newRootObjects };
  }),

  removeObject: (id) => set((state) => {
    const newObjects = { ...state.objects };
    const objToRemove = newObjects[id];
    if (!objToRemove) return state;

    // Remove from parent
    if (objToRemove.parentId && newObjects[objToRemove.parentId]) {
      newObjects[objToRemove.parentId] = {
        ...newObjects[objToRemove.parentId],
        children: newObjects[objToRemove.parentId].children.filter(childId => childId !== id)
      };
    }

    // Recursively remove children
    const removeRecursive = (targetId: string) => {
      const target = newObjects[targetId];
      if (target) {
        target.children.forEach(removeRecursive);
        delete newObjects[targetId];
      }
    };
    removeRecursive(id);

    return {
      objects: newObjects,
      rootObjects: state.rootObjects.filter(rootId => rootId !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
      selectedObjectRef: state.selectedObjectId === id ? null : state.selectedObjectRef
    };
  }),

  updateObject: (id, updates) => set((state) => {
    if (!state.objects[id]) return state;
    return {
      objects: {
        ...state.objects,
        [id]: { ...state.objects[id], ...updates }
      }
    };
  }),

  selectObject: (id) => set((state) => ({ 
    selectedObjectId: id,
    selectedObjectRef: state.selectedObjectId === id ? state.selectedObjectRef : null 
  })),

  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates }
  })),

  setTransformMode: (mode) => set({ transformMode: mode }),

  moveObject: (draggedId, targetId) => set((state) => {
    const newObjects = { ...state.objects };
    const draggedObj = newObjects[draggedId];
    const targetObj = newObjects[targetId];

    if (!draggedObj || !targetObj) return state;
    if (draggedId === targetId) return state;

    // Prevent cyclic drops
    let current = targetObj;
    while (current.parentId) {
      if (current.parentId === draggedId) return state;
      current = newObjects[current.parentId];
    }

    // Remove from old parent
    if (draggedObj.parentId && newObjects[draggedObj.parentId]) {
      newObjects[draggedObj.parentId] = {
        ...newObjects[draggedObj.parentId],
        children: newObjects[draggedObj.parentId].children.filter(id => id !== draggedId)
      };
    }

    let newRootObjects = [...state.rootObjects];
    if (!draggedObj.parentId) {
       newRootObjects = newRootObjects.filter(id => id !== draggedId);
    }

    // Add to new parent
    if (!newObjects[targetId].children.includes(draggedId)) {
      newObjects[targetId] = {
        ...newObjects[targetId],
        children: [...newObjects[targetId].children, draggedId]
      };
    }

    newObjects[draggedId] = {
      ...newObjects[draggedId],
      parentId: targetId
    };

    return { objects: newObjects, rootObjects: newRootObjects };
  }),

  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, asset]
  })),

  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter(a => a.id !== id)
  })),
}));
