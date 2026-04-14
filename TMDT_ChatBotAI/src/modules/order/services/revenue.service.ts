import { prisma } from '../../../lib/prisma';

export class RevenueService {
  /**
   * Thống kê doanh thu theo ngày trong một khoảng thời gian
   */
  async getDailyRevenue(startDate: string, endDate: string) {
    const stats = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        SUM(amount) as total
      FROM "Payment"
      WHERE status = 'SUCCESS'
        AND "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
      GROUP BY date
      ORDER BY date ASC
    `;

    return stats.map(item => ({
      date: item.date.toISOString().split('T')[0],
      total: Number(item.total)
    }));
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
        SUM(amount) as total
      FROM "Payment"
      WHERE status = 'SUCCESS'
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY month
      ORDER BY month ASC
    `;

    // Map kết quả để đảm bảo đủ 12 tháng (kể cả tháng không có doanh thu)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStr = `${year}-${String(i + 1).padStart(2, '0')}`;
      const found = stats.find(s => s.month.toISOString().startsWith(monthStr));
      return {
        month: monthStr,
        total: found ? Number(found.total) : 0
      };
    });

    return monthlyData;
  }
}
