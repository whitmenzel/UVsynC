// Save as js/uvcdnadamage-transpiled.js
const UVCDNADamageAnimation = () => {
    // Create a simplified version that will work directly in the browser
    const container = document.createElement('div');
    container.className = 'uvc-dna-container';
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; color: #fff;">
        <p>This interactive visualization shows how UVC light damages microbial DNA.</p>
        <p>Please use the link below to see the full animation:</p>
        <a href="js/uvc-viewer.html" target="_blank" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #61dafb; color: #1a1a2e; text-decoration: none; border-radius: 5px; font-weight: bold;">Open Interactive Animation</a>
      </div>
    `;
    
    return container;
  };
  
  // Create and add the component to the target element
  document.addEventListener('DOMContentLoaded', function() {
    const targetElement = document.getElementById('uvc-dna-damage-root');
    if (targetElement) {
      targetElement.appendChild(UVCDNADamageAnimation());
    }
  });