'use client';

import Link from 'next/link';
import { BookOpen, PlayCircle, Clock, ExternalLink, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-[#27272A] z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#818CF8] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#0A0A0B]" />
              </div>
              <span className="text-lg font-semibold text-[#F4F4F5] tracking-tight">Referer</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Acceder</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">
                  Empezar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1E] border border-[#27272A] text-[#A1A1AA] text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
            Verifica. Comparte. Destaca.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4F4F5] leading-[1.1] tracking-tight mb-6">
            La capa de verdad
            <br />
            <span className="text-[#71717A]">para el video online</span>
          </h1>

          <p className="text-lg text-[#A1A1AA] max-w-xl mx-auto mb-10 leading-relaxed">
            Vincula fuentes bibliográficas a timestamps específicos de tus videos.
            Dale credibilidad verificable a tu contenido.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <Button size="lg">
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

      {/* Problem */}
      <section className="py-24 border-t border-[#27272A]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#F4F4F5] tracking-tight mb-4">
              El problema de la verificación
            </h2>
            <p className="text-[#A1A1AA] max-w-lg mx-auto">
              En la era de la desinformación, verificar datos es difícil. Lo hacemos fácil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Fricción',
                description: 'Verificar un dato implica pausar, buscar, perder el hilo.',
              },
              {
                icon: ExternalLink,
                title: 'Desconexión',
                description: 'Las listas de enlaces no tienen contexto temporal.',
              },
              {
                icon: BookOpen,
                title: 'Sin distinción',
                description: 'No hay forma de distinguir contenido bien investigado.',
              },
            ].map((item, index) => (
              <Card key={index} variant="ghost" padding="lg">
                <item.icon className="w-5 h-5 text-[#818CF8] mb-4" />
                <h3 className="text-base font-medium text-[#F4F4F5] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 border-t border-[#27272A]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#F4F4F5] tracking-tight mb-4">
              Cómo funciona
            </h2>
            <p className="text-[#A1A1AA]">
              Tres pasos. Sin complicaciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Importa',
                description: 'Pega la URL de tu video de YouTube.',
              },
              {
                step: '02',
                title: 'Vincula',
                description: 'Añade fuentes a timestamps específicos.',
              },
              {
                step: '03',
                title: 'Comparte',
                description: 'Obtén un enlace verificable para tu audiencia.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-light text-[#27272A] mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-medium text-[#F4F4F5] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#A1A1AA]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#141416] border-t border-[#27272A]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#F4F4F5] tracking-tight mb-4">
              Experiencia del espectador
            </h2>
            <p className="text-[#A1A1AA]">
              Diseñado para transmitir confianza.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: PlayCircle,
                title: 'Timeline sincronizado',
                description: 'Las fuentes se iluminan cuando el video llega al momento exacto.',
              },
              {
                icon: ExternalLink,
                title: 'Deep linking',
                description: 'Un clic en la fuente salta directamente al timestamp.',
              },
              {
                icon: BookOpen,
                title: 'Acceso directo',
                description: 'Ver el paper original sin fricción.',
              },
              {
                icon: CheckCircle,
                title: 'SEO optimizado',
                description: 'Google indexa tus fuentes. Credibilidad descubrible.',
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 p-5 rounded-2xl bg-[#1A1A1E] border border-[#27272A]">
                <item.icon className="w-5 h-5 text-[#818CF8] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-[#F4F4F5] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[#27272A]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#F4F4F5] tracking-tight mb-4">
            Añade credibilidad a tu contenido
          </h2>
          <p className="text-[#A1A1AA] mb-8">
            Empieza gratis. Sin tarjeta de crédito.
          </p>
          <Link href="/login">
            <Button size="lg">
              Crear mi primera referencia
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#27272A]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#818CF8] flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-[#0A0A0B]" />
              </div>
              <span className="text-sm font-medium text-[#F4F4F5]">Referer</span>
            </div>
            <p className="text-sm text-[#71717A]">
              © {new Date().getFullYear()} Referer. Para creadores rigurosos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
