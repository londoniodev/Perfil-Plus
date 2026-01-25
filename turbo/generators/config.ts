import { PlopTypes } from "@turbo/gen";
import fs from "fs-extra";
import path from "path";

export default function generator(plop: PlopTypes.NodePlopAPI): void {

    // Helper para arrays (Handlebars)
    plop.setHelper('includes', function (array: any, value: string) {
        if (Array.isArray(array)) {
            return array.includes(value);
        }
        return false;
    });

    plop.setGenerator("new-tenant", {
        description: "Genera un nuevo tenant clonando apps/_template",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Nombre del Cliente (Slug) (ej: danielabotina-web)",
                validate: (input) => {
                    if (input.includes(" ")) return "El slug no debe tener espacios";
                    if (!/^[a-z0-9-]+$/.test(input)) return "Solo minúsculas, números y guiones";
                    if (fs.existsSync(path.join(process.cwd(), "apps", input))) return "Este tenant ya existe";
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
                choices: [
                    { name: "Blog", value: "blog" },
                    { name: "Tienda (Store)", value: "store" },
                    { name: "LMS (Cursos)", value: "lms" },
                    { name: "Portafolio", value: "portfolio" },
                ]
            }
        ],
        actions: [
            {
                type: "copy-template",
            },
            {
                type: "add",
                path: "apps/{{name}}/.env.local",
                template: "NEXT_PUBLIC_API_URL=http://localhost:3000/api\nNEXT_PUBLIC_TENANT_SLUG={{name}}",
            },
            {
                type: "cleanup-features",
            },
            {
                type: "modify",
                path: "apps/{{name}}/package.json",
                pattern: /"name": "_template"/,
                template: '"name": "{{name}}"',
            },
            {
                type: "modify",
                path: "apps/{{name}}/package.json",
                pattern: /"dev": "next dev"/,
                template: '"dev": "next dev -p {{port}}"',
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
        ],
    });

    // Custom Action: copy-template
    plop.setActionType("copy-template", async (answers, config, plop) => {
        const name = answers.name as string;
        const srcDir = path.join(process.cwd(), "apps/_template");
        const destDir = path.join(process.cwd(), "apps", name);

        try {
            await fs.copy(srcDir, destDir, {
                filter: (src) => {
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
        const adminDir = path.join(appDir, "(dashboard)", "admin");

        const removals: string[] = [];

        // Helper to remove if feature not present
        const removeIfMissing = async (featureKey: string, pathsToRemove: string[]) => {
            if (!features.includes(featureKey)) {
                for (const p of pathsToRemove) {
                    const fullPath = path.join(p);
                    if (fs.existsSync(fullPath)) {
                        await fs.remove(fullPath);
                        removals.push(p);
                    }
                }
            }
        };

        try {
            // LMS Cleanup
            await removeIfMissing("lms", [
                path.join(appDir, "cursos"), // src/app/cursos
                path.join(adminDir, "cursos") // src/app/(dashboard)/admin/cursos
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


            if (removals.length === 0) return "No se requirió limpieza de features.";
            return `Features limpiadas: ${removals.map(p => path.basename(p)).join(", ")}`;

        } catch (err) {
            throw err;
        }
    });
}
