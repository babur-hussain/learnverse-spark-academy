import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ProgrammingLogos = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* React Logo */}
      <mesh position={[-1.5, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="#61dafb" />
      </mesh>

      {/* JavaScript Logo */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 0.1]} />
        <meshBasicMaterial color="#f7df1e" />
      </mesh>

      {/* Python Logo */}
      <mesh position={[1.5, 0, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#3776ab" />
      </mesh>
      
      {/* Node.js */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshBasicMaterial color="#68a063" />
      </mesh>
      
      {/* TypeScript */}
      <mesh position={[1.4, 1.4, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.7, 0.7, 0.1]} />
        <meshBasicMaterial color="#3178c6" />
      </mesh>
      
      {/* CSS */}
      <mesh position={[-1.4, 1.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.7, 0.7, 0.1]} />
        <meshBasicMaterial color="#1572b6" />
      </mesh>
      
      {/* HTML */}
      <mesh position={[1.4, -1.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.7, 0.7, 0.1]} />
        <meshBasicMaterial color="#e34f26" />
      </mesh>
      
      {/* Git */}
      <mesh position={[-1.4, -1.4, 0]}>
        <sphereGeometry args={[0.35]} />
        <meshBasicMaterial color="#f05032" />
      </mesh>
    </group>
  );
};

export default ProgrammingLogos;
