import 'dotenv/config';
import { db, pool } from './server/db';
import { globalState, userPiStates } from './shared/schema';
import { like } from 'drizzle-orm';

async function cleanupTestUsers() {
    try {
        console.log('🔍 Checking current state...\n');

        // Get current state
        const [global] = await db.select().from(globalState);
        const allUsers = await db.select().from(userPiStates);

        console.log('Current Global State:');
        console.log(`  Total Users: ${global.totalUsers}`);
        console.log(`  Current Digit Index: ${global.currentDigitIndex}\n`);

        console.log(`Current User Pi States: ${allUsers.length} users`);
        allUsers.forEach(user => {
            const isTestUser = user.userId.startsWith('test-user-');
            console.log(`  ${isTestUser ? '🧪' : '👤'} Digit ${user.digitIndex} = ${user.digitValue} (${user.userId.substring(0, 30)}${user.userId.length > 30 ? '...' : ''})`);
        });

        // Find test users
        const testUsers = allUsers.filter(user => user.userId.startsWith('test-user-'));

        if (testUsers.length === 0) {
            console.log('\n✅ No test users found. Database is clean!');
            return;
        }

        console.log(`\n🗑️  Found ${testUsers.length} test users to remove...`);

        // Delete test users
        const result = await db
            .delete(userPiStates)
            .where(like(userPiStates.userId, 'test-user-%'))
            .returning();

        console.log(`✅ Deleted ${result.length} test users`);

        // Update global state
        const remainingUsers = await db.select().from(userPiStates);
        const newTotalUsers = remainingUsers.length;
        const newCurrentDigitIndex = newTotalUsers + 1; // Next digit to assign

        await db
            .update(globalState)
            .set({
                totalUsers: newTotalUsers,
                currentDigitIndex: newCurrentDigitIndex,
            });

        console.log(`\n✅ Updated Global State:`);
        console.log(`  Total Users: ${global.totalUsers} → ${newTotalUsers}`);
        console.log(`  Current Digit Index: ${global.currentDigitIndex} → ${newCurrentDigitIndex}`);

        // Show final state
        console.log(`\n📊 Final User Pi States: ${remainingUsers.length} users`);
        remainingUsers.forEach(user => {
            console.log(`  👤 Digit ${user.digitIndex} = ${user.digitValue}`);
        });

        console.log('\n✨ Cleanup complete! Your timeline should now show only the real users.');
        console.log('   Pi sequence: 3.1415...');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await pool.end();
    }
}

cleanupTestUsers();
