import { db } from "./db.js";
import {
  globalState,
  userPiStates,
  type UserPiState,
  type GlobalState,
  type InsertUserPiState,
  users,
} from "../shared/schema.js";
import { eq, sql } from "drizzle-orm";
import { authStorage } from "./auth/storage.js";

export interface IStorage {
  // Global State
  getGlobalState(): Promise<GlobalState>;
  updateGlobalState(updates: Partial<GlobalState>): Promise<GlobalState>;
  incrementTotalUsers(): Promise<GlobalState>;

  // User Pi State
  getUserPiState(userId: string): Promise<UserPiState | undefined>;
  createUserPiState(state: InsertUserPiState): Promise<UserPiState>;
  getNextAvailableDigitIndex(): Promise<number>;
  getAllUserPiStates(): Promise<{ state: UserPiState; user: typeof users.$inferSelect | null }[]>;

  // Auth (re-exported)
  getUser: typeof authStorage.getUser;
  upsertUser: typeof authStorage.upsertUser;
}

export class DatabaseStorage implements IStorage {
  // Re-export auth methods
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  async getGlobalState(): Promise<GlobalState> {
    const [state] = await db.select().from(globalState).limit(1);
    if (!state) {
      // Initialize if not exists
      const [newState] = await db.insert(globalState).values({
        totalUsers: 0,
        currentDigitIndex: 0,
      }).returning();
      return newState;
    }
    return state;
  }

  async updateGlobalState(updates: Partial<GlobalState>): Promise<GlobalState> {
    // Ensure state exists first
    await this.getGlobalState();

    // There is only one row in global_state, we assume ID 1 or the first one
    // But since we just got it, we can update generically
    const [updated] = await db
      .update(globalState)
      .set({ ...updates, lastRenderedAt: new Date() })
      .where(sql`id = (SELECT id FROM global_state LIMIT 1)`)
      .returning();
    return updated;
  }

  async incrementTotalUsers(): Promise<GlobalState> {
    await this.getGlobalState();
    const [updated] = await db
      .update(globalState)
      .set({
        totalUsers: sql`${globalState.totalUsers} + 1`,
        currentDigitIndex: sql`${globalState.currentDigitIndex} + 1`
      })
      .where(sql`id = (SELECT id FROM global_state LIMIT 1)`)
      .returning();
    return updated;
  }

  async getUserPiState(userId: string): Promise<UserPiState | undefined> {
    const [state] = await db.select().from(userPiStates).where(eq(userPiStates.userId, userId));
    return state;
  }

  async createUserPiState(state: InsertUserPiState): Promise<UserPiState> {
    const [newState] = await db.insert(userPiStates).values(state).returning();
    return newState;
  }

  async getNextAvailableDigitIndex(): Promise<number> {
    const state = await this.getGlobalState();
    return state.currentDigitIndex;
  }

  async getAllUserPiStates() {
    return db
      .select({
        state: userPiStates,
        user: users,
      })
      .from(userPiStates)
      .leftJoin(users, eq(userPiStates.userId, users.id))
      .orderBy(userPiStates.digitIndex);
  }
}

export const storage = new DatabaseStorage();
