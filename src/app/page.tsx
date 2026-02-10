'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, ExternalLink, CheckCircle, ArrowRight, Zap, Shield, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] overflow-hidden relative">

      {/* ===== GLOBAL BACKGROUND BLOBS ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[300px] -left-[200px] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#818CF8]/20 via-[#6366F1]/10 to-transparent blur-[120px] animate-float" />
        <div className="absolute -top-[100px] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#A78BFA]/15 via-[#7C3AED]/8 to-transparent blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] -left-[150px] w-[400px] h-[600px] rounded-full bg-gradient-to-tr from-[#6366F1]/12 via-[#818CF8]/6 to-transparent blur-[100px]" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[50%] -right-[100px] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#A78BFA]/10 via-[#818CF8]/5 to-transparent blur-[100px] animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[400px] rounded-full bg-gradient-to-t from-[#6366F1]/10 via-[#818CF8]/5 to-transparent blur-[120px]" />

        {/* Decorative circles */}
        <svg className="absolute top-[15%] right-[15%] w-[300px] h-[300px] opacity-[0.04] animate-spin" style={{ animationDuration: '60s' }}>
          <circle cx="150" cy="150" r="140" stroke="#818CF8" strokeWidth="1" fill="none" />
          <circle cx="150" cy="150" r="100" stroke="#818CF8" strokeWidth="0.5" fill="none" />
          <circle cx="150" cy="150" r="60" stroke="#818CF8" strokeWidth="0.5" fill="none" />
        </svg>

        <svg className="absolute bottom-[20%] left-[10%] w-[200px] h-[200px] opacity-[0.03] animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
          <circle cx="100" cy="100" r="90" stroke="#A78BFA" strokeWidth="1" fill="none" />
          <circle cx="100" cy="100" r="50" stroke="#A78BFA" strokeWidth="0.5" fill="none" />
        </svg>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #818CF8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#09090B]/60 backdrop-blur-xl border-b border-white/[0.06] z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Referer" width={28} height={28} className="invert brightness-200" />
              <span className="text-base font-semibold text-[#F4F4F5] tracking-tight">Referer</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Acceder</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">
                  Empezar
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-28 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#A5B4FC] text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] animate-pulse" />
            Extensión de Chrome disponible
          </div>

          <h1 className="animate-fade-up-delay-1 text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Fuentes que se ven
            <br />
            <span className="bg-gradient-to-r from-[#818CF8] via-[#A78BFA] to-[#818CF8] bg-clip-text text-transparent animate-gradient">
              mientras se ven
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 text-lg text-[#A1A1AA] max-w-lg mx-auto mb-10 leading-relaxed">
            Vincula referencias a momentos exactos de tus videos. Tu audiencia las verifica en tiempo real.
          </p>

          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <Button size="lg" className="shadow-lg shadow-[#818CF8]/10 hover:shadow-[#818CF8]/20 transition-shadow">
                Comenzar gratis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="secondary" size="lg">
                <PlayCircle className="w-4 h-4" />
                Cómo funciona
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="relative py-8 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-sm text-[#71717A]">
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#818CF8]" />
            Verificación en tiempo real
          </span>
          <span className="hidden sm:block w-px h-4 bg-[#27272A]" />
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#818CF8]" />
            Sin fricción para el espectador
          </span>
          <span className="hidden sm:block w-px h-4 bg-[#27272A]" />
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#818CF8]" />
            Para creadores rigurosos
          </span>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Tres pasos
            </h2>
            <p className="text-[#71717A]">
              Sin complicaciones. Sin fricciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Importa tu video',
                description: 'Pega la URL de YouTube. Nosotros hacemos el resto.',
                gradient: 'from-[#818CF8]/20 to-transparent',
              },
              {
                step: '02',
                title: 'Añade fuentes',
                description: 'Vincula papers, artículos o estudios a timestamps.',
                gradient: 'from-[#A78BFA]/20 to-transparent',
              },
              {
                step: '03',
                title: 'Comparte',
                description: 'Tu audiencia ve las fuentes mientras ve el video.',
                gradient: 'from-[#6366F1]/20 to-transparent',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#818CF8]/30 transition-all duration-300 backdrop-blur-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="text-4xl font-light text-[#818CF8]/30 mb-4 group-hover:text-[#818CF8]/60 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[#71717A] leading-relaxed group-hover:text-[#A1A1AA] transition-colors">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Experiencia del espectador
            </h2>
            <p className="text-[#71717A]">
              Diseñado para crear confianza sin interrumpir.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: PlayCircle, title: 'Sincronización automática', description: 'Las fuentes se iluminan cuando el video llega al momento exacto.' },
              { icon: ExternalLink, title: 'Un clic, una fuente', description: 'Salta al timestamp o abre el paper original directamente.' },
              { icon: BookOpen, title: 'Extensión de Chrome', description: 'Las fuentes aparecen directamente sobre YouTube.' },
              { icon: CheckCircle, title: 'SEO indexable', description: 'Google descubre tus fuentes. Credibilidad que se busca.' },
            ].map((item, index) => (
              <div key={index} className="group flex gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#818CF8]/20 transition-all duration-300 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-[#818CF8]/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-[#818CF8]/[0.15] transition-colors">
                  <item.icon className="w-5 h-5 text-[#818CF8]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-[#71717A] leading-relaxed group-hover:text-[#A1A1AA] transition-colors">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#818CF8]/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#818CF8] to-[#6366F1] mb-8 shadow-xl shadow-[#818CF8]/25 animate-float p-3">
            <Image src="/logo.png" alt="Referer" width={40} height={40} className="invert brightness-200" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Tu contenido merece fuentes
          </h2>
          <p className="text-[#71717A] mb-8 text-lg">
            Gratis. Sin tarjeta. Sin excusas.
          </p>
          <Link href="/login">
            <Button size="lg" className="shadow-lg shadow-[#818CF8]/10 hover:shadow-[#818CF8]/25 transition-shadow">
              Crear mi primera referencia
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Referer" width={20} height={20} className="invert brightness-200" />
              <span className="text-sm font-medium text-[#F4F4F5]">Referer</span>
            </div>
            <p className="text-sm text-[#52525B]">
              © {new Date().getFullYear()} Referer. Para creadores rigurosos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
