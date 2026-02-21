export function CursosCategorias() {
    const categories = [
        { id: 'higiene', icon: 'sanitizer', name: 'Higiene', colorClass: 'text-cs-secondary', bgHoverClass: 'group-hover:bg-cs-secondary' },
        { id: 'cocina', icon: 'restaurant_menu', name: 'Cocina', colorClass: 'text-cs-primary', bgHoverClass: 'group-hover:bg-cs-primary' },
        { id: 'admin', icon: 'manage_accounts', name: 'Admin', colorClass: 'text-cs-secondary', bgHoverClass: 'group-hover:bg-cs-secondary' },
        { id: 'barismo', icon: 'local_bar', name: 'Barismo', colorClass: 'text-cs-primary', bgHoverClass: 'group-hover:bg-cs-primary' },
        { id: 'ventas', icon: 'trending_up', name: 'Ventas', colorClass: 'text-cs-secondary', bgHoverClass: 'group-hover:bg-cs-secondary' },
    ];

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
                <h3 className="font-display font-bold text-lg text-gray-900 ">Categorías</h3>
                <a className="text-xs font-bold text-cs-primary hover:underline transition-all" href="#todas">
                    Ver todas
                </a>
            </div>
            {/* Scrollable container with hidden scrollbar */}
            <div className="flex overflow-x-auto gap-3 px-6 pb-4 no-scrollbar">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105">
                        <div className={`w-16 h-16 rounded-2xl bg-gray-100  flex items-center justify-center ${cat.colorClass} ${cat.bgHoverClass} group-hover:text-white transition-colors duration-300`}>
                            <span className="material-icons-outlined text-2xl leading-none">
                                {cat.icon}
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500  group-hover:text-gray-900 :text-gray-100 transition-colors">
                            {cat.name}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
