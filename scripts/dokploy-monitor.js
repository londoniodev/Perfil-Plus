/**
 * Dokploy Monitoring Bridge
 * 
 * Este script permite al asistente AI monitorear despliegues y leer logs
 * directamente desde la API tRPC de Dokploy.
 */

const API_BASE = "https://panel.xn--alvarolondoo-khb.dev/api";
const API_KEY = "bJXOesIZFyPMyDGAZcKaNeVSRWoOyXsWvGDnDowvRrwlZdoLbprKSmYWcCJKBHVV";

// Mapeo simple de nombres de apps comunes a sus IDs reales en Dokploy
const APP_MAP = {
    "backend-prod": "dXY2jkCM5oagLFa9H5OzT",
    "dashboard-prod": "ACH-hSb-ESyik45TryV7Y",
    "storefront-prod": "Nk6lmlSjNWOyu_l6bMMnX",
    "backend-staging": "vhtxGTJ3gJmWriWqPedSg"
};

async function callDokploy(endpoint, params = {}) {
    const url = new URL(`${API_BASE}/trpc/${endpoint}`);
    // Dokploy tRPC espera los parámetros en 'input' como JSON codificado
    // Algunos servidores tRPC envían el objeto directamente en GET
    url.searchParams.append("batch", "1");
    // Probamos sin el wrapper "0" que es común en batches complejos
    url.searchParams.append("input", JSON.stringify({ "0": { "json": params } }));

    const response = await fetch(url, {
        headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Error en API Dokploy (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return data[0]?.result?.data; 
}

/**
 * Obtiene el estado de los últimos despliegues de una aplicación
 */
async function getDeployStatus(appId) {
    console.log(`\n--- [STATUS] Consultando despliegues para App: ${appId} ---`);
    // 'deployment.all' es el procedimiento correcto según el código fuente
    const data = await callDokploy("deployment.all", { applicationId: appId });
    
    if (!data.data || data.data.length === 0) {
        console.log("No se encontraron despliegues.");
        return;
    }

    const latest = data.data[0];
    console.log(`Último Deploy: ${latest.title || "Sin título"}`);
    console.log(`Estado: ${latest.status.toUpperCase()}`);
    console.log(`Fecha: ${latest.createdAt}`);
    console.log(`ID: ${latest.deploymentId}`);
    
    if (latest.status === "error") {
        console.error(`\n[!] ERROR DETECTADO en el deploy.`);
        if (latest.log) {
            console.log("--- Extracto de logs de error ---");
            console.log(latest.log.slice(-1000)); // Mostrar los últimos 1000 caracteres
        } else {
            console.log("No hay logs disponibles en el objeto deployment.");
        }
    }
    
    return latest;
}

/**
 * Lee logs en tiempo real (Docker)
 */
async function getRuntimeLogs(target) {
    const appId = APP_MAP[target] || target;
    console.log(`\n--- [RUNTIME] Consultando logs de ejecución para: ${target} ---`);
    // Intentar con application.readLogs (común en apps de Dokploy)
    try {
        const data = await callDokploy("application.readLogs", { applicationId: appId });
        console.log("Runtime Logs:", data.data);
    } catch (e) {
        console.log("application.readLogs falló, intentando con monitoreo básico...");
        const data = await callDokploy("application.readAppMonitoring", { appName: target });
        console.log("Datos de monitoreo (CPU/RAM):", JSON.stringify(data.data, null, 2));
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0]; // status, logs, runtime
    const target = args[1] || "backend-prod";

    const appId = APP_MAP[target] || target;

    try {
        switch (command) {
            case "status":
                await getDeployStatus(appId);
                break;
            case "logs":
                const last = await getDeployStatus(appId);
                if (last) await getDeployLogs(last.deploymentId);
                break;
            case "runtime":
                await getRuntimeLogs(target);
                break;
            default:
                console.log("Uso: node dokploy-monitor.js [status|logs|runtime] [app-name|app-id]");
                console.log("Apps conocidas:", Object.keys(APP_MAP).join(", "));
        }
    } catch (err) {
        console.error("Fallo crítico en el monitor:", err.message);
    }
}

main();
