import 'dotenv/config';
import { piEngine } from './server/pi_engine';
import { storage } from './server/storage';
import { pool } from './server/db';

async function regenerateWallpaper() {
    try {
        console.log('🎨 Regenerating wallpaper...\n');

        // Check current state
        const globalState = await storage.getGlobalState();
        console.log(`Current State:`);
        console.log(`  Total Users: ${globalState.totalUsers}`);
        console.log(`  Current Digit Index: ${globalState.currentDigitIndex}`);
        console.log(`\n📊 This means the wallpaper will show ${globalState.currentDigitIndex} chords\n`);

        // Regenerate wallpaper
        console.log('🔄 Rendering wallpapers for all resolutions...');
        await piEngine.renderAllResolutions();

        console.log('\n✅ Wallpaper regeneration complete!');
        console.log(`   Chords displayed: ${globalState.currentDigitIndex}`);
        console.log('   All resolutions updated in client/public/wallpapers/\n');

    } catch (error) {
        console.error('❌ Error regenerating wallpaper:', error);
    } finally {
        await pool.end();
    }
}

regenerateWallpaper();
