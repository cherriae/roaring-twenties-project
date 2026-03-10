// ===== HARLEM RENAISSANCE: A CULTURAL EXPLOSION =====
// An interactive pixel-art 2D exploration of 1920s Harlem

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dialogBox = document.getElementById("dialog-box");
const speakerNameEl = document.getElementById("dialog-speaker");
const dialogTextEl = document.getElementById("dialog-text");
const dialogPortraitEl = document.getElementById("dialog-portrait");

// Disable image smoothing for crisp pixel art
ctx.imageSmoothingEnabled = false;

// ===== WORLD CONFIG =====
const CW = 1400;
const CH = 850;
const WW = 3600;
const WH = 2800;

const camera = { x: 0, y: 0 };
let isDialogActive = false;
let dialogPage = 0;
let currentNpcDialogues = [];

// ===== INPUT =====
const keys = {};
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !keys["Space"]) handleInteraction();
  keys[e.key] = true;
  keys[e.code] = true;
  e.preventDefault();
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  keys[e.code] = false;
});

// ===== COLORS =====
const C = {
  street: "#2d2d3a",
  sidewalk: "#6b7280",
  sidewalkLight: "#9ca3b8",
  grass: "#2d5a27",
  grassLight: "#3a7a30",
  brick: "#8b4513",
  brickDark: "#6b3410",
  wood: "#5c3317",
  woodLight: "#8b6914",
  woodDark: "#3a1f0d",
  roof: "#4a3728",
  roofRed: "#8b2500",
  window: "#fef08a",
  windowDark: "#4a4520",
  neon: "#ff6ec7",
  neonBlue: "#00d4ff",
  gold: "#fcd34d",
  cream: "#fef3c7",
  warmLight: "#fff7ed",
};

// ===== PLAYER =====
const player = {
  x: 600,
  y: 1200,
  w: 24,
  h: 36,
  speed: 4,
  frame: 0,
  dir: 0, // 0=down,1=up,2=left,3=right
  stepTimer: 0,
};

// ===== PIXEL ART CHARACTER DRAWING =====
function drawPixelPerson(
  x,
  y,
  w,
  h,
  skinColor,
  shirtColor,
  pantsColor,
  hatColor,
  facing,
) {
  const s = w / 12; // scale unit
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h, w / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pants
  ctx.fillStyle = pantsColor;
  ctx.fillRect(x + 2 * s, y + 8 * s, 3 * s, 4 * s);
  ctx.fillRect(x + 7 * s, y + 8 * s, 3 * s, 4 * s);
  // Shirt/body
  ctx.fillStyle = shirtColor;
  ctx.fillRect(x + 1 * s, y + 4 * s, 10 * s, 5 * s);
  // Arms
  ctx.fillRect(x, y + 4 * s, 2 * s, 4 * s);
  ctx.fillRect(x + 10 * s, y + 4 * s, 2 * s, 4 * s);
  // Skin (hands)
  ctx.fillStyle = skinColor;
  ctx.fillRect(x, y + 7 * s, 2 * s, 1.5 * s);
  ctx.fillRect(x + 10 * s, y + 7 * s, 2 * s, 1.5 * s);
  // Head
  ctx.fillStyle = skinColor;
  ctx.fillRect(x + 2 * s, y + 0.5 * s, 8 * s, 4 * s);
  // Hat
  if (hatColor) {
    ctx.fillStyle = hatColor;
    ctx.fillRect(x + 1 * s, y - 0.5 * s, 10 * s, 2 * s);
    ctx.fillRect(x + 3 * s, y - 1.5 * s, 6 * s, 1.5 * s);
  }
  // Eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 4 * s, y + 1.5 * s, 2 * s, 1.5 * s);
  ctx.fillRect(x + 7 * s, y + 1.5 * s, 2 * s, 1.5 * s);
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(x + 4.5 * s, y + 2 * s, 1 * s, 1 * s);
  ctx.fillRect(x + 7.5 * s, y + 2 * s, 1 * s, 1 * s);
}

