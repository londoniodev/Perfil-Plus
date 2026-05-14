
const REVALIDATION_SECRET = "+UcWZxj1HH/yMXNldrFOXSLt171Kv0mOHPbWVAh4Qw0=";
const APP_URL = "https://perfil.plus";
const TENANT_SLUG = "gescoabogados";

async function revalidate() {
    const tags = [
        `landings-${TENANT_SLUG}`,
        `tenant-marketing`,
        `tenant-design`
    ];

    for (const tag of tags) {
        console.log(`Revalidating tag: ${tag}...`);
        try {
            const res = await fetch(`${APP_URL}/api/revalidate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-revalidate-secret": REVALIDATION_SECRET,
                },
                body: JSON.stringify({ tag }),
            });
            console.log(`Result for ${tag}: ${res.status} ${res.statusText}`);
        } catch (e) {
            console.error(`Error revalidating ${tag}:`, e);
        }
    }
}

revalidate();
