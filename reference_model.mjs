/**
 * Literal ES-module translation of reference_model.py (2026-08-09).
 *
 * This file is a TRANSLATION, not a re-derivation: every intermediate value is
 * returned so that agreement with the Python reference can be checked term by
 * term (tests/test_js_parity.py, tolerance 1e-9).
 *
 * Sources of the embedded constants:
 * - Phase 7 (k_g):     csv/faz7_adim2_kg_temel.csv, csv/faz7_adim2_f_delik_kg.csv,
 *                      csv/faz7_adim4_kg_nihai_tablo.csv
 * - Phase 8 (gamma_R): csv/faz8_onerilen_gamma.csv
 *
 * The constants are hard-coded here because this module must mirror the Python
 * reference exactly and therefore cannot read files. Every other layer of the
 * tool loads the same values from the CSV sources into a single object, and
 * test_parity.mjs checks the two against each other, so a table that is updated
 * without updating this file fails the test rather than ageing silently.
 *
 * Identifier names are kept in the original language of the reference
 * implementation on purpose: renaming them would break the golden file and the
 * column headers of every CSV in the project. User-facing text is translated in
 * the interface layer, not here.
 */

export const LAMBDA = 1.1544;
export const F_DELIK_C = 0.5;
export const KADEME1 = "EC2 2004 (EN 1992-1-1:2004, 6.4.4)";
export const VERI_SURUMU = "database_v3_frozen.csv sha256[:16]=9df2366017ff721d";

export const KG0 = Object.freeze({ CFRP: 1.3422, saplama: 1.3738, TRM: 1.5827, fernandez: 1.2454 });
export const ETA_OP_G = Object.freeze({ paralel: 0.9764, capraz: 0.9124, bitisik: 1.2710, bosluksuz: 1.0 });
export const GAMMA_G = 0.90;
export const GAMMA_R = Object.freeze({ RC1: [1.75, 1.95], RC2: [1.85, 2.15], RC3: [2.00, 2.35] });

export const YONTEM_ALIAS = Object.freeze({
  cfrp: "CFRP", trm: "TRM", saplama: "saplama",
  "shear studs": "saplama", studs: "saplama", stud: "saplama",
  fernandez: "fernandez", "inclined bars": "fernandez", "egik cubuk": "fernandez",
});
export const DIZILIM_ALIAS = Object.freeze({
  paralel: "paralel", "face-centred": "paralel", "face centred": "paralel",
  capraz: "capraz", "çapraz": "capraz", corner: "capraz",
  bitisik: "bitisik", "bitişik": "bitisik", "l-arrangement": "bitisik",
  bosluksuz: "bosluksuz", "tek yuz": "paralel", "tek yüz": "paralel",
});

export const GECERLILIK = Object.freeze({
  d_mm: [54.0, 200.0],
  fc_MPa: [19.6, 44.0],
  ro_yuzde: [0.39, 1.571],
  u_red: [0.166, 1.000],
  delik_maks_d: [0.0, 7.37],
  delik_mesafe_d: [0.0, 5.33],
  kolon_b1_d: [1.00, 2.78],
  kolon_konum: "yalniz IC kolon",
  yukleme: "yalniz MERKEZI (eksantriklik/dengesiz moment YOK)",
  kayma_donatisi: "YOK (kayma donatili doseme kapsam disi)",
  kolon_kesiti: "DIKDORTGEN (L/dairesel/T kesit kapsam DISI)",
});

const GECERLILIK_ETIKET = Object.freeze({
  d_mm: ["54.0", "200.0"], fc_MPa: ["19.6", "44.0"],
  ro_yuzde: ["0.39", "1.571"], u_red: ["0.166", "1.0"],
  delik_maks_d: ["0.0", "7.37"], delik_mesafe_d: ["0.0", "5.33"],
  kolon_b1_d: ["1.0", "2.78"],
});

const TWO_PI = 2 * Math.PI;

function pyRepr(value) {
  if (typeof value === "string") return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  return String(value);
}

function pyTruthy(value) {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string" || Array.isArray(value)) return value.length !== 0;
  return true;
}

const fixed = (value, digits) => Number(value).toFixed(digits);
const signedFixed = (value, digits) => `${value >= 0 ? "+" : ""}${Number(value).toFixed(digits)}`;

