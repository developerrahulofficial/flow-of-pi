import 'dotenv/config';
import { db, pool } from './server/db';
import { globalState, userPiStates } from './shared/schema';
import { piEngine } from './server/pi_engine';
import { eq } from 'drizzle-orm';

async function simulateUsers(count: number) {
    try {
        console.log(`Simulating ${count} user signups...`);

        for (let i = 0; i < count; i++) {
            const userId = `test-user-${Date.now()}-${i}`;

            // 1. Get current state
            const state = await db.select().from(globalState).where(eq(globalState.id, 1));
            const currentChordIndex = state[0].currentDigitIndex + 1;

            // 2. Assign digit/chord
            const digitA = piEngine.getDigit(2 * (currentChordIndex - 1));

            await db.insert(userPiStates).values({
                userId,
                digitIndex: currentChordIndex,
                digitValue: digitA,
            });

            // 3. Update global state
            await db.update(globalState)
                .set({
                    totalUsers: state[0].totalUsers + 1,
                    currentDigitIndex: currentChordIndex
                })
                .where(eq(globalState.id, 1));

            console.log(`User ${i + 1} assigned chord ${currentChordIndex} (digits ${digitA} -> ${piEngine.getDigit(2 * (currentChordIndex - 1) + 1)})`);
        }

        console.log('Triggering re-render...');
        await piEngine.renderAllResolutions();

        console.log('Success.');
    } catch (error) {
        console.error('Error during simulation:', error);
    } finally {
        await pool.end();
    }
}

simulateUsers(5); // Simulate 5 users
