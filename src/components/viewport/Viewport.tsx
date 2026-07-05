import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Text, useGLTF, useTexture } from '@react-three/drei';
import { useEditorStore } from '../../store/useEditorStore';
import { SceneObject } from '../../types';
import * as THREE from 'three';
import { Maximize, RotateCw, Move } from 'lucide-react';

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ImageTargetRenderer({ obj }: { obj: SceneObject }) {
  if (obj.properties.textureUrl) {
    return <ImageTargetWithTexture obj={obj} />;
  }
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[obj.properties.physicalWidth * 10, obj.properties.physicalWidth * 10]} />
      <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ImageTargetWithTexture({ obj }: { obj: SceneObject }) {
  const texture = useTexture(obj.properties.textureUrl);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[obj.properties.physicalWidth * 10, obj.properties.physicalWidth * 10]} />
      <meshBasicMaterial map={texture} transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ObjectRenderer({ id }: { id: string }) {
  const obj = useEditorStore(state => state.objects[id]);
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const selectObject = useEditorStore(state => state.selectObject);
  const meshRef = useRef<THREE.Group>(null);
  
  const isSelected = selectedObjectId === id;

  useEffect(() => {
    if (isSelected && meshRef.current) {
      useEditorStore.setState({ selectedObjectRef: meshRef.current });
    }
  }, [isSelected, id]);

  if (!obj || !obj.visible) return null;

  const rotation: [number, number, number] = [
    THREE.MathUtils.degToRad(obj.rotation[0]),
    THREE.MathUtils.degToRad(obj.rotation[1]),
    THREE.MathUtils.degToRad(obj.rotation[2]),
  ];

  const renderGeometry = () => {
    switch (obj.type) {
      case 'box':
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={obj.properties.color || '#ffffff'} />
          </mesh>
        );
      case 'button':
        return (
          <group>
            <mesh>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial color={obj.properties.color || '#3b82f6'} side={THREE.DoubleSide} />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {obj.properties.text || 'Button'}
            </Text>
          </group>
        );
      case 'youtube':
        return (
          <mesh>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="#ff0000" side={THREE.DoubleSide} />
          </mesh>
        );
      case 'imageTarget':
        return (
          <Suspense fallback={
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[obj.properties.physicalWidth * 10, obj.properties.physicalWidth * 10]} />
              <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          }>
            <ImageTargetRenderer obj={obj} />
          </Suspense>
        );
      case 'model':
        return obj.properties.url ? (
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#888" wireframe />
            </mesh>
          }>
            <GLTFModel url={obj.properties.url} />
          </Suspense>
        ) : (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#888" wireframe />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <group 
      ref={meshRef}
      position={obj.position}
      rotation={rotation}
      scale={obj.scale}
      onPointerDown={(e) => {
        e.stopPropagation();
        selectObject(id);
      }}
    >
      {renderGeometry()}
      {obj.children.map(childId => (
        <ObjectRenderer key={childId} id={childId} />
      ))}
    </group>
  );
}

function TransformController() {
  const target = useEditorStore(state => state.selectedObjectRef);
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const transformMode = useEditorStore(state => state.transformMode);
  const updateObject = useEditorStore(state => state.updateObject);

  const handleTransform = () => {
    if (!target || !selectedObjectId) return;
    updateObject(selectedObjectId, {
      position: [target.position.x, target.position.y, target.position.z],
      rotation: [
        THREE.MathUtils.radToDeg(target.rotation.x),
        THREE.MathUtils.radToDeg(target.rotation.y),
        THREE.MathUtils.radToDeg(target.rotation.z),
      ],
      scale: [target.scale.x, target.scale.y, target.scale.z]
    });
  };

  if (!target || !selectedObjectId) return null;

  return (
    <TransformControls
      object={target}
      mode={transformMode}
      onMouseUp={handleTransform}
    />
  );
}

export function Viewport() {
  const rootObjects = useEditorStore(state => state.rootObjects);
  const selectObject = useEditorStore(state => state.selectObject);
  const transformMode = useEditorStore(state => state.transformMode);
  const setTransformMode = useEditorStore(state => state.setTransformMode);
  const { addObject, objects } = useEditorStore();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const asset = JSON.parse(data);
      if (asset.type === 'model') {
        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
        const parentId = imageTarget ? imageTarget.id : null;
        
        const newObj: SceneObject = {
          id: crypto.randomUUID(),
          name: asset.name.split('.')[0],
          type: 'model',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          children: [],
          parentId: parentId,
          properties: {
            url: asset.url
          }
        };
        
        addObject(newObj, parentId || undefined);
      } else if (asset.type === 'image') {
        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
        if (imageTarget) {
          useEditorStore.getState().updateObject(imageTarget.id, {
            properties: {
              ...imageTarget.properties,
              textureUrl: asset.url
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="w-full h-full relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Canvas 
        camera={{ position: [5, 5, 5], fov: 50 }}
        onPointerMissed={() => selectObject(null)}
      >
        <color attach="background" args={['transparent']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Grid infiniteGrid fadeDistance={20} sectionColor="#444" cellColor="#2A2A2A" />
        <axesHelper args={[5]} />
        
        {rootObjects.map(id => (
          <ObjectRenderer key={id} id={id} />
        ))}

        <TransformController />

        <OrbitControls makeDefault />
      </Canvas>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button 
          onClick={() => setTransformMode('translate')}
          className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${transformMode === 'translate' ? 'bg-blue-600 text-white' : 'bg-[#2A2A2A] text-[#888] hover:text-white'}`}
          title="Translate (Move)"
        >
          <Move size={18} />
        </button>
        <button 
          onClick={() => setTransformMode('rotate')}
          className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${transformMode === 'rotate' ? 'bg-blue-600 text-white' : 'bg-[#2A2A2A] text-[#888] hover:text-white'}`}
          title="Rotate"
        >
          <RotateCw size={18} />
        </button>
        <button 
          onClick={() => setTransformMode('scale')}
          className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${transformMode === 'scale' ? 'bg-blue-600 text-white' : 'bg-[#2A2A2A] text-[#888] hover:text-white'}`}
          title="Scale"
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
}
