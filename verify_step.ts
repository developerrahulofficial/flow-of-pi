import 'dotenv/config';
import { db, pool } from './server/db';
import { globalState, userPiStates } from './shared/schema';
import { piEngine } from './server/pi_engine';
import { eq } from 'drizzle-orm';

async function verifyStep() {
    try {
        console.log('Verifying step: Adding 1 user...');

        // 1. Get current state
        const state = await db.select().from(globalState).where(eq(globalState.id, 1));
        const currentChordIndex = state[0].currentDigitIndex + 1;
        const totalUsers = state[0].totalUsers + 1;

        console.log(`Current Index: ${state[0].currentDigitIndex}, Next Index: ${currentChordIndex}`);

        // 2. Assign digit/chord
        // Logic from simulate_users.ts
        const digitA = piEngine.getDigit(2 * (currentChordIndex - 1));

        const userId = `verify-user-${Date.now()}`;

        await db.insert(userPiStates).values({
            userId,
            digitIndex: currentChordIndex,
            digitValue: digitA,
        });

        // 3. Update global state
        await db.update(globalState)
            .set({
                totalUsers: totalUsers,
                currentDigitIndex: currentChordIndex
            })
            .where(eq(globalState.id, 1));

        console.log(`User added. Total Users: ${totalUsers}. New Chord Index: ${currentChordIndex}.`);

        console.log('Triggering re-render...');
        await piEngine.renderAllResolutions();

        console.log('Step complete.');
    } catch (error) {
        console.error('Error during verification step:', error);
    } finally {
        await pool.end();
    }
}

verifyStep();
