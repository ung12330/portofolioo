const MusicPlayer = (() => {
  let ctx, masterGain, playing = false;
  let nodes = [];

  const TRACK_TITLE = 'ungke — Kicau Mania';

  /* ── Bootstrap AudioContext ── */
  function _boot() {
    if (ctx) return;
    ctx         = new (window.AudioContext || window.webkitAudioContext)();
    masterGain  = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }

  /* ── Oscillator note helper ── */
  function _osc(type, freq, gainVal, detune = 0) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type            = type;
    osc.frequency.value = freq;
    osc.detune.value    = detune;
    g.gain.value        = gainVal;
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    nodes.push(osc, g);
    return { osc, g };
  }

  /* ── LFO modulator ── */
  function _lfo(target, rate, depth, offset = 0) {
    const lfo = ctx.createOscillator();
    const lg  = ctx.createGain();
    lfo.frequency.value = rate;
    lg.gain.value       = depth;
    lfo.connect(lg);
    lg.connect(target);
    lfo.start(ctx.currentTime + offset);
    nodes.push(lfo, lg);
  }

  /* ── Reverb (convolver from noise) ── */
  function _reverb(wet = 0.5, secs = 3) {
    const len    = ctx.sampleRate * secs;
    const buf    = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = buf;
    const dryG  = ctx.createGain();
    const wetG  = ctx.createGain();
    dryG.gain.value = 1 - wet;
    wetG.gain.value = wet;
    conv.connect(wetG);
    wetG.connect(masterGain);
    dryG.connect(masterGain);
    nodes.push(conv, dryG, wetG);
    return { dry: dryG, wet: wetG, conv };
  }

  /* ── Build ambient soundscape ── */
  function _build() {
    // Drone pads — deep space feeling
    const droneFreqs = [55, 82.5, 110, 165]; // A1 chord
    droneFreqs.forEach((f, i) => {
      const { osc, g } = _osc('sine', f, 0.035 - i * 0.005);
      _lfo(osc.frequency, 0.05 + i * 0.02, f * 0.003, i * 0.5);
      _lfo(g.gain, 0.13 + i * 0.04, 0.012, i * 1.2);
    });

    // Soft pad harmonics
    [220, 330, 440].forEach((f, i) => {
      const { osc } = _osc('triangle', f, 0.018 - i * 0.003, (i - 1) * 8);
      _lfo(osc.frequency, 0.08 + i * 0.03, f * 0.002, i * 0.8);
    });

    // Hi shimmer — airy texture
    [880, 1100, 1320].forEach((f, i) => {
      const { osc, g } = _osc('sine', f, 0.007 - i * 0.001, i * 5);
      _lfo(g.gain, 0.2 + i * 0.06, 0.005, i * 0.6);
    });

    // Sub bass pulse
    const { osc: sub } = _osc('sine', 27.5, 0.06);
    _lfo(sub.frequency, 0.03, 0.8);

    // Noise wash (space wind)
    const bufLen  = ctx.sampleRate * 2;
    const nBuf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const nData   = nBuf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) nData[i] = Math.random() * 2 - 1;
    const nSrc    = ctx.createBufferSource();
    nSrc.buffer   = nBuf;
    nSrc.loop     = true;
    const nFilt   = ctx.createBiquadFilter();
    nFilt.type    = 'bandpass';
    nFilt.frequency.value = 600;
    nFilt.Q.value = 0.4;
    const nGain   = ctx.createGain();
    nGain.gain.value = 0.008;
    nSrc.connect(nFilt);
    nFilt.connect(nGain);
    nGain.connect(masterGain);
    nSrc.start();
    nodes.push(nSrc, nFilt, nGain);

    // Reverb tail
    _reverb(0.55, 4);
  }

  /* ── UI helpers ── */
  function _updateUI(isPlay) {
    const btn    = document.querySelector('.music-play-btn');
    const bars   = document.querySelector('.music-bars');
    const status = document.querySelector('.music-status');
    const title  = document.querySelector('.music-title');
    if (btn)    btn.textContent    = isPlay ? '⏸' : '▶';
    if (bars)   bars.classList.toggle('paused', !isPlay);
    if (title)  title.textContent  = TRACK_TITLE;
    if (status) {
      const t = window.I18N?.data;
      status.textContent = isPlay
        ? (t?.music?.playing || 'Now Playing')
        : (t?.music?.paused  || 'Paused');
    }
  }

  /* ── Public API ── */
  function toggle() {
    _boot();
    if (ctx.state === 'suspended') ctx.resume();

    if (!playing) {
      if (nodes.length === 0) _build();
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 2.5);
      playing = true;
    } else {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
      playing = false;
    }
    _updateUI(playing);
    I18N?.updateMusicLabel?.();
  }

  function isPlaying() { return playing; }

  function init() {
    document.querySelector('.music-play-btn')?.addEventListener('click', toggle);
    _updateUI(false);

    // Bars animation config
    const barEls = document.querySelectorAll('.music-bars span');
    const speeds = [0.7, 0.5, 0.9, 0.6, 0.8];
    const delays = [0, 0.15, 0.08, 0.22, 0.05];
    const heights= ['14px','20px','10px','18px','12px'];
    barEls.forEach((b, i) => {
      b.style.setProperty('--spd', speeds[i] + 's');
      b.style.setProperty('--d',   delays[i] + 's');
      b.style.setProperty('--h',   heights[i]);
    });
  }

  return { init, toggle, isPlaying };
})();
