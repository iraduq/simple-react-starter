/**
 * Vila Casa Esy — Custom Lottie (Bodymovin v5.9.0) Animation Suite
 * Paleta oficială:
 * - Royal Navy:     #0d2c5c -> [0.051, 0.173, 0.361, 1]
 * - Deep Navy:      #163c78 -> [0.086, 0.235, 0.471, 1]
 * - Warm Gold:      #c69a3f -> [0.776, 0.604, 0.247, 1]
 * - Champagne Gold: #e6b85c -> [0.902, 0.722, 0.361, 1]
 * - Soft Gold Tint: #fdf8ec -> [0.992, 0.973, 0.925, 1]
 * - Emerald Green:  #10b981 -> [0.063, 0.725, 0.506, 1]
 * - Crimson Red:    #dc2626 -> [0.863, 0.149, 0.149, 1]
 * - Pure White:     #ffffff -> [1, 1, 1, 1]
 * - Soft Slate:     #eef2f7 -> [0.933, 0.949, 0.969, 1]
 */

export type CasaEsyLottieId =
  | "order-registered"
  | "order-preparing"
  | "order-delivering"
  | "order-delivered"
  | "booking-confirmed"
  | "smart-lock-pin"
  | "qr-pass-scan"
  | "card-payment"
  | "ai-concierge-wave"
  | "vip-crown"
  | "coastal-compass"
  | "coastal-sun-weather"
  | "housekeeping-sparkle"
  | "system-health-pulse"
  | "empty-luggage"
  | "live-broadcast-bell";

export interface CasaEsyLottieMeta {
  id: CasaEsyLottieId;
  stepNumber: string;
  title: string;
  subtitle: string;
  category: "room_service" | "bookings_payments" | "concierge_vip" | "operations_system";
  categoryLabel: string;
  whereToUse: string;
  routeExample: string;
  description: string;
  accentColor: string;
  animationData: Record<string, unknown>;
}

type RGBA = [number, number, number, number];

const C = {
  navy: [0.051, 0.173, 0.361, 1] as RGBA,
  navyLight: [0.086, 0.235, 0.471, 1] as RGBA,
  gold: [0.776, 0.604, 0.247, 1] as RGBA,
  goldBright: [0.902, 0.722, 0.361, 1] as RGBA,
  goldSoft: [0.992, 0.965, 0.89, 1] as RGBA,
  emerald: [0.063, 0.725, 0.506, 1] as RGBA,
  emeraldSoft: [0.88, 0.98, 0.93, 1] as RGBA,
  crimson: [0.863, 0.149, 0.149, 1] as RGBA,
  white: [1, 1, 1, 1] as RGBA,
  slateSoft: [0.945, 0.961, 0.976, 1] as RGBA,
  slateBorder: [0.82, 0.86, 0.91, 1] as RGBA,
};

const EASE_IN_OUT_1D = {
  i: { x: [0.42], y: [1] },
  o: { x: [0.58], y: [0] },
};

const EASE_IN_OUT_2D = {
  i: { x: 0.42, y: 1 },
  o: { x: 0.58, y: 0 },
};

const EASE_IN_OUT_3D = {
  i: { x: [0.42, 0.42, 0.42], y: [1, 1, 1] },
  o: { x: [0.58, 0.58, 0.58], y: [0, 0, 0] },
};

function kf1D(frames: Array<[number, number]>) {
  return {
    a: 1,
    k: frames.map(([t, val], idx) =>
      idx < frames.length - 1
        ? { t, s: [val], ...EASE_IN_OUT_1D }
        : { t, s: [val] },
    ),
  };
}

function kf2D(frames: Array<[number, [number, number, number]]>) {
  return {
    a: 1,
    k: frames.map(([t, val], idx) =>
      idx < frames.length - 1
        ? { t, s: val, ...EASE_IN_OUT_2D }
        : { t, s: val },
    ),
  };
}

function kf3D(frames: Array<[number, [number, number, number]]>) {
  return {
    a: 1,
    k: frames.map(([t, val], idx) =>
      idx < frames.length - 1
        ? { t, s: val, ...EASE_IN_OUT_3D }
        : { t, s: val },
    ),
  };
}

function tr() {
  return {
    ty: "tr",
    p: { a: 0, k: [0, 0] },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 },
    nm: "Transform",
  };
}

function el(x: number, y: number, w: number, h: number) {
  return {
    ty: "el",
    d: 1,
    p: { a: 0, k: [x, y] },
    s: { a: 0, k: [w, h] },
    nm: "Ellipse",
  };
}

function rc(x: number, y: number, w: number, h: number, r = 8) {
  return {
    ty: "rc",
    d: 1,
    p: { a: 0, k: [x, y] },
    s: { a: 0, k: [w, h] },
    r: { a: 0, k: r },
    nm: "Rect",
  };
}

function sh(
  pts: Array<[number, number]>,
  closed = false,
  inTangents?: Array<[number, number]>,
  outTangents?: Array<[number, number]>,
) {
  const zero = pts.map(() => [0, 0] as [number, number]);
  return {
    ty: "sh",
    ks: {
      a: 0,
      k: {
        i: inTangents || zero,
        o: outTangents || zero,
        v: pts,
        c: closed,
      },
    },
    nm: "Path",
  };
}

function st(color: RGBA, width = 6, opacity = 100) {
  return {
    ty: "st",
    c: { a: 0, k: color },
    o: { a: 0, k: opacity },
    w: { a: 0, k: width },
    lc: 2,
    lj: 2,
    ml: 4,
    nm: "Stroke",
  };
}