function delik(x0, y0, x1, y1, dairesel = false) {
  return { x0, y0, x1, y1, dairesel };
}

function merkez(dl) { return [0.5 * (dl.x0 + dl.x1), 0.5 * (dl.y0 + dl.y1)]; }
function yaricap(dl) { return 0.25 * ((dl.x1 - dl.x0) + (dl.y1 - dl.y0)); }

function kolonYuzuneUzaklik(dl, c1, c2) {
  const dx = Math.max(dl.x0 - c1 / 2, -c1 / 2 - dl.x1, 0.0);
  const dy = Math.max(dl.y0 - c2 / 2, -c2 / 2 - dl.y1, 0.0);
  return Math.hypot(dx, dy);
}

function acisalAralik(dl) {
  if (dl.dairesel) {
    const [cx, cy] = merkez(dl);
    const r = yaricap(dl);
    const L = Math.hypot(cx, cy);
    if (L <= r) return [-Math.PI, Math.PI];
    const yari = Math.asin(Math.min(1.0, r / L));
    const a = Math.atan2(cy, cx);
    return [a - yari, a + yari];
  }
  const aci = [];
  for (const x of [dl.x0, dl.x1]) for (const y of [dl.y0, dl.y1]) aci.push(Math.atan2(y, x));
  aci.sort((a, b) => a - b);
  const farklar = [aci[1] - aci[0], aci[2] - aci[1], aci[3] - aci[2], aci[0] + TWO_PI - aci[3]];
  let k = 0;
  for (let i = 1; i < farklar.length; i += 1) if (farklar[i] > farklar[k]) k = i;
  if (k === 3) return [aci[0], aci[3]];
  const duzeltilmis = aci.map((a, i) => (i <= k ? a + TWO_PI : a));
  return [Math.min(...duzeltilmis), Math.max(...duzeltilmis)];
}

function ec2EsdegerDelik(dl) {
  if (dl.dairesel) return dl;
  const [cx, cy] = merkez(dl);
  const genisX = dl.x1 - dl.x0;
  const genisY = dl.y1 - dl.y0;
  if (Math.abs(cx) >= Math.abs(cy)) {
    if (genisY > genisX) {
      const yeni = Math.sqrt(genisY * genisX);
      return delik(dl.x0, cy - yeni / 2, dl.x1, cy + yeni / 2);
    }
  } else if (genisX > genisY) {
    const yeni = Math.sqrt(genisX * genisY);
    return delik(cx - yeni / 2, dl.y0, cx + yeni / 2, dl.y1);
  }
  return dl;
}

function kontrolCevresi(c1, c2, offset, yuvarlakKose, n = 6000) {
  const a = c1 / 2.0;
  const b = c2 / 2.0;
  const aci = [];
  const ds = [];
  function duzParca(x0, y0, x1, y1, toplam) {
    const uz = Math.hypot(x1 - x0, y1 - y0);
    const m = Math.max(2, Math.trunc((n * uz) / toplam));
    for (let i = 0; i < m; i += 1) {
      const t = (i + 0.5) / m;
      aci.push(Math.atan2(y0 + (y1 - y0) * t, x0 + (x1 - x0) * t));
      ds.push(uz / m);
    }
  }
  if (!yuvarlakKose || offset === 0) {
    const A = a + offset;
    const B = b + offset;
    const toplam = 4 * (A + B);
    for (const p of [[A, -B, A, B], [A, B, -A, B], [-A, B, -A, -B], [-A, -B, A, -B]]) {
      duzParca(...p, toplam);
    }
  } else {
    const toplam = 2 * (c1 + c2) + TWO_PI * offset;
    for (const p of [[a + offset, -b, a + offset, b], [a, b + offset, -a, b + offset],
      [-a - offset, b, -a - offset, -b], [-a, -b - offset, a, -b - offset]]) {
      duzParca(...p, toplam);
    }
    for (const [cx, cy, a0] of [[a, b, 0.0], [-a, b, Math.PI / 2], [-a, -b, Math.PI], [a, -b, 3 * Math.PI / 2]]) {
      const uz = offset * Math.PI / 2;
      const m = Math.max(2, Math.trunc((n * uz) / toplam));
      for (let i = 0; i < m; i += 1) {
        const th = a0 + ((i + 0.5) / m) * (Math.PI / 2);
        aci.push(Math.atan2(cy + offset * Math.sin(th), cx + offset * Math.cos(th)));
        ds.push(uz / m);
      }
    }
  }
  let uTam = 0.0;
  for (const value of ds) uTam += value;
  return [aci, ds, uTam];
}

