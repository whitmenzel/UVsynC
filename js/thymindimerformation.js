import React, { useState, useEffect, useRef } from 'react';

const ThymineDimerFormation = () => {
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const maxSteps = 600; // Total animation steps
  
  // Molecule colors
  const colors = {
    carbon: '#444444',
    hydrogen: '#FFFFFF',
    nitrogen: '#3050F8',
    oxygen: '#FF2020',
    phosphorus: '#FF8000',
    sulfur: '#FFFF00',
    bond: '#444444',
    highlight: '#61dafb',
    uvRay: 'rgba(120, 81, 169, 0.8)',
    background: '#1a1a2e',
    text: '#FFFFFF',
    caption: '#AAAAAA'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with higher resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Draw atom label with connecting line
    const drawAtomLabel = (ctx, x, y, label, position) => {
      const labelY = y - 20;
      // Adjust label position to prevent overlap when molecules are close
      const offset = position === 'left' ? -15 : 15;
      const labelX = x + offset;
      
      // Draw thin connecting line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(labelX, labelY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw label
      ctx.font = '12px Arial';
      ctx.fillStyle = colors.text;
      ctx.textAlign = position === 'left' ? 'right' : 'left';
      ctx.fillText(label, labelX, labelY);
    };
    
    // Draw one thymine molecule
    const drawThymineMolecule = (ctx, x, y, size, isForming, progress) => {
      // Thymine is a ring structure with attachments
      ctx.globalAlpha = progress;
      
      // Main ring (simplified)
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = colors.bond;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // C5-C6 double bond (highlight the reactive part)
      const c5x = x - size * 0.15;
      const c6x = x + size * 0.15;
      
      ctx.beginPath();
      ctx.moveTo(c5x, y);
      ctx.lineTo(c6x, y);
      ctx.strokeStyle = isForming ? colors.highlight : colors.bond;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw key atoms
      // C5 atom
      ctx.beginPath();
      ctx.arc(c5x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.carbon;
      ctx.fill();
      
      // C6 atom
      ctx.beginPath();
      ctx.arc(c6x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.carbon;
      ctx.fill();
      
      // Oxygen atom (simplified for clarity)
      ctx.beginPath();
      ctx.arc(x, y - size * 0.3, 7, 0, Math.PI * 2);
      ctx.fillStyle = colors.oxygen;
      ctx.fill();
      
      // Nitrogen atoms (simplified for clarity)
      ctx.beginPath();
      ctx.arc(x - size * 0.25, y - size * 0.15, 7, 0, Math.PI * 2);
      ctx.fillStyle = colors.nitrogen;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x + size * 0.25, y - size * 0.15, 7, 0, Math.PI * 2);
      ctx.fillStyle = colors.nitrogen;
      ctx.fill();
      
      // Reset alpha
      ctx.globalAlpha = 1;
    };
    
    // Draw excited state pulse around a bond
    const drawExcitedStatePulse = (ctx, x1, x2, y, progress) => {
      const centerX = (x1 + x2) / 2;
      const pulseFactor = Math.sin(progress * 10) * 0.5 + 0.5;
      const pulseRadius = 10 + pulseFactor * 5;
      
      // Pulsing glow effect
      const gradient = ctx.createRadialGradient(
        centerX, y, 2,
        centerX, y, pulseRadius
      );
      gradient.addColorStop(0, 'rgba(155, 89, 182, 0.8)');
      gradient.addColorStop(1, 'rgba(155, 89, 182, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };
    
    // Draw electron movement visualization
    const drawElectronMovement = (ctx, x1, x2, y, progress) => {
      const moveProgress = (progress * 6) % 1;
      
      // Position of moving electron
      const electronX = x1 + (x2 - x1) * moveProgress;
      const electronY = y + Math.sin(moveProgress * Math.PI * 2) * 5;
      
      // Draw electron
      ctx.beginPath();
      ctx.arc(electronX, electronY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(41, 128, 185, 0.8)';
      ctx.fill();
      
      // Draw trailing effect
      const trailSteps = 5;
      for (let i = 1; i <= trailSteps; i++) {
        const trailProgress = (moveProgress - (i * 0.05)) % 1;
        if (trailProgress < 0) continue;
        
        const trailX = x1 + (x2 - x1) * trailProgress;
        const trailY = y + Math.sin(trailProgress * Math.PI * 2) * 5;
        
        ctx.beginPath();
        ctx.arc(trailX, trailY, 3 * (1 - i / trailSteps), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(41, 128, 185, ${0.8 * (1 - i / trailSteps)})`;
        ctx.fill();
      }
    };
    
    // Draw a blocked arrow
    const drawBlockedArrow = (ctx, x, y, length, angle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Arrow body
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(length * 0.7, 0);
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(length * 0.7, 0);
      ctx.lineTo(length * 0.7 - 10, -7);
      ctx.lineTo(length * 0.7 - 10, 7);
      ctx.closePath();
      ctx.fillStyle = '#ecf0f1';
      ctx.fill();
      
      // Block sign
      ctx.beginPath();
      ctx.arc(length * 0.85, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#e74c3c';
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(length * 0.85 - 8, 0);
      ctx.lineTo(length * 0.85 + 8, 0);
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.restore();
    };
    
    // Draw DNA context (simplified backbone)
    const drawDNAContext = (ctx, width, height, progress, isDamaged = false) => {
      const centerX = width / 2;
      const topY = height * 0.1;
      const bottomY = height * 0.9;
      
      // Simplified DNA backbone on left and right
      const backboneWidth = width * 0.6;
      const leftX = centerX - backboneWidth / 2;
      const rightX = centerX + backboneWidth / 2;
      
      // Draw backbones with progress-based fade-in
      ctx.globalAlpha = progress;
      
      // Left backbone
      ctx.beginPath();
      ctx.moveTo(leftX, topY);
      ctx.lineTo(leftX, bottomY);
      ctx.strokeStyle = isDamaged ? '#e74c3c' : '#4a69bd';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      // Right backbone
      ctx.beginPath();
      ctx.moveTo(rightX, topY);
      ctx.lineTo(rightX, bottomY);
      ctx.strokeStyle = isDamaged ? '#e74c3c' : '#4a69bd';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      // Reset alpha
      ctx.globalAlpha = 1;
      
      // Draw other base pairs (simplified)
      const numPairs = 5;
      const spacing = (bottomY - topY) / (numPairs + 1);
      
      for (let i = 1; i <= numPairs; i++) {
        // Skip middle position (where our focus thymine pair is)
        if (i === Math.ceil(numPairs / 2)) continue;
        
        const y = topY + i * spacing;
        
        // Draw base pair connection
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.strokeStyle = '#61dafb';
        ctx.lineWidth = isDamaged && i > Math.ceil(numPairs / 2) ? 1 : 2;
        ctx.setLineDash(isDamaged && i > Math.ceil(numPairs / 2) ? [5, 5] : []);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw base circles
        ctx.beginPath();
        ctx.arc(leftX, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightX, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#2ecc71';
        ctx.fill();
      }
    };
    
    // Draw DNA replication effects
    const drawDNAEffects = (ctx, width, height) => {
      const centerX = width / 2;
      const centerY = height * 0.7;
      
      // Draw DNA polymerase (simplified)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#e74c3c';
      ctx.fill();
      
      // Draw a large X through it to indicate blocking
      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY - 20);
      ctx.lineTo(centerX + 20, centerY + 20);
      ctx.moveTo(centerX + 20, centerY - 20);
      ctx.lineTo(centerX - 20, centerY + 20);
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      // Label
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#ecf0f1';
      ctx.textAlign = 'center';
      ctx.fillText('DNA Polymerase', centerX, centerY - 35);
      ctx.fillText('BLOCKED', centerX, centerY + 40);
      
      // Draw arrows showing inability to proceed
      drawBlockedArrow(ctx, centerX - 60, centerY, 40, 0);
      
      // Explanation text
      ctx.font = '14px Arial';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText('Thymine dimer prevents DNA replication', centerX, height - 70);
      ctx.fillText('by blocking DNA polymerase', centerX, height - 50);
      ctx.fillText('→ Cell cannot reproduce → Pathogen neutralized', centerX, height - 30);
    };
    
    // Draw the thymine dimer (final state)
    const drawThymineDimer = (ctx, x, y, size, progress) => {
      // Distance between the centers of the two thymine rings
      const moleculeSpacing = size * 1.6;
      
      // Draw the two thymines (now joined)
      drawThymineMolecule(ctx, x - moleculeSpacing / 2, y, size, false, 1);
      drawThymineMolecule(ctx, x + moleculeSpacing / 2, y, size, false, 1);
      
      // Draw the cyclobutane ring connecting them
      const leftC5X = x - moleculeSpacing / 2 - size * 0.15;
      const leftC6X = x - moleculeSpacing / 2 + size * 0.15;
      const rightC5X = x + moleculeSpacing / 2 - size * 0.15;
      const rightC6X = x + moleculeSpacing / 2 + size * 0.15;
      
      // Labels with adjusted positions to prevent overlap
      drawAtomLabel(ctx, leftC5X, y, 'C5', 'left');
      drawAtomLabel(ctx, leftC6X, y, 'C6', 'left');
      drawAtomLabel(ctx, rightC5X, y, 'C5', 'right');
      drawAtomLabel(ctx, rightC6X, y, 'C6', 'right');
      
      // Cyclobutane ring
      const points = [
        { x: leftC5X, y: y },
        { x: rightC5X, y: y },
        { x: rightC6X, y: y },
        { x: leftC6X, y: y }
      ];
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(97, 218, 251, ${progress * 0.2})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(97, 218, 251, ${progress * 0.8})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Highlight the new covalent bonds
      ctx.beginPath();
      ctx.moveTo(leftC5X, y);
      ctx.lineTo(rightC5X, y);
      ctx.strokeStyle = `rgba(255, 159, 67, ${progress})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(leftC6X, y);
      ctx.lineTo(rightC6X, y);
      ctx.strokeStyle = `rgba(255, 159, 67, ${progress})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw "Cyclobutane Ring" label
      if (progress > 0.5) {
        const labelOpacity = (progress - 0.5) * 2;
        ctx.globalAlpha = labelOpacity;
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ff9f43';
        ctx.textAlign = 'center';
        ctx.fillText('Cyclobutane Ring', x, y + 25);
        
        ctx.globalAlpha = 1;
      }
    };
    
    // Draw caption based on the current phase
    const drawCaption = (ctx, width, height, progress) => {
      const captions = [
        "Adjacent thymine bases in DNA have C5=C6 double bonds that can be activated by UVC light.",
        "UVC photons (254nm) are absorbed by the C5=C6 double bonds, exciting electrons in the bonds.",
        "Excited electrons allow carbon atoms to form new bonds, creating a cyclobutane ring between thymines.",
        "The resulting thymine dimer distorts DNA structure and blocks DNA polymerase during replication."
      ];
      
      // Determine current phase
      const phaseIndex = Math.min(
        captions.length - 1,
        Math.floor(progress * captions.length)
      );
      
      // Draw text box at top
      const padding = 10;
      const boxWidth = width * 0.9;
      const boxHeight = 40;
      const boxX = (width - boxWidth) / 2;
      const boxY = height * 0.05;
      
      // Draw semi-transparent background
      ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      
      // Draw border
      ctx.strokeStyle = '#61dafb';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Draw caption text
      ctx.font = '14px Arial';
      ctx.fillStyle = colors.caption;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(captions[phaseIndex], width / 2, boxY + boxHeight / 2);
    };
    
    // Draw progress bar at the bottom
    const drawProgressBar = (ctx, width, height, progress) => {
      const barWidth = width * 0.8;
      const barHeight = 6;
      const x = width * 0.1;
      const y = height - 10;
      
      // Background
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Progress
      ctx.fillStyle = '#61dafb';
      ctx.fillRect(x, y, barWidth * progress, barHeight);
      
      // Border
      ctx.strokeStyle = '#dfe4ea';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);
      
      // Phase indicators
      const phases = [
        'Initial State',
        'UV Radiation',
        'Dimer Formation',
        'Biological Effect'
      ];
      
      for (let i = 0; i < phases.length; i++) {
        const phaseX = x + (barWidth * i) / (phases.length - 1);
        
        // Phase marker
        ctx.beginPath();
        ctx.arc(phaseX, y + barHeight / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = progress >= i / (phases.length - 1) ? '#61dafb' : '#dfe4ea';
        ctx.fill();
        
        // Only draw the current phase label
        if (i === Math.floor(progress * phases.length) && i < phases.length) {
          ctx.font = '14px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(phases[i], width / 2, y - 10);
        }
      }
    };
    
    // Drawing the initial state - two thymine molecules
    const drawInitialState = (ctx, width, height, phaseProgress) => {
      const centerX = width / 2;
      const centerY = height / 2.2;
      const moleculeSize = width * 0.13;
      
      // Draw DNA context (simplified)
      drawDNAContext(ctx, width, height, phaseProgress);
      
      // First thymine molecule - left side
      drawThymineMolecule(
        ctx, 
        centerX - moleculeSize * (1 + 0.4 * (1 - phaseProgress)), 
        centerY,
        moleculeSize,
        false,
        phaseProgress
      );
      
      // Second thymine molecule - right side
      drawThymineMolecule(
        ctx, 
        centerX + moleculeSize * (1 + 0.4 * (1 - phaseProgress)), 
        centerY,
        moleculeSize,
        false,
        phaseProgress
      );
      
      // Draw labels for key atoms that will form bonds
      if (phaseProgress > 0.7) {
        ctx.font = '14px Arial';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        
        // Label the C5=C6 double bonds that will react
        const leftC5X = centerX - moleculeSize * 1.15;
        const leftC6X = centerX - moleculeSize * 0.85;
        const rightC5X = centerX + moleculeSize * 0.85;
        const rightC6X = centerX + moleculeSize * 1.15;
        const atomY = centerY;
        
        // Draw labels with connecting lines
        drawAtomLabel(ctx, leftC5X, atomY, 'C5', 'left');
        drawAtomLabel(ctx, leftC6X, atomY, 'C6', 'left');
        drawAtomLabel(ctx, rightC5X, atomY, 'C5', 'right');
        drawAtomLabel(ctx, rightC6X, atomY, 'C6', 'right');
        
        // Highlight the double bonds that will form the cyclobutane ring
        ctx.beginPath();
        ctx.moveTo(leftC5X, atomY);
        ctx.lineTo(leftC6X, atomY);
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(rightC5X, atomY);
        ctx.lineTo(rightC6X, atomY);
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };
    
    // Drawing the UV radiation hitting the molecules
    const drawUVRadiation = (ctx, width, height, phaseProgress) => {
      const centerX = width / 2;
      const centerY = height / 2.2;
      const moleculeSize = width * 0.13;
      
      // Draw DNA context
      drawDNAContext(ctx, width, height, 1);
      
      // Draw the two thymine molecules in position
      drawThymineMolecule(ctx, centerX - moleculeSize, centerY, moleculeSize, false, 1);
      drawThymineMolecule(ctx, centerX + moleculeSize, centerY, moleculeSize, false, 1);
      
      // Draw labels for C5 and C6 atoms
      const leftC5X = centerX - moleculeSize * 1.15;
      const leftC6X = centerX - moleculeSize * 0.85;
      const rightC5X = centerX + moleculeSize * 0.85;
      const rightC6X = centerX + moleculeSize * 1.15;
      const atomY = centerY;
      
      drawAtomLabel(ctx, leftC5X, atomY, 'C5', 'left');
      drawAtomLabel(ctx, leftC6X, atomY, 'C6', 'left');
      drawAtomLabel(ctx, rightC5X, atomY, 'C5', 'right');
      drawAtomLabel(ctx, rightC6X, atomY, 'C6', 'right');
      
      // Highlight the double bonds
      ctx.beginPath();
      ctx.moveTo(leftC5X, atomY);
      ctx.lineTo(leftC6X, atomY);
      ctx.strokeStyle = colors.highlight;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(rightC5X, atomY);
      ctx.lineTo(rightC6X, atomY);
      ctx.strokeStyle = colors.highlight;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw UV radiation
      const numRays = 8;
      const sourceX = width / 2;
      const sourceY = height * 0.1;
      const rayLength = height * 0.3 * phaseProgress;
      
      // Draw UV source
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#9b59b6';
      ctx.fill();
      
      // Draw label
      ctx.font = '14px Arial';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText('UVC Light', sourceX, sourceY - 25);
      ctx.fillText('254nm', sourceX, sourceY - 5);
      
      // Draw rays
      for (let i = 0; i < numRays; i++) {
        const angle = Math.PI / 2 + (Math.PI / (numRays - 1)) * (i - (numRays - 1) / 2);
        const endX = sourceX + Math.cos(angle) * rayLength;
        const endY = sourceY + Math.sin(angle) * rayLength;
        
        // Create gradient for the ray
        const rayGradient = ctx.createLinearGradient(sourceX, sourceY, endX, endY);
        rayGradient.addColorStop(0, 'rgba(155, 89, 182, 0.8)');
        rayGradient.addColorStop(1, 'rgba(155, 89, 182, 0)');
        
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = rayGradient;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      // Draw excited state indicators if rays have reached the molecules
      if (phaseProgress > 0.7) {
        // Excited state visual effect around C5=C6 bonds
        drawExcitedStatePulse(ctx, leftC5X, leftC6X, atomY, phaseProgress);
        drawExcitedStatePulse(ctx, rightC5X, rightC6X, atomY, phaseProgress);
        
        // Show electron movement
        drawElectronMovement(ctx, leftC5X, leftC6X, atomY, phaseProgress);
        drawElectronMovement(ctx, rightC5X, rightC6X, atomY, phaseProgress);
      }
    };
    
    // Drawing the dimer formation
    const drawDimerFormation = (ctx, width, height, phaseProgress) => {
      const centerX = width / 2;
      const centerY = height / 2.2;
      const moleculeSize = width * 0.13;
      
      // Draw DNA context
      drawDNAContext(ctx, width, height, 1);
      
      // Calculate distance between molecules based on progress
      const initialDistance = moleculeSize * 2;
      const finalDistance = moleculeSize * 1.6;
      const currentDistance = initialDistance - (initialDistance - finalDistance) * phaseProgress;
      
      // First thymine molecule - moving right
      drawThymineMolecule(
        ctx, 
        centerX - currentDistance / 2, 
        centerY,
        moleculeSize,
        true,
        1
      );
      
      // Second thymine molecule - moving left
      drawThymineMolecule(
        ctx, 
        centerX + currentDistance / 2, 
        centerY,
        moleculeSize,
        true,
        1
      );
      
      // Labels for C5 and C6 atoms
      const leftC5X = centerX - currentDistance / 2 - moleculeSize * 0.15;
      const leftC6X = centerX - currentDistance / 2 + moleculeSize * 0.15;
      const rightC5X = centerX + currentDistance / 2 - moleculeSize * 0.15;
      const rightC6X = centerX + currentDistance / 2 + moleculeSize * 0.15;
      const atomY = centerY;
      
      drawAtomLabel(ctx, leftC5X, atomY, 'C5', 'left');
      drawAtomLabel(ctx, leftC6X, atomY, 'C6', 'left');
      drawAtomLabel(ctx, rightC5X, atomY, 'C5', 'right');
      drawAtomLabel(ctx, rightC6X, atomY, 'C6', 'right');
      
      // Draw forming covalent bonds between C5-C5 and C6-C6
      const bondProgress = Math.min(1, phaseProgress * 1.5);
      
      // Draw C5-C5 bond
      ctx.beginPath();
      ctx.moveTo(leftC5X, atomY);
      ctx.lineTo(leftC5X + (rightC5X - leftC5X) * bondProgress, atomY);
      ctx.strokeStyle = `rgba(97, 218, 251, ${bondProgress})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw C6-C6 bond
      ctx.beginPath();
      ctx.moveTo(leftC6X, atomY);
      ctx.lineTo(leftC6X + (rightC6X - leftC6X) * bondProgress, atomY);
      ctx.strokeStyle = `rgba(97, 218, 251, ${bondProgress})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw cyclobutane ring forming
      if (phaseProgress > 0.5) {
        // Draw the top and bottom lines of the forming cyclobutane ring
        const cycloProgress = (phaseProgress - 0.5) * 2;
        
        ctx.beginPath();
        ctx.moveTo(leftC5X, atomY);
        ctx.lineTo(rightC5X, atomY);
        ctx.moveTo(leftC6X, atomY);
        ctx.lineTo(rightC6X, atomY);
        ctx.strokeStyle = `rgba(97, 218, 251, ${cycloProgress})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add highlight to show complete cyclobutane ring
        if (phaseProgress > 0.8) {
            const points = [
                { x: leftC5X, y: atomY },
                { x: rightC5X, y: atomY },
                { x: rightC6X, y: atomY },
                { x: leftC6X, y: atomY }
              ];
              
              ctx.beginPath();
              ctx.moveTo(points[0].x, points[0].y);
              for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
              }
              ctx.closePath();
              ctx.fillStyle = `rgba(97, 218, 251, 0.2)`;
              ctx.fill();
              ctx.strokeStyle = `rgba(97, 218, 251, 0.8)`;
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
        };
        
        // Drawing the biological effects
        const drawBiologicalEffects = (ctx, width, height, phaseProgress) => {
          const centerX = width / 2;
          const centerY = height / 2.2;
          const moleculeSize = width * 0.13;
          
          // Draw DNA context with damage
          drawDNAContext(ctx, width, height, 1, true);
          
          // Draw the thymine dimer
          drawThymineDimer(ctx, centerX, centerY, moleculeSize, phaseProgress);
          
          // Draw biological effects (DNA polymerase blockage)
          if (phaseProgress > 0.3) {
            const effectProgress = (phaseProgress - 0.3) / 0.7;
            ctx.globalAlpha = effectProgress;
            drawDNAEffects(ctx, width, height);
            ctx.globalAlpha = 1;
          }
        };
        
        // Main animation function with performance optimization
        const drawAnimation = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          // Clear canvas
          ctx.fillStyle = colors.background;
          ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
          
          // Calculate overall progress (0 to 1)
          const progress = animationStep / maxSteps;
          
          // Calculate phase-specific progress
          const phaseProgress = (progress * 4) % 1; // 4 phases
          const currentPhase = Math.min(3, Math.floor(progress * 4));
          
          // Draw appropriate phase
          switch (currentPhase) {
            case 0:
              drawInitialState(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, phaseProgress);
              break;
            case 1:
              drawUVRadiation(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, phaseProgress);
              break;
            case 2:
              drawDimerFormation(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, phaseProgress);
              break;
            case 3:
              drawBiologicalEffects(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, phaseProgress);
              break;
          }
          
          // Draw caption and progress bar
          drawCaption(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, progress);
          drawProgressBar(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, progress);
          
          // Update animation step
          if (isPlaying) {
            setAnimationStep((prevStep) => (prevStep + speed) % maxSteps);
          }
          
          // Continue animation loop
          animationRef.current = requestAnimationFrame(drawAnimation);
        };
        
        // Start animation
        animationRef.current = requestAnimationFrame(drawAnimation);
        
        // Clean up on unmount
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }, [animationStep, isPlaying, speed]);
      
      // Handle play/pause
      const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
      };
      
      // Handle speed change with validation
      const handleSpeedChange = (e) => {
        const newSpeed = parseFloat(e.target.value);
        // Add validation to prevent unusually high values
        setSpeed(Math.min(Math.max(0.5, newSpeed), 5));
      };
      
      // Reset animation
      const resetAnimation = () => {
        setAnimationStep(0);
        setIsPlaying(true);
      };
      
      return (
        <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl text-white mb-2 font-bold">Thymine Dimer Formation</h2>
          <div className="relative w-full mb-4">
            <canvas 
              ref={canvasRef} 
              className="w-full h-96 bg-gray-800 rounded-md"
              style={{ backgroundColor: '#1a1a2e' }}
              aria-label="Animation of thymine dimer formation process"
            />
          </div>
          
          {/* Controls */}
          <div className="flex gap-4 items-center">
            <button
              onClick={togglePlayPause}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={resetAnimation}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
              aria-label="Reset animation"
            >
              Reset
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">Speed:</span>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={speed}
                onChange={handleSpeedChange}
                className="w-24"
                aria-label="Animation speed control"
              />
              <span className="text-sm text-white">{speed}x</span>
            </div>
          </div>
          
          {/* Education notes */}
          <div className="mt-6 p-4 bg-gray-800 rounded text-gray-200 text-sm">
            <h3 className="text-lg text-white mb-2">About Thymine Dimer Formation</h3>
            <p className="mb-2">
              Thymine dimers form when UVC radiation (254nm) causes adjacent thymine bases in DNA 
              to form abnormal chemical bonds, creating a cyclobutane ring.
            </p>
            <p className="mb-2">
              This DNA damage blocks replication and transcription, which is harmful to cells but 
              helps protect against pathogens by preventing them from reproducing.
            </p>
            <p>
              UV sterilization technology uses this mechanism for disinfection, making it effective 
              against bacteria and viruses.
            </p>
          </div>
        </div>
      );
     };
     
     export default ThymineDimerFormation;