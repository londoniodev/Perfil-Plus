import { Fill } from "@alvarosky/ui";
import { CoachingInquiryForm } from "@/components/forms/CoachingInquiryForm";
import { CheckCircle2 } from "lucide-react";

const programs = [
    {
        title: "Essential Transformation",
        price: "$99/mes",
        features: ["Plan de entrenamiento base", "Guía nutricional", "Soporte mensual", "Acceso comunidad"],
        highlight: false
    },
    {
        title: "Elite Performance",
        price: "$199/mes",
        features: ["Entrenamiento personalizado 100%", "Macro tracking diario", "Check-ins semanales", "Soporte WhatsApp 24/7"],
        highlight: true
    }
];

export default function ServiciosPage() {
    return (
        <Fill className="bg-zinc-950 min-h-screen">
            <div className="py-20 text-center">
                <h1 className="text-5xl font-bold text-white mb-4">Programas de Coaching</h1>
                <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                    Diseñados para aquellos que están listos para elevar sus estándares y transformar su cuerpo y mente.
                </p>
            </div>

            <div className="container px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
                    {programs.map((program) => (
                        <div
                            key={program.title}
                            className={`p-8 rounded-3xl border ${program.highlight ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900'} flex flex-col`}
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">{program.title}</h3>
                            <p className="text-emerald-500 font-bold text-3xl mb-6">{program.price}</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                {program.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-zinc-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="h-px bg-zinc-800 my-6" />
                            <p className="text-xs text-zinc-500 text-center italic">Aplica abajo para verificar disponibilidad</p>
                        </div>
                    ))}
                </div>

                <div id="apply">
                    <CoachingInquiryForm />
                </div>
            </div>
        </Fill>
    );
}
