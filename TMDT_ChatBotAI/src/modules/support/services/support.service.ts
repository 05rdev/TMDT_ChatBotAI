import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class SupportService {
  async createTicket(userId: string, subject: string, message: string) {
    return prisma.supportTicket.create({
      data: {
        userId,
        subject,
        messages: {
          create: {
            senderId: userId,
            content: message
          }
        }
      },
      include: {
        messages: true
      }
    });
  }

  async getMyTickets(userId: string) {
    return prisma.supportTicket.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getTicketDetails(id: string, userId?: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { name: true, role: true } } }
        },
        user: { select: { name: true, email: true } }
      }
    });

    if (!ticket) throw new AppError(404, 'Không tìm thấy yêu cầu hỗ trợ');
    if (userId && ticket.userId !== userId) throw new AppError(403, 'Bạn không có quyền xem yêu cầu này');

    return ticket;
  }

  async replyTicket(ticketId: string, senderId: string, content: string) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new AppError(404, 'Không tìm thấy yêu cầu hỗ trợ');

    const [message] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: { ticketId, senderId, content },
        include: { sender: { select: { name: true, role: true } } }
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() }
      })
    ]);

    return message;
  }

  // Admin methods
  async getAllTickets(status?: string) {
    const where = status ? { status } : {};
    return prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.supportTicket.update({
      where: { id },
      data: { status }
    });
  }
}
