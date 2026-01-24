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

// Fixed colors for each digit (0-9) - Circos/spectral style
const DIGIT_COLORS = [
  "#00FFFF", // 0 → cyan
  "#008B8B", // 1 → teal
  "#00FF00", // 2 → green
  "#FFFF00", // 3 → yellow
  "#FF8C00", // 4 → orange
  "#FF0000", // 5 → red
  "#FF00FF", // 6 → magenta
  "#8B00FF", // 7 → violet
  "#0000FF", // 8 → blue
  "#40E0D0", // 9 → turquoise
];

export class PiEngine {
  private digits: string = "";

  constructor() {
    this.loadDigits();
  }

  private loadDigits() {
    if (fs.existsSync(PI_FILE_PATH)) {
      const content = fs.readFileSync(PI_FILE_PATH, "utf-8");
      // Find where Pi starts (after "3.")
      const piStart = content.indexOf("3.");
      if (piStart !== -1) {
        // Extract from "3." onwards and remove non-digits
        const piSection = content.substring(piStart);
        this.digits = piSection.replace(/\D/g, ""); // Now starts with 3141592653...
      } else {
        // Fallback: just remove non-digits
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
    if (!fs.existsSync(WALLPAPER_DIR)) {
      fs.mkdirSync(WALLPAPER_DIR, { recursive: true });
    }

    const globalState = await storage.getGlobalState();
    const userCount = globalState.currentDigitIndex; // Number of users = number of chords

    for (const [name, res] of Object.entries(RESOLUTIONS)) {
      await this.renderWallpaper(res.width, res.height, userCount, name);
    }
    
    await storage.updateGlobalState({});
    console.log(`Rendered wallpapers with ${userCount} chords (users)`);
  }

  private async renderWallpaper(width: number, height: number, userCount: number, filename: string) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // PHASE 0: Canvas & Base Circle
    // Step 0.1 - Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Center point
    const cx = width / 2;
    const cy = height / 2;
    
    // Radius = 40-45% of smaller dimension (centered for phone wallpapers)
    const R = Math.min(width, height) * 0.42;

    // Step 0.2 & 0.3 - Draw the 10 colored arc segments (always visible)
    this.drawDigitRing(ctx, cx, cy, R);

    // PHASE 1-4: Draw chords based on user count
    // Each user = 1 chord using 2 consecutive digits of Pi
    if (userCount > 0) {
      this.drawChords(ctx, cx, cy, R, userCount);
    }

    // Save file
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path.join(WALLPAPER_DIR, `${filename}.png`), buffer);
  }

  private drawDigitRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number) {
    // Draw outer ring with 10 colored segments (one per digit 0-9)
    // Each segment spans 36 degrees
    const segmentAngle = (Math.PI * 2) / 10; // 36 degrees in radians
    const ringWidth = R * 0.06; // Width of the colored ring
    const ringRadius = R + ringWidth; // Outer edge of ring
    
    ctx.lineWidth = ringWidth;
    ctx.lineCap = "butt";

    for (let digit = 0; digit < 10; digit++) {
      // Angle range for this digit
      // Starting from top (rotate by -90 degrees)
      const startAngle = digit * segmentAngle - Math.PI / 2;
      const endAngle = (digit + 1) * segmentAngle - Math.PI / 2;
      
      // Small gap between segments
      const gap = 0.02;
      
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius - ringWidth / 2, startAngle + gap, endAngle - gap);
      ctx.strokeStyle = DIGIT_COLORS[digit];
      ctx.stroke();
    }

    // Draw digit labels on the ring
    ctx.font = `${R * 0.05}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    
    for (let digit = 0; digit < 10; digit++) {
      // Place label at center of segment
      const labelAngle = digit * segmentAngle + segmentAngle / 2 - Math.PI / 2;
      const labelRadius = ringRadius + ringWidth * 0.8;
      const lx = cx + Math.cos(labelAngle) * labelRadius;
      const ly = cy + Math.sin(labelAngle) * labelRadius;
      ctx.fillText(digit.toString(), lx, ly);
    }
  }

  private drawChords(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, userCount: number) {
    // PHASE 2: Each user draws ONE chord using NEXT TWO digits of Pi
    // User 1: digits 0,1 (3→1)
    // User 2: digits 2,3 (4→1)
    // User N: digits 2*(N-1), 2*(N-1)+1
    
    const segmentAngle = (Math.PI * 2) / 10; // 36 degrees
    
    ctx.lineWidth = 0.8; // Thin lines (0.5-1.2px)
    ctx.lineCap = "round";

    for (let user = 1; user <= userCount; user++) {
      // Get the two digits for this user's chord
      const digitIndex1 = 2 * (user - 1);
      const digitIndex2 = 2 * (user - 1) + 1;
      
      const startDigit = this.getDigit(digitIndex1);
      const endDigit = this.getDigit(digitIndex2);
      
      // PHASE 3: Calculate angles
      // Step 3.1: angle = center of digit's 36° segment
      // angle = digit * 36° + 18° (in degrees) - rotate to start from top
      const startAngle = startDigit * segmentAngle + segmentAngle / 2 - Math.PI / 2;
      const endAngle = endDigit * segmentAngle + segmentAngle / 2 - Math.PI / 2;
      
      // Step 3.2: Convert angle to point on circle
      const x1 = cx + R * Math.cos(startAngle);
      const y1 = cy + R * Math.sin(startAngle);
      const x2 = cx + R * Math.cos(endAngle);
      const y2 = cy + R * Math.sin(endAngle);
      
      // Step 3.3 & 3.4: Draw chord with color of START digit
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2); // Straight line
      ctx.strokeStyle = DIGIT_COLORS[startDigit];
      ctx.globalAlpha = 0.3; // Low opacity (0.2-0.4)
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1; // Reset alpha
  }
}

export const piEngine = new PiEngine();
