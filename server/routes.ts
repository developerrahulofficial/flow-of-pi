import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { piEngine } from "./pi_engine";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, verifySupabaseToken } from "./auth/supabaseAuth";
import path from "path";
import express from "express";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Serve static wallpapers
  app.use("/wallpapers", express.static(path.join(process.cwd(), "client", "public", "wallpapers")));

  // API Routes
  app.get(api.pi.state.path, async (req, res) => {
    const state = await storage.getGlobalState();
    res.json(state);
  });

  app.get(api.pi.myDigit.path, verifySupabaseToken, async (req, res) => {
    const userId = (req.user as any).id;
    const userState = await storage.getUserPiState(userId);

    if (!userState) {
      return res.json(null);
    }

    const digitIndex = userState.digitIndex - 1; // 0-based index for Pi sequence
    const digitValue = piEngine.getDigit(digitIndex);

    // User N reveals Digit N. They form a chord with Digit N-1 if N > 1.
    const hasChord = userState.digitIndex > 1;
    const fromDigit = hasChord ? piEngine.getDigit(digitIndex - 1) : null;

    res.json({
      digitIndex: userState.digitIndex,
      digitValue: digitValue,
      fromDigit,
      toDigit: digitValue,
      chordNumber: hasChord ? userState.digitIndex - 1 : null,
      assignedAt: userState.assignedAt?.toISOString() || new Date().toISOString(),
    });
  });

  app.post(api.pi.assignDigit.path, verifySupabaseToken, async (req, res) => {
    const userId = (req.user as any).id;

    // Check if already has one
    const existing = await storage.getUserPiState(userId);
    if (existing) {
      const dIndex = existing.digitIndex - 1;
      const dValue = piEngine.getDigit(dIndex);
      const hasC = existing.digitIndex > 1;
      const fDigit = hasC ? piEngine.getDigit(dIndex - 1) : null;

      return res.json({
        digitIndex: existing.digitIndex,
        digitValue: dValue,
        fromDigit: fDigit,
        toDigit: dValue,
        chordNumber: hasC ? existing.digitIndex - 1 : null,
        assignedAt: existing.assignedAt?.toISOString() || new Date().toISOString(),
      });
    }

    // Assign EXACTLY ONE new digit
    const globalState = await storage.incrementTotalUsers();
    const userDigitNumber = globalState.currentDigitIndex; // This will be 2 for the first user

    const digitIndex = userDigitNumber - 1; // 0-based index of Pi
    const digitValue = piEngine.getDigit(digitIndex);

    const newState = await storage.createUserPiState({
      userId,
      digitIndex: userDigitNumber,
      digitValue: digitValue,
    });

    // CRITICAL: Await render so user sees updated art immediately
    await piEngine.renderAllResolutions().catch(console.error);

    const hasC = userDigitNumber > 1;
    const fDigit = hasC ? piEngine.getDigit(digitIndex - 1) : null;

    res.json({
      digitIndex: newState.digitIndex,
      digitValue: newState.digitValue,
      fromDigit: fDigit,
      toDigit: digitValue,
      chordNumber: hasC ? userDigitNumber - 1 : null,
      assignedAt: newState.assignedAt?.toISOString() || new Date().toISOString(),
    });
  });

  app.get(api.pi.timeline.path, async (req, res) => {
    // 1. Get System Node (Index 1, Value 3)
    const systemNode = {
      digitIndex: 1,
      digitValue: 3,
      isSystem: true,
      user: null
    };

    // 2. Get User Nodes
    const userStates = await storage.getAllUserPiStates();

    // Map to response format
    const userNodes = userStates.map(({ state, user }) => ({
      digitIndex: state.digitIndex,
      digitValue: state.digitValue,
      isSystem: false,
      user: user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        instagramHandle: user.instagramHandle,
      } : null,
    }));

    // Combine and Sort
    const timeline = [systemNode, ...userNodes].sort((a, b) => a.digitIndex - b.digitIndex);

    res.json(timeline);
  });

  app.get(api.pi.wallpaper.path, async (req, res) => {
    // Return URLs for the images
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}/wallpapers`;

    const ts = Date.now();
    res.json({
      latest: `${baseUrl}/latest.png?t=${ts}`,
      resolutions: {
        "iphone-11": `${baseUrl}/iphone-11.png?t=${ts}`,
        "iphone-11-pro": `${baseUrl}/iphone-11-pro.png?t=${ts}`,
        "iphone-12": `${baseUrl}/iphone-12.png?t=${ts}`,
        "iphone-14-pro": `${baseUrl}/iphone-14-pro.png?t=${ts}`,
        "iphone-14-plus": `${baseUrl}/iphone-14-plus.png?t=${ts}`,
        "iphone-14-pro-max": `${baseUrl}/iphone-14-pro-max.png?t=${ts}`,
        "iphone-15": `${baseUrl}/iphone-15.png?t=${ts}`,
        "iphone-15-pro-max": `${baseUrl}/iphone-15-pro-max.png?t=${ts}`,
        "iphone-16-pro": `${baseUrl}/iphone-16-pro.png?t=${ts}`,
        "iphone-16-pro-max": `${baseUrl}/iphone-16-pro-max.png?t=${ts}`,
      }
    });
  });

  // Scheduled Task for Daily Updates (5:55 PM IST ~ 12:25 PM UTC)
  // For simplicity in this demo, we rely on user activity or manual trigger
  // But we can add a check here.
  setInterval(() => {
    const now = new Date();
    // Simple check: if it's 5:55 PM IST (UTC+5:30) -> 12:25 UTC
    if (now.getUTCHours() === 12 && now.getUTCMinutes() === 25) {
      piEngine.renderAllResolutions().catch(console.error);
    }
  }, 60000); // Check every minute

  // Initial render on startup if folder empty
  const wallpaperDir = path.join(process.cwd(), "client", "public", "wallpapers");
  if (!fs.existsSync(wallpaperDir) || fs.readdirSync(wallpaperDir).length === 0) {
    console.log("Initial wallpaper render...");
    // Delay slightly to let DB connect
    setTimeout(() => piEngine.renderAllResolutions(), 5000);
  }

  return httpServer;
}
