import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingComputer = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* Screen */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.5, 1.8, 0.1]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Screen glow */}
      <mesh position={[0, 0.5, 0.06]}>
        <boxGeometry args={[2.3, 1.6, 0.05]} />
        <meshBasicMaterial color="#4285f4" transparent opacity={0.3} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[2.8, 0.2, 1.2]} />
        <meshBasicMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Stand */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      
      {/* Keyboard */}
      <mesh position={[0, -1.15, 0.5]}>
        <boxGeometry args={[2.2, 0.1, 0.8]} />
        <meshBasicMaterial color="#f5f5f5" />
      </mesh>
    </group>
  );
};

export default FloatingComputer;
