import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { piEngine } from "./pi_engine";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
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

  app.get(api.pi.myDigit.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).claims.sub;
    const userState = await storage.getUserPiState(userId);
    
    if (!userState) {
      return res.json(null);
    }
    
    res.json({
      digitIndex: userState.digitIndex,
      digitValue: userState.digitValue,
      assignedAt: userState.assignedAt?.toISOString() || new Date().toISOString(),
    });
  });

  app.post(api.pi.assignDigit.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).claims.sub;
    
    // Check if already has one
    const existing = await storage.getUserPiState(userId);
    if (existing) {
      return res.json({
        digitIndex: existing.digitIndex,
        digitValue: existing.digitValue,
        assignedAt: existing.assignedAt?.toISOString() || new Date().toISOString(),
      });
    }
    
    // Assign new
    // 1. Increment global counter
    const globalState = await storage.incrementTotalUsers();
    const newIndex = globalState.currentDigitIndex;
    
    // 2. Get digit value
    const digitValue = piEngine.getDigit(newIndex);
    
    // 3. Create user state
    const newState = await storage.createUserPiState({
      userId,
      digitIndex: newIndex,
      digitValue,
    });
    
    // 4. Trigger render (async, don't wait)
    piEngine.renderAllResolutions().catch(console.error);
    
    res.json({
      digitIndex: newState.digitIndex,
      digitValue: newState.digitValue,
      assignedAt: newState.assignedAt?.toISOString() || new Date().toISOString(),
    });
  });

  app.get(api.pi.wallpaper.path, async (req, res) => {
    // Return URLs for the images
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}/wallpapers`;
    
    res.json({
      latest: `${baseUrl}/latest.png`,
      resolutions: {
        "1170x2532": `${baseUrl}/1170x2532.png`,
        "1290x2796": `${baseUrl}/1290x2796.png`,
        "1125x2436": `${baseUrl}/1125x2436.png`,
        "750x1334": `${baseUrl}/750x1334.png`,
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
