import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingComputer = () => {
  const groupRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => ({
    screen: new THREE.MeshStandardMaterial({ 
      color: '#1a1a1a',
      roughness: 0.2,
      metalness: 0.8
    }),
    glow: new THREE.MeshStandardMaterial({
      color: '#4285f4',
      emissive: '#4285f4',
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.3
    }),
    base: new THREE.MeshStandardMaterial({
      color: '#e0e0e0',
      roughness: 0.5,
      metalness: 0.2
    }),
    stand: new THREE.MeshStandardMaterial({
      color: '#333',
      roughness: 0.3,
      metalness: 0.7
    }),
    keyboard: new THREE.MeshStandardMaterial({
      color: '#f5f5f5',
      roughness: 0.4,
      metalness: 0.1
    })
  }), []);

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth floating animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      
      // Subtle scale animation
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Screen */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.8, 0.1]} />
        <primitive object={materials.screen} />
      </mesh>
      
      {/* Screen glow */}
      <mesh position={[0, 0.5, 0.06]} castShadow>
        <boxGeometry args={[2.3, 1.6, 0.05]} />
        <primitive object={materials.glow} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.2, 1.2]} />
        <primitive object={materials.base} />
      </mesh>
      
      {/* Stand */}
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <primitive object={materials.stand} />
      </mesh>
      
      {/* Keyboard */}
      <mesh position={[0, -1.15, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.1, 0.8]} />
        <primitive object={materials.keyboard} />
      </mesh>
    </group>
  );
};

export default FloatingComputer;
