import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.js";
import { piEngine } from "./pi_engine.js";
import { api } from "../shared/routes.js";
import { setupAuth, registerAuthRoutes, verifySupabaseToken, supabase } from "./auth/supabaseAuth.js";
import path from "path";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Wallpapers are served via Supabase Storage

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
    // Return Public URLs from Supabase Storage
    const { data } = supabase.storage.from('wallpapers').getPublicUrl('latest.png');
    const baseUrl = data.publicUrl.replace('/latest.png', '');

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

  // For Vercel, we can trigger this via a manual API endpoint or Vercel Cron
  app.get("/api/admin/render", verifySupabaseToken, async (req, res) => {
    // Simple protection - only allow specific user or check for a secret header
    await piEngine.renderAllResolutions();
    res.json({ status: "success" });
  });

  // Initial render on Koyeb startup
  console.log("Initial wallpaper render check...");
  // Delay slightly to let DB connect and bucket be created
  setTimeout(() => {
    piEngine.renderAllResolutions()
      .then(() => console.log("Startup render complete."))
      .catch(err => console.error("Startup render failed:", err));
  }, 10000);

  return httpServer;
}