function fl(color: RGBA, opacity = 100) {
  return {
    ty: "fl",
    c: { a: 0, k: color },
    o: { a: 0, k: opacity },
    r: 1,
    nm: "Fill",
  };
}

function tm(startFrames?: Array<[number, number]>, endFrames?: Array<[number, number]>) {
  return {
    ty: "tm",
    s: startFrames ? kf1D(startFrames) : { a: 0, k: 0 },
    e: endFrames ? kf1D(endFrames) : { a: 0, k: 100 },
    o: { a: 0, k: 0 },
    m: 1,
    nm: "Trim",
  };
}

function group(items: unknown[], name = "Group") {
  return {
    ty: "gr",
    it: [...items, tr()],
    nm: name,
    bm: 0,
  };
}

interface LayerOpts {
  ind: number;
  nm: string;
  shapes: unknown[];
  p?: [number, number, number] | ReturnType<typeof kf2D>;
  a?: [number, number, number];
  s?: [number, number, number] | ReturnType<typeof kf3D>;
  r?: number | ReturnType<typeof kf1D>;
  o?: number | ReturnType<typeof kf1D>;
}

function layer({
  ind,
  nm,
  shapes,
  p = [100, 100, 0],
  a = [0, 0, 0],
  s = [100, 100, 100],
  r = 0,
  o = 100,
}: LayerOpts) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm,
    sr: 1,
    ks: {
      o: typeof o === "number" ? { a: 0, k: o } : o,
      r: typeof r === "number" ? { a: 0, k: r } : r,
      p: Array.isArray(p) ? { a: 0, k: p } : p,
      a: { a: 0, k: a },
      s: Array.isArray(s) ? { a: 0, k: s } : s,
    },
    ao: 0,
    shapes,
    ip: 0,
    op: 120,
    st: 0,
    bm: 0,
  };
}

function doc(nm: string, layers: unknown[]) {
  return {
    v: "5.9.0",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm,
    ddd: 0,
    assets: [],
    layers,
  };
}

/* ============================================================================
 * 1. 01 · ÎNREGISTRATĂ (Ceas & Radar Confirmare Bucătărie)
 * ========================================================================== */
const animOrderRegistered = doc("casa_esy_01_order_registered", [
  // Acul minutar (se rotește 360 grade)
  layer({
    ind: 1,
    nm: "MinuteHand",
    r: kf1D([
      [0, 0],
      [120, 360],
    ]),
    shapes: [group([sh([[0, 0], [0, -28]]), st(C.goldBright, 5.5)])],
  }),
  // Acul orar
  layer({
    ind: 2,
    nm: "HourHand",
    r: kf1D([
      [0, 45],
      [60, 75],
      [120, 45],
    ]),
    shapes: [group([sh([[0, 0], [18, 0]]), st(C.gold, 6)])],
  }),
  // Punct central auriu
  layer({
    ind: 3,
    nm: "CenterPivot",
    shapes: [group([el(0, 0, 11, 11), fl(C.goldBright)])],
  }),
  // Inel progres trim path auriu
  layer({
    ind: 4,
    nm: "GoldProgressArc",
    r: -90,
    shapes: [
      group([
        el(0, 0, 88, 88),
        tm(
          [
            [0, 0],
            [60, 20],
            [120, 0],
          ],
          [
            [0, 35],
            [60, 95],
            [120, 35],
          ],
        ),
        st(C.goldBright, 5),
      ]),
    ],
  }),
  // Cadran bleumarin principal
  layer({
    ind: 5,
    nm: "NavyClockDisc",
    s: kf3D([
      [0, [100, 100, 100]],
      [60, [104, 104, 100]],
      [120, [100, 100, 100]],
    ]),
    shapes: [
      group([el(0, 0, 112, 112), st(C.gold, 4), fl(C.navy)]),
    ],
  }),
  // Unda radar exterioară
  layer({
    ind: 6,
    nm: "PulseRing",
    s: kf3D([
      [0, [95, 95, 100]],
      [100, [148, 148, 100]],
      [120, [152, 152, 100]],
    ]),
    o: kf1D([
      [0, 75],
      [100, 0],
      [120, 0],
    ]),
    shapes: [group([el(0, 0, 112, 112), st(C.gold, 3.5)])],
  }),
]);

/* ============================================================================
 * 2. 02 · ÎN PREPARARE (Chef Hat / Cloche & Abur Cald)
 * ========================================================================== */
