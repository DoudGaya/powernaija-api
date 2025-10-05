import { prisma } from '../lib/prisma';
import { getChatResponse, translateText } from '../lib/openai';
import { logger } from '../utils/logger';
import { ErrorTypes } from '../middleware/errorHandler';

/**
 * Chatbot Service - Handles AI chat sessions and messages
 */

/**
 * Create or get active chat session
 */
export async function getOrCreateChatSession(
  userId: string,
  language: string = 'en'
): Promise<any> {
  try {
    // Try to find active session
    let session = await prisma.chatSession.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50, // Last 50 messages
        },
      },
    });

    // Create new session if none exists
    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          language,
          isActive: true,
        },
        include: {
          messages: true,
        },
      });

      logger.info(`New chat session created: ${session.id} for user ${userId}`);
    }

    return session;
  } catch (error) {
    logger.error('Error getting/creating chat session:', error);
    throw error;
  }
}

/**
 * Send chat message and get AI response
 */
export async function sendChatMessage(
  userId: string,
  message: string,
  sessionId?: string,
  language: string = 'en'
): Promise<any> {
  try {
    // Get or create session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Last 20 messages for context
          },
        },
      });

      if (!session || session.userId !== userId) {
        throw ErrorTypes.NotFound('Chat session not found');
      }
    } else {
      session = await getOrCreateChatSession(userId, language);
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    });

    // Prepare conversation history for AI
    const conversationHistory = session.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get AI response
    const aiResponse = await getChatResponse(message, conversationHistory, language);

    // Save AI response
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse,
      },
    });

    logger.info(`Chat message exchanged in session ${session.id}`);

    return {
      sessionId: session.id,
      userMessage: userMessage.content,
      aiResponse: assistantMessage.content,
      language,
    };
  } catch (error) {
    logger.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Translate a message
 */
export async function translateMessage(
  text: string,
  targetLanguage: string
): Promise<{ translatedText: string; originalText: string; targetLanguage: string }> {
  try {
    const translatedText = await translateText(text, targetLanguage);

    logger.info(`Message translated to ${targetLanguage}`);

    return {
      translatedText,
      originalText: text,
      targetLanguage,
    };
  } catch (error) {
    logger.error('Error translating message:', error);
    throw error;
  }
}

/**
 * End chat session
 */
export async function endChatSession(userId: string, sessionId: string): Promise<void> {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw ErrorTypes.NotFound('Chat session not found');
    }

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    logger.info(`Chat session ended: ${sessionId}`);
  } catch (error) {
    logger.error('Error ending chat session:', error);
    throw error;
  }
}

/**
 * Get user's chat sessions
 */
export async function getUserChatSessions(userId: string, page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          messages: {
            take: 1, // Just the last message
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.chatSession.count({ where: { userId } }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting user chat sessions:', error);
    throw error;
  }
}

/**
 * Get chat session details with messages
 */
export async function getChatSessionDetails(userId: string, sessionId: string) {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw ErrorTypes.NotFound('Chat session not found');
    }

    return session;
  } catch (error) {
    logger.error('Error getting chat session details:', error);
    throw error;
  }
}

/**
 * Get all chat sessions (admin only)
 */
export async function getAllChatSessions(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.chatSession.count(),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all chat sessions:', error);
    throw error;
  }
}