function azaltilmisCevre(c1, c2, d, offsetKatsayisi, yuvarlakKose, delikler,
  maksUzaklik = null, ec2Esdeger = false, n = 6000) {
  const [aci, ds, uTam] = kontrolCevresi(c1, c2, offsetKatsayisi * d, yuvarlakKose, n);
  const etkin = [];
  for (const dl of delikler ?? []) {
    if (maksUzaklik !== null && kolonYuzuneUzaklik(dl, c1, c2) > maksUzaklik) continue;
    etkin.push(ec2Esdeger ? ec2EsdegerDelik(dl) : dl);
  }
  const maske = new Uint8Array(aci.length);
  for (const dl of etkin) {
    const [a0, a1] = acisalAralik(dl);
    for (const kay of [-TWO_PI, 0.0, TWO_PI]) {
      for (let i = 0; i < aci.length; i += 1) if (aci[i] >= a0 + kay && aci[i] <= a1 + kay) maske[i] = 1;
    }
  }
  let kayip = 0.0;
  for (let i = 0; i < ds.length; i += 1) if (maske[i]) kayip += ds[i];
  return { u_tam: uTam, u_azaltilmis: uTam - kayip, u_kayip: kayip, dikkate_alinan_delik: etkin.length };
}

function azaltEc2(c1, c2, d, delikler) {
  return azaltilmisCevre(c1, c2, d, 2.0, true, delikler, 6.0 * d, true);
}

