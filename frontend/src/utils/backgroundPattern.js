/* Abstract geometric line pattern background */
export const abstractLinePattern = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
    <defs>
      <pattern id="lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" opacity="0.08">
        <line x1="0" y1="0" x2="100" y2="100" stroke="#1E3A8A" stroke-width="1"/>
        <line x1="100" y1="0" x2="0" y2="100" stroke="#D97706" stroke-width="1"/>
        <line x1="50" y1="0" x2="50" y2="100" stroke="#475569" stroke-width="0.5"/>
        <line x1="0" y1="50" x2="100" y2="50" stroke="#475569" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="1200" height="1200" fill="white"/>
    <rect width="1200" height="1200" fill="url(#lines)"/>
  </svg>
`;

export const backgroundStyle = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(abstractLinePattern)}")`,
  backgroundSize: "400px 400px",
  backgroundAttachment: "fixed",
};
