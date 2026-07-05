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
  settings: {
    appKey: '',
    projectName: 'My AR Experience',
    imageTargetSrc: null,
  },
  transformMode: 'translate',

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
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
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

  selectObject: (id) => set({ selectedObjectId: id }),

  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates }
  })),

  setTransformMode: (mode) => set({ transformMode: mode }),
}));
