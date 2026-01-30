import 'dotenv/config';
import { db, pool } from './server/db';
import { globalState, userPiStates } from './shared/schema';
import { piEngine } from './server/pi_engine';
import { eq } from 'drizzle-orm';

async function simulateToFeynman() {
    const TARGET_DIGITS = 770;

    try {
        console.log(`Starting bulk simulation to reach Feynman Point (${TARGET_DIGITS} users)...`);

        // 1. Clear state
        console.log("Clearing state...");
        await db.delete(userPiStates);
        await db.update(globalState).set({ totalUsers: 0, currentDigitIndex: 0 }).where(eq(globalState.id, 1));

        // 2. Build rows
        const rows = [];
        for (let i = 0; i < TARGET_DIGITS; i++) {
            rows.push({
                userId: `feynman-user-${i}`,
                digitIndex: i + 1,
                digitValue: piEngine.getDigit(i),
            });
        }

        // 3. Bulk insert
        console.log(`Bulk inserting ${rows.length} users...`);
        await db.insert(userPiStates).values(rows);

        // 4. Update global state
        await db.update(globalState)
            .set({
                totalUsers: TARGET_DIGITS,
                currentDigitIndex: TARGET_DIGITS
            })
            .where(eq(globalState.id, 1));

        console.log('Simulation complete. Rendering...');
        await piEngine.renderAllResolutions();

        console.log('Success.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

simulateToFeynman();
