import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'findxvision-api'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 500, 1000]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const caseOperations = new client.Counter({
  name: 'case_operations_total',
  help: 'Total number of case operations',
  labelNames: ['operation', 'status']
});

const userAuthentications = new client.Counter({
  name: 'user_authentications_total',
  help: 'Total number of user authentication attempts',
  labelNames: ['method', 'status']
});

const notificationsSent = new client.Counter({
  name: 'notifications_sent_total',
  help: 'Total number of notifications sent',
  labelNames: ['type', 'status']
});

const databaseQueries = new client.Histogram({
  name: 'database_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['operation', 'collection']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(caseOperations);
register.registerMetric(userAuthentications);
register.registerMetric(notificationsSent);
register.registerMetric(databaseQueries);

// Middleware to collect metrics
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  // Override res.end to capture metrics when response is sent
  const originalEnd = res.end.bind(res);
  res.end = function(this, chunk?, encoding?): Response {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path || 'unknown';
    
    // Record metrics
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    // Decrement active connections
    activeConnections.dec();
    
    // Call original end method
    return originalEnd(chunk, encoding);
  };
  
  next();
};

// Metrics endpoint
export const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
};

// Custom metric helpers
export const recordCaseOperation = (operation, status: 'success' | 'failure') => {
  caseOperations.labels(operation, status).inc();
};

export const recordUserAuthentication = (method, status: 'success' | 'failure') => {
  userAuthentications.labels(method, status).inc();
};

export const recordNotificationSent = (type, status: 'success' | 'failure') => {
  notificationsSent.labels(type, status).inc();
};

export const recordDatabaseQuery = (operation, collection, duration) => {
  databaseQueries.labels(operation, collection).observe(duration);
};

export { register };
