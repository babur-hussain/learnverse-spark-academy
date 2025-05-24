import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import FloatingComputer from './FloatingComputer';
import FloatingBooks from './FloatingBooks';
import ProgrammingLogos from './ProgrammingLogos';
import StudyMaterials from './StudyMaterials';

interface Scene3DProps {
  model: 'computer' | 'books' | 'programming' | 'materials';
  className?: string;
}

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#4285f4" />
  </mesh>
);

const Scene3D: React.FC<Scene3DProps> = ({ model, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset error state when model changes
    setHasError(false);
    setIsLoading(true);
  }, [model]);

  const renderModel = () => {
    try {
      switch (model) {
        case 'computer':
          return <FloatingComputer />;
        case 'books':
          return <FloatingBooks />;
        case 'programming':
          return <ProgrammingLogos />;
        case 'materials':
          return <StudyMaterials />;
        default:
          return <FloatingComputer />;
      }
    } catch (error) {
      console.error('Error rendering 3D model:', error);
      setHasError(true);
      return null;
    }
  };

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 mb-2">Unable to load 3D content</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: true,
          preserveDrawingBuffer: true,
          stencil: false,
          depth: true
        }}
        style={{ background: 'transparent' }}
        onError={(error) => {
          console.error('Canvas error:', error);
          setHasError(true);
        }}
        onCreated={() => setIsLoading(false)}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          {renderModel()}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            dampingFactor={0.05}
            rotateSpeed={0.5}
          />
          <Preload all />
        </Suspense>
      </Canvas>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading 3D Model...</div>
        </div>
      )}
    </div>
  );
};

export default Scene3D;
