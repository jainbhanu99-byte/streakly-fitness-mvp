/* Hand-built SVG plant illustration — an "x-ray" pot cross-section showing
   the seed and root system growing underground, with a stem/leaves/blossoms
   growing above soil. Growth is continuously interpolated within each of the
   six STAGES thresholds (from app.js), not just jumped at each boundary.
   No image assets, no libraries — plain inline SVG + CSS, same constraint
   as the rest of the app. */

const POT_TONES = {
  pot_terracotta: { wall: '#B9784F', rim: '#A35A40' },
  pot_ceramic: { wall: '#C9C2B4', rim: '#A9A08D' },
  pot_copper: { wall: '#C08A3E', rim: '#8F6423' }
};

/* stemHeight is the *above-soil* height in SVG units at the start of each
   stage; interpolated toward the next stage's start value as points climb
   within the current stage. leaves/branches/blossoms are rounded targets. */
const PLANT_STAGE_SHAPES = [
  { stemHeight: 0, leaves: 0, branches: 1, blossoms: 0 },   // Seed
  { stemHeight: 10, leaves: 2, branches: 2, blossoms: 0 },  // Sprout
  { stemHeight: 24, leaves: 4, branches: 3, blossoms: 0 },  // Sapling
  { stemHeight: 42, leaves: 6, branches: 4, blossoms: 0 },  // Young tree
  { stemHeight: 50, leaves: 6, branches: 4, blossoms: 4 },  // Blooming
  { stemHeight: 58, leaves: 8, branches: 5, blossoms: 7 }   // Flourishing
];

function stageIndexFor(points) {
  let idx = 0;
  STAGES.forEach((st, i) => { if (points >= st.min) idx = i; });
  return idx;
}

function rootPathsD(cx, baseY, branchCount) {
  const paths = [];
  for (let i = 0; i < branchCount; i++) {
    const spread = branchCount <= 1 ? 0 : (i / (branchCount - 1) - 0.5) * 2; // -1..1
    const len = 14 + Math.abs(spread) * 8 + (i % 2) * 4;
    const endX = cx + spread * 22;
    const endY = baseY + len;
    const ctrlX = cx + spread * 11;
    const ctrlY = baseY + len * 0.55;
    paths.push(`M${cx},${baseY} Q${ctrlX},${ctrlY} ${endX},${endY}`);
  }
  return paths;
}

function leafSVG(x, y, angleDeg, size) {
  const rad = (angleDeg * Math.PI) / 180;
  const midX = x + Math.cos(rad) * size * 0.5;
  const midY = y - Math.sin(rad) * size * 0.5;
  const rx = (size * 0.55).toFixed(1);
  const ry = (size * 0.24).toFixed(1);
  return `<ellipse cx="${midX.toFixed(1)}" cy="${midY.toFixed(1)}" rx="${rx}" ry="${ry}" fill="var(--primary)" opacity="0.92" transform="rotate(${(-angleDeg).toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)})"/>`;
}

