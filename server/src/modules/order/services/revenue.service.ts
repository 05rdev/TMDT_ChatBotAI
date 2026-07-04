import { prisma } from '../../../lib/prisma';

export class RevenueService {
  /**
   * Thống kê doanh thu theo ngày trong một khoảng thời gian
   */
  async getDailyRevenue(startDate: string, endDate: string) {
    const stats = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        SUM("totalAmount") as total
      FROM "Order"
      WHERE status != 'CANCELLED'
        AND "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
      GROUP BY date
      ORDER BY date ASC
    `;

    // Map kết quả để đảm bảo đủ các ngày trong khoảng (kể cả ngày không có doanh thu)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: any[] = [];
    
    // Đảm bảo lấy đủ 7 ngày nếu không có tham số start/end
    const actualStart = new Date(start);
    const actualEnd = new Date(end);
    
    for (let d = new Date(actualStart); d <= actualEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const found = stats.find(s => {
        const sDate = new Date(s.date).toISOString().split('T')[0];
        return sDate === dateStr;
      });
      
      days.push({
        date: dateStr,
        total: found ? Number(found.total) : 0
      });
    }

    return days;
  }

  /**
   * Thống kê doanh thu theo tháng trong một năm
   */
  async getMonthlyRevenue(year: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    const stats = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalAmount") as total
      FROM "Order"
      WHERE status != 'CANCELLED'
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY month
      ORDER BY month ASC
    `;

    // Map kết quả để đảm bảo đủ 12 tháng (kể cả tháng không có doanh thu)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStr = `${year}-${String(i + 1).padStart(2, '0')}`;
      const found = stats.find(s => {
        const sDate = new Date(s.month).toISOString().substring(0, 7);
        return sDate === monthStr;
      });
      
      return {
        month: monthStr,
        total: found ? Number(found.total) : 0
      };
    });

    return monthlyData;
  }
}
