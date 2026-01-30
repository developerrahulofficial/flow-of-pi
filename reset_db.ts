import 'dotenv/config';
import { db, pool } from './server/db';
import { globalState, userPiStates, users } from './shared/schema';
import { piEngine } from './server/pi_engine';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function reset() {
    try {
        console.log('Resetting database...');
        // Clear user data and states
        await db.delete(userPiStates);
        await db.delete(users);

        // Reset global state to 1 (starting with the first digit '3')
        await db.update(globalState)
            .set({
                totalUsers: 0,
                currentDigitIndex: 1
            })
            .where(eq(globalState.id, 1));

        console.log('Clearing old wallpapers...');
        const wallpaperDir = path.join(process.cwd(), "client", "public", "wallpapers");
        if (fs.existsSync(wallpaperDir)) {
            const files = fs.readdirSync(wallpaperDir);
            for (const file of files) {
                fs.unlinkSync(path.join(wallpaperDir, file));
            }
        }

        console.log('Triggering re-render...');
        await piEngine.renderAllResolutions();

        console.log('Reset complete.');
    } catch (error) {
        console.error('Error during reset:', error);
    } finally {
        await pool.end();
    }
}

reset();