function renderPlantSVG(totalPoints, opts) {
  opts = opts || {};
  const size = opts.size || 120;
  const potId = opts.potId || 'pot_terracotta';
  const vitality = typeof opts.vitality === 'number' ? opts.vitality : 1;
  const leveledUp = !!opts.leveledUp;

  const stageIdx = stageIndexFor(totalPoints);
  const stage = STAGES[stageIdx];
  const next = STAGES[stageIdx + 1];
  const frac = next ? Math.max(0, Math.min(1, (totalPoints - stage.min) / (next.min - stage.min))) : 1;
  const shape = PLANT_STAGE_SHAPES[stageIdx];
  const nextShape = PLANT_STAGE_SHAPES[stageIdx + 1] || shape;

  const stemHeight = shape.stemHeight + (nextShape.stemHeight - shape.stemHeight) * frac;
  const leafCount = Math.round(shape.leaves + (nextShape.leaves - shape.leaves) * frac);
  const branchCount = Math.max(1, shape.branches);
  const blossomCount = Math.round(shape.blossoms + (nextShape.blossoms - shape.blossoms) * frac);
  const seedOpacity = Math.max(0, 1 - stageIdx / 2.5);

  const tone = POT_TONES[potId] || POT_TONES.pot_terracotta;
  const cx = 70;
  const potTopY = 106, potBottomY = 158, potTopHalfW = 42, potBottomHalfW = 30;
  const groundY = 113;
  const seedY = 138;
  const soilShade = 0.55 + vitality * 0.3;
  const stemTopY = groundY - stemHeight;

  const roots = rootPathsD(cx, seedY, branchCount)
    .map(d => `<path d="${d}" stroke="#D9C7A3" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85"/>`)
    .join('');

  let leavesSVG = '';
  for (let i = 0; i < leafCount; i++) {
    const t = (i + 1) / (leafCount + 1);
    const ly = seedY - (seedY - stemTopY) * t;
    if (ly < groundY - 2) {
      const side = i % 2 === 0 ? 1 : -1;
      const angle = side > 0 ? 32 + ((i * 11) % 22) : 148 - ((i * 11) % 22);
      leavesSVG += leafSVG(cx, ly, angle, 8 + (i % 3) * 1.5);
    }
  }

  let blossomsSVG = '';
  for (let i = 0; i < blossomCount; i++) {
    const angle = (i / Math.max(1, blossomCount)) * Math.PI * 2;
    const bx = cx + Math.cos(angle) * 11;
    const by = stemTopY + 3 + Math.sin(angle) * 7;
    blossomsSVG += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="3.2" fill="var(--accent)"/>`;
  }

  const stemD = `M${cx},${seedY} Q${cx + 4},${((seedY + stemTopY) / 2).toFixed(1)} ${cx},${stemTopY.toFixed(1)}`;

  return `<svg class="plant-illustration${leveledUp ? ' stage-up-flash' : ''}" viewBox="0 0 140 170" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="plant-soil" d="M${cx - potTopHalfW + 2},${potTopY + 2} L${cx - potBottomHalfW + 2},${potBottomY - 2} L${cx + potBottomHalfW - 2},${potBottomY - 2} L${cx + potTopHalfW - 2},${potTopY + 2} Z" fill="#8A6034" style="opacity:${soilShade.toFixed(2)};"/>
    <ellipse cx="${cx}" cy="${seedY}" rx="4.5" ry="3" fill="#5C4326" opacity="${seedOpacity.toFixed(2)}"/>
    ${roots}
    <path d="M${cx - potTopHalfW},${potTopY} L${cx - potBottomHalfW},${potBottomY} L${cx + potBottomHalfW},${potBottomY} L${cx + potTopHalfW},${potTopY}" fill="none" stroke="${tone.wall}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M${cx - potTopHalfW - 4},${potTopY} L${cx + potTopHalfW + 4},${potTopY}" stroke="${tone.rim}" stroke-width="4" stroke-linecap="round"/>
    <g class="plant-growth-group">
      <path d="${stemD}" stroke="var(--primary-dark)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${leavesSVG}
      ${blossomsSVG}
    </g>
  </svg>`;
}

function restartAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  requestAnimationFrame(() => el.classList.add(className));
}

function waterPlantFX(container) {
  if (!container) return;
  const soil = container.querySelector('.plant-soil');
  restartAnimation(soil, 'soil-wet-pulse');
  const growth = container.querySelector('.plant-growth-group');
  restartAnimation(growth, 'grow-tick');
  const fx = document.createElement('div');
  fx.className = 'water-fx';
  fx.innerHTML = '<span class="water-drop wd1">💧</span><span class="water-drop wd2">💧</span><span class="water-drop wd3">💧</span>';
  container.appendChild(fx);
  setTimeout(() => { if (fx.parentNode) fx.parentNode.removeChild(fx); }, 1300);
}
