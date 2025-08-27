import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingBooks = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* Book 1 */}
      <mesh position={[-0.8, 0, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[1.2, 1.6, 0.2]} />
        <meshBasicMaterial color="#4285f4" />
      </mesh>

      {/* Book 2 */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[1.2, 1.6, 0.2]} />
        <meshBasicMaterial color="#34a853" />
      </mesh>

      {/* Book 3 */}
      <mesh position={[0.8, -0.2, 0]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[1.2, 1.6, 0.2]} />
        <meshBasicMaterial color="#ea4335" />
      </mesh>
    </group>
  );
};

export default FloatingBooks;
