import 'dotenv/config';
import { db, pool } from './server/db';
import { globalState, userPiStates } from './shared/schema';

async function fixGlobalState() {
    try {
        console.log('🔍 Checking current state...\n');

        // Get current counts
        const [global] = await db.select().from(globalState);
        const users = await db.select().from(userPiStates);

        console.log('Current Global State:');
        console.log(`  Total Users: ${global.totalUsers}`);
        console.log(`  Current Digit Index: ${global.currentDigitIndex}`);
        console.log(`\nActual User Count in Database: ${users.length}\n`);

        // Calculate correct values
        const correctTotalUsers = users.length;
        const correctCurrentDigitIndex = users.length + 1; // Next digit to assign

        // Update global state
        const [updated] = await db
            .update(globalState)
            .set({
                totalUsers: correctTotalUsers,
                currentDigitIndex: correctCurrentDigitIndex,
            })
            .returning();

        console.log('✅ Updated Global State:');
        console.log(`  Total Users: ${global.totalUsers} → ${updated.totalUsers}`);
        console.log(`  Current Digit Index: ${global.currentDigitIndex} → ${updated.currentDigitIndex}`);

        console.log('\n✨ Global state fixed!');
        console.log(`   Timeline should now show: System (3) + ${correctTotalUsers} users = ${correctTotalUsers + 1} digits total`);
        console.log('   Pi sequence: 3.1415...\n');

    } catch (error) {
        console.error('❌ Error fixing global state:', error);
    } finally {
        await pool.end();
    }
}

fixGlobalState();
