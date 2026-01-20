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
                    { name: "E-books", value: "ebooks" },
                ]
            }
        ],
        actions: [
            {
                type: "copy-template",
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
        ],
    });

    // Custom Action: copy-template
    plop.setActionType("copy-template", async (answers, config, plop) => {
        const name = answers.name as string;
        const srcDir = path.join(process.cwd(), "apps/_template");
        const destDir = path.join(process.cwd(), "apps", name);

        try {
            // Copia recursiva filtrando carpetas pesadas
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
}
