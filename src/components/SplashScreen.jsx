import { useState } from 'react';
const SplashScreen = ({ onPlay }) => {
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day', 'night', 'rain'
  const [selectedBuilding, setSelectedBuilding] = useState('cs_lab');

  const buildings = {
    cs_lab: {
      name: "CS & AI Lab (Sector 7G)",
      npc: "Dr. Turing (Lab Supervisor)",
      desc: "High-performance compute clusters and late-night debugging sessions.",
      chip: "ACADEMICS"
    },
    library: {
      name: "Grand Campus Archives",
      npc: "Archivist Elena",
      desc: "Quiet study zones, rare tome collections, and ancient exam archives.",
      chip: "KNOWLEDGE"
    },
    nexus: {
      name: "Nexus Central Terminal",
      npc: "System Core AI",
      desc: "Main hub for campus quests, protocol checks, and system diagnostics.",
      chip: "OPERATIONS"
    },
    quad: {
      name: "Central Student Quad",
      npc: "Coffee Vendor Sam",
      desc: "Open grassy quad with seasonal events, food stalls, and student stalls.",
      chip: "COMMUNITY"
    }
  };

  const scrollToBento = () => {
    const el = document.getElementById('bento-grid-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={styles.landingWrapper}>
      {/* Top Navigation Bar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <span className="pixel-font" style={styles.navLogo}>VALLEY</span>
          <span className="inventory-chip" style={{ marginLeft: '12px' }}>v1.0 ONLINE</span>
        </div>
        <div style={styles.navLinks}>
          <span className="inventory-chip">[CAMPUS MAP]</span>
          <span className="inventory-chip">[MINIGAMES]</span>
          <span className="inventory-chip">[DEPARTMENT NPCS]</span>
        </div>
        <button className="btn-primary" onClick={onPlay} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
          PLAY GAME ➔
        </button>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBadge}>
          <span className="inventory-chip" style={{ backgroundColor: 'var(--accent-harvest)', color: '#fff', border: '1px solid var(--border-box)' }}>
            ★ CAMPUS EXPLORATION PROTOCOL ★
          </span>
        </div>

        <h1 className="pixel-font" style={styles.heroTitle}>VALLEY</h1>
        
        <p style={styles.heroSubtitle}>
          Step into a tactile 8-bit campus RPG. Explore university sectors, meet department NPCs, complete quests, and unlock campus secrets.
        </p>

        <div style={styles.heroButtons}>
          <button className="btn-primary" onClick={onPlay} style={{ fontSize: '1.05rem', padding: '14px 32px' }}>
            PLAY GAME [ENTER CAMPUS]
          </button>
          <button className="btn-ghost" onClick={scrollToBento} style={{ fontSize: '1.05rem', padding: '14px 28px' }}>
            VIEW QUEST LOG
          </button>
        </div>
      </section>

      {/* Arcade Monitor Feature Showcase */}
      <section style={styles.arcadeSection}>
        <div className="arcade-frame" style={styles.arcadeContainer}>
          <div className="arcade-header">
            <div className="arcade-dots">
              <div className="arcade-dot red"></div>
              <div className="arcade-dot yellow"></div>
              <div className="arcade-dot green"></div>
            </div>
            <span className="arcade-title">VALLEY_CAMPUS_PREVIEW_SYS.EXE</span>
            <span className="inventory-chip" style={{ fontSize: '9px', padding: '2px 6px' }}>LIVE CANVAS</span>
          </div>

          <div className="arcade-body" style={{
            height: '340px',
            background: timeOfDay === 'day' 
              ? 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 60%, #4A8505 60%, #2D6A4F 100%)'
              : timeOfDay === 'night'
              ? 'linear-gradient(180deg, #0B192C 0%, #1E3E62 60%, #1A3626 60%, #0D2317 100%)'
              : 'linear-gradient(180deg, #4A5568 0%, #718096 60%, #2F4F4F 60%, #1A3030 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            transition: 'background 0.5s ease',
            position: 'relative'
          }}>
            {/* Environment Overlay / Weather effects */}
            {timeOfDay === 'rain' && (
              <div style={styles.rainOverlay}>
                <span style={{ position: 'absolute', top: '10%', left: '15%', opacity: 0.7, color: '#A0AEC0' }}>💧</span>
                <span style={{ position: 'absolute', top: '40%', left: '45%', opacity: 0.7, color: '#A0AEC0' }}>💧</span>
                <span style={{ position: 'absolute', top: '25%', left: '75%', opacity: 0.7, color: '#A0AEC0' }}>💧</span>
              </div>
            )}

            {/* Display Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
              <div className="inventory-chip" style={{ backgroundColor: 'rgba(253, 251, 247, 0.9)' }}>
                📍 {buildings[selectedBuilding].name}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setTimeOfDay('day')} 
                  className="inventory-chip" 
                  style={{ cursor: 'pointer', opacity: timeOfDay === 'day' ? 1 : 0.6 }}
                >
                  ☀️ DAY
                </button>
                <button 
                  onClick={() => setTimeOfDay('night')} 
                  className="inventory-chip" 
                  style={{ cursor: 'pointer', opacity: timeOfDay === 'night' ? 1 : 0.6 }}
                >
                  🌙 NIGHT
                </button>
                <button 
                  onClick={() => setTimeOfDay('rain')} 
                  className="inventory-chip" 
                  style={{ cursor: 'pointer', opacity: timeOfDay === 'rain' ? 1 : 0.6 }}
                >
                  🌧️ RAIN
                </button>
              </div>
            </div>

            {/* Simulated Pixel Sprite & Building Graphic */}
            <div style={{ textAlign: 'center', zIndex: 2, margin: 'auto 0' }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: 'var(--bg-surface)',
                border: '2px solid var(--border-box)',
                boxShadow: '3px 3px 0px var(--border-box)',
                borderRadius: '8px',
                padding: '16px 24px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--accent-harvest)',
                    border: '2px solid var(--border-box)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    🎓
                  </div>
                  <div>
                    <h4 className="pixel-font" style={{ margin: 0, fontSize: '11px', color: 'var(--text-primary)' }}>
                      {buildings[selectedBuilding].npc}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {buildings[selectedBuilding].desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Bar at bottom of arcade screen */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', zIndex: 2 }}>
              <button 
                className="btn-primary" 
                onClick={onPlay} 
                style={{ fontSize: '0.8rem', padding: '8px 18px' }}
              >
                ENTER THIS BUILDING (PLAY) ➔
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Pixel Divider */}
      <div className="pixel-divider" style={{ maxWidth: '1000px', margin: '40px auto' }}></div>

      {/* Asymmetric 3-Column Bento Grid Section */}
      <section id="bento-grid-section" style={styles.bentoSection}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="inventory-chip">[SYSTEM FEATURES]</span>
          <h2 className="pixel-font" style={{ fontSize: '1.6rem', margin: '12px 0 6px 0', color: 'var(--text-primary)' }}>
            EXPLORE THE CAMPUS GRID
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Structured modern layout with tactile 8-bit soul.
          </p>
        </div>

        <div style={styles.bentoGrid}>
          {/* Bento Item 1: Large Box (2 Columns, 1 Row) - Interactive Map Preview */}
          <div className="dialogue-card" style={styles.gridLarge}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="inventory-chip">[CAMPUS MAP PREVIEW]</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-forest)' }}>● 4 SECTORS ACTIVE</span>
            </div>
            
            <h3 className="pixel-font" style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}>
              INTERACTIVE BUILDINGS & ZONES
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Click on any department node below to preview sector data and assigned faculty NPCs before entering:
            </p>

            {/* Interactive Selector Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {Object.keys(buildings).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedBuilding(key)}
                  style={{
                    backgroundColor: selectedBuilding === key ? 'var(--bg-inventory)' : 'var(--bg-canvas)',
                    border: `2px solid ${selectedBuilding === key ? 'var(--border-box)' : 'rgba(61,40,23,0.2)'}`,
                    boxShadow: selectedBuilding === key ? '2px 2px 0px var(--border-box)' : 'none',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="pixel-font" style={{ fontSize: '10px', color: 'var(--text-primary)' }}>
                      {key.toUpperCase()}
                    </span>
                    <span className="inventory-chip" style={{ fontSize: '8px' }}>
                      {buildings[key].chip}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                    {buildings[key].name}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={onPlay} style={{ fontSize: '0.85rem' }}>
                LAUNCH FULL MAP ➔
              </button>
            </div>
          </div>

          {/* Bento Item 2: Tall Box (1 Column, 2 Rows) - Quest Log Journal */}
          <div className="dialogue-card" style={styles.gridTall}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="inventory-chip">[QUEST LOG & JOURNAL]</span>
              <span style={{ fontSize: '18px' }}>📜</span>
            </div>

            <h3 className="pixel-font" style={{ fontSize: '1.1rem', margin: '0 0 16px 0' }}>
              STUDENT QUEST LOOP
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Track daily campus events, lab exams, and secrets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={styles.journalItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pixel-font" style={{ fontSize: '9px', color: 'var(--text-primary)' }}>
                    QUEST #01: LAB EXAM
                  </span>
                  <span className="inventory-chip" style={{ backgroundColor: '#D1E7DD', color: 'var(--accent-forest)', fontSize: '8px' }}>
                    DONE
                  </span>
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Submit algorithms lab before 23:59
                </div>
              </div>

              <div style={styles.journalItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pixel-font" style={{ fontSize: '9px', color: 'var(--text-primary)' }}>
                    QUEST #02: NEXUS CHECK
                  </span>
                  <span className="inventory-chip" style={{ backgroundColor: '#FFF3CD', color: 'var(--accent-harvest)', fontSize: '8px' }}>
                    IN PROGRESS
                  </span>
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Inspect Sector 7G Central Terminal
                </div>
              </div>

              <div style={styles.journalItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pixel-font" style={{ fontSize: '9px', color: 'var(--text-primary)' }}>
                    QUEST #03: GITHUB SIGN
                  </span>
                  <span className="inventory-chip" style={{ backgroundColor: '#F8D7DA', color: 'var(--accent-terracotta)', fontSize: '8px' }}>
                    NEW
                  </span>
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Locate developer message in campus quad
                </div>
              </div>

              <div style={styles.journalItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pixel-font" style={{ fontSize: '9px', color: 'var(--text-primary)' }}>
                    EVENT: SPRING FEST
                  </span>
                  <span className="inventory-chip" style={{ fontSize: '8px' }}>
                    UPCOMING
                  </span>
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Join the department festival at Quad
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 3: Small Square 1 (1 Column, 1 Row) - Quick Stats */}
          <div className="dialogue-card" style={styles.gridSmall1}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="inventory-chip">[CAMPUS STATS]</span>
              <span style={{ fontSize: '18px' }}>📊</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div className="pixel-font" style={{ fontSize: '1.4rem', color: 'var(--accent-forest)' }}>
                  40+
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Explorable Buildings
                </div>
              </div>

              <div>
                <div className="pixel-font" style={{ fontSize: '1.4rem', color: 'var(--accent-harvest)' }}>
                  12+
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Department NPCs
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 4: Small Square 2 (1 Column, 1 Row) - Student Inventory */}
          <div className="dialogue-card" style={styles.gridSmall2}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="inventory-chip">[INVENTORY SLOTS]</span>
              <span style={{ fontSize: '18px' }}>🎒</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={styles.inventorySlot}>
                <span style={{ fontSize: '20px' }}>☕</span>
                <span className="pixel-font" style={{ fontSize: '8px', marginTop: '4px' }}>COFFEE</span>
              </div>
              <div style={styles.inventorySlot}>
                <span style={{ fontSize: '20px' }}>🪪</span>
                <span className="pixel-font" style={{ fontSize: '8px', marginTop: '4px' }}>ID CARD</span>
              </div>
              <div style={styles.inventorySlot}>
                <span style={{ fontSize: '20px' }}>🧪</span>
                <span className="pixel-font" style={{ fontSize: '8px', marginTop: '4px' }}>LAB COAT</span>
              </div>
              <div style={styles.inventorySlot}>
                <span style={{ fontSize: '20px' }}>💻</span>
                <span className="pixel-font" style={{ fontSize: '8px', marginTop: '4px' }}>LAPTOP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Pixel Divider */}
      <div className="pixel-divider" style={{ maxWidth: '1000px', margin: '40px auto' }}></div>

      {/* Footer Section */}
      <footer style={styles.footer}>
        <div style={styles.footerCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="pixel-font" style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
                VALLEY
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Built with React, Phaser 3, and Stardew 8-bit design principles.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="inventory-chip">[BUILD v1.0.4]</span>
              <button className="btn-primary" onClick={onPlay} style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                START PLAYING
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  landingWrapper: {
    backgroundColor: 'var(--bg-canvas)',
    minHeight: '100vh',
    width: '100%',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
    paddingBottom: '60px',
    boxSizing: 'border-box'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 40px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '2px solid var(--border-box)',
    boxShadow: '0 2px 0px var(--border-box)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center'
  },
  navLogo: {
    fontSize: '1.3rem',
    color: 'var(--text-primary)',
    letterSpacing: '2px'
  },
  navLinks: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  heroSection: {
    maxWidth: '900px',
    margin: '60px auto 40px auto',
    textAlign: 'center',
    padding: '0 20px'
  },
  heroBadge: {
    marginBottom: '20px'
  },
  heroTitle: {
    fontSize: '4rem',
    margin: '0 0 16px 0',
    color: 'var(--text-primary)',
    letterSpacing: '6px',
    textShadow: '3px 3px 0px var(--bg-inventory), 5px 5px 0px var(--border-box)'
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    maxWidth: '650px',
    margin: '0 auto 36px auto'
  },
  heroButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  arcadeSection: {
    maxWidth: '950px',
    margin: '0 auto',
    padding: '0 20px'
  },
  arcadeContainer: {
    width: '100%'
  },
  rainOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1
  },
  bentoSection: {
    maxWidth: '1050px',
    margin: '0 auto',
    padding: '0 20px'
  },
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'auto auto',
    gap: '24px'
  },
  gridLarge: {
    gridColumn: 'span 2',
    gridRow: 'span 1'
  },
  gridTall: {
    gridColumn: 'span 1',
    gridRow: 'span 2'
  },
  gridSmall1: {
    gridColumn: 'span 1',
    gridRow: 'span 1'
  },
  gridSmall2: {
    gridColumn: 'span 1',
    gridRow: 'span 1'
  },
  journalItem: {
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-box)',
    borderRadius: '6px',
    padding: '10px 12px'
  },
  inventorySlot: {
    backgroundColor: 'var(--bg-inventory)',
    border: '1px solid var(--border-box)',
    padding: '10px 6px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    maxWidth: '1050px',
    margin: '40px auto 0 auto',
    padding: '0 20px'
  },
  footerCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '2px solid var(--border-box)',
    boxShadow: '4px 4px 0px var(--border-box)',
    borderRadius: '8px',
    padding: '24px 32px'
  }
};

export default SplashScreen;

