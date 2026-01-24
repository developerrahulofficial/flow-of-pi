import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
import { storage } from "./storage";

// Constants for artwork
const RESOLUTIONS = {
  "1170x2532": { width: 1170, height: 2532 },
  "1290x2796": { width: 1290, height: 2796 },
  "1125x2436": { width: 1125, height: 2436 },
  "750x1334": { width: 750, height: 1334 },
  "latest": { width: 1170, height: 2532 }, // Default to 1170x2532
};

const PI_FILE_PATH = path.join(process.cwd(), "server", "pi-1million.txt");
const WALLPAPER_DIR = path.join(process.cwd(), "client", "public", "wallpapers");

export class PiEngine {
  private digits: string = "";

  constructor() {
    this.loadDigits();
  }

  private loadDigits() {
    if (fs.existsSync(PI_FILE_PATH)) {
      this.digits = fs.readFileSync(PI_FILE_PATH, "utf-8").replace(/\D/g, ""); // Keep only digits
    } else {
      console.warn("Pi digits file not found. Artwork will be empty until downloaded.");
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
    const count = globalState.currentDigitIndex;
    
    // We render one "master" art state, but adapted for each resolution
    // Actually, to be efficient, we can render once large and crop/resize, 
    // BUT the prompt says "Center artwork safely".
    // Let's render for each resolution to be safe and crisp.

    for (const [name, res] of Object.entries(RESOLUTIONS)) {
      await this.renderWallpaper(res.width, res.height, count, name);
    }
    
    // Update timestamp
    await storage.updateGlobalState({});
  }

  private async renderWallpaper(width: number, height: number, digitCount: number, filename: string) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Center
    const cx = width / 2;
    const cy = height / 2;
    // Radius: fit within the smaller dimension, with some padding
    const maxRadius = Math.min(width, height) * 0.45; 

    // Visual Style: Circos-style
    // We map digits to chords/arcs.
    // 0-9 mapped to segments on the circle.
    
    // Palette (Neon/Spectral)
    const colors = [
      "#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", 
      "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#7F00FF"
    ];

    ctx.globalCompositeOperation = "screen"; // Additive blending for "neon" look
    ctx.lineWidth = 1; // Fine lines

    // Draw chords
    // We process digits in pairs to draw a chord from digit A to digit B? 
    // Or just one digit adds "one new line"?
    // "Each new digit adds ONE new stroke / chord / line"
    // Let's say digit[i] connects to digit[i-1].
    // Or digit[i] determines start/end based on its value and position.
    
    // Algorithm:
    // Divide circle into 10 segments (0-9).
    // Digit `d` at index `i`:
    // Start point: mapped to segment `d`.
    // End point: mapped to segment `next_digit`? Or `prev_digit`?
    // Let's connect `i` to `i-1`.
    
    // Optimization: If count is huge, this loop is slow.
    // Limit to last N digits if it gets too dense? 
    // Prompt says "Dense overlapping colorful chords". 
    // Canvas is fast enough for 10-20k lines. 1M might be slow.
    // For MVP, we render all up to current count.
    
    // To make it look "Circos", we connect points on the circumference.
    // Each digit represents a "node" on the circle.
    // But we need variation within the segment so all 3s don't start at exact same pixel.
    // Map index `i` to a specific angle within the segment for digit `d`.
    
    // Total capacity per segment? Maybe just random angle within segment `d`? 
    // "Deterministic" -> Use seeded random or math based on index.
    
    for (let i = 1; i < digitCount; i++) {
      const d1 = this.getDigit(i - 1);
      const d2 = this.getDigit(i);
      
      const color = colors[d1];
      
      // Calculate angles
      // Segment span = 360 / 10 = 36 degrees.
      // Offset within segment based on `i` to avoid overlap
      // Use a golden ratio or simple mod to spread them out.
      const segmentSpan = (Math.PI * 2) / 10;
      
      // Deterministic jitter within segment
      const jitter1 = (Math.sin(i) * 0.5 + 0.5) * segmentSpan;
      const jitter2 = (Math.cos(i) * 0.5 + 0.5) * segmentSpan;
      
      const angle1 = d1 * segmentSpan + jitter1;
      const angle2 = d2 * segmentSpan + jitter2;
      
      const x1 = cx + Math.cos(angle1) * maxRadius;
      const y1 = cy + Math.sin(angle1) * maxRadius;
      
      const x2 = cx + Math.cos(angle2) * maxRadius;
      const y2 = cy + Math.sin(angle2) * maxRadius;
      
      // Quadratic Bezier Curve for "Chord" look (goes through center-ish)
      // Control point is closer to center (0,0) relative to circle
      // Control point radius depends on distance between angles?
      // Simple approach: Control point is (cx, cy) -> straight lines through center.
      // Better: Control point is midpoint * factor.
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3; // Transparency for density
      
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.stroke();
    }
    
    // Save file
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path.join(WALLPAPER_DIR, `${filename}.png`), buffer);
  }
}

export const piEngine = new PiEngine();
