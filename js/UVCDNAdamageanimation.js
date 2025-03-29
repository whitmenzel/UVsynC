import React, { useState, useEffect, useRef } from 'react';

const UVCDNADamageAnimation = () => {
  const [exposureTime, setExposureTime] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const animationStepRef = useRef(0);
  
  // DNA parameters
  const dnaParams = {
    basePairs: 12,         // Number of base pairs to display
    damageThreshold: 30,   // Exposure time threshold before damage begins
    completeDamage: 100,   // Exposure time for maximum damage
    dimerFormationRate: 2, // Rate at which dimers form with exposure
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions with higher resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Helper function to get colors
    const getColor = (isDamaged, damageLevel = 0) => {
      if (!isDamaged) return '#61dafb'; // Cyan-blue for normal DNA
      
      // Return color based on damage level (0-1)
      const r = Math.floor(97 + damageLevel * 158); // 61 to 255
      const g = Math.floor(218 - damageLevel * 168); // 218 to 50
      const b = Math.floor(251 - damageLevel * 200); // 251 to 51
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    // Calculate DNA double helix coordinates
    const calculateDNA = (time, centerX, centerY, radius, height) => {
      const basePairs = [];
      const leftStrand = [];
      const rightStrand = [];
      
      // Calculate damage level based on current exposure time
      const damageLevel = Math.max(0, Math.min(1, 
        (time - dnaParams.damageThreshold) / 
        (dnaParams.completeDamage - dnaParams.damageThreshold)
      ));
      
      // Parameters for the helix
      const turns = 2; // Number of complete turns
      const twistRate = (Math.PI * 2 * turns) / dnaParams.basePairs;
      
      for (let i = 0; i < dnaParams.basePairs; i++) {
        const t = i / (dnaParams.basePairs - 1);
        const y = centerY - height / 2 + t * height;
        const angle = i * twistRate + (animationStepRef.current * 0.02);
        
        // Calculate strand positions with sine wave for more realistic double helix
        const x1 = centerX + radius * Math.cos(angle);
        const x2 = centerX + radius * Math.cos(angle + Math.PI);
        
        leftStrand.push({ x: x1, y: y });
        rightStrand.push({ x: x2, y: y });
        
        // Determine if this is a thymine-adenine pair (for demonstration, we'll say even indices are T-A pairs)
        const isThymine = i % 3 === 0;
        
        // Figure out if this base pair is damaged based on position and exposure time
        let isDamaged = false;
        let dimerFormed = false;
        
        if (isThymine && damageLevel > 0) {
          // Bases at the top are damaged first, then damage progresses down
          const positionFactor = 1 - t; // 1 at top, 0 at bottom
          const damageProbability = damageLevel * positionFactor * 3;
          
          // Create a deterministic "random" value based on position
          const pseudoRandom = Math.sin(i * 7.3) * 0.5 + 0.5;
          isDamaged = pseudoRandom < damageProbability;
          
          // Determine if a dimer has formed (more advanced damage)
          dimerFormed = isDamaged && (pseudoRandom < damageProbability * 0.7);
        }
        
        basePairs.push({
          left: { x: x1, y: y },
          right: { x: x2, y: y },
          isThymine,
          isDamaged,
          dimerFormed,
          damageLevel: isDamaged ? Math.min(1, damageLevel * 1.5) : 0
        });
      }
      
      return { basePairs, leftStrand, rightStrand };
    };
    
    // Draw the entire DNA visualization
    const drawDNA = (time, centerX, centerY, width, height) => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / dpr);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Draw UVC source
      drawUVCSource(centerX - width * 0.4, centerY - height * 0.2, time);
      
      // Calculate the DNA structure
      const radius = width * 0.15;
      const { basePairs, leftStrand, rightStrand } = calculateDNA(
        time, centerX, centerY, radius, height * 0.8
      );
      
      // Draw strands (backbone)
      drawStrand(leftStrand, 5, '#4a69bd');
      drawStrand(rightStrand, 5, '#4a69bd');
      
      // Draw base pairs
      basePairs.forEach(base => {
        drawBasePair(base);
      });
      
      // Draw damage indicators and labels
      drawDamageIndicators(basePairs, time);
      
      // Draw time indicator
      drawExposureIndicator(time);
    };
    
    // Draw a strand of the DNA (backbone)
    const drawStrand = (points, thickness, color) => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      // Use quadratic curves to smooth the strand
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        
        if (i < points.length - 1) {
          const xc = (p1.x + p2.x) / 2;
          const yc = (p1.y + p2.y) / 2;
          ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
        } else {
          ctx.lineTo(p2.x, p2.y);
        }
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.stroke();
    };
    
    // Draw a single base pair
    const drawBasePair = (base) => {
      const { left, right, isThymine, isDamaged, dimerFormed, damageLevel } = base;
      
      // Draw the connecting line (base pair)
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      
      if (isDamaged) {
        ctx.strokeStyle = getColor(true, damageLevel);
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = getColor(false);
        ctx.lineWidth = 2;
      }
      
      ctx.stroke();
      
      // Draw base pair markers (nucleotides)
      const baseSize = 8;
      
      // Left nucleotide
      ctx.beginPath();
      ctx.arc(left.x, left.y, baseSize, 0, Math.PI * 2);
      ctx.fillStyle = isThymine ? '#9b59b6' : '#3498db'; // Purple for Thymine, Blue for other bases
      ctx.fill();
      
      // Right nucleotide
      ctx.beginPath();
      ctx.arc(right.x, right.y, baseSize, 0, Math.PI * 2);
      ctx.fillStyle = isThymine ? '#e74c3c' : '#2ecc71'; // Red for Adenine, Green for other bases
      ctx.fill();
      
      // Draw dimer connection (cross-link between adjacent damaged thymine bases)
      if (dimerFormed && isThymine) {
        const fromLeftToRight = Math.random() > 0.5;
        const prevBase = fromLeftToRight ? left : right;
        
        // Draw small interconnecting link to represent the dimer
        ctx.beginPath();
        ctx.moveTo(prevBase.x, prevBase.y);
        ctx.lineTo(prevBase.x + (fromLeftToRight ? 10 : -10), prevBase.y + 15);
        ctx.strokeStyle = '#ff9f43';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw the dimer highlight
        ctx.beginPath();
        ctx.arc(prevBase.x, prevBase.y, baseSize + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff9f43';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };
    
    // Draw the UVC light source
    const drawUVCSource = (x, y, time) => {
      const intensity = time / 100;
      
      // Light source
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#61dafb';
      ctx.fill();
      
      // Glow effect
      const gradientUVC = ctx.createRadialGradient(x, y, 5, x, y, 30);
      gradientUVC.addColorStop(0, 'rgba(97, 218, 251, 0.8)');
      gradientUVC.addColorStop(1, 'rgba(97, 218, 251, 0)');
      
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fillStyle = gradientUVC;
      ctx.fill();
      
      // Text label
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('UVC', x, y - 25);
      
      // Draw rays
      drawRays(x, y, intensity);
    };
    
    // Draw UVC light rays
    const drawRays = (x, y, intensity) => {
      const numRays = 12;
      const maxLength = 150 * intensity;
      const angleOffset = animationStepRef.current * 0.01;
      
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + angleOffset;
        const length = maxLength * (0.7 + Math.sin(i * 10 + animationStepRef.current * 0.1) * 0.3);
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        // Create gradient for the ray
        const rayGradient = ctx.createLinearGradient(x, y, endX, endY);
        rayGradient.addColorStop(0, 'rgba(97, 218, 251, 0.8)');
        rayGradient.addColorStop(1, 'rgba(97, 218, 251, 0)');
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = rayGradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };
    
    // Draw damage indicators and explanation
    const drawDamageIndicators = (basePairs, time) => {
      // Count damaged bases
      const damagedCount = basePairs.filter(b => b.isDamaged).length;
      const dimerCount = basePairs.filter(b => b.dimerFormed).length;
      
      // Draw damage indicator
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(`DNA Damage: ${damagedCount} bases affected`, 20, canvas.height / dpr - 60);
      ctx.fillText(`Thymine Dimers: ${dimerCount} formed`, 20, canvas.height / dpr - 40);
      
      // Show status message
      let statusMessage = "Normal DNA Structure";
      let statusColor = "#4cd137";
      
      if (time > dnaParams.damageThreshold) {
        if (dimerCount > 0) {
          statusMessage = "Thymine Dimers Forming - Replication Blocked";
          statusColor = "#e84118";
        } else if (damagedCount > 0) {
          statusMessage = "DNA Damage Occurring";
          statusColor = "#fbc531";
        }
      }
      
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = statusColor;
      ctx.textAlign = 'center';
      ctx.fillText(statusMessage, canvas.width / dpr / 2, 30);
      
      // Labels for nucleotides
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText("T: Thymine", 20, 60);
      ctx.fillText("A: Adenine", 20, 80);
      
      // Color indicators
      ctx.beginPath();
      ctx.arc(15, 60 - 4, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#9b59b6";
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(15, 80 - 4, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#e74c3c";
      ctx.fill();
      
      // Show dimer explanation if any have formed
      if (dimerCount > 0) {
        ctx.font = '13px Arial';
        ctx.fillStyle = '#ff9f43';
        ctx.textAlign = 'right';
        ctx.fillText("Thymine Dimers: UV causes adjacent", canvas.width / dpr - 20, 60);
        ctx.fillText("thymine bases to bond abnormally", canvas.width / dpr - 20, 80);
      }
    };
    
    // Draw exposure time indicator
    const drawExposureIndicator = (time) => {
      const width = canvas.width / dpr - 40;
      const x = 20;
      const y = canvas.height / dpr - 20;
      const height = 10;
      
      // Draw background bar
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(x, y, width, height);
      
      // Draw filled portion
      const fillWidth = (width * time) / 100;
      
      // Gradient based on damage level
      let gradient;
      if (time < dnaParams.damageThreshold) {
        // Safe level - blue/green
        gradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
        gradient.addColorStop(0, '#00a8ff');
        gradient.addColorStop(1, '#4cd137');
      } else {
        // Damage level - yellow/red
        gradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
        gradient.addColorStop(0, '#fbc531');
        gradient.addColorStop(1, '#e84118');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, fillWidth, height);
      
      // Draw border
      ctx.strokeStyle = '#dfe4ea';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      
      // Label
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`UVC Exposure Time: ${time}%`, canvas.width / dpr / 2, y - 10);
    };
    
    // Animation loop
    const animate = () => {
      animationStepRef.current += 1;
      
      // Calculate the center of the canvas
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;
      
      // Calculate width and height for the DNA
      const width = canvas.width / dpr * 0.8;
      const height = canvas.height / dpr * 0.7;
      
      drawDNA(exposureTime, centerX, centerY, width, height);
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation if playing
    if (isPlaying) {
      animate();
    }
    
    // Handle window resize
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      if (!isPlaying) {
        // Redraw if not already animating
        const centerX = canvas.width / dpr / 2;
        const centerY = canvas.height / dpr / 2;
        const width = canvas.width / dpr * 0.8;
        const height = canvas.height / dpr * 0.7;
        
        drawDNA(exposureTime, centerX, centerY, width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [exposureTime, isPlaying]);
  
  // Check initial loading status
  useEffect(() => {
    if (isInitialLoad) {
      // Start exposure time at 0 and gradually increase for initial animation
      const initialTimer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      
      return () => clearTimeout(initialTimer);
    }
  }, [isInitialLoad]);
  
  // Handle slider change
  const handleExposureChange = (e) => {
    setExposureTime(parseInt(e.target.value, 10));
  };
  
  // Handle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle reset
  const handleReset = () => {
    setExposureTime(0);
    setIsPlaying(true);
    animationStepRef.current = 0;
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-xl overflow-hidden">
      <div className="p-6 bg-gray-800 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-blue-400">UVC DNA Damage Animation</h2>
        <p className="mt-2 text-gray-300">
          This animation demonstrates how UVC light damages DNA by creating thymine dimers,
          which prevent DNA replication and cellular reproduction in pathogens.
        </p>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-96 bg-gray-900"
        />
      </div>
      
      <div className="p-6 bg-gray-800">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <div className="flex gap-2">
            <button 
              onClick={togglePlayPause}
              className={`px-4 py-2 rounded-md transition-colors ${
                isPlaying ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
              } text-white font-medium`}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              UVC Exposure Time: {exposureTime}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={exposureTime}
              onChange={handleExposureChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Safe</span>
              <span>Damage Begins</span>
              <span>Lethal</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-gray-900 p-4 rounded-md text-gray-300 text-sm">
          <h3 className="text-lg font-medium text-blue-400 mb-2">How UVC Works Against Pathogens</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>UVC light (254nm wavelength) is absorbed by thymine bases in DNA</li>
            <li>Adjacent thymine bases form "thymine dimers" - abnormal chemical bonds</li>
            <li>These dimers prevent DNA replication and RNA transcription</li>
            <li>Without the ability to reproduce, pathogens are effectively neutralized</li>
            <li>Increased exposure time leads to more thymine dimers, causing more damage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UVCDNADamageAnimation;