const animOrderPreparing = doc("casa_esy_02_order_preparing", [
  // Abur stânga
  layer({
    ind: 1,
    nm: "SteamLeft",
    p: kf2D([
      [0, [78, 62, 0]],
      [60, [78, 44, 0]],
      [120, [78, 62, 0]],
    ]),
    o: kf1D([
      [0, 35],
      [60, 100],
      [120, 35],
    ]),
    shapes: [
      group([
        sh(
          [
            [0, 12],
            [-5, 0],
            [5, -12],
          ],
          false,
        ),
        st(C.goldBright, 4.5),
      ]),
    ],
  }),
  // Abur centru
  layer({
    ind: 2,
    nm: "SteamCenter",
    p: kf2D([
      [0, [100, 52, 0]],
      [60, [100, 34, 0]],
      [120, [100, 52, 0]],
    ]),
    o: kf1D([
      [0, 100],
      [60, 40],
      [120, 100],
    ]),
    shapes: [
      group([
        sh(
          [
            [0, 14],
            [5, 0],
            [-4, -14],
          ],
          false,
        ),
        st(C.goldBright, 5),
      ]),
    ],
  }),
  // Abur dreapta
  layer({
    ind: 3,
    nm: "SteamRight",
    p: kf2D([
      [0, [122, 62, 0]],
      [60, [122, 44, 0]],
      [120, [122, 62, 0]],
    ]),
    o: kf1D([
      [0, 45],
      [60, 100],
      [120, 45],
    ]),
    shapes: [
      group([
        sh(
          [
            [0, 12],
            [-4, 0],
            [4, -12],
          ],
          false,
        ),
        st(C.goldBright, 4.5),
      ]),
    ],
  }),
  // Cloche / Bonetă bucătar (se ridică și coboară)
  layer({
    ind: 4,
    nm: "ChefClocheDome",
    p: kf2D([
      [0, [100, 112, 0]],
      [45, [100, 101, 0]],
      [90, [100, 112, 0]],
      [120, [100, 112, 0]],
    ]),
    r: kf1D([
      [0, 0],
      [30, -4],
      [60, 4],
      [90, 0],
      [120, 0],
    ]),
    shapes: [
      // Mâner superior cloche
      group([el(0, -34, 12, 12), fl(C.goldBright)]),
      // Cupolă
      group([
        sh(
          [
            [-36, 4],
            [-32, -22],
            [0, -28],
            [32, -22],
            [36, 4],
          ],
          true,
        ),
        st(C.goldBright, 5),
        fl(C.navy),
      ]),
    ],
  }),
  // Tava / Platoul de bază
  layer({
    ind: 5,
    nm: "PlatterBase",
    p: [100, 126, 0],
    shapes: [
      group([
        sh([
          [-44, 0],
          [44, 0],
        ]),
        st(C.gold, 6.5),
      ]),
    ],
  }),
  // Medalion fundal
  layer({
    ind: 6,
    nm: "BackdropCircle",
    shapes: [group([el(0, 0, 132, 132), st(C.gold, 3.5), fl(C.navy)])],
  }),
]);

/* ============================================================================
 * 3. 03 · PE DRUM (Service Bell / Clopoțel Room Service & Unde Sonore)
 * ========================================================================== */
const animOrderDelivering = doc("casa_esy_03_order_delivering", [
  // Unde sonore stânga & dreapta
  layer({
    ind: 1,
    nm: "SoundWaves",
    s: kf3D([
      [0, [92, 92, 100]],
      [60, [112, 112, 100]],
      [120, [92, 92, 100]],
    ]),
    o: kf1D([
      [0, 25],
      [40, 100],
      [90, 20],
      [120, 25],
    ]),
    shapes: [
      group([
        sh([
          [-46, -18],
          [-54, -4],
          [-46, 10],
        ]),
        st(C.goldBright, 4.5),
      ]),
      group([
        sh([
          [46, -18],
          [54, -4],
          [46, 10],
        ]),
        st(C.goldBright, 4.5),
      ]),
    ],
  }),
  // Clopoțelul care oscilează
  layer({
    ind: 2,
    nm: "SwingingBell",
    p: [100, 84, 0],
    r: kf1D([
      [0, 0],
      [20, -14],
      [40, 14],
      [60, -10],
      [80, 10],
      [100, 0],
      [120, 0],
    ]),
    shapes: [
      // Butonul de sus al clopoțelului
      group([el(0, -14, 10, 10), fl(C.goldBright)]),
      // Corpul clopoțelului
      group([
        sh(
          [
            [-28, 30],
            [-22, -4],
            [0, -10],
            [22, -4],
            [28, 30],
          ],
          true,
        ),
        st(C.goldBright, 5),
        fl(C.gold),
      ]),
      // Limbă clopoțel
      group([el(0, 35, 11, 11), fl(C.goldBright)]),
    ],
  }),
  // Medalion bleumarin
  layer({
    ind: 3,
    nm: "NavyCircle",
    shapes: [group([el(0, 0, 128, 128), st(C.gold, 4), fl(C.navy)])],
  }),
]);

/* ============================================================================
 * 4. 04 · LIVRATĂ (Bifă Animată & Particule Festive)
 * ========================================================================== */
const animOrderDelivered = doc("casa_esy_04_order_delivered", [
  // Bifa centrală animată cu Trim Path
  layer({
    ind: 1,
    nm: "AnimatedCheckmark",
    s: kf3D([
      [0, [85, 85, 100]],
      [45, [110, 110, 100]],
      [75, [100, 100, 100]],
      [120, [100, 100, 100]],
    ]),
    shapes: [
      group([
        sh([
          [-24, 2],
          [-6, 20],
          [28, -16],
        ]),
        tm(undefined, [
          [0, 0],
          [45, 100],
          [120, 100],
        ]),
        st(C.white, 9),
      ]),
    ],
  }),
  // Stele / Particule aurii
  layer({
    ind: 2,
    nm: "CelebrationDots",
    s: kf3D([
      [0, [75, 75, 100]],
      [60, [115, 115, 100]],
      [120, [75, 75, 100]],
    ]),
    o: kf1D([
      [0, 20],
      [50, 100],
      [120, 20],
    ]),
    shapes: [
      group([el(-64, -42, 9, 9), fl(C.goldBright)]),
      group([el(66, -38, 11, 11), fl(C.gold)]),
      group([el(-58, 48, 8, 8), fl(C.gold)]),
      group([el(62, 46, 10, 10), fl(C.goldBright)]),
    ],
  }),
  // Cercul verde smarald + contur auriu
  layer({
    ind: 3,
    nm: "EmeraldDisc",
    s: kf3D([
      [0, [94, 94, 100]],
      [40, [104, 104, 100]],
      [120, [94, 94, 100]],
    ]),
    shapes: [group([el(0, 0, 114, 114), st(C.goldBright, 4.5), fl(C.emerald)])],
  }),
]);

