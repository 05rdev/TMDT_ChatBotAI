'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Bot, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="space-y-20 md:space-y-28">
      {/* 
        HERO SECTION: Clean & Warm 
        Serif heading + clear CTA + visual balance
      */}
      <section className="relative pt-8 lg:pt-16 min-h-[75vh] flex flex-col justify-center animate-slide-in-right">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">

          {/* Typographic Block */}
          <div className="lg:col-span-7 flex flex-col justify-center z-20">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-max mb-6 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>{t('home.badge')}</span>
            </div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-foreground">
              {t('home.heroTitle')}{' '}
              <span className="text-primary">{t('home.heroHighlight')}</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {t('home.heroDesc')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full flex items-center justify-center gap-2 group">
                  <span>{t('home.exploreNow')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-hub" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span>{t('home.aiAssistant')}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Block */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0 z-10">
            <div className="card-elevated aspect-[4/5] w-full bg-secondary relative flex items-center justify-center overflow-hidden group rounded-[var(--radius-xl)]">
              <img
                src="https://i.pinimg.com/736x/bd/c2/55/bdc25522e1aa37641d046928b87982dd.jpg"
                alt="AI Assistant"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Floating product hint card */}
              <div className="absolute bottom-6 left-6 right-6 card-elevated bg-card p-4 flex items-center gap-3 animate-fade-in-up">
                <div className="w-12 h-12 bg-primary/10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t('home.aiSuggested')}</p>
                  <p className="text-xs text-muted-foreground">{t('home.aiSuggestedDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        FEATURES: Clean Grid
        Warm cards with soft shadows
      */}
      <section className="py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <h2 className="font-heading text-3xl md:text-4xl tracking-tight text-foreground">
            {t('home.whyChoose')}
          </h2>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            {t('home.whyChooseDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<Bot className="w-7 h-7 text-primary" />}
            iconBg="bg-primary/10"
            title={t('home.smartConsulting')}
            description={t('home.smartConsultingDesc')}
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7 text-warning" />}
            iconBg="bg-warning/10"
            title={t('home.instantResponse')}
            description={t('home.instantResponseDesc')}
          />
          <FeatureCard
            icon={<ShieldCheck className="w-7 h-7 text-accent" />}
            iconBg="bg-accent/10"
            title={t('home.absoluteSecurity')}
            description={t('home.absoluteSecurityDesc')}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, description }: { icon: React.ReactNode, iconBg: string, title: string, description: string }) {
  return (
    <div className="card-elevated-hover p-6 flex flex-col gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-[var(--radius-md)] flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
