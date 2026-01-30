import 'dotenv/config';

async function verifyCacheBusting() {
    try {
        console.log('Fetching 1...');
        const res1 = await fetch('http://localhost:5000/api/pi/wallpaper');
        const json1 = await res1.json();
        console.log('URL 1:', json1.latest);

        await new Promise(r => setTimeout(r, 100));

        console.log('Fetching 2...');
        const res2 = await fetch('http://localhost:5000/api/pi/wallpaper');
        const json2 = await res2.json();
        console.log('URL 2:', json2.latest);

        if (json1.latest !== json2.latest) {
            console.log('SUCCESS: URLs are different (cache busting active).');
        } else {
            console.error('FAILURE: URLs are identical.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyCacheBusting();