/* ============================================================================
 * 5. 05 · REZERVARE & PLATĂ CONFIRMATĂ (Scut / Medalion Regal)
 * ========================================================================== */
const animBookingConfirmed = doc("casa_esy_05_booking_confirmed", [
  layer({
    ind: 1,
    nm: "CheckInsideShield",
    shapes: [
      group([
        sh([
          [-20, 2],
          [-5, 17],
          [24, -14],
        ]),
        tm(undefined, [
          [0, 0],
          [55, 100],
          [120, 100],
        ]),
        st(C.goldBright, 8),
      ]),
    ],
  }),
  layer({
    ind: 2,
    nm: "OrbitingRing",
    r: kf1D([
      [0, 0],
      [120, 360],
    ]),
    shapes: [
      group([el(0, -68, 12, 12), fl(C.goldBright)]),
      group([el(0, 68, 9, 9), fl(C.gold)]),
      group([el(0, 0, 136, 136), st(C.gold, 2.5, 45)]),
    ],
  }),
  layer({
    ind: 3,
    nm: "RoyalNavyBadge",
    s: kf3D([
      [0, [98, 98, 100]],
      [60, [103, 103, 100]],
      [120, [98, 98, 100]],
    ]),
    shapes: [group([el(0, 0, 106, 106), st(C.goldBright, 4.5), fl(C.navy)])],
  }),
]);

/* ============================================================================
 * 6. 06 · SMART LOCK & COD PIN ACCES CAMERĂ
 * ========================================================================== */
const animSmartLockPin = doc("casa_esy_06_smart_lock_pin", [
  // Cele 4 puncte PIN care se aprind
  layer({
    ind: 1,
    nm: "PinDots",
    p: [100, 114, 0],
    o: kf1D([
      [0, 35],
      [50, 100],
      [100, 100],
      [120, 35],
    ]),
    shapes: [
      group([el(-24, 0, 9, 9), fl(C.goldBright)]),
      group([el(-8, 0, 9, 9), fl(C.goldBright)]),
      group([el(8, 0, 9, 9), fl(C.goldBright)]),
      group([el(24, 0, 9, 9), fl(C.emerald)]),
    ],
  }),
  // Corpul lacătului
  layer({
    ind: 2,
    nm: "LockBody",
    p: [100, 114, 0],
    shapes: [group([rc(0, 0, 82, 58, 14), st(C.goldBright, 4.5), fl(C.navy)])],
  }),
  // Veriga lacătului care se ridică (deblocare)
  layer({
    ind: 3,
    nm: "LockShackle",
    p: kf2D([
      [0, [100, 82, 0]],
      [45, [100, 68, 0]],
      [95, [100, 68, 0]],
      [120, [100, 82, 0]],
    ]),
    shapes: [
      group([
        sh([
          [-22, 10],
          [-22, -14],
          [0, -24],
          [22, -14],
          [22, 2],
        ]),
        st(C.gold, 7),
      ]),
    ],
  }),
]);

/* ============================================================================
 * 7. 07 · SCANARE PERMIS QR LA RECEPȚIE
 * ========================================================================== */
const animQrPassScan = doc("casa_esy_07_qr_pass_scan", [
  // Raza laser orizontală
  layer({
    ind: 1,
    nm: "LaserBeam",
    p: kf2D([
      [0, [100, 62, 0]],
      [60, [100, 138, 0]],
      [120, [100, 62, 0]],
    ]),
    shapes: [group([sh([[-48, 0], [48, 0]]), st(C.emerald, 5)])],
  }),
  // Blocuri QR interioare
  layer({
    ind: 2,
    nm: "QrBlocks",
    shapes: [
      group([rc(-20, -20, 22, 22, 4), fl(C.navy)]),
      group([rc(20, -20, 22, 22, 4), fl(C.navy)]),
      group([rc(-20, 20, 22, 22, 4), fl(C.navy)]),
      group([rc(18, 18, 16, 16, 3), fl(C.gold)]),
      group([rc(0, 0, 12, 12, 2), fl(C.goldBright)]),
    ],
  }),
  // Cadru colțuri QR
  layer({
    ind: 3,
    nm: "QrFrame",
    shapes: [group([rc(0, 0, 118, 118, 22), st(C.gold, 4.5), fl(C.white)])],
  }),
]);

/* ============================================================================
 * 8. 08 · PROCESARE PLATĂ CARD BANCAR (Stripe Contactless)
 * ========================================================================== */
