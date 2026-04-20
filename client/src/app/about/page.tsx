import { Bot, Zap, ShieldCheck, Brain, Sparkles, ArrowRight, Globe, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-32">
      {/* Hero */}
      <section className="relative pt-12 lg:pt-20 animate-slide-in-right">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-foreground text-background px-4 py-2 font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--primary)] w-max">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Về chúng tôi</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase text-foreground">
              Mua sắm<br />
              <span className="text-primary" style={{ WebkitTextStroke: '2px var(--foreground)' }}>Thông minh</span>
            </h1>

            <p className="text-xl font-medium max-w-xl border-l-4 border-primary pl-6 py-2 text-foreground/80">
              UltraShop kết hợp sức mạnh của Trí Tuệ Nhân Tạo với thương mại điện tử, 
              tạo nên trải nghiệm mua sắm chưa từng có — nhanh, chính xác và cá nhân hóa.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/shop">
                <Button size="lg" className="text-lg py-4 px-8 flex items-center group">
                  Khám phá ngay <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/chatbot">
                <Button variant="outline" size="lg" className="text-lg py-4 px-8">
                  <Bot className="w-5 h-5 mr-3" /> Chat với AI
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Block */}
          <div className="relative">
            <div className="solid-card aspect-square w-full max-w-lg mx-auto bg-accent relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(var(--foreground) 2px, transparent 0)', backgroundSize: '16px 16px' }} />
              <div className="text-center relative z-10 space-y-6">
                <Bot className="w-32 h-32 text-foreground mx-auto" />
                <div className="bg-foreground text-background px-6 py-3 font-black text-xl uppercase tracking-wider">
                  AI-Powered Platform
                </div>
              </div>
              {/* Floating stats */}
              <div className="absolute top-6 right-6 solid-card bg-background px-4 py-3 rotate-3 hover:rotate-0 transition-transform">
                <span className="font-black text-2xl text-primary">99.9%</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uptime</span>
              </div>
              <div className="absolute bottom-6 left-6 solid-card bg-background px-4 py-3 -rotate-3 hover:rotate-0 transition-transform">
                <span className="font-black text-2xl text-primary">&lt;0.1s</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phản hồi AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t-4 border-foreground pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
              Sứ mệnh<br />của chúng tôi
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-xl font-medium text-foreground/80 leading-relaxed">
              Chúng tôi tin rằng tương lai của thương mại điện tử nằm ở sự kết hợp giữa 
              con người và trí tuệ nhân tạo. UltraShop được xây dựng với mục tiêu mang đến 
              trải nghiệm mua sắm hoàn toàn mới — nơi AI không chỉ là công cụ, mà là người 
              bạn đồng hành thông minh.
            </p>
            <p className="text-lg font-medium text-foreground/60 leading-relaxed">
              Từ tư vấn sản phẩm bằng ngôn ngữ tự nhiên, tìm kiếm bằng hình ảnh, đến hệ thống 
              đề xuất cá nhân hóa — mọi tính năng đều được thiết kế để tiết kiệm thời gian 
              và nâng cao trải nghiệm của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="border-t-4 border-foreground pt-16">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-12">
          Giá trị cốt lõi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ValueCard
            icon={<Brain className="w-12 h-12 text-primary" />}
            title="AI-First"
            description="Mọi tính năng đều được hỗ trợ bởi AI — từ tìm kiếm ngữ nghĩa, chatbot tư vấn, đến gợi ý sản phẩm thông minh."
            className="bg-foreground text-background"
          />
          <ValueCard
            icon={<Zap className="w-12 h-12" />}
            title="Tốc độ cực nhanh"
            description="Kiến trúc hiện đại với Redis caching, CDN phân tán và thuật toán tối ưu đảm bảo phản hồi dưới 100ms."
            className="bg-accent"
          />
          <ValueCard
            icon={<ShieldCheck className="w-12 h-12" />}
            title="Bảo mật tuyệt đối"
            description="Mã hóa end-to-end, JWT authentication, và giám sát bảo mật 24/7 bảo vệ mọi giao dịch của bạn."
            className="bg-background"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="border-t-4 border-foreground pt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard number="1000+" label="Sản phẩm" icon={<Package className="w-6 h-6" />} />
          <StatCard number="500+" label="Khách hàng" icon={<Users className="w-6 h-6" />} />
          <StatCard number="99.9%" label="Uptime" icon={<Globe className="w-6 h-6" />} />
          <StatCard number="<0.1s" label="Tốc độ AI" icon={<Zap className="w-6 h-6" />} />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t-4 border-foreground pt-16">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-12">
          Công nghệ
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Next.js', desc: 'Frontend Framework' },
            { name: 'Node.js', desc: 'Backend Runtime' },
            { name: 'PostgreSQL', desc: 'Database' },
            { name: 'pgVector', desc: 'AI Search Engine' },
            { name: 'Redis', desc: 'Caching Layer' },
            { name: 'Ollama', desc: 'Local AI Model' },
            { name: 'Prisma', desc: 'ORM' },
            { name: 'VNPay', desc: 'Payment Gateway' },
          ].map((tech) => (
            <div key={tech.name} className="solid-card bg-background p-6 hover:-translate-y-2 transition-transform">
              <h4 className="font-black text-lg uppercase tracking-tight text-foreground">{tech.name}</h4>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="solid-card bg-foreground text-background p-12 md:p-16 text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
          Sẵn sàng trải nghiệm?
        </h2>
        <p className="text-xl font-medium opacity-80 max-w-2xl mx-auto">
          Tham gia cùng hàng nghìn khách hàng đang tận hưởng trải nghiệm mua sắm thông minh với UltraShop.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/shop">
            <Button size="lg" className="text-lg py-4 px-10 bg-primary text-primary-foreground border-2 border-background shadow-[4px_4px_0px_0px_var(--background)]">
              Mua sắm ngay
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="text-lg py-4 px-10 border-2 border-background text-background hover:bg-background hover:text-foreground">
              Tạo tài khoản
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, description, className = '' }: { icon: React.ReactNode; title: string; description: string; className?: string }) {
  return (
    <div className={`solid-card p-8 flex flex-col justify-between hover:-translate-y-2 hover:translate-x-2 transition-transform duration-300 ${className}`}>
      <div className="mb-8 p-4 border-2 border-current w-max shadow-[4px_4px_0px_0px_currentColor]">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-black uppercase mb-4 tracking-wide">{title}</h3>
        <p className="font-medium text-lg opacity-80 leading-snug">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="solid-card bg-accent p-8 text-center hover:-translate-y-2 transition-transform">
      <div className="flex items-center justify-center mb-4 text-primary">{icon}</div>
      <div className="text-4xl font-black text-foreground tracking-tighter">{number}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">{label}</div>
    </div>
  );
}
