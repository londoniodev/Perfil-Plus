"use client";

import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './sections/Layout';
import Hero from './sections/Hero';
import TechStack from './sections/TechStack';
import Services from './sections/Services';
import About from './sections/About';
import Experience from './sections/Experience';
import Projects from './sections/Projects';
import Clients from './sections/Clients';
import Contact from './sections/Contact';

export default function Landing() {
    return (
        <LanguageProvider>
            <Layout>
                <section id="hero"><Hero /></section>
                <section id="tech-stack"><TechStack /></section>
                <section id="services"><Services /></section>
                <section id="about"><About /></section>
                <section id="experience"><Experience /></section>
                <section id="projects"><Projects /></section>
                <section id="clients"><Clients /></section>
                <section id="contact"><Contact /></section>
            </Layout>
        </LanguageProvider>
    );
}
