document.documentElement.classList.add('js-enabled');

document.addEventListener('DOMContentLoaded', () => {
  // 1. Tooltip Logic
  const tooltip = document.getElementById('agent-tooltip');
  const tooltipTitle = tooltip.querySelector('.tooltip-title');
  const tooltipDesc = tooltip.querySelector('.tooltip-desc');
  const nodeGroups = document.querySelectorAll('.node-group');

  let hoveredNodeName = null;

  nodeGroups.forEach(group => {
    group.addEventListener('mouseenter', () => {
      const agentName = group.getAttribute('data-agent');
      const agentDesc = group.getAttribute('data-desc');
      if (agentName && agentDesc) {
        tooltipTitle.textContent = agentName;
        tooltipDesc.textContent = agentDesc;
        tooltip.classList.add('active');
        hoveredNodeName = agentName;
      }
      group.classList.add('highlighted');
    });

    group.addEventListener('mouseleave', () => {
      tooltipTitle.textContent = "Sistema Agêntico";
      tooltipDesc.textContent = "Passe o mouse sobre os nós da rede para inspecionar os funcionários de IA.";
      tooltip.classList.remove('active');
      hoveredNodeName = null;
      group.classList.remove('highlighted');
    });
  });

  // 2. 3D Wireframe Globe & Orbit Projection Math
  const cx = 300;
  const cy = 300;
  const R_globe = 130; // Radius of core wireframe sphere
  const tilt = 22 * Math.PI / 180; // Tilt angle on X-axis (perspective)
  let theta = 0; // Current rotation angle (Y-axis)
  let speed = 0.002; // Gentle slow rotation speed

  // SVG Elements
  const latitudeContainer = document.getElementById('sphere-latitudes');
  const longitudeContainer = document.getElementById('sphere-longitudes');
  const connectionsContainer = document.getElementById('connections-layer');
  const signalsContainer = document.getElementById('signals-layer');

  // Define the 7 agent nodes (orbiting or sitting on the wireframe)
  const nodes = [
    {
      id: 'node-interface',
      name: 'Agente de Interface',
      R: 130, lat: 35 * Math.PI / 180, lon0: 0,
      el: document.getElementById('node-interface'),
      type: 'outer'
    },
    {
      id: 'node-analista',
      name: 'Agente Analista',
      R: 130, lat: -25 * Math.PI / 180, lon0: 120 * Math.PI / 180,
      el: document.getElementById('node-analista'),
      type: 'outer'
    },
    {
      id: 'node-operacional',
      name: 'Agente Operacional',
      R: 180, lat: 15 * Math.PI / 180, lon0: 72 * Math.PI / 180,
      el: document.getElementById('node-operacional'),
      type: 'outer'
    },
    {
      id: 'node-seguranca',
      name: 'Agente de Segurança',
      R: 180, lat: -45 * Math.PI / 180, lon0: 240 * Math.PI / 180,
      el: document.getElementById('node-seguranca'),
      type: 'outer'
    },
    {
      id: 'node-raciocinio',
      name: 'Agente de Raciocínio',
      R: 130, lat: 50 * Math.PI / 180, lon0: 180 * Math.PI / 180,
      el: document.getElementById('node-raciocinio'),
      type: 'outer'
    },
    {
      id: 'node-conhecimento',
      name: 'Base de Conhecimento',
      R: 130, lat: -10 * Math.PI / 180, lon0: 300 * Math.PI / 180,
      el: document.getElementById('node-conhecimento'),
      type: 'sub'
    },
    {
      id: 'node-barramento',
      name: 'Barramento de Eventos',
      R: 130, lat: -40 * Math.PI / 180, lon0: 45 * Math.PI / 180,
      el: document.getElementById('node-barramento'),
      type: 'sub'
    }
  ];

  // Define connection topology
  const connections = [
    { from: 'node-interface', to: 'center', accented: true },
    { from: 'node-analista', to: 'center', accented: true },
    { from: 'node-operacional', to: 'center', accented: true },
    { from: 'node-seguranca', to: 'center', accented: true },
    { from: 'node-raciocinio', to: 'center', accented: true },
    { from: 'node-conhecimento', to: 'center', accented: false },
    { from: 'node-barramento', to: 'center', accented: false },

    // Loop connections
    { from: 'node-interface', to: 'node-analista', accented: false },
    { from: 'node-analista', to: 'node-operacional', accented: false },
    { from: 'node-operacional', to: 'node-seguranca', accented: false },
    { from: 'node-seguranca', to: 'node-raciocinio', accented: false },
    { from: 'node-raciocinio', to: 'node-interface', accented: false },
    { from: 'node-conhecimento', to: 'node-raciocinio', accented: false },
    { from: 'node-barramento', to: 'node-interface', accented: false }
  ];

  // Initialize line elements
  connectionsContainer.innerHTML = '';
  connections.forEach((conn, index) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('id', `conn-line-${index}`);
    line.setAttribute('stroke', conn.accented ? '#1A3A5C' : '#0A0A0A');
    line.setAttribute('stroke-width', conn.accented ? '1' : '0.8');
    line.setAttribute('opacity', conn.accented ? '0.35' : '0.10');
    connectionsContainer.appendChild(line);
  });

  // Initialize active signaling packet dots
  const signals = [
    { connIndex: 0, t: 0.0, speed: 0.008 },
    { connIndex: 2, t: 0.4, speed: 0.006 },
    { connIndex: 4, t: 0.7, speed: 0.007 },
    { connIndex: 8, t: 0.2, speed: 0.009 },
    { connIndex: 11, t: 0.5, speed: 0.005 }
  ];
  signalsContainer.innerHTML = '';
  signals.forEach((sig, index) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('id', `sig-dot-${index}`);
    circle.setAttribute('r', '2');
    circle.setAttribute('fill', '#1A3A5C');
    circle.setAttribute('opacity', '0.75');
    signalsContainer.appendChild(circle);
  });

  // Setup wireframe line shapes
  latitudeContainer.innerHTML = '';
  const latAngles = [-60, -30, 0, 30, 60];
  latAngles.forEach((angleDeg) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    if (angleDeg === 0) {
      // Accented Equator Line in Slate Blue
      path.setAttribute('stroke', '#1A3A5C');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('opacity', '0.35');
    } else {
      path.setAttribute('stroke', '#0A0A0A');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('opacity', '0.06');
    }
    latitudeContainer.appendChild(path);
  });

  longitudeContainer.innerHTML = '';
  const lonOffsets = [0, 30, 60, 90, 120, 150];
  lonOffsets.forEach(() => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#0A0A0A');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('opacity', '0.06');
    longitudeContainer.appendChild(path);
  });

  // Math Helpers to project 3D to 2D
  function getLatitudePath(latRad, R, phi) {
    let d = "";
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      let lonRad = (i / steps) * Math.PI * 2;
      let x = R * Math.cos(latRad) * Math.sin(lonRad);
      let y = R * Math.sin(latRad);
      let z = R * Math.cos(latRad) * Math.cos(lonRad);

      let xP = x;
      let yP = y * Math.cos(phi) - z * Math.sin(phi);

      let X = xP + cx;
      let Y = yP + cy;
      if (i === 0) d += `M ${X.toFixed(1)} ${Y.toFixed(1)}`;
      else d += ` L ${X.toFixed(1)} ${Y.toFixed(1)}`;
    }
    return d;
  }

  function getLongitudePath(lonRad, R, phi) {
    let d = "";
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      let latRad = -Math.PI / 2 + (i / steps) * Math.PI;
      let x = R * Math.cos(latRad) * Math.sin(lonRad);
      let y = R * Math.sin(latRad);
      let z = R * Math.cos(latRad) * Math.cos(lonRad);

      let xP = x;
      let yP = y * Math.cos(phi) - z * Math.sin(phi);

      let X = xP + cx;
      let Y = yP + cy;
      if (i === 0) d += `M ${X.toFixed(1)} ${Y.toFixed(1)}`;
      else d += ` L ${X.toFixed(1)} ${Y.toFixed(1)}`;
    }
    return d;
  }

  // Loop Frame
  function animate() {
    // Increment rotation
    theta += speed;

    // Render latitude static wireframes (tilted sphere)
    const latPaths = latitudeContainer.querySelectorAll('path');
    latAngles.forEach((angleDeg, i) => {
      const latRad = angleDeg * Math.PI / 180;
      const d = getLatitudePath(latRad, R_globe, tilt);
      latPaths[i].setAttribute('d', d);
    });

    // Render rotating longitude wireframes
    const lonPaths = longitudeContainer.querySelectorAll('path');
    lonOffsets.forEach((offsetDeg, i) => {
      const lonRad = (offsetDeg * Math.PI / 180) + theta;
      const d = getLongitudePath(lonRad, R_globe, tilt);
      lonPaths[i].setAttribute('d', d);
    });

    // Compute and update nodes positions
    nodes.forEach(node => {
      let currentLon = node.lon0 + theta;
      let x = node.R * Math.cos(node.lat) * Math.sin(currentLon);
      let y = node.R * Math.sin(node.lat);
      let z = node.R * Math.cos(node.lat) * Math.cos(currentLon);

      // Tilt around X-axis
      let xP = x;
      let yP = y * Math.cos(tilt) - z * Math.sin(tilt);
      let zP = y * Math.sin(tilt) + z * Math.cos(tilt);

      node.xProjected = xP + cx;
      node.yProjected = yP + cy;
      node.zDepth = zP; // Depth coordinate for scaling

      // Select SVG node components
      const outerCircle = node.el.querySelector('.node-outer, .node-outer-sub');
      const innerCircle = node.el.querySelector('.node-inner, .node-inner-sub');

      outerCircle.setAttribute('cx', node.xProjected);
      outerCircle.setAttribute('cy', node.yProjected);
      innerCircle.setAttribute('cx', node.xProjected);
      innerCircle.setAttribute('cy', node.yProjected);

      // 3D perspective mapping: size and opacity
      let normZ = (zP + node.R) / (2 * node.R); // Normalized depth [0, 1]
      let scale = 0.85 + 0.3 * normZ;
      let opacity = 0.45 + 0.55 * normZ;

      if (hoveredNodeName !== node.name) {
        node.el.setAttribute('opacity', opacity);
        let baseOuter = node.type === 'outer' ? 5 : 4;
        let baseInner = node.type === 'outer' ? 2.5 : 2;
        outerCircle.setAttribute('r', baseOuter * scale);
        innerCircle.setAttribute('r', baseInner * scale);
      } else {
        node.el.setAttribute('opacity', '1.0');
        let baseOuter = node.type === 'outer' ? 5 : 4;
        let baseInner = node.type === 'outer' ? 2.5 : 2;
        // Larger scale on hover
        outerCircle.setAttribute('r', baseOuter * scale * 1.35);
        innerCircle.setAttribute('r', baseInner * scale * 1.35);
      }
    });

    // Update lines between nodes
    connections.forEach((conn, index) => {
      const line = document.getElementById(`conn-line-${index}`);

      let startX, startY;
      if (conn.from === 'center') {
        startX = cx;
        startY = cy;
      } else {
        const fromNode = nodes.find(n => n.id === conn.from);
        startX = fromNode.xProjected;
        startY = fromNode.yProjected;
      }

      let endX, endY;
      if (conn.to === 'center') {
        endX = cx;
        endY = cy;
      } else {
        const toNode = nodes.find(n => n.id === conn.to);
        endX = toNode.xProjected;
        endY = toNode.yProjected;
      }

      line.setAttribute('x1', startX);
      line.setAttribute('y1', startY);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);

      // Store coordinate endpoints on connection object for signal animation
      conn.startX = startX;
      conn.startY = startY;
      conn.endX = endX;
      conn.endY = endY;
    });

    // Update animated signal packets
    signals.forEach((sig, index) => {
      const dot = document.getElementById(`sig-dot-${index}`);
      const conn = connections[sig.connIndex];

      sig.t += sig.speed;
      if (sig.t > 1.0) {
        sig.t = 0;
        // Transition randomly to another line to maintain dynamic flow
        sig.connIndex = Math.floor(Math.random() * connections.length);
      }

      let x = (1 - sig.t) * conn.startX + sig.t * conn.endX;
      let y = (1 - sig.t) * conn.startY + sig.t * conn.endY;

      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
    });

    requestAnimationFrame(animate);
  }

  // Start the projection loop
  animate();

  // 3. Intersection Observer for "O que fazemos" simple robust animation
  const pillarsSection = document.getElementById('o-que-fazemos');
  const allFlowPaths = document.querySelectorAll('.pillars-flow-container .draw-path');
  
  // Initialize SVG dash array based on path lengths
  allFlowPaths.forEach(p => {
    const len = p.getTotalLength();
    p.style.setProperty('--path-length', len);
    // Set initial state for non-reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        pillarsSection.classList.add('is-visible');
        observer.unobserve(pillarsSection); // Trigger only once, never breaks
      }
    });
  }, { threshold: 0.25 });

  observer.observe(pillarsSection);

  // 4. Intersection Observer for "O que é um funcionário agêntico" table rows stagger
  const agenticSection = document.getElementById('o-que-e');
  if (agenticSection) {
    const agenticObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          agenticSection.classList.add('is-visible');
          const rows = agenticSection.querySelectorAll('.table-row');
          rows.forEach((row, index) => {
            setTimeout(() => {
              row.classList.add('is-visible');
            }, index * 120); // 120ms delay stagger for a clean, premium cadence
          });
          agenticObserver.unobserve(agenticSection);
        }
      });
    }, { threshold: 0.15 });
    
    agenticObserver.observe(agenticSection);
  }

  // 5. Dynamic Word-by-Word Reveal for Hero Headline
  const heroHeadline = document.querySelector('.hero-headline');
  if (heroHeadline) {
    const textContent = heroHeadline.textContent.trim();
    const words = textContent.split(/\s+/);
    heroHeadline.innerHTML = words.map(word => {
      return `<span class="reveal-word"><span class="reveal-word-inner">${word}</span></span>`;
    }).join(' ');

    requestAnimationFrame(() => {
      const inners = heroHeadline.querySelectorAll('.reveal-word-inner');
      inners.forEach((inner, idx) => {
        setTimeout(() => {
          inner.classList.add('animate');
        }, idx * 60); // 60ms stagger between words
      });
    });
  }

  // 6. Technical Grid Line Drawing Animation on Load
  const technicalGrid = document.querySelector('.technical-grid');
  if (technicalGrid) {
    const linesCount = 6;
    for (let i = 1; i <= linesCount; i++) {
      const hLine = document.createElement('div');
      hLine.className = 'grid-reveal-line horizontal';
      hLine.style.top = `${(i / (linesCount + 1)) * 100}%`;
      technicalGrid.appendChild(hLine);

      const vLine = document.createElement('div');
      vLine.className = 'grid-reveal-line vertical';
      vLine.style.left = `${(i / (linesCount + 1)) * 100}%`;
      technicalGrid.appendChild(vLine);

      setTimeout(() => {
        hLine.classList.add('animate');
      }, i * 140);

      setTimeout(() => {
        vLine.classList.add('animate');
      }, (i + 1) * 140);
    }
  }

  // 7. General Scroll Reveal with Blur (all sections)
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      const intersecting = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target);

      intersecting.forEach((target, index) => {
        setTimeout(() => {
          target.classList.add('is-revealed');
        }, index * 100);
        revealObserver.unobserve(target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 8. Methodology Section Slider Animations
  const sec = document.querySelector('.metodo');
  const cards = document.querySelectorAll('.metodo-card');
  const niveis = document.querySelectorAll('.metodo-diagrama .nivel');
  const diagramProgressLine = document.getElementById('diagram-progress-line');
  const btnPrev = document.querySelector('.metodo-btn.prev');
  const btnNext = document.querySelector('.metodo-btn.next');
  const currentIndicator = document.getElementById('metodo-current');
  
  if (sec && cards.length > 0 && niveis.length > 0) {
    const N = cards.length;
    const mapa = [[0,1], [2], [3], [3], [4]]; 
    let currentIdx = 0;

    function updateSlider() {
      // Update cards visibility
      cards.forEach((c, i) => c.classList.toggle('is-active', i === currentIdx));
      
      // Update diagram nodes
      niveis.forEach((n, i) => n.classList.toggle('aceso', mapa[currentIdx] ? mapa[currentIdx].includes(i) : false));

      // Update progress line
      if (diagramProgressLine && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const percentages = { 0: 0, 1: 0.25, 2: 0.5, 3: 0.75, 4: 1 };
        const highestLevelIndex = mapa[currentIdx] ? Math.max(...mapa[currentIdx]) : 0;
        const revealAmount = 500 * (percentages[highestLevelIndex] || 0);
        diagramProgressLine.style.strokeDashoffset = 1000 - revealAmount;
      }

      // Update indicator
      if (currentIndicator) {
        currentIndicator.textContent = String(currentIdx + 1).padStart(2, '0');
      }
    }

    function nextCard() {
      currentIdx = (currentIdx + 1) % N;
      updateSlider();
    }

    function prevCard() {
      currentIdx = (currentIdx + N - 1) % N;
      updateSlider();
    }

    // Button Listeners
    if (btnNext) btnNext.addEventListener('click', nextCard);
    if (btnPrev) btnPrev.addEventListener('click', prevCard);

    // Keyboard support when section is in view
    window.addEventListener('keydown', (e) => {
      const rect = sec.getBoundingClientRect();
      // Only capture arrows if section is visible in viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowRight') nextCard();
        if (e.key === 'ArrowLeft') prevCard();
      }
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    sec.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    sec.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, {passive: true});

    function handleSwipe() {
      const threshold = 50;
      if (touchEndX < touchStartX - threshold) {
        nextCard(); // Swiped left -> next
      }
      if (touchEndX > touchStartX + threshold) {
        prevCard(); // Swiped right -> prev
      }
    }

    // Initialize
    updateSlider();
  }

  // 9. Efeito Multiplicador Section Fractal Animations
  const multiplicationSection = document.querySelector('.multiplication-section');
  const fractalBranches = document.querySelectorAll('.fractal-branch');
  
  if (multiplicationSection && fractalBranches.length > 0) {
    // Initialize branch line lengths for drawing transitions
    fractalBranches.forEach(p => {
      const len = p.getTotalLength();
      p.style.setProperty('--path-length', len);
      // Set initial hidden state for non-reduced motion
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      }
    });

    // Observer to trigger the staggered reveal transitions
    const multiplicationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          multiplicationSection.classList.add('is-visible');
          multiplicationObserver.unobserve(multiplicationSection);
        }
      });
    }, { threshold: 0.20 });

    multiplicationObserver.observe(multiplicationSection);
  }

  // 10. Soluções Section Scroll Reveal & Accordion Interaction
  const solutionsSection = document.getElementById('solucoes');
  const solutionsItems = document.querySelectorAll('.solutions-item');
  const solutionsList = document.querySelector('.solutions-list');
  
  if (solutionsSection && solutionsItems.length > 0) {
    // Scroll Reveal staggered entries
    const solutionsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          solutionsItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('is-visible');
            }, index * 150); // 150ms stagger delay
          });
          solutionsObserver.unobserve(solutionsSection);
        }
      });
    }, { threshold: 0.15 });

    solutionsObserver.observe(solutionsSection);

    // Accordion Hover & Tap Interactions
    // Set first solution (01) active by default
    solutionsItems[0].classList.add('active');

    const setActiveSolution = (index) => {
      solutionsItems.forEach((item, idx) => {
        if (idx === index) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    };

    solutionsItems.forEach((item, index) => {
      // Hover event for desktop
      item.addEventListener('mouseenter', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setActiveSolution(index);
      });

      // Click event for touch devices / mobile
      item.addEventListener('click', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setActiveSolution(index);
      });
    });

    // Reset back to first solution when mouse leaves the accordion container
    if (solutionsList) {
      solutionsList.addEventListener('mouseleave', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setActiveSolution(0);
      });
    }
  }

  // 11. Quem Lidera Section Scroll Reveal Animations
  const leaderSection = document.getElementById('sobre');
  if (leaderSection) {
    const elementsToReveal = leaderSection.querySelectorAll('.leader-reveal-item');
    const leaderObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          elementsToReveal.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('is-visible');
            }, index * 80); // 80ms stagger delay
          });
          leaderObserver.unobserve(leaderSection);
        }
      });
    }, { threshold: 0.15 });

    leaderObserver.observe(leaderSection);
  }

  // 12. Final CTA Section Scroll Reveal Animations
  const finalCtaSection = document.querySelector('.final-cta-section');
  if (finalCtaSection) {
    const revealItems = finalCtaSection.querySelectorAll('.final-cta-reveal-item');
    const finalCtaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealItems.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('is-visible');
            }, index * 120); // 120ms stagger delay
          });
          finalCtaObserver.unobserve(finalCtaSection);
        }
      });
    }, { threshold: 0.20 });

    finalCtaObserver.observe(finalCtaSection);
  }

  // 13. Mobile Menu Navigation (Hamburger Toggle)
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    const toggleMenu = () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isOpen);
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    };

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          toggleMenu();
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        toggleMenu();
      }
    });
  }
});
