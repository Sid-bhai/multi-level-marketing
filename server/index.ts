import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const app = express();

// Basic middleware setup with better performance
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Optimized session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
    ttl: 86400000 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400000, // 24 hours
    sameSite: 'lax'
  }
});

app.use(sessionMiddleware);

// Minimal logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    log(`${req.method} ${req.path}`);
  }
  next();
});

// Main application setup with proper error handling
const startServer = async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer().catch(console.error);