export default function GithubButton() {
  return (
    <a
      href="https://github.com/pawarnitya819-cpu/Pragati-SIH2026103"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "12px 24px",
        borderRadius: "9999px",
        backgroundColor: "#0B1D3A",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 600,
        lineHeight: "normal",
        textDecoration: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        boxSizing: "border-box",
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        style={{ 
          height: "20px", 
          width: "20px", 
          flexShrink: 0, 
          display: "block" 
        }} 
        fill="currentColor" 
        aria-hidden="true"
      >
        <path
          d={
            "M12 .5C5.73.5 5.73 12c0 5.09 3.29 9.4 7.86 10.93.58.1-.79-.25.79-.56" +
            "0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68" +
            "-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76" +
            "2.7 1.25 3.36.96 1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.6" +
            "9-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18" +
            "1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59" +
            ".23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68" +
            ".41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56" +
            "A10.52 10.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z"
          }
        />
      </svg>
      <span>View on GitHub</span>
    </a>
  );
}