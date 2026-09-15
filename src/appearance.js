// Apariencia Astra: cristal oscuro y controles inspirados en el dashboard del usuario.
// Se incrusta en el mismo módulo; no requiere recursos ni fuentes externos.
export const APPEARANCE = `
entreno-panel {
  --e-bg: var(--primary-background-color, #070b12);
  --e-card: var(--card-background-color, #252633);
  --e-card2: var(--secondary-background-color, #20222a);
  --e-text: var(--primary-text-color, #e2e3eb);
  --e-text2: var(--secondary-text-color, #aaacb9);
  --e-acc: var(--primary-color, #32b9ec);
  --e-font: var(--primary-font-family, Roboto, system-ui, sans-serif);
  --e-glass: color-mix(in srgb, var(--e-card) 72%, transparent);
  --e-edge: color-mix(in srgb, var(--e-text) 10%, transparent);
  --e-icon-bg: color-mix(in srgb, var(--e-bg) 78%, var(--e-card));
  --e-radius-lg: 26px; --e-pad: 18px; --e-gap: 14px;
  --e-shadow: inset 0 1px 1px var(--e-edge), 0 6px 20px #00000012;
  background: var(--e-bg);
  background-image: var(--entreno-background,
    radial-gradient(ellipse at 5% 32%, #244b6266, transparent 57%),
    radial-gradient(ellipse at 85% 16%, #6d53613d, transparent 56%),
    radial-gradient(ellipse at 48% 72%, #64657855, transparent 53%));
}
entreno-panel .e-main { min-height:0; scrollbar-width:thin; scrollbar-color:var(--e-edge) transparent; }
entreno-panel .e-page { padding:22px 16px calc(30px + env(safe-area-inset-bottom)); gap:18px; }
entreno-panel .e-header { padding:4px 4px 12px; }
entreno-panel .e-header h1 { font-size:25px; font-weight:650; letter-spacing:-.025em; }
entreno-panel .e-header .sub { margin-top:5px; }
entreno-panel .e-topbar { background:transparent; border-bottom:1px solid var(--e-edge); }
/* Barra superior: iconos de HA, etiqueta accesible y subrayado activo. */
entreno-panel .e-nav { padding:0 12px; background:color-mix(in srgb,var(--e-bg) 65%,transparent); border-bottom:1px solid var(--e-edge); flex:none; }
entreno-panel .e-nav-inner { max-width:1120px; grid-template-columns:repeat(5,minmax(0,1fr)); padding:0; gap:8px; border-radius:0; background:none; box-shadow:none; }
entreno-panel .e-nav button { position:relative; min-height:68px; border-radius:0; flex-direction:column; gap:5px; padding:10px 4px; font-size:11px; color:var(--e-text2); }
entreno-panel .e-nav button .ico { width:32px; height:26px; background:none !important; }
entreno-panel .e-nav button svg { width:23px; height:23px; }
entreno-panel .e-nav button.on { color:var(--e-text); background:none; }
entreno-panel .e-nav button::after { content:''; position:absolute; bottom:0; left:16%; right:16%; height:3px; border-radius:3px; background:transparent; }
entreno-panel .e-nav button.on::after { background:var(--e-text); }
entreno-panel .e-nav button:hover { color:var(--e-text); background:var(--e-edge); }
/* Superficies de cristal: bordes leves y fondo visible entre tarjetas. */
entreno-panel .e-bubble { background:linear-gradient(130deg,var(--e-edge),transparent 65%),var(--e-glass); border:1px solid var(--e-edge); box-shadow:var(--e-shadow); }
entreno-panel .e-bubble.accent { background:linear-gradient(120deg,var(--e-acc-soft),transparent 70%),var(--e-glass); border-color:color-mix(in srgb,var(--e-acc) 23%,var(--e-edge)); }
entreno-panel .e-bubble.plain { background:none; border:0; box-shadow:none; }
entreno-panel .e-bubble-head { align-items:center; gap:12px; }
entreno-panel .e-bubble-title, entreno-panel .e-workout .e-bubble-title { font-size:16px; font-weight:650; text-transform:none; letter-spacing:0; color:var(--e-text); }
entreno-panel .e-bubble-title.big { font-size:18px; }
entreno-panel .e-bubble-sub { font-size:13px; line-height:1.45; }
entreno-panel .e-bubble-head .txt { gap:3px; }
entreno-panel .e-ico { background:var(--e-icon-bg); color:var(--e-text2); width:42px; height:42px; }
entreno-panel .e-ico.ok { color:var(--e-ok); background:var(--e-icon-bg); }
entreno-panel .e-ico.warn { color:var(--e-warn); background:var(--e-icon-bg); }
entreno-panel .e-ico.err { color:var(--e-err); background:var(--e-icon-bg); }
entreno-panel .e-ico.sm { width:36px; height:36px; }
/* Métricas en filas redondeadas con icono, etiqueta y valor. */
entreno-panel .e-metric { display:grid; grid-template-columns:36px minmax(0,1fr); column-gap:10px; row-gap:3px; border-radius:32px; padding:14px; align-items:center; }
entreno-panel .e-metric > .e-ico { grid-row:1 / 3; }
entreno-panel .e-metric .lab { font-size:12px; line-height:1.25; }
entreno-panel .e-metric .val { font-size:21px; flex-wrap:wrap; gap:3px; }
entreno-panel .e-metric .foot { grid-column:1 / -1; min-width:0; min-height:0; padding:3px 5px 0; font-size:12px; }
entreno-panel .e-metric .foot:empty { display:none; }
entreno-panel .e-section { display:flex; align-items:center; gap:14px; padding:18px 4px 4px; }
entreno-panel .e-section::after { content:''; height:5px; flex:1; min-width:18px; border-radius:99px; background:var(--e-edge); }
entreno-panel .e-section > .e-stack { min-width:0; }
entreno-panel .e-section .e-bubble-title { font-size:19px; }
entreno-panel .e-section > .e-section-action { order:2; flex:none; }
entreno-panel .e-section > svg { flex:none; width:22px; height:22px; color:var(--e-text2); }
entreno-panel .e-btn.primary { background:color-mix(in srgb,var(--e-acc) 75%,#0064ac); color:white; box-shadow:inset 0 1px 2px #ffffff20; }
entreno-panel .e-btn.ghost, entreno-panel .e-chip { background:var(--e-icon-bg); }
entreno-panel .e-chip { border:1px solid var(--e-edge); min-height:30px; }
entreno-panel .e-chip.acc { background:var(--e-acc-soft); }
entreno-panel .e-chip.ok { background:var(--e-ok-soft); }
entreno-panel .e-chip.warn { background:var(--e-warn-soft); }
entreno-panel .e-chip.err { background:var(--e-err-soft); }
entreno-panel .e-seg { background:var(--e-glass); box-shadow:inset 0 0 0 1px var(--e-edge); gap:4px; }
entreno-panel .e-seg button { min-height:42px; padding:4px 8px; }
entreno-panel .e-seg button.on { color:var(--e-text); background:var(--e-edge); }
entreno-panel .e-input, entreno-panel .e-select, entreno-panel .e-textarea { background-color:var(--e-icon-bg); border-color:var(--e-edge); border-radius:20px; }
entreno-panel .e-bar { height:6px; background:var(--e-edge); }
entreno-panel .e-bar.lg { height:8px; }
entreno-panel .e-next-item { margin:4px 0; padding:12px; border-radius:24px; background:color-mix(in srgb,var(--e-card) 55%,transparent); }
entreno-panel .e-next-item + .e-next-item { border-top:0; }
entreno-panel .e-exercise { border-radius:28px; }
entreno-panel .e-ex-head { align-items:center; }
entreno-panel .e-ex-n { display:flex; align-items:center; justify-content:center; width:34px; height:34px; padding:0; border-radius:50%; background:var(--e-icon-bg); }
entreno-panel .e-sheet { background:var(--e-card); border:1px solid var(--e-edge); box-shadow:0 20px 80px #0008; }
entreno-panel .e-sheet-bg { backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
entreno-panel .e-sheet-head { padding:20px 20px 12px; }
entreno-panel .e-sheet-body { padding:12px 20px 24px; }
entreno-panel .e-bubble-head .act { max-width:55%; flex-wrap:wrap; justify-content:flex-end; }
@media (min-width:860px) {
  entreno-panel .e-page { padding:30px 24px 40px; gap:20px; }
  entreno-panel .e-nav button { flex-direction:row; gap:10px; font-size:14px; min-height:72px; }
  entreno-panel .e-nav button .ico { width:28px; height:28px; }
  entreno-panel .e-nav-inner { gap:24px; }
}
@media (max-width:380px) {
  entreno-panel .e-page { padding-left:10px; padding-right:10px; }
  entreno-panel .e-metric { column-gap:7px; padding:11px; }
  entreno-panel .e-metric .val { font-size:18px; }
  entreno-panel .e-nav-inner { gap:0; }
  entreno-panel .e-bubble-head { flex-wrap:wrap; }
  entreno-panel .e-bubble-head .act { max-width:100%; }
}
@media (prefers-reduced-transparency:reduce) {
  entreno-panel { background-image:none; --e-glass:var(--e-card); }
  entreno-panel .e-sheet-bg { backdrop-filter:none; }
}
`;
