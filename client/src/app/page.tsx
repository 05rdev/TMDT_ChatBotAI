import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Bot, Zap, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-8 animate-fade-in-up">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">Kỷ nguyên mua sắm AI mới đã bắt đầu</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Mua sắm thông minh <br />
          <span className="gradient-text">Với trợ lý AI thực thụ</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Tìm kiếm bằng hình ảnh, giọng nói và nhận gợi ý cá nhân hóa từ hệ thống trí tuệ nhân tạo tiên tiến nhất. 
          UltraShop mang cả kho hàng đến ngay tầm tay bạn.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
          <Link href="/shop">
            <Button size="lg" className="w-full sm:w-auto">Bắt đầu mua sắm</Button>
          </Link>
          <Link href="/ai-hub">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">Khám phá AI Assistant</Button>
          </Link>
        </div>

        {/* Hero Image / Mockup Placeholder */}
        <div className="pt-16 max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="glass-card rounded-[2rem] aspect-[16/9] flex items-center justify-center border-white/10 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
             <Bot className="w-32 h-32 text-emerald-500/30" />
             <div className="text-center z-10 p-8">
                <span className="text-slate-500 font-mono text-sm tracking-widest uppercase mb-4 block">Visual Interface Preview</span>
                <div className="flex space-x-4">
                   <div className="w-48 h-64 bg-slate-800/50 rounded-xl border border-white/5 animate-pulse" />
                   <div className="w-48 h-64 bg-slate-800/50 rounded-xl border border-white/5 animate-pulse delay-75" />
                   <div className="w-48 h-64 bg-slate-800/50 rounded-xl border border-white/5 animate-pulse delay-150" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Bot className="w-8 h-8 text-emerald-400" />}
          title="Tư vấn 24/7"
          description="Hỏi đáp về sản phẩm, tìm kiếm thông tin và nhận hỗ trợ ngay lập tức từ Chatbot AI."
        />
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-cyan-400" />}
          title="Gợi ý siêu tốc"
          description="Hệ thống học máy phân tích hành vi để đưa ra những sản phẩm khớp nhất với sở thích của bạn."
        />
         <FeatureCard 
          icon={<ShieldCheck className="w-8 h-8 text-blue-400" />}
          title="An toàn tuyệt đối"
          description="Thanh toán bảo mật, quản lý đơn hàng minh bạch và hỗ trợ đổi trả dễ dàng."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 rounded-2xl border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-2 group">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