// ===== INTERACTIVE NPCS =====
const npcs = [
  // COTTON CLUB
  {
    name: "Louis Armstrong",
    x: 2650,
    y: 420,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#dc2626",
    pants: "#1e1b4b",
    hat: "#fcd34d",
    dialogues: [
      "Welcome to the Cotton Club, friend! I'm Louis Armstrong — they call me Satchmo. My trumpet speaks what words cannot.",
      "Jazz was born in New Orleans, but Harlem gave it a stage. Here, music is freedom — every improvised note is a declaration of who we are.",
      "Duke Ellington plays here too. The music we make? It's reshaping America's soul, one swing at a time.",
    ],
    region: "club",
  },
  {
    name: "Duke Ellington",
    x: 2750,
    y: 340,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#f5f5f5",
    pants: "#1e1b4b",
    hat: null,
    dialogues: [
      "I'm Edward Kennedy Ellington — Duke to you. My orchestra has a residency right here at the Cotton Club since 1927.",
      "I don't write jazz. I write music that transcends categories. 'It Don't Mean a Thing if It Ain't Got That Swing.'",
      "Music is my mistress, and she plays second fiddle to no one. Harlem taught me that art has no ceiling.",
    ],
    region: "club",
  },
  // LITERARY SALON (A'Lelia Walker's)
  {
    name: "Langston Hughes",
    x: 530,
    y: 620,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#047857",
    pants: "#374151",
    hat: null,
    dialogues: [
      "I'm Langston Hughes. 'I, too, sing America.' My poetry gives voice to the dreams of ordinary Black folk.",
      "They say my poem 'The Weary Blues' captured the soul of Harlem's nightlife. The rhythm of jazz lives in my verses.",
      "A'Lelia Walker invited me here — her salon is a safe haven for artists, writers, and thinkers of every kind. Everyone is welcome at her table.",
    ],
    region: "salon",
  },
  {
    name: "Zora Neale Hurston",
    x: 650,
    y: 710,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#7c3aed",
    pants: "#1e1b4b",
    hat: "#c084fc",
    dialogues: [
      "I'm Zora Neale Hurston! Writer, anthropologist, and Harlem's most fabulous storyteller.",
      "My novel 'Their Eyes Were Watching God' tells the story of a Black woman finding her own voice. Our stories matter!",
      "I traveled the South collecting folklore — the oral traditions of our people are treasures. Harlem gave me the courage to share them with the world.",
    ],
    region: "salon",
  },
  // A'LELIA WALKER'S DARK TOWER
  {
    name: "A'Lelia Walker",
    x: 980,
    y: 1850,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#c026d3",
    pants: "#581c87",
    hat: "#e879f9",
    dialogues: [
      "Welcome to the Dark Tower, darling! I'm A'Lelia Walker, daughter of Madam C.J. Walker, America's first female self-made millionaire.",
      "I opened this salon as a gathering place for ALL artists — Black, white, gay, straight. Art knows no boundaries, and neither does my guest list.",
      "Langston Hughes, Countee Cullen, Richard Bruce Nugent — they all find safety and inspiration here. This is a place where you can be yourself, fully and freely.",
      "My mother built an empire from hair care products. I'm using that legacy to build a cultural revolution. The Renaissance needs patrons, and I intend to be the best.",
    ],
    region: "tower",
  },
  {
    name: "Richard Bruce Nugent",
    x: 1080,
    y: 1920,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#f43f5e",
    pants: "#0f172a",
    hat: null,
    dialogues: [
      "I'm Richard Bruce Nugent — the enfant terrible of the Harlem Renaissance! My story 'Smoke, Lilies and Jade' was published in FIRE!! magazine in 1926.",
      "It was one of the first openly gay works published by a Black American writer. Some called it scandalous. I call it honest.",
      "Here at A'Lelia's Dark Tower, I don't have to hide who I am. This community accepts me — artist, bohemian, and proudly gay.",
      "Art must be fearless. If we can't be truthful in our work, what's the point? The Renaissance belongs to ALL of us.",
    ],
    region: "tower",
  },
  {
    name: "Countee Cullen",
    x: 880,
    y: 1930,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#2563eb",
    pants: "#1e293b",
    hat: null,
    dialogues: [
      "I'm Countee Cullen. They published my first collection, 'Color,' when I was just 22. Poetry chose me before I chose it.",
      "My poem 'Heritage' asks: 'What is Africa to me?' Identity is complicated. The Renaissance lets us explore questions that have no easy answers.",
      "I married Yolande Du Bois — W.E.B. Du Bois's daughter — but my heart... it's complicated. Many of us here live between what society expects and who we truly are.",
      "Harold Jackman is my closest companion. The world may not understand us, but here in Harlem, among fellow artists, we have found our people.",
    ],
    region: "tower",
  },
  // GLADYS BENTLEY'S SPEAKEASY
  {
    name: "Gladys Bentley",
    x: 2200,
    y: 1800,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#f5f5f5",
    pants: "#0f172a",
    hat: "#1e293b",
    dialogues: [
      "Honey, I'm Gladys Bentley! I perform in a white tuxedo and top hat, and I don't apologize for a thing.",
      "I sing the blues my way — bold, raunchy, and real. The Clam House on 133rd Street is MY stage. They call this block 'Jungle Alley.'",
      "I'm an openly lesbian performer in the 1920s. Harlem gives me that freedom. Here on this street, we live out loud.",
      "Drag balls, rent parties, speakeasies — Harlem's nightlife is the most accepting place in America right now. Remember that.",
    ],
    region: "speakeasy",
  },
  {
    name: "Alain Locke",
    x: 2300,
    y: 1880,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#78350f",
    pants: "#292524",
    hat: null,
    dialogues: [
      "I'm Alain Locke — philosopher, professor at Howard University, and the first Black Rhodes Scholar.",
      "I edited 'The New Negro' anthology in 1925. It became the manifesto of this Renaissance — declaring that Black Americans are defining their OWN identity.",
      "The 'Old Negro' was a stereotype. The 'New Negro' is self-determined, artistic, intellectual. This movement is about cultural self-expression.",
      "As a gay Black man in academia, I know the power — and the cost — of living authentically. Harlem is where we can breathe.",
    ],
    region: "speakeasy",
  },
  // APOLLO THEATER
  {
    name: "Bessie Smith",
    x: 1700,
    y: 610,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#dc2626",
    pants: "#1e1b4b",
    hat: "#fbbf24",
    dialogues: [
      "I'm Bessie Smith — the Empress of the Blues! My voice shakes the walls of every theater I sing in.",
      "I was the highest-paid Black entertainer in America. My recording of 'Downhearted Blues' sold 800,000 copies in six months!",
      "The blues tells the truth about life — love, loss, hardship, and joy. I sing for every Black woman finding her strength.",
      "I love who I love, men and women both. The blues don't judge, and neither should you. Music is pure honesty.",
    ],
    region: "apollo",
  },
  {
    name: "Ma Rainey",
    x: 1800,
    y: 530,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#7c2d12",
    pants: "#1c1917",
    hat: "#d97706",
    dialogues: [
      "They call me Ma Rainey, the Mother of the Blues! I've been singing since before this 'Renaissance' had a name.",
      "My song 'Prove It on Me Blues' says it plainly: 'Went out last night with a crowd of my friends. They must've been women, 'cause I don't like no men.'",
      "I don't hide who I am. I wear my gold teeth, my necklaces, and my truth proudly. The stage is where I'm FREE.",
      "Bessie Smith learned from me. Now Harlem is learning from all of us. The blues is the heartbeat of this movement.",
    ],
    region: "apollo",
  },
  // OUTDOOR ART GALLERY
  {
    name: "Aaron Douglas",
    x: 2700,
    y: 2250,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#ca8a04",
    pants: "#1e293b",
    hat: null,
    dialogues: [
      "I'm Aaron Douglas, and they call me the 'Father of Black American Art.' My murals blend African art with Art Deco modernism.",
      "My paintings use silhouettes and concentric circles of light — connecting the African past with the American present.",
      "Alain Locke himself asked me to illustrate 'The New Negro.' Art is the visual language of this Renaissance.",
      "Every brushstroke is an act of resistance. We are not invisible. We paint ourselves into history.",
    ],
    region: "gallery",
  },
  {
    name: "Augusta Savage",
    x: 2850,
    y: 2320,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#059669",
    pants: "#1e293b",
    hat: null,
    dialogues: [
      "I'm Augusta Savage, sculptor. They denied me a scholarship to study in France because of my race — but I fought back and eventually won.",
      "I opened my own art studio right here in Harlem to teach young Black artists. Someone has to nurture the next generation.",
      "My sculpture 'The Harp' — inspired by the hymn 'Lift Every Voice and Sing' — was the star of the 1939 World's Fair.",
      "Art is how we claim space. When the world says you don't belong, you sculpt your own place in it.",
    ],
    region: "gallery",
  },
  // MARCUS GARVEY PARK
  {
    name: "Marcus Garvey",
    x: 1400,
    y: 2200,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#0d9488",
    pants: "#0f172a",
    hat: "#facc15",
    dialogues: [
      "I am Marcus Garvey, founder of the Universal Negro Improvement Association! 'Up, you mighty race!'",
      "I believe in Pan-Africanism — that people of African descent worldwide must unite. My 'Back to Africa' movement inspired millions.",
      "Not everyone in Harlem agrees with me — W.E.B. Du Bois and I have our disagreements. But we ALL want Black liberation.",
      "I organized the largest mass movement in African American history. Never forget: 'A people without knowledge of their past is like a tree without roots.'",
    ],
    region: "park",
  },
  {
    name: "W.E.B. Du Bois",
    x: 1550,
    y: 2280,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#4338ca",
    pants: "#1e1b4b",
    hat: null,
    dialogues: [
      "I am W.E.B. Du Bois — scholar, activist, and editor of The Crisis magazine for the NAACP.",
      "I coined the concept of 'double consciousness' — the feeling of being both American and Black in a nation that refuses to see you as both.",
      "The Talented Tenth — the educated elite — must lead our people forward. Education and art are our weapons.",
      "Garvey's approach differs from mine, but make no mistake: the struggle for equality defines this era as much as the art does.",
    ],
    region: "park",
  },
  // RENT PARTY HOUSE
  {
    name: "Claude McKay",
    x: 250,
    y: 2050,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#be185d",
    pants: "#1e293b",
    hat: null,
    dialogues: [
      "I'm Claude McKay — born in Jamaica, reborn in Harlem. My poem 'If We Must Die' was a battle cry against racial violence.",
      "I wrote 'Home to Harlem' — the first Black bestselling novel. It captures the raw, vibrant, messy beauty of life here.",
      "I've loved both men and women. My bisexuality is part of who I am, and my writing doesn't shy away from desire or identity.",
      "The Red Summer of 1919 — white mobs attacking Black communities across America — that's why I wrote 'If We Must Die.' Poetry can be a weapon.",
    ],
    region: "rentparty",
  },
  // CHURCH
  {
    name: "Reverend Adam Clayton Powell Sr.",
    x: 350,
    y: 350,
    w: 28,
    h: 42,
    skin: "#8B4513",
    shirt: "#0f172a",
    pants: "#0f172a",
    hat: null,
    dialogues: [
      "Welcome to the Abyssinian Baptist Church. I'm Reverend Powell. This church has served Harlem since we moved here in 1923.",
      "We have over 10,000 members — the largest Protestant congregation in America! Faith and community go hand in hand.",
      "The Great Migration brought millions of Black Southerners north, seeking freedom from Jim Crow. Harlem became their promised land.",
      "But Harlem isn't perfect. Overcrowding, poverty, and discrimination persist. The Renaissance is beautiful, but it exists alongside real struggle.",
    ],
    region: "church",
  },
];