const animCardPayment = doc("casa_esy_08_card_payment", [
  // Semnal Contactless / Valuri
  layer({
    ind: 1,
    nm: "ContactlessWaves",
    p: [152, 72, 0],
    o: kf1D([
      [0, 25],
      [60, 100],
      [120, 25],
    ]),
    s: kf3D([
      [0, [90, 90, 100]],
      [60, [110, 110, 100]],
      [120, [90, 90, 100]],
    ]),
    shapes: [
      group([el(0, 0, 24, 24), st(C.goldBright, 3.5)]),
      group([el(0, 0, 40, 40), st(C.gold, 3)]),
    ],
  }),
  // Cardul bancar
  layer({
    ind: 2,
    nm: "LuxuryCard",
    p: kf2D([
      [0, [96, 106, 0]],
      [60, [96, 98, 0]],
      [120, [96, 106, 0]],
    ]),
    r: kf1D([
      [0, -4],
      [60, 2],
      [120, -4],
    ]),
    shapes: [
      // Cipul auriu
      group([rc(-28, -4, 20, 15, 4), fl(C.goldBright)]),
      // Linia magnetică / text
      group([sh([[-36, 18], [26, 18]]), st(C.gold, 4.5)]),
      // Corpul cardului bleumarin
      group([rc(0, 0, 112, 72, 14), st(C.goldBright, 4), fl(C.navy)]),
    ],
  }),
]);

/* ============================================================================
 * 9. 09 · ESY AI CONCIERGE (Undă Vocală & Neurală)
 * ========================================================================== */
const animAiConciergeWave = doc("casa_esy_09_ai_concierge_wave", [
  layer({
    ind: 1,
    nm: "Bar1",
    p: [60, 100, 0],
    s: kf3D([
      [0, [100, 45, 100]],
      [60, [100, 115, 100]],
      [120, [100, 45, 100]],
    ]),
    shapes: [group([rc(0, 0, 10, 56, 5), fl(C.gold)])],
  }),
  layer({
    ind: 2,
    nm: "Bar2",
    p: [80, 100, 0],
    s: kf3D([
      [0, [100, 110, 100]],
      [60, [100, 45, 100]],
      [120, [100, 110, 100]],
    ]),
    shapes: [group([rc(0, 0, 10, 74, 5), fl(C.goldBright)])],
  }),
  layer({
    ind: 3,
    nm: "Bar3Center",
    p: [100, 100, 0],
    s: kf3D([
      [0, [100, 60, 100]],
      [40, [100, 125, 100]],
      [80, [100, 50, 100]],
      [120, [100, 60, 100]],
    ]),
    shapes: [group([rc(0, 0, 12, 86, 6), fl(C.white)])],
  }),
  layer({
    ind: 4,
    nm: "Bar4",
    p: [120, 100, 0],
    s: kf3D([
      [0, [100, 115, 100]],
      [60, [100, 50, 100]],
      [120, [100, 115, 100]],
    ]),
    shapes: [group([rc(0, 0, 10, 74, 5), fl(C.goldBright)])],
  }),
  layer({
    ind: 5,
    nm: "Bar5",
    p: [140, 100, 0],
    s: kf3D([
      [0, [100, 50, 100]],
      [60, [100, 110, 100]],
      [120, [100, 50, 100]],
    ]),
    shapes: [group([rc(0, 0, 10, 56, 5), fl(C.gold)])],
  }),
  layer({
    ind: 6,
    nm: "NavyOrb",
    shapes: [group([el(0, 0, 134, 134), st(C.gold, 4), fl(C.navy)])],
  }),
]);

/* ============================================================================
 * 10. 10 · COROANA CLUB PRIVILÈGE VIP
 * ========================================================================== */
const animVipCrown = doc("casa_esy_10_vip_crown", [
  // Bijuterii în vârful coroanei
  layer({
    ind: 1,
    nm: "CrownJewels",
    p: kf2D([
      [0, [100, 102, 0]],
      [60, [100, 92, 0]],
      [120, [100, 102, 0]],
    ]),
    shapes: [
      group([el(-32, -26, 9, 9), fl(C.white)]),
      group([el(0, -34, 11, 11), fl(C.goldBright)]),
      group([el(32, -26, 9, 9), fl(C.white)]),
      // Silueta coroanei
      group([
        sh(
          [
            [-34, 22],
            [-36, -16],
            [-14, 4],
            [0, -24],
            [14, 4],
            [36, -16],
            [34, 22],
          ],
          true,
        ),
        st(C.goldBright, 5),
        fl(C.gold),
      ]),
    ],
  }),
  layer({
    ind: 2,
    nm: "VipMedallion",
    shapes: [group([el(0, 0, 130, 130), st(C.goldBright, 4.5), fl(C.navy)])],
  }),
]);

/* ============================================================================
 * 11. 11 · BUSOLĂ & VALURILE MĂRII NEGRE (Nautical Compass)
 * ========================================================================== */
const animCoastalCompass = doc("casa_esy_11_coastal_compass", [
  // Acul busolei
  layer({
    ind: 1,
    nm: "CompassNeedle",
    r: kf1D([
      [0, 25],
      [40, -20],
      [80, 45],
      [120, 25],
    ]),
    shapes: [
      group([
        sh(
          [
            [0, -38],
            [11, 0],
            [0, 38],
            [-11, 0],
          ],
          true,
        ),
        st(C.goldBright, 4),
        fl(C.gold),
      ]),
      group([el(0, 0, 10, 10), fl(C.white)]),
    ],
  }),
  // Cercul busolei
  layer({
    ind: 2,
    nm: "CompassDial",
    shapes: [
      group([el(0, 0, 112, 112), st(C.gold, 4.5)]),
      group([el(0, 0, 134, 134), st(C.navy, 4), fl(C.navy)]),
    ],
  }),
]);

/* ============================================================================
 * 12. 12 · METEO LIVE EFORIE NORD (Soare & Valuri Marine)
 * ========================================================================== */
