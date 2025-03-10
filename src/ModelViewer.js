import React, { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useProgress, Environment, Html } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";


function LoadingIndicator() {
const { progress } = useProgress();
return (
<Html center>
<div className="loading-overlay">
<div className="loader"></div>
<div className="loading-text">Loading model: {progress.toFixed(0)}%</div>
</div>
</Html>
);
}


function ModelMesh({ geometry }) {
const meshRef = useRef();

useEffect(() => {
if (meshRef.current && geometry) {

geometry.computeBoundingBox();
const center = new THREE.Vector3();
geometry.boundingBox.getCenter(center);
geometry.translate(-center.x, -center.y, -center.z);


 
  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere.radius;
  const scale = 2 / radius;
  
  meshRef.current.scale.set(scale, scale, scale);
}
}, [geometry]);

return (
<mesh ref={meshRef} castShadow receiveShadow>
<primitive object={geometry} attach="geometry" />
<meshStandardMaterial 
  color="#60a5fa" 
  roughness={0.3} 
  metalness={0.4} 
  envMapIntensity={1.0} 
  clearcoat={0.1} 
  clearcoatRoughness={0.1} 
/>
</mesh>
);
}


function STLModel({ url }) {
const geometry = useLoader(STLLoader, url);
return <ModelMesh geometry={geometry} />;
}

function OBJModel({ url }) {
const obj = useLoader(OBJLoader, url);
return (
<primitive object={obj} scale={2} castShadow receiveShadow />
);
}


function Scene({ modelUrl, fileName }) {
const isSTL = fileName?.toLowerCase().endsWith(".stl");
const isOBJ = fileName?.toLowerCase().endsWith(".obj");

return (
<>

<ambientLight intensity={0.4} />
<directionalLight position={[10, 10, 5]} intensity={0.7} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
<directionalLight position={[-10, -10, -5]} intensity={0.3} />
<spotLight position={[0, 10, 10]} intensity={0.5} castShadow />

  
  <Environment preset="night" />
  
 
  <OrbitControls 
    enableDamping 
    dampingFactor={0.25}
    rotateSpeed={0.7}
    zoomSpeed={0.8}
  />
  
  
  <gridHelper 
    args={[20, 20, "#304050", "#202530"]} 
    position={[0, -0.01, 0]} 
    rotation={[Math.PI/2, 0, 0]}
  />
  
  
  {isSTL && <STLModel url={modelUrl} />}
  {isOBJ && <OBJModel url={modelUrl} />}
</>
);
}


function ErrorMessage({ message }) {
return (
<Html center>
<div style={{
background: "rgba(0,0,0,0.7)",
color: "#ef4444",
padding: "20px",
borderRadius: "8px",
maxWidth: "80%",
textAlign: "center"
}}>
Error: {message}
</div>
</Html>
);
}

function ModelViewer({ modelUrl, fileName }) {
const [error, setError] = useState(null);


if (!modelUrl || !fileName) {
return (
<div className="model-viewer-container">
<div className="center-content">
<div>No model specified</div>
</div>
</div>
);
}


const isSTL = fileName.toLowerCase().endsWith(".stl");
const isOBJ = fileName.toLowerCase().endsWith(".obj");

if (!isSTL && !isOBJ) {
return (
<div className="model-viewer-container">
<div className="center-content">
<div style={{ color: "#ef4444" }}>Error: Unsupported file type: {fileName}</div>
</div>
</div>
);
}


const handleError = (e) => {
console.error("❌ Error loading model:", e);
setError(new Error(`loading model: ${e.message}`));
};

return (
<div className="model-viewer-container">
<Canvas
shadows
camera={{ position:[0, 2, 10], fov: 45 }}
style={{ background: "linear-gradient(to bottom, #1e293b, #0f172a)" }}
onError={handleError}
>
{error ? (
<ErrorMessage message={error} />
) : (
<Suspense fallback={<LoadingIndicator />}>
<Scene modelUrl={modelUrl} fileName={fileName} />
</Suspense>
)}
</Canvas>
</div>
);
}

export default ModelViewer;