// ===== AMBIENT NPCS =====
const ambientNpcs = [];

// Club Dancers
for (let i = 0; i < 25; i++) {
  const colors = [
    "#dc2626",
    "#7c3aed",
    "#2563eb",
    "#059669",
    "#d97706",
    "#ec4899",
    "#06b6d4",
  ];
  ambientNpcs.push({
    x: 2530 + Math.random() * 320,
    y: 500 + Math.random() * 200,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: colors[Math.floor(Math.random() * colors.length)],
    pants: "#1e1b4b",
    offset: Math.random() * 100,
    type: "dancer",
  });
}

// Salon Guests
for (let i = 0; i < 8; i++) {
  ambientNpcs.push({
    x: 440 + Math.random() * 300,
    y: 600 + Math.random() * 200,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: "#6b7280",
    pants: "#374151",
    offset: Math.random() * 100,
    type: "thinker",
  });
}

// Dark Tower Guests
for (let i = 0; i < 10; i++) {
  const towerColors = ["#c026d3", "#7c3aed", "#ec4899", "#f43f5e", "#8b5cf6"];
  ambientNpcs.push({
    x: 830 + Math.random() * 350,
    y: 1820 + Math.random() * 200,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: towerColors[Math.floor(Math.random() * towerColors.length)],
    pants: "#0f172a",
    offset: Math.random() * 100,
    type: "dancer",
  });
}

// Park Strollers
for (let i = 0; i < 12; i++) {
  ambientNpcs.push({
    x: 1300 + Math.random() * 400,
    y: 2100 + Math.random() * 250,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: "#64748b",
    pants: "#334155",
    offset: Math.random() * 100,
    type: "stroller",
  });
}

// Speakeasy Patrons
for (let i = 0; i < 12; i++) {
  ambientNpcs.push({
    x: 2100 + Math.random() * 350,
    y: 1780 + Math.random() * 180,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: "#1e1b4b",
    pants: "#0f172a",
    offset: Math.random() * 100,
    type: "dancer",
  });
}

// Rent Party Guests
for (let i = 0; i < 10; i++) {
  ambientNpcs.push({
    x: 100 + Math.random() * 350,
    y: 2000 + Math.random() * 180,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: `hsl(${Math.random() * 360}, 70%, 55%)`,
    pants: "#292524",
    offset: Math.random() * 100,
    type: "dancer",
  });
}

// Church Congregation
for (let i = 0; i < 10; i++) {
  ambientNpcs.push({
    x: 200 + Math.random() * 300,
    y: 300 + Math.random() * 200,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: "#1e293b",
    pants: "#0f172a",
    offset: Math.random() * 100,
    type: "seated",
  });
}

// Street Pedestrians
for (let i = 0; i < 30; i++) {
  ambientNpcs.push({
    x: Math.random() * WW,
    y: 1050 + Math.random() * 300,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: `hsl(${Math.random() * 360}, 50%, 50%)`,
    pants: "#374151",
    offset: Math.random() * 200,
    type: "walker",
    baseX: Math.random() * WW,
  });
}

// Gallery Viewers
for (let i = 0; i < 6; i++) {
  ambientNpcs.push({
    x: 2600 + Math.random() * 400,
    y: 2200 + Math.random() * 200,
    w: 20,
    h: 32,
    skin: "#8B4513",
    shirt: "#a16207",
    pants: "#1e293b",
    offset: Math.random() * 100,
    type: "thinker",
  });
}

