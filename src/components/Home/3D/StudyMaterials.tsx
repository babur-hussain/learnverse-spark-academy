import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StudyMaterials = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* Notebook */}
      <mesh position={[-1, 0, 0]}>
        <boxGeometry args={[1.2, 1.6, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Pencil */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>

      {/* Calculator */}
      <mesh position={[1, -0.2, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.1]} />
        <meshBasicMaterial color="#333333" />
      </mesh>

      {/* Globe */}
      <mesh position={[0, -0.8, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial color="#4a90e2" />
      </mesh>
    </group>
  );
};

export default StudyMaterials;
