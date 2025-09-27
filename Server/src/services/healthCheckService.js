import mongoose from 'mongoose';

export class HealthCheckService {
  static async checkDatabase(){
    try {
      const start = Date.now();
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      } else {
        throw new Error('Database connection not established');
      }
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  static async checkWhatsAppAPI(){
    try {
      const start = Date.now();
      const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
        }
      });
      
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        return {
          status: 'healthy',
          responseTime
        };
      } else {
        return {
          status: 'unhealthy',
          error: `WhatsApp API returned ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown WhatsApp API error'
      };
    }
  }

  static async checkEmailService(){
    try {
      const start = Date.now();
      // This would typically involve checking SMTP connection
      // For now, we'll just simulate a check
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown email service error'
      };
    }
  }

  static getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memUsage.heapUsed;
    
    return {
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: Math.round((usedMemory / totalMemory) * 100)
      },
      cpu: {
        usage: Math.round(process.cpuUsage().user / 1000000) // Convert to seconds
      }
    };
  }

  static async getHealthStatus(){
    const database = await this.checkDatabase();
    
    // Determine overall status based on database only for simplicity
    const overallStatus = 
      database.status === 'healthy' ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database
      }
    };
  }
}

// Health check endpoints
export const healthCheck = async (req, res) => {
  try {
    const healthStatus = await HealthCheckService.getHealthStatus();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown health check error'
    });
  }
};

// Simple liveness probe
export const livenessProbe = (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
};

// Readiness probe
export const readinessProbe = async (req, res) => {
  try {
    const database = await HealthCheckService.checkDatabase();
    
    if (database.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        issues: {
          database
        }
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown readiness check error'
    });
  }
};