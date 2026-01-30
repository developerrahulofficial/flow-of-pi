import 'dotenv/config';
import { db, pool } from './server/db';
import { users } from './shared/schema';

async function checkUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log(JSON.stringify(allUsers, null, 2));
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await pool.end();
    }
}

checkUsers();
