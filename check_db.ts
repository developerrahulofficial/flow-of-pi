import 'dotenv/config';
import { db, pool } from './server/db';
import { globalState, userPiStates } from './shared/schema';

async function checkState() {
    try {
        const global = await db.select().from(globalState);
        const users = await db.select().from(userPiStates);

        console.log('Global State:', JSON.stringify(global, null, 2));
        console.log('User Pi States:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error checking state:', error);
    } finally {
        await pool.end();
    }
}

checkState();
