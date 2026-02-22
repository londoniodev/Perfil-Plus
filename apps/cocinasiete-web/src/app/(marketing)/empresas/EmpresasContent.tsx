"use client";

import Image from "next/image";
import { Utensils, Sandwich, Coffee, Check, Map as MapIcon, MapPin, Factory, Truck, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";

export function EmpresasContent() {
    const handleCotizar = () => {
        window.open(`https://wa.me/${siteConfig.phone.replace(/[^0-9]/g, '')}?text=Hola, quiero cotizar alimentación para mi empresa.`, '_blank');
    };

    return (
        <div className="bg-zinc-50 text-zinc-900 font-sans min-h-screen pb-24">
            <section className="px-4 py-8 max-w-lg mx-auto md:max-w-2xl pt-28 md:pt-32">
                <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight tracking-tight">
                    Cotiza la alimentación para tu evento corporativo
                </h1>
                <p className="text-zinc-600 mb-4 text-base leading-relaxed">
                    Con nuestra línea de refrigerios, desayunos y almuerzos empresariales para reuniones con tu equipo, jornadas de capacitación y cierre de año.
                </p>
                <p className="text-zinc-600 text-base leading-relaxed">
                    También somos proveedores de alimentación institucional con facturación electrónica y línea de crédito.
                </p>
            </section>

            <main className="px-4 space-y-10 max-w-lg mx-auto md:max-w-2xl">
                {/* Almuerzos Section */}
                <section>
                    <div className="flex items-center space-x-2 mb-4">
                        <Utensils className="text-primary w-6 h-6" />
                        <h2 className="text-2xl font-bold text-primary">Almuerzos</h2>
                    </div>
                    <div className="space-y-4">
                        {/* Menú Daily */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 relative overflow-hidden transition-all hover:shadow-md">
                            <div className="absolute top-0 right-0 bg-zinc-100 px-3 py-1 rounded-bl-xl text-xs font-bold text-zinc-900">Estándar</div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-zinc-900">Menú Daily</h3>
                                <span className="text-primary font-bold text-lg">$16.500</span>
                            </div>
                            <p className="text-sm text-zinc-600 mb-3">La opción perfecta para el día a día.</p>
                            <ul className="text-sm text-zinc-600 space-y-2">
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Sopa del día</li>
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Proteína 120g</li>
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />2 acompañamientos y ensalada</li>
                            </ul>
                        </div>

                        {/* Menú Zero */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 relative overflow-hidden transition-all hover:shadow-md">
                            <div className="absolute top-0 right-0 bg-green-100 px-3 py-1 rounded-bl-xl text-xs font-bold text-green-700">Saludable</div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-zinc-900">Menú Zero</h3>
                                <span className="text-primary font-bold text-lg">$18.900</span>
                            </div>
                            <p className="text-sm text-zinc-600 mb-3">Bajo en carbohidratos, alto en sabor.</p>
                            <ul className="text-sm text-zinc-600 space-y-2">
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Proteína magra 150g</li>
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Base de vegetales frescos</li>
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Aderezo de la casa bajo en grasa</li>
                            </ul>
                        </div>

                        {/* Menú Premium */}
                        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-l-primary relative overflow-hidden transition-all hover:shadow-lg">
                            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-xl text-xs font-bold">Recomendado</div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-zinc-900">Menú Premium</h3>
                                <span className="text-primary font-bold text-lg">$24.500</span>
                            </div>
                            <p className="text-sm text-zinc-600 mb-3">Para ocasiones especiales y paladares exigentes.</p>
                            <ul className="text-sm text-zinc-600 space-y-2">
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Corte fino de Res/Salmón 200g</li>
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Acompañamientos gourmet</li>
                                <li className="flex items-center"><Check className="text-primary w-4 h-4 mr-2" />Postre y bebida natural</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Refrigerios Section */}
                <section>
                    <div className="flex items-center space-x-2 mb-4">
                        <Sandwich className="text-primary w-6 h-6" />
                        <h2 className="text-2xl font-bold text-primary">Refrigerios</h2>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
                        <h3 className="font-bold text-lg text-zinc-900 mb-4">Sandwich Box</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between items-center border-b border-zinc-200 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-semibold text-zinc-900">Pollo Pesto</p>
                                    <p className="text-sm text-zinc-600 mt-0.5">Pan ciabatta, pechuga grillé, tomate</p>
                                </div>
                                <span className="text-primary font-bold text-base">$12.000</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-semibold text-zinc-900">Roast Beef</p>
                                    <p className="text-sm text-zinc-600 mt-0.5">Pan artesanal, rúgula, mostaza miel</p>
                                </div>
                                <span className="text-primary font-bold text-base">$14.500</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-semibold text-zinc-900">Caprese Vegetariano</p>
                                    <p className="text-sm text-zinc-600 mt-0.5">Mozzarella fresca, tomate, albahaca</p>
                                </div>
                                <span className="text-primary font-bold text-base">$11.500</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Desayunos Section */}
                <section>
                    <div className="flex items-center space-x-2 mb-4">
                        <Coffee className="text-primary w-6 h-6" />
                        <h2 className="text-2xl font-bold text-primary">Desayunos</h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden transition-all hover:shadow-md">
                        <div className="h-40 bg-zinc-100 relative">
                            <Image
                                alt="Desayuno corporativo con fruta y café"
                                className="object-cover"
                                fill
                                src="/images/empresas/desayuno.webp"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white font-bold text-xl drop-shadow-md">Energía para tu equipo</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-zinc-900">Pack Continental</h3>
                                <span className="text-primary font-bold text-lg">$15.000</span>
                            </div>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                Incluye fruta picada de temporada, parfait de yogurt griego, croissant de mantequilla y jugo de naranja 100% natural.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Zona de Cobertura Section */}
                <section className="mt-8 mb-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <MapIcon className="text-zinc-600 w-5 h-5" />
                        <h3 className="text-lg font-bold text-zinc-900">Zona de Cobertura</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col items-center text-center">
                        <div className="flex justify-center flex-wrap gap-8 mb-4 w-full">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-900">Cali</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
                                    <Factory className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-900">Acopi</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-900">Yumbo</span>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-600 italic">Entregas programadas de 7:00 AM a 5:00 PM</p>
                    </div>
                </section>
            </main>

            {/* CTA Sticky Bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-50/90 backdrop-blur-md border-t border-zinc-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-lg mx-auto md:max-w-2xl">
                    <button
                        onClick={handleCotizar}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-primary/90 transition duration-300 flex items-center justify-center uppercase tracking-wide"
                    >
                        Cotizar Ahora
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
