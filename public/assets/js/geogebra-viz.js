// Integrasi GeoGebra Apps API (deployggb.js) untuk simulasi komposisi & invers fungsi.
let ggbApplet = null;
let currentMode = 'komposisi';
let inverseExists = false;
let resizeObserver = null;
let resizeFrame = 0;
let lastAppletWidth = 0;
let lastAppletHeight = 0;
let lastCompactPerspective = null;

function getAppletDimensions() {
  const container = document.getElementById('ggb-applet-container');
  const wrapper = container.closest('.geogebra-wrap');
  const wrapperStyle = wrapper ? getComputedStyle(wrapper) : null;
  const horizontalPadding = wrapperStyle
    ? parseFloat(wrapperStyle.paddingLeft) + parseFloat(wrapperStyle.paddingRight)
    : 0;
  const availableWidth = wrapper
    ? wrapper.clientWidth - horizontalPadding
    : container.getBoundingClientRect().width;
  const width = Math.max(260, Math.floor(availableWidth));
  const viewportWidth = document.documentElement.clientWidth;
  const compact = viewportWidth <= 900;
  let height;

  if (viewportWidth <= 600) {
    height = Math.max(360, Math.min(480, Math.round(width * 1.15)));
  } else if (compact) {
    height = Math.max(420, Math.min(540, Math.round(width * 0.72)));
  } else {
    height = 460;
  }

  return { width, height, compact };
}

function resizeGeoGebra(force = false) {
  if (!ggbApplet) return;
  const { width, height, compact } = getAppletDimensions();

  if (force || Math.abs(width - lastAppletWidth) > 2 || Math.abs(height - lastAppletHeight) > 2) {
    ggbApplet.setSize(width, height);
    if (typeof ggbApplet.recalculateEnvironments === 'function') {
      ggbApplet.recalculateEnvironments();
      requestAnimationFrame(() => ggbApplet && ggbApplet.recalculateEnvironments());
    }
    lastAppletWidth = width;
    lastAppletHeight = height;
  }

  if (force || compact !== lastCompactPerspective) {
    // Pada layar sempit, panel aljabar GeoGebra disembunyikan karena nilai dan
    // rumus sudah tersedia pada kontrol HTML. Area grafik tetap utuh dan luas.
    ggbApplet.setPerspective(compact ? 'G' : 'AG');
    lastCompactPerspective = compact;
  }
}

function scheduleGeoGebraResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => resizeGeoGebra());
}

function ggbOnInit() {
  document.getElementById('ggb-status').textContent = 'Applet siap digunakan.';

  // Definisikan objek dasar. Slider a,b,c dibuat sebagai objek GeoGebra
  // namun kontrol yang ditampilkan ke pengguna adalah <input type="range">
  // kustom di HTML, disinkronkan lewat setValue()/getValue().
  ggbApplet.evalCommand('a=2');
  ggbApplet.evalCommand('b=1');
  ggbApplet.evalCommand('c=-2');

  ggbApplet.evalCommand('f(x)=a*x+b');
  ggbApplet.evalCommand('g(x)=x^2+c');
  ggbApplet.evalCommand('h(x)=f(g(x))');       // komposisi (f∘g)(x)
  ggbApplet.evalCommand('garisIdentitas: y=x');
  ggbApplet.evalCommand('t=2');
  ggbApplet.evalCommand('titikF=(t,f(t))');
  ggbApplet.evalCommand('titikInv=(f(t),t)');
  ggbApplet.evalCommand('kuadratTerbatas(x)=If(x>=0,x^2)');
  ggbApplet.evalCommand('inversKuadrat(x)=If(x>=0,sqrt(x))');

  ggbApplet.setColor('f', 47, 93, 187);        // biru — sesuai --curve-f
  ggbApplet.setColor('g', 194, 78, 46);        // oranye kemerahan — sesuai --curve-g
  ggbApplet.setColor('h', 16, 35, 63);         // ink — kurva komposisi
  ggbApplet.setColor('garisIdentitas', 60, 82, 110);
  ggbApplet.setColor('titikF', 47, 93, 187);
  ggbApplet.setColor('titikInv', 31, 138, 110);
  ggbApplet.setColor('kuadratTerbatas', 131, 85, 43);
  ggbApplet.setColor('inversKuadrat', 112, 74, 168);
  ggbApplet.setLineStyle('garisIdentitas', 1); // garis putus-putus

  ggbApplet.setVisible('a', false);
  ggbApplet.setVisible('b', false);
  ggbApplet.setVisible('c', false);
  ggbApplet.setVisible('t', false);

  syncInverseState();
  applyMode(currentMode);
  updateFormulaDisplay();
  resizeGeoGebra(true);
}

