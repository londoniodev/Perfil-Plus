"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const TechStack = () => {
  const { t } = useLanguage();

  const content = {
    title: { es: 'Tecnologías que domino', en: 'Technologies I Master' }
  };

  const technologies = [
    {
      name: 'React',
      icon: 'https://cdn.simpleicons.org/react/61DAFB',
    },
    {
      name: 'JavaScript',
      icon: 'https://cdn.simpleicons.org/javascript/F7DF1E',
    },
    {
      name: 'n8n',
      icon: 'https://cdn.simpleicons.org/n8n/EA4B71',
    },
    {
      name: 'Power BI',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg',
    },
    {
      name: 'Power Apps',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Powerapps-logo.svg',
    },
    {
      name: 'Power Automate',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Microsoft_Power_Automate.svg',
    },
    {
      name: 'WordPress',
      icon: 'https://cdn.simpleicons.org/wordpress/21759B',
    },
    {
      name: 'MongoDB',
      icon: 'https://cdn.simpleicons.org/mongodb/47A248',
    },
    {
      name: 'Supabase',
      icon: 'https://cdn.simpleicons.org/supabase/3ECF8E',
    },
    {
      name: 'Cursor',
      icon: 'https://static.cdnlogo.com/logos/c/23/cursor.svg',
    },
  ];

  // Triple the array to ensure smooth seamless loop on wider screens
  const duplicatedTechs = [...technologies, ...technologies, ...technologies];

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-white text-center mb-10">
          {t(content.title.es, content.title)}
        </h3>

        <div className="relative w-full overflow-hidden">
          {/* Scrolling container */}
          <div className="flex animate-scroll w-max">
            {duplicatedTechs.map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                className="flex-shrink-0 mx-8 flex flex-col items-center justify-center group"
              >
                <div className="w-20 h-20 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-300">
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Ctext y="32" font-size="32"%3E⚙️%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <span className="text-gray-400 text-sm mt-3 font-medium group-hover:text-white transition-colors">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%); /* Move exactly 1/3 of the width (one set of items) */
          }
        }
        
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TechStack;
