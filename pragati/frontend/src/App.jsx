import React, { useState } from 'react';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 
        =================================================================
        YOUR EXISTING PRAGATI DASHBOARD / SITE COMPONENTS GO HERE
        Example: <Navbar />, <Sidebar />, <DashboardRouter />, etc.
        =================================================================
      */}

      {/* --- SIH PRAGATI AI COPILOT ROADMAP WIDGET --- */}
      <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1000 }}>
        {/* Floating Chat Trigger Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            fontSize: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease-in-out',
          }}
          title="PRAGATI AI Copilot Preview"
        >
          🤖
        </button>

        {/* Chatbot Preview Window */}
        {isChatOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '75px',
              right: '0',
              width: '350px',
              maxWidth: '90vw',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  PRAGATI AI Copilot
                </h4>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  Infrastructure Intelligence Engine
                </span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', maxHeight: '380px', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                }}
              >
                ⚡ Planned v2.0 Roadmap
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#334155',
                  lineHeight: '1.5',
                  marginBottom: '12px',
                }}
              >
                <strong>Automated Monitoring Assistant</strong>
                <br />
                Our RAG-driven AI model is designed to analyze project delays, auto-generate risk assessment reports, and query real-time GIS and infrastructure progress logs.
              </div>

              {/* Technical Architecture Box */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  borderLeft: '4px solid #1e3a8a',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#1e40af',
                }}
              >
                <strong>Technical Specifications:</strong>
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  <li><strong>Core Engine:</strong> Llama 3 / Fine-tuned RAG</li>
                  <li><strong>Data Pipeline:</strong> Vector search over project GIS & delay logs</li>
                  <li><strong>Capabilities:</strong> Anomaly detection & multi-agency sync alerts</li>
                </ul>
              </div>
            </div>

            {/* Footer Input Placeholder */}
            <div style={{ padding: '12px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
              <input
                type="text"
                placeholder="AI Copilot offline during evaluation..."
                disabled
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  fontSize: '12px',
                  color: '#64748b',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>
        )}
      </div>
      {/* --- END OF SIH WIDGET --- */}
    </div>
  );
}