const animCoastalSunWeather = doc("casa_esy_12_coastal_sun_weather", [
  // Valul mării în partea de jos
  layer({
    ind: 1,
    nm: "SeaWave",
    p: kf2D([
      [0, [94, 132, 0]],
      [60, [106, 132, 0]],
      [120, [94, 132, 0]],
    ]),
    shapes: [
      group([
        sh([
          [-48, 0],
          [-24, -10],
          [0, 0],
          [24, -10],
          [48, 0],
        ]),
        st(C.navy, 6.5),
      ]),
      group([
        sh([
          [-40, 14],
          [-16, 6],
          [12, 14],
          [38, 6],
        ]),
        st(C.gold, 5),
      ]),
    ],
  }),
  // Soarele rotativ
  layer({
    ind: 2,
    nm: "GoldenSun",
    p: [100, 82, 0],
    r: kf1D([
      [0, 0],
      [120, 180],
    ]),
    s: kf3D([
      [0, [96, 96, 100]],
      [60, [106, 106, 100]],
      [120, [96, 96, 100]],
    ]),
    shapes: [
      group([el(0, 0, 44, 44), fl(C.goldBright)]),
      group([el(0, 0, 64, 64), st(C.gold, 4, 55)]),
    ],
  }),
]);

/* ============================================================================
 * 13. 13 · HOUSEKEEPING & PREGĂTIRE SUITĂ (5 Stele Curățenie)
 * ========================================================================== */
const animHousekeepingSparkle = doc("casa_esy_13_housekeeping_sparkle", [
  // Stea 1
  layer({
    ind: 1,
    nm: "SparkleTop",
    p: [100, 56, 0],
    s: kf3D([
      [0, [60, 60, 100]],
      [60, [120, 120, 100]],
      [120, [60, 60, 100]],
    ]),
    shapes: [
      group([
        sh([
          [0, -14],
          [0, 14],
        ]),
        st(C.goldBright, 5),
      ]),
      group([
        sh([
          [-14, 0],
          [14, 0],
        ]),
        st(C.goldBright, 5),
      ]),
    ],
  }),
  // Silueta patului / suitei
  layer({
    ind: 2,
    nm: "SuiteBed",
    p: [100, 114, 0],
    shapes: [
      // Pernă stânga & dreapta
      group([rc(-18, -10, 22, 12, 4), fl(C.goldBright)]),
      group([rc(18, -10, 22, 12, 4), fl(C.goldBright)]),
      // Saltea / cadru
      group([rc(0, 8, 84, 24, 6), st(C.gold, 4.5), fl(C.white)]),
    ],
  }),
  layer({
    ind: 3,
    nm: "NavyCircleBg",
    shapes: [group([el(0, 0, 132, 132), st(C.gold, 4), fl(C.navy)])],
  }),
]);

/* ============================================================================
 * 14. 14 · STARE SISTEM & INFRASTRUCTURĂ LIVE (ECG Heartbeat)
 * ========================================================================== */
const animSystemHealthPulse = doc("casa_esy_14_system_health_pulse", [
  // Linia ECG animată
  layer({
    ind: 1,
    nm: "EcgLine",
    shapes: [
      group([
        sh([
          [-50, 4],
          [-22, 4],
          [-10, -24],
          [6, 28],
          [20, -10],
          [32, 4],
          [50, 4],
        ]),
        tm(undefined, [
          [0, 15],
          [70, 100],
          [120, 100],
        ]),
        st(C.emerald, 7),
      ]),
    ],
  }),
  // Cercul exterior
  layer({
    ind: 2,
    nm: "HealthDisc",
    shapes: [group([el(0, 0, 130, 130), st(C.emerald, 4), fl(C.navy)])],
  }),
]);

/* ============================================================================
 * 15. 15 · VALIZĂ DE VACANȚĂ & SEJUR (Empty State / Rezervă Cameră)
 * ========================================================================== */
const animEmptyLuggage = doc("casa_esy_15_empty_luggage", [
  layer({
    ind: 1,
    nm: "Suitcase",
    p: kf2D([
      [0, [100, 106, 0]],
      [60, [100, 96, 0]],
      [120, [100, 106, 0]],
    ]),
    r: kf1D([
      [0, -3],
      [60, 3],
      [120, -3],
    ]),
    shapes: [
      // Mâner superior
      group([
        sh([
          [-16, -28],
          [-16, -42],
          [16, -42],
          [16, -28],
        ]),
        st(C.gold, 6),
      ]),
      // Benzi verticale aurii
      group([sh([[-18, -26], [-18, 26]]), st(C.goldBright, 4)]),
      group([sh([[18, -26], [18, 26]]), st(C.goldBright, 4)]),
      // Corp valiză
      group([rc(0, 0, 86, 58, 12), st(C.gold, 4.5), fl(C.navy)]),
    ],
  }),
]);

/* ============================================================================
 * 16. 16 · ALERTĂ & NOTIFICARE BROADCAST LIVE
 * ========================================================================== */