// ===== HELPER FUNCTIONS =====
function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function circle(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function text(str, x, y, color = "#fff", font = "14px serif") {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(str, x, y);
}

function stroke(x, y, w, h, color, lw = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.strokeRect(x, y, w, h);
}

// ===== BUILDING DRAWING FUNCTIONS =====

function drawBuilding(
  x,
  y,
  w,
  h,
  wallColor,
  roofColor,
  windowColor,
  name,
  floors,
) {
  // Wall
  rect(x, y, w, h, wallColor);
  // Darker brick lines
  for (let by = y; by < y + h; by += 12) {
    rect(x, by, w, 1, "rgba(0,0,0,0.1)");
  }
  // Roof
  rect(x - 10, y - 20, w + 20, 25, roofColor);
  // Cornice
  rect(x - 5, y - 5, w + 10, 8, roofColor);
  // Windows
  for (let f = 0; f < floors; f++) {
    const numWin = Math.floor(w / 60);
    for (let wi = 0; wi < numWin; wi++) {
      const wx = x + 30 + wi * 60;
      const wy = y + 30 + f * 80;
      if (wy + 40 < y + h - 10) {
        rect(wx, wy, 25, 35, windowColor);
        rect(wx + 11, wy, 2, 35, "rgba(0,0,0,0.3)");
        rect(wx, wy + 16, 25, 2, "rgba(0,0,0,0.3)");
      }
    }
  }
  // Sign
  if (name) {
    const tw = ctx.measureText ? name.length * 9 : 100;
    rect(x + w / 2 - tw / 2, y - 45, tw, 22, "#1e1b4b");
    text(name, x + w / 2 - tw / 2 + 5, y - 28, C.gold, "bold 16px serif");
  }
}

function drawNeonSign(x, y, txt, color) {
  const t = Date.now() / 500;
  const flicker = Math.sin(t * 3) > -0.3 ? 1 : 0.3;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 15 * flicker;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5 + 0.5 * flicker;
  ctx.font = "bold 22px serif";
  ctx.fillText(txt, x, y);
  ctx.restore();
}

function drawTree(x, y) {
  rect(x + 8, y + 20, 8, 20, "#5c3317");
  circle(x + 12, y + 10, 16, "#2d5a27");
  circle(x + 4, y + 16, 10, "#3a7a30");
  circle(x + 20, y + 16, 10, "#3a7a30");
}

function drawStreetLamp(x, y) {
  rect(x, y, 6, 70, "#374151");
  rect(x - 8, y - 5, 22, 10, "#4b5563");
  circle(x + 3, y + 2, 8, "rgba(254,240,138,0.4)");
  rect(x - 2, y, 10, 6, C.gold);
}

function drawCar(x, y, color) {
  // Body
  rect(x, y + 10, 70, 25, color);
  // Cabin
  rect(x + 15, y, 35, 15, color);
  // Windows
  rect(x + 18, y + 2, 13, 10, "#a5f3fc");
  rect(x + 34, y + 2, 13, 10, "#a5f3fc");
  // Wheels
  circle(x + 15, y + 35, 8, "#1e1b4b");
  circle(x + 55, y + 35, 8, "#1e1b4b");
  circle(x + 15, y + 35, 4, "#6b7280");
  circle(x + 55, y + 35, 4, "#6b7280");
  // Headlight
  rect(x + 68, y + 15, 4, 6, C.gold);
}

// ===== WORLD DRAWING =====
function drawWorld() {
  const t = Date.now() / 1000;

  // === SKY / GROUND ===
  // Night sky gradient at top
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
  skyGrad.addColorStop(0, "#0c0a1a");
  skyGrad.addColorStop(1, "#1a1a3e");
  rect(0, 0, WW, 300, "#0c0a1a");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, WW, 300);

  // Stars
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137.5 + 50) % WW;
    const sy = (i * 73.1 + 10) % 250;
    const twinkle = Math.sin(t * 2 + i) * 0.4 + 0.6;
    ctx.globalAlpha = twinkle;
    rect(sx, sy, 2, 2, "#fff");
  }
  ctx.globalAlpha = 1;

  // Ground base
  rect(0, 300, WW, WH - 300, C.street);

  // === MAIN ROADS ===
  // Horizontal main road
  rect(0, 1000, WW, 200, "#292929");
  // Road lines
  for (let rx = 0; rx < WW; rx += 80) {
    rect(rx, 1095, 40, 6, "#fbbf24");
  }
  // Sidewalks along main road
  rect(0, 960, WW, 40, C.sidewalk);
  rect(0, 1200, WW, 40, C.sidewalkLight);

  // Vertical cross-road
  rect(1900, 300, 150, WH - 300, "#292929");
  for (let ry = 300; ry < WH; ry += 80) {
    rect(1970, ry, 6, 40, "#fbbf24");
  }
  rect(1860, 300, 40, WH - 300, C.sidewalk);
  rect(2050, 300, 40, WH - 300, C.sidewalkLight);

  // === UPPER LEFT: ABYSSINIAN BAPTIST CHURCH ===
  const chX = 100,
    chY = 300;
  rect(chX, chY, 500, 500, C.brick);
  rect(chX - 10, chY - 30, 520, 35, C.roofRed);
  // Steeple
  rect(chX + 220, chY - 120, 60, 100, C.brick);
  // Cross
  rect(chX + 245, chY - 155, 10, 40, C.gold);
  rect(chX + 235, chY - 140, 30, 8, C.gold);
  // Stained glass windows
  const stainColors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
  for (let wi = 0; wi < 5; wi++) {
    rect(chX + 40 + wi * 90, chY + 60, 40, 70, stainColors[wi]);
    rect(chX + 40 + wi * 90, chY + 180, 40, 70, stainColors[(wi + 2) % 5]);
  }
  // Door
  rect(chX + 200, chY + 380, 100, 120, C.woodDark);
  rect(chX + 245, chY + 380, 10, 120, C.wood);
  // Pews inside
  for (let py = 0; py < 4; py++) {
    for (let px = 0; px < 3; px++) {
      rect(chX + 60 + px * 140, chY + 300 + py * 40, 100, 8, C.woodDark);
    }
  }
  text(
    "ABYSSINIAN BAPTIST CHURCH",
    chX + 100,
    chY - 40,
    C.gold,
    "bold 20px serif",
  );

  // === UPPER-MID-LEFT: LITERARY SALON ===
  drawBuilding(
    400,
    540,
    400,
    320,
    "#a0522d",
    C.roofRed,
    C.window,
    "LITERARY SALON",
    3,
  );
  // Bookshelves inside
  for (let bi = 0; bi < 6; bi++) {
    rect(420 + bi * 60, 640, 40, 60, C.woodDark);
    for (let bk = 0; bk < 3; bk++) {
      const bookColors = [
        "#dc2626",
        "#2563eb",
        "#16a34a",
        "#d97706",
        "#7c3aed",
      ];
      rect(
        425 + bi * 60 + bk * 12,
        645 + Math.random() * 5,
        8,
        20,
        bookColors[Math.floor(Math.random() * 5)],
      );
    }
  }
  // Desk / writing table
  rect(500, 740, 100, 40, C.wood);
  rect(650, 720, 60, 50, C.wood);
  // Rug
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(450, 700, 300, 120);
  ctx.fillStyle = "#991b1b";
  ctx.fillRect(460, 710, 280, 100);

  // === UPPER RIGHT: COTTON CLUB ===
  const ccX = 2500,
    ccY = 300;
  rect(ccX, ccY, 600, 450, C.woodDark);
  rect(ccX - 10, ccY - 30, 620, 35, "#4a1a2e");
  // Neon sign
  drawNeonSign(ccX + 180, ccY - 50, "✦ THE COTTON CLUB ✦", "#ff6ec7");
  // Stage
  rect(ccX + 150, ccY + 30, 300, 120, "#2a0a1e");
  rect(ccX + 145, ccY + 25, 310, 10, C.gold);
  // Spotlights
  circle(ccX + 220, ccY + 20, 10, "rgba(255,200,50,0.5)");
  circle(ccX + 380, ccY + 20, 10, "rgba(255,200,50,0.5)");
  // Piano on stage
  rect(ccX + 180, ccY + 60, 50, 40, "#0a0a0a");
  rect(ccX + 175, ccY + 55, 60, 10, "#1e1e1e");
  // Microphone
  rect(ccX + 330, ccY + 70, 4, 50, "#9ca3af");
  circle(ccX + 332, ccY + 65, 6, "#4b5563");
  // Tables and chairs
  for (let ti = 0; ti < 8; ti++) {
    const tx = ccX + 60 + (ti % 4) * 140;
    const ty = ccY + 200 + Math.floor(ti / 4) * 120;
    circle(tx, ty, 25, C.woodLight);
    circle(tx, ty, 20, C.wood);
    // Chairs
    rect(tx - 30, ty - 8, 10, 16, C.woodDark);
    rect(tx + 20, ty - 8, 10, 16, C.woodDark);
  }
  // Bar
  rect(ccX + 480, ccY + 60, 100, 350, "#2a1a0e");
  rect(ccX + 485, ccY + 70, 90, 10, C.gold); // Bottles shelf
  for (let bi = 0; bi < 7; bi++) {
    rect(ccX + 490 + bi * 12, ccY + 50, 8, 20, `hsl(${bi * 40}, 70%, 40%)`);
  }
  // Dance floor
  for (let dx = 0; dx < 4; dx++) {
    for (let dy = 0; dy < 3; dy++) {
      const floorColor = (dx + dy) % 2 === 0 ? "#3a1f0d" : "#2a0f00";
      rect(ccX + 100 + dx * 80, ccY + 200 + dy * 80, 80, 80, floorColor);
    }
  }

  // === APOLLO THEATER ===
  const apX = 1550,
    apY = 440;
  rect(apX, apY, 300, 340, "#8b0000");
  rect(apX - 10, apY - 30, 320, 35, "#4a0000");
  // Marquee
  rect(apX + 20, apY - 70, 260, 50, "#1e1b4b");
  rect(apX + 15, apY - 75, 270, 8, C.gold);
  rect(apX + 15, apY - 22, 270, 8, C.gold);
  // Marquee lights
  for (let li = 0; li < 15; li++) {
    const bulbBright = Math.sin(t * 5 + li * 0.4) > 0 ? "#fef08a" : "#92400e";
    circle(apX + 30 + li * 18, apY - 75, 4, bulbBright);
    circle(apX + 30 + li * 18, apY - 18, 4, bulbBright);
  }
  text("APOLLO THEATER", apX + 55, apY - 42, C.gold, "bold 18px serif");
  text("TONIGHT: BESSIE SMITH", apX + 55, apY - 28, "#e5e7eb", "12px serif");
  // Curtains
  rect(apX + 30, apY + 20, 50, 200, "#8b0000");
  rect(apX + 220, apY + 20, 50, 200, "#8b0000");
  // Stage
  rect(apX + 30, apY + 200, 240, 80, C.woodDark);
  rect(apX + 25, apY + 195, 250, 10, C.gold);
  // Audience seats
  for (let row = 0; row < 3; row++) {
    for (let seat = 0; seat < 5; seat++) {
      rect(apX + 50 + seat * 45, apY + 300 + row * 25, 30, 8, "#6b0000");
    }
  }

  // === LOWER LEFT: A'LELIA WALKER'S DARK TOWER ===
  const dtX = 800,
    dtY = 1700;
  rect(dtX, dtY, 450, 400, "#2e1065");
  rect(dtX - 10, dtY - 30, 470, 35, "#1e0a3e");
  // Tower spires
  rect(dtX + 50, dtY - 80, 30, 60, "#2e1065");
  rect(dtX + 370, dtY - 80, 30, 60, "#2e1065");
  rect(dtX + 60, dtY - 95, 10, 20, C.gold);
  rect(dtX + 380, dtY - 95, 10, 20, C.gold);
  drawNeonSign(dtX + 100, dtY - 40, "THE DARK TOWER", "#c084fc");
  // Chandeliers
  circle(dtX + 150, dtY + 60, 20, "rgba(253,224,71,0.3)");
  circle(dtX + 300, dtY + 60, 20, "rgba(253,224,71,0.3)");
  rect(dtX + 145, dtY + 40, 10, 25, C.gold);
  rect(dtX + 295, dtY + 40, 10, 25, C.gold);
  // Fancy wallpaper pattern
  for (let px = 0; px < 8; px++) {
    for (let py = 0; py < 6; py++) {
      ctx.fillStyle = "rgba(168,85,247,0.1)";
      ctx.fillRect(dtX + 20 + px * 55, dtY + 80 + py * 55, 30, 30);
    }
  }
  // Grand piano
  rect(dtX + 60, dtY + 250, 80, 50, "#0a0a0a");
  // Couches
  rect(dtX + 200, dtY + 150, 100, 40, "#581c87");
  rect(dtX + 200, dtY + 280, 100, 40, "#581c87");
  // Sign: "ALL ARE WELCOME"
  rect(dtX + 130, dtY + 370, 200, 25, C.gold);
  text(
    "ALL ARE WELCOME HERE",
    dtX + 140,
    dtY + 388,
    "#1e0a3e",
    "bold 13px serif",
  );

  // === GLADYS BENTLEY'S SPEAKEASY / CLAM HOUSE ===
  const spX = 2100,
    spY = 1700;
  rect(spX, spY, 400, 300, "#1e1b4b");
  rect(spX - 10, spY - 30, 420, 35, "#0c0a1a");
  drawNeonSign(spX + 80, spY - 45, "THE CLAM HOUSE", "#00d4ff");
  drawNeonSign(spX + 100, spY - 20, "★ Jungle Alley ★", "#ff6ec7");
  // Bar
  rect(spX + 20, spY + 30, 360, 15, C.woodLight);
  // Bar stools
  for (let bs = 0; bs < 8; bs++) {
    rect(spX + 40 + bs * 42, spY + 50, 15, 25, C.woodDark);
    circle(spX + 47 + bs * 42, spY + 48, 10, C.wood);
  }
  // Stage area
  rect(spX + 100, spY + 180, 200, 80, "#0c0a1a");
  rect(spX + 95, spY + 175, 210, 10, C.neon);
  // Spotlight
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.moveTo(spX + 200, spY + 100);
  ctx.lineTo(spX + 140, spY + 260);
  ctx.lineTo(spX + 260, spY + 260);
  ctx.fillStyle = "#fef08a";
  ctx.fill();
  ctx.restore();

  // === RENT PARTY HOUSE ===
  const rpX = 50,
    rpY = 1900;
  drawBuilding(
    rpX,
    rpY,
    450,
    350,
    "#a0522d",
    "#6b3410",
    C.window,
    "RENT PARTY TONIGHT!",
    2,
  );
  // Phonograph
  rect(rpX + 350, rpY + 60, 30, 30, C.woodDark);
  circle(rpX + 365, rpY + 55, 15, "#1e1e1e");
  // Food table
  rect(rpX + 50, rpY + 200, 120, 30, C.wood);
  // Dancing space
  for (let dx = 0; dx < 3; dx++) {
    for (let dy = 0; dy < 2; dy++) {
      const fc = (dx + dy) % 2 === 0 ? "#8b5e3c" : "#7a4e2c";
      rect(rpX + 150 + dx * 60, rpY + 120 + dy * 60, 60, 60, fc);
    }
  }
  // Sign explaining rent parties
  rect(rpX + 60, rpY + 310, 330, 30, "rgba(0,0,0,0.7)");
  text(
    "Pay a few coins, dance all night!",
    rpX + 70,
    rpY + 330,
    C.cream,
    "13px serif",
  );

  // === MARCUS GARVEY PARK ===
  const gpX = 1200,
    gpY = 1600;
  rect(gpX, gpY, 600, 700, C.grass);
  // Paths
  rect(gpX + 250, gpY, 100, 700, "#d4a574");
  rect(gpX, gpY + 300, 600, 80, "#d4a574");
  // Trees
  for (let ti = 0; ti < 12; ti++) {
    drawTree(gpX + 30 + (ti % 4) * 150, gpY + 50 + Math.floor(ti / 4) * 220);
  }
  // Fountain
  circle(gpX + 300, gpY + 340, 40, "#60a5fa");
  circle(gpX + 300, gpY + 340, 30, "#93c5fd");
  circle(gpX + 300, gpY + 340, 8, "#bfdbfe");
  // Benches
  for (let bi = 0; bi < 3; bi++) {
    rect(gpX + 80 + bi * 200, gpY + 440, 60, 15, C.woodDark);
    rect(gpX + 80 + bi * 200, gpY + 430, 8, 25, C.woodDark);
    rect(gpX + 132 + bi * 200, gpY + 430, 8, 25, C.woodDark);
  }
  // Statue base
  rect(gpX + 280, gpY + 550, 40, 60, "#6b7280");
  rect(gpX + 270, gpY + 600, 60, 15, "#9ca3af");
  text(
    "MARCUS GARVEY PARK",
    gpX + 200,
    gpY + 680,
    "#166534",
    "bold 18px serif",
  );

  // === OUTDOOR ART GALLERY ===
  const agX = 2550,
    agY = 2100;
  rect(agX, agY, 500, 450, C.grassLight);
  // Fence
  for (let fi = 0; fi < 12; fi++) {
    rect(agX + fi * 42, agY, 4, 20, "#f5f5f4");
    rect(agX + fi * 42, agY + 430, 4, 20, "#f5f5f4");
  }
  rect(agX, agY, 500, 4, "#f5f5f4");
  // Easels with paintings
  const paintingColors = [
    ["#fbbf24", "#dc2626", "#7c3aed"],
    ["#2563eb", "#16a34a", "#f97316"],
    ["#ec4899", "#0891b2", "#a855f7"],
    ["#84cc16", "#e11d48", "#6366f1"],
    ["#f59e0b", "#14b8a6", "#d946ef"],
  ];
  for (let ei = 0; ei < 5; ei++) {
    const ex = agX + 40 + ei * 95;
    const ey = agY + 60;
    // Easel
    rect(ex + 18, ey + 50, 4, 60, C.woodDark);
    rect(ex + 28, ey + 50, 4, 60, C.woodDark);
    rect(ex + 10, ey + 70, 30, 4, C.woodDark);
    // Canvas
    rect(ex, ey, 50, 55, "#fef3c7");
    // Abstract art (silhouettes like Aaron Douglas)
    const pc = paintingColors[ei];
    circle(ex + 25, ey + 20, 18, pc[0]);
    rect(ex + 5, ey + 25, 40, 25, pc[1]);
    ctx.globalAlpha = 0.5;
    circle(ex + 15, ey + 15, 10, pc[2]);
    ctx.globalAlpha = 1;
  }
  // Sculpture
  rect(agX + 230, agY + 280, 40, 80, "#6b7280");
  rect(agX + 220, agY + 350, 60, 15, "#9ca3af");
  text(
    "HARLEM OUTDOOR ART GALLERY",
    agX + 120,
    agY + 430,
    "#166534",
    "bold 16px serif",
  );
  // Trees in gallery
  drawTree(agX + 20, agY + 250);
  drawTree(agX + 450, agY + 250);
  drawTree(agX + 20, agY + 370);
  drawTree(agX + 450, agY + 370);

  // === STREET DECORATIONS ===
  // Street lamps along main road
  for (let lx = 100; lx < WW; lx += 250) {
    drawStreetLamp(lx, 910);
    drawStreetLamp(lx + 120, 1205);
  }

  // Parked cars
  drawCar(300, 1040, "#8b0000");
  drawCar(700, 1040, "#1e3a5f");
  drawCar(1100, 1040, "#2e1065");
  drawCar(1500, 1050, "#065f46");
  drawCar(2300, 1040, "#78350f");
  drawCar(2800, 1050, "#4a0000");
  drawCar(600, 1100, "#1e293b");
  drawCar(1800, 1100, "#581c87");

  // Signs and posters on sidewalks
  rect(200, 930, 120, 25, "#1e1b4b");
  text("125th Street", 210, 948, C.gold, "bold 12px serif");

  rect(1300, 930, 140, 25, "#1e1b4b");
  text("Lenox Avenue", 1310, 948, C.gold, "bold 12px serif");

  rect(2200, 930, 160, 25, "#1e1b4b");
  text("133rd Street", 2210, 948, C.gold, "bold 12px serif");

  // Decorative awnings on buildings near streets
  for (let ax = 100; ax < 800; ax += 200) {
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(ax, 950);
    ctx.lineTo(ax + 80, 950);
    ctx.lineTo(ax + 70, 960);
    ctx.lineTo(ax + 10, 960);
    ctx.fill();
  }

  // Additional small storefronts along the street
  // Barbershop
  rect(1000, 830, 150, 130, C.brick);
  rect(990, 810, 170, 25, C.roofRed);
  text("BARBERSHOP", 1020, 828, C.cream, "bold 12px serif");
  // Barber pole
  for (let bp = 0; bp < 8; bp++) {
    rect(990, 840 + bp * 10, 8, 5, bp % 2 === 0 ? "#dc2626" : "#fff");
  }
  rect(1020, 880, 30, 50, C.window);

  // Record Shop
  rect(2600, 1250, 160, 130, "#2e1065");
  rect(2590, 1230, 180, 25, "#1e0a3e");
  text("RECORD SHOP", 2610, 1248, C.neonBlue, "bold 12px serif");
  // Records on display
  for (let ri = 0; ri < 4; ri++) {
    circle(2630 + ri * 30, 1310, 12, "#0a0a0a");
    circle(2630 + ri * 30, 1310, 4, stainColors[ri % 5]);
  }

  // Historical info plaques scattered around
  drawInfoPlaque(680, 1230, "THE GREAT MIGRATION: 1910-1940");
  drawInfoPlaque(1500, 1230, "6 MILLION Black Americans moved North");
  drawInfoPlaque(2300, 1230, "HARLEM: Capital of Black America");
  drawInfoPlaque(900, 2150, "The 1920s: A safe space for LGBTQ+ artists");
}

