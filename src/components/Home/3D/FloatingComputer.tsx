<<<<<<< HEAD
=======

>>>>>>> main
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingComputer = () => {
  const groupRef = useRef<THREE.Group>(null);
<<<<<<< HEAD
  const materials = useMemo(() => ({
    screen: new THREE.MeshStandardMaterial({ 
      color: '#1a1a1a',
      roughness: 0.2,
      metalness: 0.8
=======
  
  const materials = useMemo(() => ({
    screen: new THREE.MeshStandardMaterial({ 
      color: '#1a1a1a',
      roughness: 0.1,
      metalness: 0.9,
      envMapIntensity: 0.5
>>>>>>> main
    }),
    glow: new THREE.MeshStandardMaterial({
      color: '#4285f4',
      emissive: '#4285f4',
<<<<<<< HEAD
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
=======
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6
    }),
    base: new THREE.MeshStandardMaterial({
      color: '#f0f0f0',
      roughness: 0.3,
      metalness: 0.1
    }),
    stand: new THREE.MeshStandardMaterial({
      color: '#333',
      roughness: 0.2,
      metalness: 0.8
    }),
    keyboard: new THREE.MeshStandardMaterial({
      color: '#fafafa',
      roughness: 0.4,
      metalness: 0.05
>>>>>>> main
    })
  }), []);

  useFrame((state) => {
    if (groupRef.current) {
<<<<<<< HEAD
      // Smooth floating animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      
      // Subtle scale animation
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
=======
      const time = state.clock.elapsedTime;
      
      // Smooth floating animation
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
      groupRef.current.position.y = Math.sin(time * 0.4) * 0.2;
      
      // Gentle scale breathing effect
      const scale = 0.85 + Math.sin(time * 0.6) * 0.03;
>>>>>>> main
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
<<<<<<< HEAD
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Screen */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.8, 0.1]} />
        <primitive object={materials.screen} />
      </mesh>
      
      {/* Screen glow */}
      <mesh position={[0, 0.5, 0.06]} castShadow>
        <boxGeometry args={[2.3, 1.6, 0.05]} />
=======
    <group ref={groupRef} position={[0, 0, 0]} castShadow receiveShadow>
      {/* Screen */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.8, 0.08]} />
        <primitive object={materials.screen} />
      </mesh>
      
      {/* Screen glow effect */}
      <mesh position={[0, 0.5, 0.06]} castShadow>
        <boxGeometry args={[2.3, 1.6, 0.02]} />
>>>>>>> main
        <primitive object={materials.glow} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -0.9, 0]} castShadow receiveShadow>
<<<<<<< HEAD
        <boxGeometry args={[2.8, 0.2, 1.2]} />
=======
        <boxGeometry args={[2.8, 0.15, 1.2]} />
>>>>>>> main
        <primitive object={materials.base} />
      </mesh>
      
      {/* Stand */}
      <mesh position={[0, -0.6, 0]} castShadow>
<<<<<<< HEAD
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
=======
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <primitive object={materials.stand} />
      </mesh>
      
      {/* Stand base */}
      <mesh position={[0, -0.82, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
>>>>>>> main
        <primitive object={materials.stand} />
      </mesh>
      
      {/* Keyboard */}
<<<<<<< HEAD
      <mesh position={[0, -1.15, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.1, 0.8]} />
=======
      <mesh position={[0, -1.1, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.08, 0.8]} />
        <primitive object={materials.keyboard} />
      </mesh>
      
      {/* Mouse */}
      <mesh position={[1.2, -1.05, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.05, 0.25]} />
>>>>>>> main
        <primitive object={materials.keyboard} />
      </mesh>
    </group>
  );
};

export default FloatingComputer;