const animLiveBroadcastBell = doc("casa_esy_16_live_broadcast_bell", [
  // Inel de undă broadcast
  layer({
    ind: 1,
    nm: "BroadcastPulse",
    s: kf3D([
      [0, [90, 90, 100]],
      [90, [145, 145, 100]],
      [120, [145, 145, 100]],
    ]),
    o: kf1D([
      [0, 80],
      [90, 0],
      [120, 0],
    ]),
    shapes: [group([el(0, 0, 110, 110), st(C.crimson, 4)])],
  }),
  // Punct de notificare roșu-rubiniu
  layer({
    ind: 2,
    nm: "LiveAlertDot",
    p: [134, 64, 0],
    s: kf3D([
      [0, [90, 90, 100]],
      [60, [125, 125, 100]],
      [120, [90, 90, 100]],
    ]),
    shapes: [group([el(0, 0, 22, 22), st(C.white, 3), fl(C.crimson)])],
  }),
  // Megafon / Clopoțel central
  layer({
    ind: 3,
    nm: "BellCore",
    r: kf1D([
      [0, 0],
      [25, -12],
      [50, 12],
      [75, -8],
      [100, 0],
      [120, 0],
    ]),
    shapes: [
      group([
        sh(
          [
            [-24, 20],
            [-18, -12],
            [0, -20],
            [18, -12],
            [24, 20],
          ],
          true,
        ),
        st(C.goldBright, 5),
        fl(C.navy),
      ]),
    ],
  }),
]);