function syncInverseState() {
  if (!ggbApplet) return;

  const a = Number(document.getElementById('slider-a').value);
  if (a === 0) {
    if (inverseExists) ggbApplet.deleteObject('invf');
    inverseExists = false;
  } else {
    ggbApplet.evalCommand('invf(x)=Invert(f)');
    ggbApplet.setColor('invf', 31, 138, 110);
    inverseExists = true;
  }
}

function updateInverseWarning() {
  const warning = document.getElementById('inverse-warning');
  const aIsZero = Number(document.getElementById('slider-a').value) === 0;
  warning.hidden = !(currentMode === 'invers' && aIsZero);
}

function applyMode(mode) {
  currentMode = mode;
  if (!ggbApplet) return;
  ggbApplet.setVisible('h', mode === 'komposisi');
  ggbApplet.setVisible('garisIdentitas', mode === 'invers');
  ggbApplet.setVisible('titikF', mode === 'invers' && inverseExists);
  ggbApplet.setVisible('titikInv', mode === 'invers' && inverseExists);
  ggbApplet.setVisible('kuadratTerbatas', mode === 'invers');
  ggbApplet.setVisible('inversKuadrat', mode === 'invers');
  if (inverseExists) ggbApplet.setVisible('invf', mode === 'invers');
  updateInverseWarning();
}

function setMode(mode) {
  document.getElementById('tab-komposisi').classList.toggle('active', mode === 'komposisi');
  document.getElementById('tab-invers').classList.toggle('active', mode === 'invers');
  applyMode(mode);
}

function updateFormulaDisplay() {
  const a = document.getElementById('slider-a').value;
  const b = document.getElementById('slider-b').value;
  const c = document.getElementById('slider-c').value;
  const t = document.getElementById('slider-t').value;
  document.getElementById('val-a').textContent = a;
  document.getElementById('val-b').textContent = b;
  document.getElementById('val-c').textContent = c;
  document.getElementById('val-t').textContent = t;

  const bSign = Number(b) >= 0 ? `+${b}` : b;
  const cSign = Number(c) >= 0 ? `+${c}` : c;
  document.getElementById('formula-display').innerHTML =
    `f(x)=${a}x${bSign}, g(x)=x&sup2;${cSign}`;
}

function wireSliders() {
  const sliderA = document.getElementById('slider-a');
  const sliderB = document.getElementById('slider-b');
  const sliderC = document.getElementById('slider-c');
  const sliderT = document.getElementById('slider-t');

  const onChange = (ggbVar, el) => {
    if (ggbApplet) {
      ggbApplet.setValue(ggbVar, parseFloat(el.value));
      if (ggbVar === 'a') {
        syncInverseState();
        applyMode(currentMode);
      }
    }
    updateFormulaDisplay();
  };

  sliderA.addEventListener('input', () => onChange('a', sliderA));
  sliderB.addEventListener('input', () => onChange('b', sliderB));
  sliderC.addEventListener('input', () => onChange('c', sliderC));
  sliderT.addEventListener('input', () => onChange('t', sliderT));
}

function resetSimulation() {
  const defaults = { a: 2, b: 1, c: -2, t: 2 };
  Object.entries(defaults).forEach(([name, value]) => {
    document.getElementById(`slider-${name}`).value = String(value);
    if (ggbApplet) ggbApplet.setValue(name, value);
  });
  syncInverseState();
  updateFormulaDisplay();
  setMode('komposisi');
}

function initGeoGebraVisualization() {
  wireSliders();
  document.getElementById('reset-simulation').addEventListener('click', resetSimulation);

  const container = document.getElementById('ggb-applet-container');
  const initialDimensions = getAppletDimensions();

  const params = {
    appName: 'graphing',
    width: initialDimensions.width,
    height: initialDimensions.height,
    perspective: initialDimensions.compact ? 'G' : 'AG',
    showToolBar: false,
    showAlgebraInput: false,
    showMenuBar: false,
    showResetIcon: false,
    enableLabelDrags: false,
    enableShiftDragZoom: true,
    showFullscreenButton: true,
    language: 'id',
    appletOnLoad: function (api) {
      ggbApplet = api;
      ggbOnInit();
    },
  };

  if (typeof GGBApplet === 'undefined') {
    document.getElementById('ggb-status').textContent =
      'Gagal memuat GeoGebra. Periksa koneksi internet Anda.';
    return;
  }

  const applet = new GGBApplet(params, true);
  applet.inject('ggb-applet-container');

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(scheduleGeoGebraResize);
    resizeObserver.observe(container);
  }
  window.addEventListener('resize', scheduleGeoGebraResize, { passive: true });
  window.addEventListener('orientationchange', scheduleGeoGebraResize, { passive: true });
}

window.initGeoGebraVisualization = initGeoGebraVisualization;