function drawInfoPlaque(x, y, txt) {
  rect(x, y, txt.length * 7.5 + 20, 22, "rgba(30,27,75,0.85)");
  stroke(x, y, txt.length * 7.5 + 20, 22, C.gold, 1);
  text(txt, x + 10, y + 16, C.cream, "bold 11px serif");
}

// ===== UPDATE =====
function update() {
  if (isDialogActive) return;

  let dx = 0,
    dy = 0;
  if (keys.w || keys.ArrowUp) dy -= 1;
  if (keys.s || keys.ArrowDown) dy += 1;
  if (keys.a || keys.ArrowLeft) dx -= 1;
  if (keys.d || keys.ArrowRight) dx += 1;

  // Normalize diagonal
  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  player.x += dx * player.speed;
  player.y += dy * player.speed;

  // Direction for animation
  if (dy < 0) player.dir = 1;
  else if (dy > 0) player.dir = 0;
  if (dx < 0) player.dir = 2;
  else if (dx > 0) player.dir = 3;

  // Step animation
  if (dx !== 0 || dy !== 0) {
    player.stepTimer += 0.15;
    player.frame = Math.floor(player.stepTimer) % 4;
  }

  // World Boundaries
  player.x = Math.max(0, Math.min(WW - player.w, player.x));
  player.y = Math.max(0, Math.min(WH - player.h, player.y));

  // Camera
  camera.x = player.x - CW / 2 + player.w / 2;
  camera.y = player.y - CH / 2 + player.h / 2;
  camera.x = Math.max(0, Math.min(WW - CW, camera.x));
  camera.y = Math.max(0, Math.min(WH - CH, camera.y));

  // Animate ambient NPCs
  const time = Date.now() / 200;
  ambientNpcs.forEach((npc) => {
    npc.yOff = 0;
    if (npc.type === "dancer") {
      npc.yOff = Math.sin(time + npc.offset) * 4;
      npc.xOff = Math.cos(time * 0.7 + npc.offset) * 2;
    } else if (npc.type === "thinker") {
      npc.xOff = Math.sin(time / 3 + npc.offset) * 0.3;
    } else if (npc.type === "walker") {
      npc.x = npc.baseX + Math.sin(time / 6 + npc.offset) * 80;
    } else if (npc.type === "stroller") {
      npc.xOff = Math.sin(time / 5 + npc.offset) * 1.5;
      npc.yOff = Math.cos(time / 7 + npc.offset) * 1;
    } else if (npc.type === "seated") {
      npc.xOff = 0;
      npc.yOff = 0;
    } else {
      npc.xOff = 0;
    }
  });
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, CW, CH);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawWorld();

  // Ambient NPCs
  ambientNpcs.forEach((npc) => {
    const nx = npc.x + (npc.xOff || 0);
    const ny = npc.y + (npc.yOff || 0);
    drawPixelPerson(
      nx,
      ny,
      npc.w,
      npc.h,
      npc.skin,
      npc.shirt,
      npc.pants,
      null,
      0,
    );
  });

  // Interactive NPCs
  npcs.forEach((npc) => {
    drawPixelPerson(
      npc.x,
      npc.y,
      npc.w,
      npc.h,
      npc.skin,
      npc.shirt,
      npc.pants,
      npc.hat,
      0,
    );

    const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
    if (dist < 80) {
      // Speech bubble
      const bx = npc.x - 15,
        by = npc.y - 35;
      rect(bx, by, 60, 22, "rgba(255,255,255,0.95)");
      stroke(bx, by, 60, 22, C.gold, 1);
      text("[SPACE]", bx + 5, by + 16, "#1e1b4b", "bold 11px sans-serif");
    }
    // Name
    ctx.font = "bold 10px sans-serif";
    const nameW = ctx.measureText(npc.name).width;
    rect(
      npc.x - nameW / 2 + npc.w / 2 - 2,
      npc.y + npc.h + 4,
      nameW + 4,
      14,
      "rgba(0,0,0,0.6)",
    );
    text(
      npc.name,
      npc.x - nameW / 2 + npc.w / 2,
      npc.y + npc.h + 15,
      C.gold,
      "bold 10px sans-serif",
    );
  });

  // Player
  const bobY = Math.sin(player.stepTimer * 2) * (player.frame > 0 ? 2 : 0);
  drawPixelPerson(
    player.x,
    player.y + bobY,
    player.w,
    player.h,
    "#d4a574",
    "#3b82f6",
    "#1e293b",
    null,
    player.dir,
  );

  ctx.restore();

  // === HUD ===
  // Location
  const region = getPlayerRegion();
  rect(10, 10, 250, 30, "rgba(0,0,0,0.7)");
  stroke(10, 10, 250, 30, C.gold, 1);
  text(`📍 ${region}`, 20, 30, C.gold, "bold 14px serif");

  // Mini-map
  const mmX = CW - 160,
    mmY = 10,
    mmW = 150,
    mmH = 100;
  rect(mmX, mmY, mmW, mmH, "rgba(0,0,0,0.7)");
  stroke(mmX, mmY, mmW, mmH, C.gold, 1);
  // Buildings on minimap
  const mmSx = mmW / WW,
    mmSy = mmH / WH;
  rect(mmX + 100 * mmSx, mmY + 300 * mmSy, 500 * mmSx, 500 * mmSy, "#8b4513"); // Church
  rect(mmX + 400 * mmSx, mmY + 540 * mmSy, 400 * mmSx, 320 * mmSy, "#a0522d"); // Salon
  rect(mmX + 2500 * mmSx, mmY + 300 * mmSy, 600 * mmSx, 450 * mmSy, "#78350f"); // Cotton Club
  rect(mmX + 1550 * mmSx, mmY + 440 * mmSy, 300 * mmSx, 340 * mmSy, "#8b0000"); // Apollo
  rect(mmX + 800 * mmSx, mmY + 1700 * mmSy, 450 * mmSx, 400 * mmSy, "#2e1065"); // Dark Tower
  rect(mmX + 2100 * mmSx, mmY + 1700 * mmSy, 400 * mmSx, 300 * mmSy, "#1e1b4b"); // Speakeasy
  rect(mmX + 1200 * mmSx, mmY + 1600 * mmSy, 600 * mmSx, 700 * mmSy, "#2d5a27"); // Park
  rect(mmX + 2550 * mmSx, mmY + 2100 * mmSy, 500 * mmSx, 450 * mmSy, "#3a7a30"); // Gallery
  rect(mmX + 50 * mmSx, mmY + 1900 * mmSy, 450 * mmSx, 350 * mmSy, "#8b4513"); // Rent Party
  // Roads
  rect(mmX, mmY + 1000 * mmSy, mmW, 200 * mmSy, "#444");
  rect(mmX + 1900 * mmSx, mmY, 150 * mmSx, mmH, "#444");
  // Player dot
  const px = mmX + player.x * mmSx;
  const py = mmY + player.y * mmSy;
  circle(px, py, 3, "#3b82f6");
  circle(px, py, 2, "#fff");

  // Controls hint
  rect(CW - 280, CH - 30, 270, 22, "rgba(0,0,0,0.5)");
  text(
    "WASD/Arrows: Move | SPACE: Talk",
    CW - 275,
    CH - 13,
    "#9ca3af",
    "11px sans-serif",
  );
}