export const CASA_ESY_LOTTIE_CATALOG: CasaEsyLottieMeta[] = [
  {
    id: "order-registered",
    stepNumber: "01",
    title: "Înregistrată",
    subtitle: "Preluată în bucătărie",
    category: "room_service",
    categoryLabel: "Room Service Live",
    whereToUse: "Tracker Comandă Room Service (Pasul 01) & KDS Bucătărie",
    routeExample: "/comanda/:orderCode",
    description:
      "Ceas gastronomic bleumarin și auriu cu rotație continuă a minutarului, arc de progres și undă radar de preluare instantă în bucătărie.",
    accentColor: "#0d2c5c",
    animationData: animOrderRegistered,
  },
  {
    id: "order-preparing",
    stepNumber: "02",
    title: "În Preparare",
    subtitle: "Gătită proaspăt acum",
    category: "room_service",
    categoryLabel: "Room Service Live",
    whereToUse: "Tracker Comandă Room Service (Pasul 02) & Badge Comandă Activă",
    routeExample: "/comanda/:orderCode",
    description:
      "Cloche de restaurant luxury în nuanțele Vila Casa Esy care se ridică ritmic și eliberează trei valuri animate de abur cald auriu.",
    accentColor: "#c69a3f",
    animationData: animOrderPreparing,
  },
  {
    id: "order-delivering",
    stepNumber: "03",
    title: "Pe Drum",
    subtitle: "Ospătarul se apropie",
    category: "room_service",
    categoryLabel: "Room Service Live",
    whereToUse: "Tracker Comandă Room Service (Pasul 03) & Alertă Livrare",
    routeExample: "/comanda/:orderCode",
    description:
      "Clopoțel auriu de Room Service cu balans fizic și unde sonore laterale care anunță că ospătarul este în drum spre cameră.",
    accentColor: "#c69a3f",
    animationData: animOrderDelivering,
  },
  {
    id: "order-delivered",
    stepNumber: "04",
    title: "Livrată",
    subtitle: "Predată · Poftă bună!",
    category: "room_service",
    categoryLabel: "Room Service Live",
    whereToUse: "Tracker Comandă Room Service (Pasul 04) & Confirmare Finală",
    routeExample: "/comanda/:orderCode",
    description:
      "Medalion smarald cu contur auriu, bifă trasată progresiv (Trim Path) cu efect elastic și particule festive.",
    accentColor: "#10b981",
    animationData: animOrderDelivered,
  },
  {
    id: "booking-confirmed",
    stepNumber: "05",
    title: "Rezervare Confirmată",
    subtitle: "Garantată prin Stripe 3D Secure",
    category: "bookings_payments",
    categoryLabel: "Rezervări & Plăți",
    whereToUse: "Pagina de Succes Rezervare & Confirmare Email/Factură",
    routeExample: "/booking-success",
    description:
      "Insignă regală bleumarin cu sateliți aurii pe orbită și bifă aurie animată pentru confirmarea plății sejurului.",
    accentColor: "#0d2c5c",
    animationData: animBookingConfirmed,
  },
  {
    id: "smart-lock-pin",
    stepNumber: "06",
    title: "Smart Lock & Cod PIN",
    subtitle: "Acces digital în suită",
    category: "bookings_payments",
    categoryLabel: "Rezervări & Plăți",
    whereToUse: "Self Check-in Online, Cardul Sejurului din Profil & Admin Smart Lock",
    routeExample: "/checkin/:bookingCode",
    description:
      "Lacăt inteligent care își ridică veriga aurie la deblocare în timp ce indicatorii PIN se aprind în verde smarald.",
    accentColor: "#c69a3f",
    animationData: animSmartLockPin,
  },
  {
    id: "qr-pass-scan",
    stepNumber: "07",
    title: "Permis QR Check-in",
    subtitle: "Verificare rapidă la recepție",
    category: "bookings_payments",
    categoryLabel: "Rezervări & Plăți",
    whereToUse: "Permisul QR digital din Booking Success și Profilul Oaspetelui",
    routeExample: "/booking-success",
    description:
      "Matrice QR în culorile Casa Esy parcursă vertical de o rază laser smarald pentru check-in expres.",
    accentColor: "#10b981",
    animationData: animQrPassScan,
  },
  {
    id: "card-payment",
    stepNumber: "08",
    title: "Plată Card Contactless",
    subtitle: "Achitare online sau pe cameră",
    category: "bookings_payments",
    categoryLabel: "Rezervări & Plăți",
    whereToUse: "Secțiunea de Plată Stripe pentru Room Service și Folio Cameră",
    routeExample: "/comanda/:orderCode",
    description:
      "Card bancar Royal Navy & Gold cu cip metalic și unde contactless animate pentru plățile rapide.",
    accentColor: "#0d2c5c",
    animationData: animCardPayment,
  },
  {
    id: "ai-concierge-wave",
    stepNumber: "09",
    title: "Esy AI Concierge",
    subtitle: "Asistent vocal & text 24/7",
    category: "concierge_vip",
    categoryLabel: "Concierge & VIP",
    whereToUse: "ChatWidget-ul flotant și Panoul de Conversații AI din Admin",
    routeExample: "/",
    description:
      "Egalizator neural cu 5 frecvențe aurii și albe pe sferă bleumarin, activ atunci când Esy procesează o întrebare sau o comandă vocală.",
    accentColor: "#0d2c5c",
    animationData: animAiConciergeWave,
  },
  {
    id: "vip-crown",
    stepNumber: "10",
    title: "Club Privilège VIP",
    subtitle: "Statut Bronze · Silver · Gold",
    category: "concierge_vip",
    categoryLabel: "Concierge & VIP",
    whereToUse: "Cardul de Fidelitate din Profil și Box-ul de Reducere VIP",
    routeExample: "/profile",
    description:
      "Coroana regală Casa Esy cu pietre prețioase în vârf care plutește lin pe medalionul de membru Privilège.",
    accentColor: "#c69a3f",
    animationData: animVipCrown,
  },
  {
    id: "coastal-compass",
    stepNumber: "11",
    title: "Busola Mării Negre",
    subtitle: "Orientare & Explorare Locații",
    category: "concierge_vip",
    categoryLabel: "Concierge & VIP",
    whereToUse: "Pagina Locații & Atracții, Pagina 404 și Loader-ul de Navigare",
    routeExample: "/places",
    description:
      "Busolă maritimă cu ac auriu mobil care ghidează oaspeții către plaja din Eforie Nord și restaurantele vilei.",
    accentColor: "#0d2c5c",
    animationData: animCoastalCompass,
  },
  {
    id: "coastal-sun-weather",
    stepNumber: "12",
    title: "Soare & Briză Eforie Nord",
    subtitle: "Meteo live la malul mării",
    category: "concierge_vip",
    categoryLabel: "Concierge & VIP",
    whereToUse: "Briefing-ul Matinal, Facilități Resort și Hero-ul de Vară",
    routeExample: "/facilitati",
    description:
      "Soare auriu rotativ deasupra valurilor Mării Negre, ideal pentru secțiunea de vreme și plajă.",
    accentColor: "#c69a3f",
    animationData: animCoastalSunWeather,
  },
  {
    id: "housekeeping-sparkle",
    stepNumber: "13",
    title: "Suită Igienizată 5★",
    subtitle: "Housekeeping & Inspecție",
    category: "operations_system",
    categoryLabel: "Operațiuni & Sistem",
    whereToUse: "Portalul Housekeeping la marcarea camerei ca „Curată / Inspectată”",
    routeExample: "/housekeeping",
    description:
      "Suită hotelieră cu perne aurii și stea strălucitoare care confirmă pregătirea impecabilă a camerei.",
    accentColor: "#0d2c5c",
    animationData: animHousekeepingSparkle,
  },
  {
    id: "system-health-pulse",
    stepNumber: "14",
    title: "System Health Live",
    subtitle: "Telemetrie & Uptime 99.9%",
    category: "operations_system",
    categoryLabel: "Operațiuni & Sistem",
    whereToUse: "Tabul Stare Sistem & Infrastructură din Admin Dashboard",
    routeExample: "/admin?tab=health",
    description:
      "Puls ECG în timp real în nuanța verde smarald pe fundal bleumarin pentru monitorizarea bazei de date și a serviciilor AI.",
    accentColor: "#10b981",
    animationData: animSystemHealthPulse,
  },
  {
    id: "empty-luggage",
    stepNumber: "15",
    title: "Pregătit de Vacanță",
    subtitle: "Stare goală pentru rezervări",
    category: "operations_system",
    categoryLabel: "Operațiuni & Sistem",
    whereToUse: "Pagina „Rezervările Mele” când oaspetele nu are încă un sejur activ",
    routeExample: "/my-bookings",
    description:
      "Valiză boutique bleumarin cu curele aurii care plutește ușor, invitând utilizatorul să își aleagă camera.",
    accentColor: "#0d2c5c",
    animationData: animEmptyLuggage,
  },
  {
    id: "live-broadcast-bell",
    stepNumber: "16",
    title: "Alertă & Broadcast Live",
    subtitle: "Anunțuri recepție în timp real",
    category: "operations_system",
    categoryLabel: "Operațiuni & Sistem",
    whereToUse: "Bannerul global de alerte Broadcast și notificări KDS/Recepție",
    routeExample: "/admin",
    description:
      "Clopoțel de notificare cu indicator roșu-rubiniu și undă de difuzare pentru mesajele urgente către oaspeți.",
    accentColor: "#dc2626",
    animationData: animLiveBroadcastBell,
  },
];

export const CASA_ESY_LOTTIE_BY_ID: Record<CasaEsyLottieId, CasaEsyLottieMeta> =
  CASA_ESY_LOTTIE_CATALOG.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<CasaEsyLottieId, CasaEsyLottieMeta>,
  );
