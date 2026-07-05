declare global {
  namespace Express {
    interface Request {
      requestId: string;
      userId?: string;
      sessionId?: string;
      traceId?: string;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}


export {};
