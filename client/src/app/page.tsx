import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Bot, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-32">
      {/* 
        HERO SECTION: Asymmetric Tension & Massive Typography 
        Breaking the "Safe Split" with overlapping elements
      */}
      <section className="relative pt-12 lg:pt-24 min-h-[80vh] flex flex-col justify-center animate-slide-in-right">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Typographic Block (Col 1-8) */}
          <div className="lg:col-span-8 flex flex-col justify-center z-20">
            <div className="inline-flex items-center space-x-2 bg-foreground text-background px-4 py-2 border-2 border-transparent w-max mb-8 font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--primary)]">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Giao Thức Mua Sắm Thế Hệ 3.0</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase text-foreground">
              Lệnh <br/>
              <span className="text-primary" style={{ WebkitTextStroke: '2px var(--foreground)' }}>Mua Hàng</span>
            </h1>
            
            <p className="mt-8 text-xl md:text-3xl font-medium max-w-2xl border-l-4 border-primary pl-6 py-2 text-foreground/80">
              Không cần tìm kiếm. Chỉ cần ra lệnh. Trợ lý AI của UltraShop sẽ mang cả thế giới đến màn hình của bạn.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-12">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-xl py-4 px-8 flex items-center justify-between group">
                  <span>Khởi Động</span>
                  <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-hub" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-xl py-4 px-8">
                  <Bot className="w-6 h-6 mr-3" />
                  <span>Kết Nối AI</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Fragmented Visual Block (Col 9-12) overlapping */}
          <div className="lg:col-span-4 relative mt-12 lg:mt-0 z-10 lg:-ml-16">
            <div className="solid-card aspect-[3/4] w-full bg-accent relative flex items-center justify-center overflow-hidden group">
              {/* Halftone pattern overlay */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(var(--foreground) 2px, transparent 0)', backgroundSize: '16px 16px' }} />
              
              <div className="absolute top-4 left-4 bg-background border-2 border-foreground px-3 py-1 font-bold text-sm uppercase z-10">
                [AI_VISION_ACTIVE]
              </div>
              
              <Bot className="w-48 h-48 text-foreground group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]" />
              
              {/* Overlapping Product Card Fragment */}
              <div className="absolute -bottom-6 -left-12 w-64 h-32 solid-card bg-background p-4 flex flex-col justify-between transform -rotate-3 group-hover:rotate-0 transition-transform">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 bg-primary rounded-none" />
                  <span className="font-bold text-lg">999.000₫</span>
                </div>
                <div className="h-4 w-3/4 bg-muted mt-4" />
                <div className="h-4 w-1/2 bg-muted mt-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        FEATURES: Asymmetric Grid 
        Not the standard 3-column equal grid
      */}
      <section className="py-12 border-t-4 border-foreground">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter w-full md:w-1/2">
            Kiến trúc <br/> Hệ thống
          </h2>
          <p className="w-full md:w-1/3 text-xl font-medium mt-6 md:mt-0 text-foreground/70">
            Ba trụ cột đảm bảo trải nghiệm mua sắm không độ trễ, an toàn tuyệt đối và thông minh vượt trội.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <FeatureCard 
              icon={<Bot className="w-12 h-12 text-primary" />}
              title="Tư vấn Cognitive"
              description="Hỏi đáp về sản phẩm bằng ngôn ngữ tự nhiên. AI hiểu ngữ cảnh, đưa ra lời khuyên như một chuyên gia thực thụ."
              className="h-full bg-foreground text-background"
            />
          </div>
          <div className="md:col-span-1">
            <FeatureCard 
              icon={<Zap className="w-12 h-12 text-foreground" />}
              title="Phản hồi 0.1s"
              description="Thuật toán phân tích hành vi siêu tốc."
              className="h-full bg-accent"
            />
          </div>
          <div className="md:col-span-1">
             <FeatureCard 
              icon={<ShieldCheck className="w-12 h-12 text-foreground" />}
              title="Giao thức Bảo mật"
              description="Kiểm soát toàn vẹn luồng thanh toán."
              className="h-full bg-background"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, className = '' }: { icon: React.ReactNode, title: string, description: string, className?: string }) {
  return (
    <div className={`solid-card p-8 flex flex-col justify-between hover:-translate-y-2 hover:translate-x-2 transition-transform duration-300 ${className}`}>
      <div className="mb-8 p-4 border-2 border-current w-max shadow-[4px_4px_0px_0px_currentColor]">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-black uppercase mb-4 tracking-wide">{title}</h3>
        <p className="font-medium text-lg opacity-80 leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
}
