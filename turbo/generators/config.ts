import { PlopTypes } from "@turbo/gen";
import fs from "fs";
import path from "path";

// TAREA 1: Definición Centralizada
const AVAILABLE_FEATURES = [
    { name: 'Tienda (E-commerce)', value: 'store' },
    { name: 'Blog / Noticias', value: 'blog' },
    { name: 'LMS (Cursos)', value: 'lms' },
    { name: 'Portafolio', value: 'portfolio' },
    { name: 'Restaurante / POS', value: 'restaurant' }, // <--- Módulo de Restaurante
    { name: 'Bot WhatsApp (CRM)', value: 'bot-whatsapp' }, // Nueva feature piloto
];

export default function generator(plop: PlopTypes.NodePlopAPI): void {
    // Retry wrapper for Windows EBUSY locks
    const safeRm = async (targetPath: string, retries = 5, delayMs = 300) => {
        for (let i = 0; i < retries; i++) {
            try {
                if (fs.existsSync(targetPath)) {
                    await fs.promises.rm(targetPath, { recursive: true, force: true });
                }
                return;
            } catch (err: any) {
                if (err.code === 'EBUSY' || err.code === 'ENOTEMPTY' || err.code === 'EPERM') {
                    await new Promise(res => setTimeout(res, delayMs));
                } else {
                    throw err;
                }
            }
        }
        console.warn(`[Warining] No se pudo borrar ${targetPath} después de reintentos.`);
    };

    const safeCp = async (src: string, dest: string, retries = 5, delayMs = 300, options: any = {}) => {
        for (let i = 0; i < retries; i++) {
            try {
                await fs.promises.cp(src, dest, options);
                return;
            } catch (err: any) {
                if (err.code === 'EBUSY' || err.code === 'EPERM') {
                    await new Promise(res => setTimeout(res, delayMs));
                } else {
                    throw err;
                }
            }
        }
        throw new Error(`Fallback error copying ${src} to ${dest}`);
    };

    // Helper para arrays (Handlebars)
    plop.setHelper('includes', function (array: any, value: string) {
        if (Array.isArray(array)) {
            return array.includes(value);
        }
        return false;
    });

    // ==========================================
    // TAREA 2: Actualizar Generador `new-tenant`
    // ==========================================
    plop.setGenerator("new-tenant", {
        description: "Genera un nuevo tenant clonando apps/_template",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Nombre del Cliente (Slug) (se agregará -web si no está presente) (ej: danielabotina)",
                filter: (input) => {
                    const slug = input.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
                    return slug.endsWith("-web") ? slug : `${slug}-web`;
                },
                validate: (input) => {
                    const slug = input.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
                    const finalName = slug.endsWith("-web") ? slug : `${slug}-web`;

                    if (finalName.includes(" ")) return "El slug no debe tener espacios";
                    if (!/^[a-z0-9-]+$/.test(finalName)) return "Solo minúsculas, números y guiones";
                    if (fs.existsSync(path.join(process.cwd(), "apps", finalName))) return `El tenant ${finalName} ya existe`;
                    return true;
                }
            },
            {
                type: "input",
                name: "title",
                message: "Título del Sitio (ej: Daniela Botina Art)",
            },
            {
                type: "number",
                name: "port",
                message: "Puerto Local (ej: 3002)",
                default: 3002,
                validate: (input) => {
                    if (isNaN(input)) return "Debe ser un número";
                    return true;
                }
            },
            {
                type: "checkbox",
                name: "features",
                message: "Selecciona las features a activar:",
                choices: AVAILABLE_FEATURES
            }
        ],
        actions: [
            {
                type: "copy-template",
            },
            {
                type: "add",
                path: "apps/{{name}}/.env.local",
                // Asking for specific port or using default
                template: "NEXT_PUBLIC_API_URL=http://localhost:3000/api\nNEXT_PUBLIC_TENANT_SLUG={{name}}\nNEXT_PUBLIC_TENANT_ID={{name}}\nDATABASE_URL=postgresql://postgres:alvarojose1998@web-projects-database-postgres-gyiyxn:5432/db_{{name}}\nMANAGEMENT_DATABASE_URL=postgresql://postgres:alvarojose1998@web-projects-database-postgres-gyiyxn:5432/web-projects?schema=public",
            },
            {
                type: "cleanup-features",
            },
            {
                type: "modify",
                path: "apps/{{name}}/package.json",
                pattern: /"name": "template"/,
                template: '"name": "{{name}}"',
            },
            {
                type: "modify",
                path: "apps/{{name}}/src/lib/config.ts",
                pattern: /\|\| 'mauro';/,
                template: "|| '{{name}}';",
            },
            {
                type: "modify",
                path: "apps/{{name}}/package.json",
                pattern: /"dev": "next dev.*"/,
                template: '"dev": "next dev --webpack -p {{port}}"',
            },
            {
                type: "modify",
                path: "apps/{{name}}/Dockerfile",
                pattern: /mauromera-web/g,
                template: "{{name}}",
            },
            {
                type: "modify",
                path: "apps/{{name}}/Dockerfile",
                pattern: /ARG NEXT_PUBLIC_TENANT_ID=mauro/,
                template: "ARG NEXT_PUBLIC_TENANT_ID={{name}}",
            },
            {
                type: "modify",
                path: "apps/{{name}}/Dockerfile",
                pattern: /EXPOSE 3000/,
                template: "EXPOSE {{port}}\n\nENV PORT {{port}}",
            },
            {
                type: "add",
                path: "apps/{{name}}/src/config/site.ts",
                templateFile: "templates/site.ts.hbs",
                force: true
            },
            {
                type: "add",
                path: "apps/{{name}}/public/manifest.json",
                templateFile: "templates/manifest.json.hbs",
                force: true
            },
            {
                type: "install-dependencies",
            },
        ],
    });

    // ==========================================
    // TAREA 3: Crear Generador `add-feature`
    // ==========================================
    // Custom Action: install-dependencies
    plop.setActionType("install-dependencies", async (answers, config, plop) => {
        const { exec } = require("child_process");
        return new Promise((resolve, reject) => {
            console.log("📦 Installing dependencies to update lockfile...");
            exec("pnpm install --lockfile-only", (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.error(`Error updating lockfile: ${error.message}`);
                    return reject(error);
                }
                if (stderr) console.log(`Stderr: ${stderr}`);
                console.log(stdout);
                resolve("Dependencies installed & lockfile updated successfully!");
            });
        });
    });
    plop.setGenerator("add-feature", {
        description: "Agrega una feature a un tenant existente",
        prompts: [
            {
                type: "input",
                name: "tenant",
                message: "Slug del tenant destino (ej: mauromera-web)",
                validate: (input) => {
                    if (!fs.existsSync(path.join(process.cwd(), "apps", input))) return "Este tenant no existe";
                    return true;
                }
            },
            {
                type: "list", // O checkbox si queremos múltiples
                name: "feature",
                message: "Selecciona la feature a instalar:",
                choices: AVAILABLE_FEATURES
            }
        ],
        actions: [
            {
                type: "install-feature-files"
            }
        ]
    });

    // Custom Action: copy-template
    plop.setActionType("copy-template", async (answers, config, plop) => {
        const name = answers.name as string;
        const srcDir = path.join(process.cwd(), "apps/_template");
        const destDir = path.join(process.cwd(), "apps", name);

        try {
            await safeCp(srcDir, destDir, 5, 200, {
                recursive: true,
                filter: (src: string) => {
                    const basename = path.basename(src);
                    return basename !== "node_modules" && basename !== ".next" && basename !== ".turbo" && basename !== ".git" && basename !== "dist";
                }
            });
            return `Template clonado exitosamente en apps/${name}`;
        } catch (err) {
            throw err;
        }
    });

    // Custom Action: cleanup-features
    plop.setActionType("cleanup-features", async (answers, config, plop) => {
        const name = answers.name as string;
        const features = answers.features as string[];
        const appDir = path.join(process.cwd(), "apps", name, "src", "app");
        const libDir = path.join(process.cwd(), "apps", name, "src", "lib");
        const adminDir = path.join(appDir, "(dashboard)", "admin");
        const dashboardDir = path.join(appDir, "(dashboard)");

        const removals: string[] = [];

        // Helper to remove if feature not present
        const removeIfMissing = async (featureKey: string, pathsToRemove: string[]) => {
            if (!features.includes(featureKey)) {
                for (const p of pathsToRemove) {
                    const fullPath = path.join(p);
                    if (fs.existsSync(fullPath)) {
                        await safeRm(fullPath);
                        removals.push(p);
                    }
                }
            }
        };

        try {
            // LMS Cleanup
            await removeIfMissing("lms", [
                path.join(appDir, "cursos"),
                path.join(adminDir, "cursos")
            ]);

            // Store Cleanup
            await removeIfMissing("store", [
                path.join(appDir, "tienda"),
                path.join(adminDir, "productos"),
                path.join(appDir, "checkout")
            ]);

            // Blog Cleanup
            await removeIfMissing("blog", [
                path.join(appDir, "blog"),
                path.join(adminDir, "blog")
            ]);

            // Portfolio Cleanup
            await removeIfMissing("portfolio", [
                path.join(appDir, "portafolio"),
            ]);

            // WhatsApp Cleanup
            await removeIfMissing("bot-whatsapp", [
                path.join(dashboardDir, "whatsapp"),
                path.join(libDir, "whatsapp"),
            ]);

            // Restaurant Cleanup
            await removeIfMissing("restaurant", [
                path.join(adminDir, "restaurant"),
                path.join(dashboardDir, "kitchen"),
                path.join(dashboardDir, "waiter"),
                path.join(appDir, "(public)", "menu"),
                path.join(appDir, "(public)", "[slug]", "menu"),
                path.join(process.cwd(), "apps", name, "src", "components", "menu"),
                path.join(process.cwd(), "apps", name, "src", "components", "waiter"),
                path.join(process.cwd(), "apps", name, "src", "components", "kitchen"),
            ]);


            if (removals.length === 0) return "No se requirió limpieza de features.";
            return `Features limpiadas: ${removals.map(p => path.basename(p)).join(", ")}`;

        } catch (err) {
            throw err;
        }
    });

    // Custom Action: install-feature-files
    plop.setActionType("install-feature-files", async (answers, config, plop) => {
        const tenant = answers.tenant as string;
        const feature = answers.feature as string;

        const templateDir = path.join(process.cwd(), "apps/_template");
        const targetDir = path.join(process.cwd(), "apps", tenant);

        // Feature Mapping: Define where files come from for each feature
        // Esto podría ser más dinámico, pero por ahora mapeamos las rutas conocidas.
        // Si la estructura siempre es src/app/(dashboard)/[feature], podemos generalizar.

        let pathsToCopy: string[] = [];

        switch (feature) {
            case 'bot-whatsapp':
                pathsToCopy = [
                    "src/app/(dashboard)/whatsapp",
                    "src/lib/whatsapp"
                ];
                break;
            case 'restaurant':
                pathsToCopy = [
                    "src/app/(dashboard)/admin/restaurant",
                    "src/app/(dashboard)/kitchen",
                    "src/app/(dashboard)/waiter",
                    "src/app/(public)/menu",
                    "src/app/(public)/[slug]/menu",
                    "src/components/menu",
                    "src/components/waiter",
                    "src/components/kitchen"
                ];
                break;
            case 'store':
                pathsToCopy = [
                    "src/app/(marketing)/tienda",
                    "src/app/(dashboard)/admin/productos",
                    "src/app/checkout"
                ];
                break;
            case 'blog':
                pathsToCopy = [
                    "src/app/(marketing)/blog",
                    "src/app/(dashboard)/admin/blog"
                ];
                break;
            case 'lms':
                pathsToCopy = [
                    "src/app/(dashboard)/cursos",
                    "src/app/(dashboard)/admin/cursos"
                ];
                break;
            case 'portfolio':
                pathsToCopy = [
                    "src/app/(marketing)/portafolio",
                    "src/app/(dashboard)/admin/portafolio"
                ];
                break;
            // Add other cases as needed
            default:
                // Try Generic Logic: src/app/(dashboard)/[feature]
                // But since prompts use 'bot-whatsapp' and folder is 'whatsapp', mapping is better.
                return `No hay definición de rutas para la feature: ${feature}`;
        }

        let copiedCount = 0;

        try {
            for (const relativePath of pathsToCopy) {
                const sourcePath = path.join(templateDir, relativePath);
                const destPath = path.join(targetDir, relativePath);

                if (fs.existsSync(sourcePath)) {
                    await safeCp(sourcePath, destPath, 5, 200, { recursive: true });
                    copiedCount++;
                } else {
                    console.warn(`Feature source not found: ${sourcePath}`);
                }
            }

            if (copiedCount === 0) return "No se encontraron archivos para copiar.";
            return `Feature '${feature}' instalada exitosamente en ${tenant}`;

        } catch (err) {
            throw err;
        }
    });
}
