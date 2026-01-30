import { createCanvas, CanvasRenderingContext2D } from "canvas";
import { storage } from "./storage.js";
import { supabase } from "./auth/supabaseAuth.js";

const RESOLUTIONS = {
  "iphone-11": { width: 828, height: 1792 },
  "iphone-11-pro": { width: 1125, height: 2436 },
  "iphone-12": { width: 1170, height: 2532 },
  "iphone-14-pro": { width: 1179, height: 2556 },
  "iphone-14-plus": { width: 1284, height: 2778 },
  "iphone-14-pro-max": { width: 1290, height: 2796 },
  "iphone-15": { width: 1179, height: 2556 },
  "iphone-15-pro-max": { width: 1290, height: 2796 },
  "iphone-16-pro": { width: 1206, height: 2622 },
  "iphone-16-pro-max": { width: 1320, height: 2868 },
  "latest": { width: 1170, height: 2532 }, // Default to iPhone 12/13
};

const PI_FILE_PATH = path.join(process.cwd(), "server", "pi-1million.txt");
import fs from "fs";
import path from "path";

// FIXED Circos-style scientific spectral palette
const DIGIT_COLORS = [
  "#666666", // 0 → Grey
  "#EF4444", // 1 → Red
  "#F97316", // 2 → Orange
  "#FACC15", // 3 → Yellow
  "#4ADE80", // 4 → Green
  "#2DD4BF", // 5 → Teal
  "#3B82F6", // 6 → Blue
  "#6366F1", // 7 → Indigo
  "#A855F7", // 8 → Purple
  "#EC4899", // 9 → Pink
];

export class PiEngine {
  private digits: string = "";

  constructor() {
    this.loadDigits();
  }

  private loadDigits() {
    if (fs.existsSync(PI_FILE_PATH)) {
      const content = fs.readFileSync(PI_FILE_PATH, "utf-8");
      const piStart = content.indexOf("3.");
      if (piStart !== -1) {
        const piSection = content.substring(piStart);
        this.digits = piSection.replace(/\D/g, "");
      } else {
        this.digits = content.replace(/\D/g, "");
      }
      console.log(`Loaded ${this.digits.length} digits of Pi. First 10: ${this.digits.substring(0, 10)}`);
    } else {
      console.warn("Pi digits file not found.");
    }
  }

  getDigit(index: number): number {
    if (index < 0 || index >= this.digits.length) return 0;
    return parseInt(this.digits[index], 10);
  }

  async renderAllResolutions() {
    const globalState = await storage.getGlobalState();
    const userCount = globalState.currentDigitIndex;

    // Ensure bucket exists (using service role)
    await supabase.storage.createBucket('wallpapers', { public: true }).catch(() => { });

    for (const [name, res] of Object.entries(RESOLUTIONS)) {
      await this.renderWallpaper(res.width, res.height, userCount, name);
    }

    await storage.updateGlobalState({});
    console.log(`Rendered wallpapers with ${userCount} users (1-user-1-digit mode) and uploaded to Supabase`);
  }

  private async renderWallpaper(width: number, height: number, userCount: number, filename: string) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(width, height) * 0.42;

    // 1. Chords Layer (Background)
    if (userCount > 1) {
      this.drawChords(ctx, cx, cy, R, userCount);
    }

    // 2. Base Ring Layer
    this.drawDigitRing(ctx, cx, cy, R);

    // 3. Dots Layer (Top)
    if (userCount > 1) {
      this.drawDots(ctx, cx, cy, R, userCount);
    }

    const buffer = canvas.toBuffer("image/png");

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('wallpapers')
      .upload(`${filename}.png`, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${filename}.png to Supabase:`, error);
    }
  }

  private drawDigitRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number) {
    const segmentAngle = (Math.PI * 2) / 10;
    const ringWidth = R * 0.02;

    ctx.lineWidth = ringWidth;
    ctx.lineCap = "butt";

    for (let digit = 0; digit < 10; digit++) {
      const startAngle = digit * segmentAngle - Math.PI / 2;
      const endAngle = (digit + 1) * segmentAngle - Math.PI / 2;
      const gap = 0.01;

      ctx.beginPath();
      ctx.arc(cx, cy, R, startAngle + gap, endAngle - gap);
      ctx.strokeStyle = DIGIT_COLORS[digit];
      ctx.stroke();
    }
  }

  private drawChords(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, userCount: number) {
    const segmentAngle = (Math.PI * 2) / 10;
    const phi = (1 + Math.sqrt(5)) / 2;

    // SIGNIFICANT VISIBILITY BOOST: Thicker lines and higher opacity
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.5;

    for (let i = 1; i < userCount; i++) {
      const digitA = this.getDigit(i - 1);
      const digitB = this.getDigit(i);

      const jitterA = ((i * phi) % 1) * 0.9 + 0.05;
      const jitterB = (((i + 1) * phi) % 1) * 0.9 + 0.05;

      const angleA = (digitA * segmentAngle) + (jitterA * segmentAngle) - Math.PI / 2;
      const angleB = (digitB * segmentAngle) + (jitterB * segmentAngle) - Math.PI / 2;

      const x1 = cx + R * Math.cos(angleA);
      const y1 = cy + R * Math.sin(angleA);
      const x2 = cx + R * Math.cos(angleB);
      const y2 = cy + R * Math.sin(angleB);

      // REAL CURVED LOGIC: Midpoint Arc
      // Instead of pulling to the center, we pull toward a midpoint angle
      // on a smaller concentric circle (the "void border").
      let midAngle = (angleA + angleB) / 2;

      // Handle the 0-2PI wrap-around to ensure we curve the correct way (most aesthetic)
      if (Math.abs(angleA - angleB) > Math.PI) {
        midAngle += Math.PI;
      }

      const innerR = R * 0.4; // Chords will bow around this radius
      const cpX = cx + innerR * Math.cos(midAngle);
      const cpY = cy + innerR * Math.sin(midAngle);

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, DIGIT_COLORS[digitA]);
      gradient.addColorStop(1, DIGIT_COLORS[digitB]);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpX, cpY, x2, y2);
      ctx.strokeStyle = gradient;
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }

  private drawDots(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, userCount: number) {
    const segmentAngle = (Math.PI * 2) / 10;
    const phi = (1 + Math.sqrt(5)) / 2;

    let i = 0;
    while (i < userCount) {
      const digit = this.getDigit(i);
      let clusterSize = 1;

      while (i + clusterSize < userCount && this.getDigit(i + clusterSize) === digit) {
        clusterSize++;
      }

      if (clusterSize > 1) {
        // Position should feel "cloud-like" in the segment but not pinned to center
        // Deterministic jitter for both angle and radius
        const angleJitter = ((i * phi) % 1) * 0.8 + 0.1;
        const segmentStart = digit * segmentAngle - Math.PI / 2;
        const angle = segmentStart + (angleJitter * segmentAngle);

        // Broad radial band outside R
        const radialPull = (((i + 2) * phi) % 1) * 30 + 10;
        const radius = R + radialPull;

        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);

        let dotRadius = 2.5;
        if (clusterSize === 3) dotRadius = 4.5;
        if (clusterSize === 4) dotRadius = 6.5;
        if (clusterSize >= 5) dotRadius = 8.5;

        ctx.fillStyle = DIGIT_COLORS[digit];
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      i += clusterSize;
    }

    ctx.globalAlpha = 1.0;
  }
}

export const piEngine = new PiEngine();