function yerlesim(dizilim, b1Girdi, b2Girdi, nDelik, mesafe, c1, c2, dairesel = false) {
  if (b1Girdi === null || b1Girdi === undefined || (nDelik || 0) === 0) return [];
  const s = String(dizilim || "").toLowerCase();
  const m = mesafe === null || mesafe === undefined ? 0.0 : Number(mesafe);
  const b1 = Number(b1Girdi);
  const b2 = Number(pyTruthy(b2Girdi) ? b2Girdi : b1Girdi);
  const a = c1 / 2.0;
  const b = c2 / 2.0;
  function yuzX(isaret = 1, kaydir = 0.0) {
    const x0 = a + m;
    return delik(isaret > 0 ? isaret * x0 : -(x0 + b1), kaydir - b2 / 2,
      isaret > 0 ? isaret * (x0 + b1) : -x0, kaydir + b2 / 2, dairesel);
  }
  function yuzY(isaret = 1, kaydir = 0.0) {
    const y0 = b + m;
    return delik(kaydir - b2 / 2, isaret > 0 ? isaret * y0 : -(y0 + b1),
      kaydir + b2 / 2, isaret > 0 ? isaret * (y0 + b1) : -y0, dairesel);
  }
  function kose(sx = 1, sy = 1) {
    const x0 = a + m;
    const y0 = b + m;
    return delik(sx > 0 ? x0 : -(x0 + b1), sy > 0 ? y0 : -(y0 + b2),
      sx > 0 ? x0 + b1 : -x0, sy > 0 ? y0 + b2 : -y0, dairesel);
  }
  const yuzDar = (isaret = 1) => (c2 <= c1 ? yuzX(isaret) : yuzY(isaret));
  const yuzGenis = (isaret = 1) => (c2 <= c1 ? yuzY(isaret) : yuzX(isaret));
  const vari = (...kelimeler) => kelimeler.some((x) => s.includes(x));

  if (vari("kucuk", "küçük", "kisa kenar", "kısa kenar", "dar yuz")) {
    if (nDelik === 1) return [yuzDar(1)];
    if (nDelik === 2) return [yuzDar(1), yuzDar(-1)];
    return null;
  }
  if (vari("buyuk yuz", "uzun kenar", "genis yuz")) {
    if (nDelik === 1) return [yuzGenis(1)];
    if (nDelik === 2) return [yuzGenis(1), yuzGenis(-1)];
    return null;
  }
  if (vari("bosluksuz")) return [];
  if (vari("paralel") && nDelik === 2) return [yuzX(1), yuzX(-1)];
  if (vari("capraz", "çapraz") && nDelik === 2) return [kose(1, 1), kose(-1, -1)];
  if (vari("capraz", "çapraz") && nDelik === 1) return [kose(1, 1)];
  if (vari("paralel") && nDelik === 1) return [yuzX(1)];
  if (s.trim() === "bitisik") return [yuzX(1), yuzY(1)];
  if (vari("karsilikli")) return [yuzX(1), yuzX(-1)];
  if (vari("2x2")) {
    if (nDelik !== 4) return null;
    return [b2 / 2 + b2, b2 / 2].map((ky) => delik(a + m, ky - b2, a + m + b1, ky, dairesel))
      .concat([b2 / 2 + b2, b2 / 2].map((ky) => delik(a + m + b1, ky - b2, a + m + 2 * b1, ky, dairesel)));
  }
  if (vari("l duzeni", "l düzeni", "kose cevresinde")) return nDelik === 3 ? [yuzX(1), kose(1, 1), yuzY(1)] : null;
  if (vari("yan yana", "e-w sira", "sira")) {
    if (nDelik === 2) return [-b2, 0.0].map((k) => delik(a + m, k, a + m + b1, k + b2, dairesel));
    if (nDelik === 3) return [-1.5 * b2, -0.5 * b2, 0.5 * b2].map((k) => delik(a + m, k, a + m + b1, k + b2, dairesel));
    return null;
  }
  if (vari("hat", "sira disari", "disari")) {
    const sonuc = [];
    for (let i = 0; i < Math.trunc(nDelik); i += 1) sonuc.push(delik(a + m + i * b1, -b2 / 2, a + m + (i + 1) * b1, b2 / 2, dairesel));
    return sonuc;
  }
  if (vari("tek yuz", "tek yüz", "bir yuz", "tek delik", "on yuz")) return nDelik === 1 ? [yuzX(1)] : null;
  if (vari("dort yuz", "dört yüz", "her yuz")) return nDelik === 4 ? [yuzX(1), yuzX(-1), yuzY(1), yuzY(-1)] : null;
  if (vari("kose", "köse", "köşe")) return nDelik === 1 ? [kose(1, 1)] : null;
  return null;
}

function vEc2(fc, u, d, ro, C = 0.18, vMinUygula = true) {
  const k = Math.min(2.0, 1.0 + Math.sqrt(200.0 / d));
  const rho = Math.min(ro, 0.02);
  let v = C * k * Math.pow(100.0 * rho * fc, 1.0 / 3.0);
  if (vMinUygula) v = Math.max(v, 0.035 * Math.pow(k, 1.5) * Math.sqrt(fc));
  return v * u * d / 1000.0;
}

function kanitB(yon, diz) {
  return yon === "TRM" || (["CFRP", "saplama", "TRM", "fernandez"].includes(yon) && diz === "bitisik");
}

export function f_delik(u_red, c = F_DELIK_C) {
  return 1.0 - c * Math.sqrt(Math.max(0.0, 1.0 - u_red));
}

