/**
 * Generate a custom sky-like geometric background
 * Combines gradient with geometric texture patterns
 */
export function generateSkyBackground() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1400" viewBox="0 0 1400 1400">
      <defs>
        <!-- Sky gradient: light blue to white -->
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#E0F2FE;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#F0F9FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:1" />
        </linearGradient>

        <!-- Geometric pattern overlay -->
        <pattern id="geoPattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <!-- Triangles -->
          <polygon points="100,0 200,100 100,100" fill="#0EA5E9" opacity="0.03"/>
          <polygon points="0,100 100,100 100,200" fill="#0284C7" opacity="0.03"/>
          <polygon points="0,0 100,100 0,100" fill="#06B6D4" opacity="0.03"/>
          <polygon points="100,100 200,200 100,200" fill="#0369A1" opacity="0.03"/>

          <!-- Grid lines -->
          <line x1="0" y1="0" x2="200" y2="200" stroke="#1E40AF" stroke-width="0.5" opacity="0.05"/>
          <line x1="200" y1="0" x2="0" y2="200" stroke="#1E40AF" stroke-width="0.5" opacity="0.05"/>

          <!-- Hexagon accent -->
          <circle cx="100" cy="100" r="15" fill="none" stroke="#0EA5E9" stroke-width="1" opacity="0.08"/>
        </pattern>

        <!-- Floating circles pattern -->
        <pattern id="floatingCircles" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="30" fill="#0284C7" opacity="0.02"/>
          <circle cx="250" cy="150" r="25" fill="#06B6D4" opacity="0.03"/>
          <circle cx="150" cy="250" r="35" fill="#0EA5E9" opacity="0.02"/>
          <circle cx="100" cy="100" r="15" fill="#1E40AF" opacity="0.04"/>
          <circle cx="280" cy="280" r="20" fill="#0369A1" opacity="0.03"/>
        </pattern>
      </defs>

      <!-- Base gradient -->
      <rect width="1400" height="1400" fill="url(#skyGradient)"/>

      <!-- Geometric pattern layer 1 -->
      <rect width="1400" height="1400" fill="url(#geoPattern)"/>

      <!-- Floating circles layer -->
      <rect width="1400" height="1400" fill="url(#floatingCircles)"/>

      <!-- Subtle lines for tech vibe -->
      <line x1="0" y1="350" x2="1400" y2="350" stroke="#0EA5E9" stroke-width="1" opacity="0.05"/>
      <line x1="0" y1="700" x2="1400" y2="700" stroke="#0284C7" stroke-width="1" opacity="0.05"/>
      <line x1="0" y1="1050" x2="1400" y2="1050" stroke="#06B6D4" stroke-width="1" opacity="0.05"/>

      <!-- Light mesh overlay -->
      <g opacity="0.03">
        <line x1="200" y1="0" x2="200" y2="1400" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="400" y1="0" x2="400" y2="1400" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="600" y1="0" x2="600" y2="1400" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="800" y1="0" x2="800" y2="1400" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="1000" y1="0" x2="1000" y2="1400" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="1200" y1="0" x2="1200" y2="1400" stroke="#1E3A8A" stroke-width="1"/>

        <line x1="0" y1="200" x2="1400" y2="200" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="0" y1="400" x2="1400" y2="400" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="0" y1="600" x2="1400" y2="600" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="0" y1="800" x2="1400" y2="800" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="0" y1="1000" x2="1400" y2="1000" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="0" y1="1200" x2="1400" y2="1200" stroke="#1E3A8A" stroke-width="1"/>
      </g>
    </svg>
  `;
}
