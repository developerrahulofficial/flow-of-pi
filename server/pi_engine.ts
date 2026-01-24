import fs from "fs";
import path from "path";
import { createCanvas, CanvasRenderingContext2D } from "canvas";
import { storage } from "./storage";

const RESOLUTIONS = {
  "1170x2532": { width: 1170, height: 2532 },
  "1290x2796": { width: 1290, height: 2796 },
  "1125x2436": { width: 1125, height: 2436 },
  "750x1334": { width: 750, height: 1334 },
  "latest": { width: 1170, height: 2532 },
};

const PI_FILE_PATH = path.join(process.cwd(), "server", "pi-1million.txt");
const WALLPAPER_DIR = path.join(process.cwd(), "client", "public", "wallpapers");

const COLORS = [
  "#FF3333", // 0 - Red
  "#FF8C33", // 1 - Orange  
  "#FFDD33", // 2 - Yellow
  "#AAFF33", // 3 - Yellow-Green
  "#33FF57", // 4 - Green
  "#33FFAA", // 5 - Cyan-Green
  "#33DDFF", // 6 - Cyan
  "#3388FF", // 7 - Blue
  "#8833FF", // 8 - Purple
  "#FF33DD", // 9 - Magenta
];

const INITIAL_DIGITS = 100; // Show first 100 digits of Pi on startup for visual appeal

export class PiEngine {
  private digits: string = "";

  constructor() {
    this.loadDigits();
  }

  private loadDigits() {
    if (fs.existsSync(PI_FILE_PATH)) {
      this.digits = fs.readFileSync(PI_FILE_PATH, "utf-8").replace(/\D/g, "");
      console.log(`Loaded ${this.digits.length} digits of Pi`);
    } else {
      console.warn("Pi digits file not found.");
    }
  }

  getDigit(index: number): number {
    if (index < 0 || index >= this.digits.length) return 0;
    return parseInt(this.digits[index], 10);
  }

  async renderAllResolutions() {
    if (!fs.existsSync(WALLPAPER_DIR)) {
      fs.mkdirSync(WALLPAPER_DIR, { recursive: true });
    }

    const globalState = await storage.getGlobalState();
    const userCount = globalState.currentDigitIndex;
    
    // Always show at least INITIAL_DIGITS for visual appeal, plus user contributions
    const digitCount = Math.max(INITIAL_DIGITS, userCount);

    for (const [name, res] of Object.entries(RESOLUTIONS)) {
      await this.renderWallpaper(res.width, res.height, digitCount, name);
    }
    
    await storage.updateGlobalState({});
    console.log(`Rendered wallpapers with ${digitCount} digits`);
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  private async renderWallpaper(width: number, height: number, digitCount: number, filename: string) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.40;
    const innerRadius = maxRadius * 0.08; // Black hole in center
    const ringWidth = maxRadius * 0.04;
    const outerRingRadius = maxRadius + ringWidth * 2;

    // Draw outer colored ring segments (0-9)
    this.drawSegmentRing(ctx, cx, cy, outerRingRadius, ringWidth);

    // Draw scattered particles around the ring
    this.drawParticles(ctx, cx, cy, outerRingRadius, ringWidth * 3, digitCount);

    // Draw the chords
    this.drawChords(ctx, cx, cy, maxRadius, innerRadius, digitCount);

    // Draw center black hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();

    // Draw thin ring around center
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path.join(WALLPAPER_DIR, `${filename}.png`), buffer);
  }

  private drawSegmentRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, width: number) {
    const segmentSpan = (Math.PI * 2) / 10;
    const gap = 0.02; // Small gap between segments

    for (let d = 0; d < 10; d++) {
      const startAngle = d * segmentSpan - Math.PI / 2 + gap;
      const endAngle = (d + 1) * segmentSpan - Math.PI / 2 - gap;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = COLORS[d];
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D, cx: number, cy: number, baseRadius: number, spread: number, count: number) {
    const particleCount = Math.min(count * 3, 1500);
    
    for (let i = 0; i < particleCount; i++) {
      const seed = i * 7.31;
      const angle = this.seededRandom(seed) * Math.PI * 2;
      const radiusOffset = (this.seededRandom(seed + 1) - 0.5) * spread * 2;
      const r = baseRadius + radiusOffset;
      
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      
      const digit = Math.floor(this.seededRandom(seed + 2) * 10);
      const size = this.seededRandom(seed + 3) * 3 + 1;
      const alpha = this.seededRandom(seed + 4) * 0.6 + 0.2;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[digit];
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawChords(ctx: CanvasRenderingContext2D, cx: number, cy: number, maxRadius: number, innerRadius: number, digitCount: number) {
    const segmentSpan = (Math.PI * 2) / 10;
    
    ctx.globalCompositeOperation = "lighter";
    
    for (let i = 1; i < digitCount; i++) {
      const d1 = this.getDigit(i - 1);
      const d2 = this.getDigit(i);
      
      // Position within segment - spread out based on index
      const posInSegment1 = (i % 50) / 50;
      const posInSegment2 = ((i + 17) % 50) / 50;
      
      const angle1 = d1 * segmentSpan + posInSegment1 * segmentSpan * 0.9 - Math.PI / 2;
      const angle2 = d2 * segmentSpan + posInSegment2 * segmentSpan * 0.9 - Math.PI / 2;
      
      const x1 = cx + Math.cos(angle1) * maxRadius;
      const y1 = cy + Math.sin(angle1) * maxRadius;
      const x2 = cx + Math.cos(angle2) * maxRadius;
      const y2 = cy + Math.sin(angle2) * maxRadius;

      // Control point for bezier - closer to center for more curve
      const midAngle = (angle1 + angle2) / 2;
      const angleDiff = Math.abs(angle2 - angle1);
      const curveDepth = 0.2 + (angleDiff / Math.PI) * 0.3;
      const controlRadius = maxRadius * curveDepth;
      
      const cpx = cx + Math.cos(midAngle) * controlRadius;
      const cpy = cy + Math.sin(midAngle) * controlRadius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      
      ctx.strokeStyle = COLORS[d1];
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}

export const piEngine = new PiEngine();
