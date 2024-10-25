import React, { useState, useEffect, useRef } from 'react';
const RotatingTorus = () => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [rotationSpeed, setRotationSpeed] = useState({ x: 0, y: 0, z: 0 });
  const [speed, setSpeed] = useState(0.05);
  const animationRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const torusParams = {
      R: 1.5,
      r: 0.5,
      segments: 64,
      slices: 64,
    };
    const project = (x, y, z) => {
      const fov = 200;
      return {
        x: x * fov / (z + 5) + canvas.width / 2,
        y: y * fov / (z + 5) + canvas.height / 2,
      };
    };
    const rotatePoint = (x, y, z, rotation) => {
      const { x: rx, y: ry, z: rz } = rotation;
      let temp = y;
      y = y * Math.cos(rx) - z * Math.sin(rx);
      z = temp * Math.sin(rx) + z * Math.cos(rx);
      temp = x;
      x = x * Math.cos(ry) + z * Math.sin(ry);
      z = -temp * Math.sin(ry) + z * Math.cos(ry);
      temp = x;
      x = x * Math.cos(rz) - y * Math.sin(rz);
      y = temp * Math.sin(rz) + y * Math.cos(rz);
      return { x, y, z };
    };
    const renderTorus = (rotation) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#00FFFF';
      for (let i = 0; i < torusParams.segments; i++) {
        const theta = (i / torusParams.segments) * Math.PI * 2;
        for (let j = 0; j < torusParams.slices; j++) {
          const phi = (j / torusParams.slices) * Math.PI * 2;
          const x = (torusParams.R + torusParams.r * Math.cos(phi)) * Math.cos(theta);
          const y = (torusParams.R + torusParams.r * Math.cos(phi)) * Math.sin(theta);
          const z = torusParams.r * Math.sin(phi);
          const rotated = rotatePoint(x, y, z, rotation);
          const projected = project(rotated.x, rotated.y, rotated.z);
          if (j === 0) {
            ctx.beginPath();
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }
    };
    const animate = () => {
      setRotation(prevRotation => ({
        x: prevRotation.x + rotationSpeed.x * speed,
        y: prevRotation.y + rotationSpeed.y * speed,
        z: prevRotation.z + rotationSpeed.z * speed,
      }));
      renderTorus(rotation);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [speed, rotation, rotationSpeed]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft':
          setRotationSpeed({ x: 0, y: -1, z: 0 });
          break;
        case 'ArrowRight':
          setRotationSpeed({ x: 0, y: 1, z: 0 });
          break;
        case 'ArrowUp':
          setRotationSpeed({ x: -1, y: 0, z: 0 });
          break;
        case 'ArrowDown':
          setRotationSpeed({ x: 1, y: 0, z: 0 });
          break;
        case '[':
          setSpeed(prev => Math.max(0.01, prev - 0.01));
          break;
        case ']':
          setSpeed(prev => Math.min(0.1, prev + 0.01));
          break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          setRotationSpeed({ x: 0, y: 0, z: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-2 border-cyan-500"
      />
      <div className="mt-4 text-cyan-500">
        <p>Hold arrow keys to rotate the torus</p>
        <p>Use [ and ] to decrease/increase rotation speed</p>
        <p>Current speed: {speed.toFixed(2)}</p>
      </div>
    </div>
  );
};
export default RotatingTorus;
