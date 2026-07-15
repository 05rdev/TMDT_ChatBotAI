'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  Camera,
  CheckCircle2,
  Headphones,
  MessageSquareText,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const heroProducts = [
  {
    name: 'Laptop AI',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=520&q=80',
    tone: 'bg-primary/10',
  },
  {
    name: 'Tai nghe',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=520&q=80',
    tone: 'bg-accent/10',
  },
  {
    name: 'Camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=520&q=80',
    tone: 'bg-warning/10',
  },
];

const stats = [
  { value: '1.000+', label: 'sản phẩm công nghệ được tuyển chọn', icon: <Boxes className="h-5 w-5" /> },
  { value: '24/7', label: 'trợ lý AI luôn sẵn sàng hỗ trợ', icon: <Bot className="h-5 w-5" /> },
  { value: '2H', label: 'giao nhanh nội thành cho đơn đủ điều kiện', icon: <Truck className="h-5 w-5" /> },
  { value: '30 ngày', label: 'đổi trả rõ ràng, dễ theo dõi', icon: <PackageCheck className="h-5 w-5" /> },
];

const aiFlow = [
  {
    icon: <MessageSquareText className="h-5 w-5" />,
    title: 'Hỏi theo nhu cầu',
    text: 'Bạn mô tả ngân sách, mục đích dùng và sở thích. AI hiểu ngữ cảnh thay vì chỉ khớp từ khóa.',
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: 'Lọc đúng sản phẩm',
    text: 'Hệ thống so sánh thuộc tính, tồn kho, đánh giá và mức giá để rút ngắn thời gian chọn mua.',
  },
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    title: 'Chốt đơn tự tin',
    text: 'Thông tin sản phẩm, chính sách và trạng thái đơn hàng được gom lại để bạn ra quyết định nhanh hơn.',
  },
];

const values = [
  {
    icon: <WandSparkles className="h-6 w-6" />,
    title: 'Cá nhân hóa vừa đủ',
    text: 'Gợi ý dựa trên nhu cầu thực tế của từng khách hàng, không biến trải nghiệm mua sắm thành một ma trận khó thoát.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Minh bạch và an toàn',
    text: 'Từ đăng nhập, thanh toán đến lịch sử đơn hàng, các luồng quan trọng được thiết kế để dễ kiểm tra và ít rủi ro.',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'Hỗ trợ có người thật',
    text: 'AI giúp xử lý nhanh, còn đội ngũ hỗ trợ vẫn ở đó khi bạn cần một câu trả lời rõ ràng và có trách nhiệm.',
  },
];

const techStack = ['Next.js', 'Node.js', 'PostgreSQL', 'pgVector', 'Redis', 'Prisma', 'VNPay', 'Cloudinary'];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background animate-fade-in-up">
      <section className="page-shell py-8 md:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold uppercase text-primary">
              <Sparkles className="h-4 w-4" />
              Về UltraShop
            </div>

            <h1 className="font-heading text-4xl font-semibold leading-[1.05] text-foreground md:text-6xl">
              Mua sắm công nghệ dễ hiểu hơn nhờ AI.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              UltraShop kết hợp cửa hàng thiết bị công nghệ với trợ lý AI để giúp bạn tìm đúng sản phẩm,
              hiểu rõ lựa chọn và theo dõi đơn hàng trong một trải nghiệm gọn gàng.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  Khám phá cửa hàng
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/chatbot">
                <Button variant="outline" size="lg" className="w-full gap-2 bg-card sm:w-auto">
                  <Bot className="h-4 w-4" />
                  Hỏi trợ lý AI
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                'Tìm bằng văn bản',
                'Tìm bằng hình ảnh',
                'Gợi ý theo nhu cầu',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[8px] border border-border bg-card p-4 shadow-sm md:p-5">
            <div className="grid grid-cols-[1fr_0.78fr] gap-3">
              <div className="relative min-h-[300px] overflow-hidden rounded-[8px] bg-secondary">
                <Image
                  src={heroProducts[0].image}
                  alt={heroProducts[0].name}
                  fill
                  sizes="(min-width: 1024px) 360px, 58vw"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="grid gap-3">
                {heroProducts.slice(1).map((product) => (
                  <div key={product.name} className={`relative min-h-[142px] overflow-hidden rounded-[8px] ${product.tone}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 280px, 36vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 rounded-[8px] border border-white/30 bg-white/88 p-4 shadow-lg backdrop-blur-md dark:border-border dark:bg-card/90">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Tìm kiếm bằng hình ảnh</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Tải ảnh sản phẩm lên, UltraShop gợi ý các lựa chọn tương tự trong cửa hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/35">
        <div className="page-shell grid gap-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[8px] border border-border bg-card p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                {item.icon}
              </div>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-12 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div>
            <span className="text-xs font-bold uppercase text-primary">Sứ mệnh</span>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground md:text-5xl">
              Giảm bớt nhiễu, tăng thêm sự chắc chắn khi mua hàng.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p>
              Chúng tôi xây UltraShop cho những người muốn mua thiết bị công nghệ nhanh hơn nhưng vẫn cần
              thông tin đáng tin cậy. Thay vì mở quá nhiều tab, bạn có thể hỏi AI, so sánh sản phẩm và
              chuyển thẳng sang giỏ hàng khi đã sẵn sàng.
            </p>
            <p>
              Mục tiêu của trang không chỉ là bán sản phẩm. Chúng tôi muốn từng bước trong hành trình mua
              sắm, từ tìm kiếm, tư vấn, thanh toán đến hỗ trợ sau bán, đều rõ ràng và ít mệt hơn.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-card">
        <div className="page-shell py-12 md:py-18">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase text-primary">AI trong mua sắm</span>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Từ câu hỏi đến lựa chọn phù hợp
              </h2>
            </div>
            <Link href="/ai-hub" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">
              Xem AI Hub
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {aiFlow.map((item, index) => (
              <FeatureCard key={item.title} icon={item.icon} title={`${index + 1}. ${item.title}`} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-12 md:py-18">
        <div className="grid gap-4 md:grid-cols-3">
          {values.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/35">
        <div className="page-shell grid gap-8 py-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] bg-accent text-accent-foreground">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Nền tảng được xây cho tốc độ và khả năng mở rộng.
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Công nghệ phía sau UltraShop hỗ trợ tìm kiếm ngữ nghĩa, chatbot, quản lý đơn hàng và thanh toán
              trong cùng một hệ thống.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {techStack.map((tech) => (
              <div key={tech} className="rounded-[8px] border border-border bg-card px-4 py-4 text-center text-sm font-semibold text-foreground">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-12 md:py-18">
        <div className="overflow-hidden rounded-[8px] border border-primary/20 bg-primary p-7 text-primary-foreground md:p-10">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold leading-tight md:text-4xl">
                Sẵn sàng tìm món đồ công nghệ tiếp theo?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                Khám phá cửa hàng hoặc trò chuyện với trợ lý AI để nhận gợi ý phù hợp với nhu cầu của bạn.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/shop">
                <Button size="lg" className="w-full gap-2 bg-card text-foreground hover:bg-secondary sm:w-auto">
                  Mua sắm ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full border-white/40 text-white hover:bg-white/10 sm:w-auto">
                  Tạo tài khoản
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="card-elevated-hover p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[8px] bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
    </article>
  );
}