// ===== REGIONS =====
function getPlayerRegion() {
  const px = player.x,
    py = player.y;
  if (px > 2500 && py < 750) return "The Cotton Club";
  if (px > 1550 && px < 1850 && py > 440 && py < 780) return "Apollo Theater";
  if (px > 100 && px < 600 && py > 300 && py < 800)
    return "Abyssinian Baptist Church";
  if (px > 400 && px < 800 && py > 540 && py < 860) return "Literary Salon";
  if (px > 800 && px < 1250 && py > 1700 && py < 2100)
    return "A'Lelia Walker's Dark Tower";
  if (px > 2100 && px < 2500 && py > 1700 && py < 2000)
    return "The Clam House (Speakeasy)";
  if (px > 50 && px < 500 && py > 1900 && py < 2250) return "Rent Party";
  if (px > 1200 && px < 1800 && py > 1600 && py < 2300)
    return "Marcus Garvey Park";
  if (px > 2550 && py > 2100) return "Outdoor Art Gallery";
  if (py > 960 && py < 1240) return "Harlem Streets";
  return "Harlem, New York";
}

// ===== INTERACTION =====
function handleInteraction() {
  if (isDialogActive) {
    dialogPage++;
    if (dialogPage >= currentNpcDialogues.length) {
      dialogBox.classList.add("hidden");
      isDialogActive = false;
      dialogPage = 0;
      currentNpcDialogues = [];
    } else {
      dialogTextEl.textContent = currentNpcDialogues[dialogPage];
      document.getElementById("dialog-page").textContent =
        `${dialogPage + 1}/${currentNpcDialogues.length} — SPACE to continue`;
    }
    return;
  }

  let nearest = null,
    nearDist = Infinity;
  npcs.forEach((npc) => {
    const d = Math.hypot(player.x - npc.x, player.y - npc.y);
    if (d < 80 && d < nearDist) {
      nearDist = d;
      nearest = npc;
    }
  });

  if (nearest) showDialog(nearest);
}

function showDialog(npc) {
  currentNpcDialogues = npc.dialogues;
  dialogPage = 0;

  speakerNameEl.textContent = npc.name;
  dialogTextEl.textContent = npc.dialogues[0];

  if (dialogPortraitEl) {
    dialogPortraitEl.style.backgroundColor = npc.shirt;
    dialogPortraitEl.innerHTML = `<span class="text-lg font-bold text-white drop-shadow-md">${npc.name[0]}</span>`;
  }

  const pageEl = document.getElementById("dialog-page");
  if (pageEl)
    pageEl.textContent = `1/${npc.dialogues.length} — SPACE to continue`;

  dialogBox.classList.remove("hidden");
  isDialogActive = true;
}

// ===== GAME LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
