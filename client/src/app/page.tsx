import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Bot, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
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
              <span>Trải nghiệm mua sắm thông minh</span>
            </div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-foreground">
              Mua sắm dễ dàng,{' '}
              <span className="text-primary">thông minh hơn</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Không cần tìm kiếm mệt mỏi. Trợ lý AI của UltraShop sẽ giúp bạn tìm đúng sản phẩm, đúng giá, đúng lúc.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full flex items-center justify-center gap-2 group">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-hub" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span>Trợ lý AI</span>
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
                  <p className="text-sm font-semibold text-foreground truncate">Gợi ý bởi AI</p>
                  <p className="text-xs text-muted-foreground">Sản phẩm phù hợp nhất với bạn</p>
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
            Tại sao chọn UltraShop?
          </h2>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            Ba trụ cột đảm bảo trải nghiệm mua sắm hoàn hảo cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<Bot className="w-7 h-7 text-primary" />}
            iconBg="bg-primary/10"
            title="Tư vấn thông minh"
            description="Hỏi đáp về sản phẩm bằng ngôn ngữ tự nhiên. AI hiểu ngữ cảnh, đưa ra lời khuyên như một chuyên gia thực thụ."
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7 text-warning" />}
            iconBg="bg-warning/10"
            title="Phản hồi tức thì"
            description="Thuật toán phân tích hành vi siêu tốc, mang đến trải nghiệm mượt mà không độ trễ."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-7 h-7 text-accent" />}
            iconBg="bg-accent/10"
            title="An toàn tuyệt đối"
            description="Kiểm soát toàn vẹn luồng thanh toán, bảo vệ thông tin cá nhân của bạn."
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
