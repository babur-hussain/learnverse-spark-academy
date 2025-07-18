
import React, { Suspense, useState, useEffect, useCallback } from 'react';
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

const ErrorFallback = () => (
  <mesh>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshStandardMaterial color="#ef4444" />
  </mesh>
);

const Scene3D: React.FC<Scene3DProps> = ({ model, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [model]);

  const handleError = useCallback((error: any) => {
    console.error('3D Scene error:', error);
    setHasError(true);
    setIsLoading(false);
  }, []);

  const renderModel = useCallback(() => {
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
      handleError(error);
      return <ErrorFallback />;
    }
  }, [model, handleError]);

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg`}>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">3D content unavailable</p>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        style={{ background: 'transparent' }}
        onError={handleError}
        onCreated={() => setIsLoading(false)}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          {renderModel()}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={1}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            dampingFactor={0.05}
            rotateSpeed={0.5}
          />
          <Preload all />
        </Suspense>
      </Canvas>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Loading 3D...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scene3D;