export function hesapla({
  d, fc, ro, kolon_b1, kolon_b2 = null,
  delik_b1 = null, delik_b2 = null, delik_sayisi = 0,
  delik_dizilim = "bosluksuz", delik_mesafe = 0.0, delik_sekli = "kare",
  kolon_konum = "ic", kolon_kesiti = "dikdortgen", yukleme = "merkezi",
  eksantriklik = 0.0, moment_M_V = 0.0, kayma_donatisi = false, V_flex_kN = null,
  g_yontem = null, g_miktar = null, sinif = "RC2",
  fy = null, t = null, B = null, r_s = null, d_g = null,
  lam = LAMBDA, c_fdelik = F_DELIK_C,
} = {}) {
  void g_miktar;
  const uyari = [];
  kolon_b2 = pyTruthy(kolon_b2) ? kolon_b2 : kolon_b1;

  if (!["ic", "iç", "interior"].includes(String(kolon_konum).trim().toLowerCase())) {
    uyari.push(`KAPSAM DISI: kolon_konum = ${pyRepr(kolon_konum)}. Model YALNIZ IC kolon ` +
      "icin kalibre edildi; kenar/kose kolon verisi ana sete girmemistir.");
  }
  if (!["dikdortgen", "dikdörtgen", "kare", "rectangular"].includes(String(kolon_kesiti).trim().toLowerCase())) {
    uyari.push(`KAPSAM DISI: kolon_kesiti = ${pyRepr(kolon_kesiti)}. Geometri motoru ` +
      "DIKDORTGEN kolon varsayar; L/dairesel/T kesitte kontrol cevresi " +
      "YANLIS hesaplanir (ornek: dairesel D=402 kare sanilirsa cevre +%14.4).");
  }
  if (!["merkezi", "merkezî", "concentric", "central"].includes(String(yukleme).trim().toLowerCase())) {
    uyari.push(`KAPSAM DISI: yukleme = ${pyRepr(yukleme)}. Model YALNIZ merkezi yukleme ` + "icin kalibre edildi.");
  }
  if (pyTruthy(eksantriklik)) uyari.push(`KAPSAM DISI: eksantriklik = ${eksantriklik} mm. Eksantrik yukleme ` + "kalibrasyon setine GIRMEMISTIR (ayri tartisma konusu).");
  if (pyTruthy(moment_M_V)) uyari.push(`KAPSAM DISI: dengesiz moment M/V = ${moment_M_V}. Model dengesiz ` + "moment aktarimi icin kalibre EDILMEMISTIR.");
  if (pyTruthy(kayma_donatisi)) uyari.push("KAPSAM DISI: kayma_donatisi = True. Kayma donatili doseme kalibrasyon " + "setine GIRMEMISTIR; EC2'nin kayma donatili kurallari uygulanmaz.");

  const kullanilmayan = [];
  if (r_s !== null && r_s !== undefined) kullanilmayan.push("r_s");
  if (d_g !== null && d_g !== undefined) kullanilmayan.push("d_g");
  if (fy !== null && fy !== undefined) kullanilmayan.push("fy");
  if (kullanilmayan.length) uyari.push("EC2 2004 tabaninda KULLANILMAYAN girdi(ler) yok sayildi: " + kullanilmayan.join(", "));

  const [, , u_tam] = kontrolCevresi(kolon_b1, kolon_b2, 2.0 * d, true);
  const n_delik = Math.trunc(pyTruthy(delik_sayisi) ? Number(delik_sayisi) : 0);
  let u_red_mm;
  if (n_delik > 0) {
    const delikler = yerlesim(delik_dizilim, delik_b1, delik_b2, n_delik, delik_mesafe,
      kolon_b1, kolon_b2, String(delik_sekli).trim().toLowerCase() === "dairesel");
    if (delikler === null) throw new Error(`delik_dizilim cozulemedi: ${pyRepr(delik_dizilim)}`);
    u_red_mm = azaltEc2(kolon_b1, kolon_b2, d, delikler).u_azaltilmis;
  } else u_red_mm = u_tam;
  const u_red = u_red_mm / u_tam;

  const T1 = vEc2(fc, u_tam, d, ro / 100.0);
  const T1_lam = lam * T1;
  const fd = f_delik(u_red, c_fdelik);

  const sinifAnahtar = String(sinif).trim().toUpperCase();
  if (!(sinifAnahtar in GAMMA_R)) {
    throw new Error(`sinif cozulemedi: ${pyRepr(sinif)} (beklenen: ['RC1', 'RC2', 'RC3'])`);
  }
  sinif = sinifAnahtar;
  const [g_un, g_str] = GAMMA_R[sinif];
  const diz_anahtar = n_delik === 0 ? "bosluksuz" : DIZILIM_ALIAS[String(delik_dizilim).trim().toLowerCase()];

  let kg_0 = null;
  let eta_g = null;
  let kanit = null;
  let kg;
  let kg_durum;
  if (pyTruthy(g_yontem)) {
    if (diz_anahtar === undefined) {
      throw new Error(`k_g icin delik_dizilim cozulemedi: ${pyRepr(delik_dizilim)}. eta_op,g YALNIZ ` +
        "'paralel' (face-centred), 'capraz' (corner) ve 'bitisik' (L-arrangement) " +
        "icin kalibre edilmistir (K12/K14); baska bir dizilime esleme SEMANTIK " +
        "karardir ve otomatik YAPILMAZ. Guclendirme hesabi icin bu ucunden birini " + "acikca verin.");
    }
    const yon = YONTEM_ALIAS[String(g_yontem).trim().toLowerCase()];
    if (yon === undefined) {
      throw new Error(`g_yontem cozulemedi: ${pyRepr(g_yontem)} (beklenen: ['CFRP', 'TRM', 'fernandez', 'saplama'])`);
    }
    kg_0 = KG0[yon];
    eta_g = ETA_OP_G[diz_anahtar];
    kg = kg_0 * eta_g;
    kanit = kanitB(yon, diz_anahtar) ? "B" : "A";
    kg_durum = `k_g = k_g,0(${yon}) x eta_op,g(${diz_anahtar}) = ${fixed(kg_0, 4)} x ` +
      `${fixed(eta_g, 4)} = ${fixed(kg, 4)} · KANIT DUZEYI ${kanit}`;
    if (yon === "fernandez") uyari.push("AYRI KATEGORI — 'fernandez' (egik yapistirilmis celik cubuk) " +
      "kayma saplamasina KATILMAZ (yapistirma + egim != mekanik ankraj); ayri raporlanir.");
    if (yon === "TRM") uyari.push("KANIT DUZEYI B — TRM: k_g,temel TEK laboratuvardan (mercimek_2022, 4 cift) " +
      "kalibre edilmistir. Sinirli dis karsilastirmada model TRM'nin k_g'sini " +
      "ORTALAMA %32 FAZLA tahmin etmektedir (gozlenen/tahmin = 0.759, n=2, tek " +
      "kaynak) — sapmanin YONU " +
      "bilinmekte, BUYUKLUGU bilinmemektedir. Bagimsiz deneyle dogrulanmalidir.");
    if (n_delik >= 2 && diz_anahtar === "bitisik") uyari.push("KANIT DUZEYI B — BITISIK DIZILIM: f_delik,kg yalniz kendi ikiz programimizla " +
      "(9 cift, TEK laboratuvar) kalibre edilmistir. BAGIMSIZ HICBIR DOGRULAMA " +
      "NOKTASI YOKTUR ve bosluk YAPISALDIR (mevcut bagimsiz veri setlerinin tamami " +
      "TEK delikli, `bitisik` ise tanimi geregi IKI deliklidir). Uc dizilim icinde " +
      "EN YUKSEK deger budur; yani DOGRULANMAMIS olan taraf, tasarimda EN COMERT " +
      "olan taraftir. (TRM'den FARKI: TRM'de sapmanin yonu biliniyor, burada hic " +
      "veri yok.) Bagimsiz IKI DELIKLI deneyle dogrulanmalidir.");
  } else {
    kg = 1.0;
    kg_durum = "guclendirme yok";
  }

  const V = T1_lam * fd * kg;
  const V_d_un = T1_lam * fd / g_un;
  let kg_tasarim;
  let V_d;
  let esik;
  let net;
  if (pyTruthy(g_yontem)) {
    kg_tasarim = GAMMA_G * kg;
    V_d = T1_lam * fd * kg_tasarim / g_str;
    esik = g_str / g_un;
    net = 100.0 * (kg_tasarim / esik - 1.0);
    if (kg_tasarim <= esik) uyari.push(`BASA-BAS ESIGI ALTINDA (${sinif}): gamma_g*k_g = ${fixed(kg_tasarim, 4)} <= ` +
      `esik ${fixed(esik, 4)} (= gamma_R,gucl/gamma_R,gucl.siz = ${g_str}/${g_un}). ` +
      `Guclendirme bu hucrede TASARIM DEGERINI DUSURUYOR (net ${signedFixed(net, 1)}%): ` +
      "k_g'nin getirdigi ek belirsizlik ortalama kazanci asiyor. ORTALAMA kazanc " +
      "ile TASARIM kazanci ayni sey DEGILDIR.");
  } else {
    kg_tasarim = null; V_d = V_d_un; esik = null; net = null;
  }

  const olcum = {
    d_mm: d, fc_MPa: fc, ro_yuzde: ro, u_red,
    delik_maks_d: n_delik ? Math.max(delik_b1 || 0, delik_b2 || delik_b1 || 0) / d : 0.0,
    delik_mesafe_d: (delik_mesafe || 0) / d, kolon_b1_d: kolon_b1 / d,
  };
  for (const [k, v] of Object.entries(olcum)) {
    const [lo, hi] = GECERLILIK[k];
    if (!(lo <= v && v <= hi)) {
      const [loS, hiS] = GECERLILIK_ETIKET[k];
      uyari.push(`GECERLILIK ARALIGI DISI: ${k} = ${fixed(v, 3)} (aralik ${loS}-${hiS})`);
    }
  }

  let v_flex_oran = null;
  if (pyTruthy(V_flex_kN)) {
    v_flex_oran = V / V_flex_kN;
    if (v_flex_oran > 0.9) uyari.push(`EGILME SINIRLI: V_tahmin/V_flex = ${fixed(v_flex_oran, 3)} > 0.90. ` +
      "Bu kesitte EGILME yonetiyor olabilir; zimbalama tahmini " +
      "belirleyici DEGILDIR (kalibrasyon setinde bu numuneler yoktu).");
  } else uyari.push("V_flex verilmedi: egilme sinirinin yonetip yonetmedigi KONTROL " +
    "EDILEMEDI (Kural 8). Tasarimda egilme kapasitesi ayrica kontrol edilmelidir.");

  return {
    V_tahmin_kN: V,
    V_d_kN: V_d,
    V_d_guclendirilmemis_kN: V_d_un,
    ara: {
      u_tam_mm: u_tam, u_red_mm, u_red, T1_ec2_kN: T1, lambda: lam,
      lambda_x_T1_kN: T1_lam, f_delik: fd, k_g: kg, k_g_0: kg_0,
      eta_op_g: eta_g, k_g_durum: kg_durum, kanit_duzeyi: kanit,
      sinif, gamma_R: pyTruthy(g_yontem) ? g_str : g_un,
      gamma_R_guclendirilmemis: g_un, gamma_g: pyTruthy(g_yontem) ? GAMMA_G : null,
      k_g_tasarim: kg_tasarim, basabas_esigi: esik, net_kazanc_yuzde: net,
      v_flex_oran, r_s_mm: null, d_g_mm: null,
    },
    uyarilar: uyari,
    girdi: {
      d, fc, ro, fy, t, B, kolon_b1, kolon_b2, delik_b1, delik_b2,
      delik_sayisi: n_delik, delik_dizilim, delik_mesafe, delik_sekli,
      kolon_konum, kolon_kesiti, yukleme, eksantriklik, moment_M_V,
      kayma_donatisi, V_flex_kN,
    },
    model: {
      kademe1: KADEME1, f_delik: `1 - ${c_fdelik}*sqrt(1-u_red)`, lambda: lam,
      veri_surumu: VERI_SURUMU, k_g_kaynagi: "FAZ 7 (K13/K14/K16)",
      gamma_kaynagi: "FAZ 8 / K21",
    },
  };
}

async function batchCli() {
  if (typeof process === "undefined" || process.argv[2] !== "--batch") return;
  const { readFile } = await import("node:fs/promises");
  const yol = process.argv[3];
  if (!yol) throw new Error("--batch icin girdi JSON yolu gerekli");
  const girdiler = JSON.parse(await readFile(yol, "utf8"));
  const ciktilar = girdiler.map(({ ad, ...girdi }) => {
    try {
      const s = hesapla(girdi);
      return { ad, V_tahmin_kN: s.V_tahmin_kN, V_d_kN: s.V_d_kN,
        V_d_guclendirilmemis_kN: s.V_d_guclendirilmemis_kN,
        uyarilar: s.uyarilar, ...s.ara };
    } catch (error) { return { ad, hata: error.message }; }
  });
  process.stdout.write(JSON.stringify(ciktilar));
}

await batchCli();
