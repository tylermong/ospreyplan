package app.ospreyplan.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableScheduling
public class DatabaseConfig
{
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Autowired
    private DataSource dataSource;

    /**
     * Log connection pool status every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void logConnectionPoolStatus()
    {
        if (dataSource instanceof HikariDataSource)
        {
            HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
            try
            {
                logger.info("Connection Pool Status - Active: {}, Idle: {}, Waiting: {}, Total: {}",
                        hikariDataSource.getHikariPoolMXBean().getActiveConnections(),
                        hikariDataSource.getHikariPoolMXBean().getIdleConnections(),
                        hikariDataSource.getHikariPoolMXBean().getThreadsAwaitingConnection(),
                        hikariDataSource.getHikariPoolMXBean().getTotalConnections());
            }
            catch (Exception e)
            {
                logger.error("Failed to get connection pool status", e);
            }
        }
    }

    /**
     * Log detailed pool metrics every 15 minutes
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void logDetailedPoolMetrics()
    {
        if (dataSource instanceof HikariDataSource)
        {
            HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
            try
            {
                var poolMXBean = hikariDataSource.getHikariPoolMXBean();
                
                logger.info("Detailed Connection Pool Metrics:");
                logger.info("  - Pool Name: {}", hikariDataSource.getPoolName());
                logger.info("  - Maximum Pool Size: {}", hikariDataSource.getMaximumPoolSize());
                logger.info("  - Minimum Idle: {}", hikariDataSource.getMinimumIdle());
                logger.info("  - Active Connections: {}", poolMXBean.getActiveConnections());
                logger.info("  - Idle Connections: {}", poolMXBean.getIdleConnections());
                logger.info("  - Total Connections: {}", poolMXBean.getTotalConnections());
                logger.info("  - Threads Awaiting Connection: {}", poolMXBean.getThreadsAwaitingConnection());
                
                // Log if we're approaching the connection limit
                int activeConnections = poolMXBean.getActiveConnections();
                int maxPoolSize = hikariDataSource.getMaximumPoolSize();
                double utilizationPercent = (double) activeConnections / maxPoolSize * 100;
                
                if (utilizationPercent > 80)
                {
                    logger.warn("High connection pool utilization: {:.1f}% ({}/{})", 
                               utilizationPercent, activeConnections, maxPoolSize);
                }
            }
            catch (Exception e)
            {
                logger.error("Failed to get detailed connection pool metrics", e);
            }
        }
    }

    @RestController
    public static class ConnectionPoolController
    {
        @Autowired
        private DataSource dataSource;

        /**
         * Simple endpoint to check connection pool status
         */
        @GetMapping("/api/health/connection-pool")
        public Map<String, Object> getConnectionPoolStatus()
        {
            Map<String, Object> status = new HashMap<>();
            
            if (dataSource instanceof HikariDataSource)
            {
                HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
                try
                {
                    var poolMXBean = hikariDataSource.getHikariPoolMXBean();
                    
                    status.put("status", "UP");
                    status.put("activeConnections", poolMXBean.getActiveConnections());
                    status.put("idleConnections", poolMXBean.getIdleConnections());
                    status.put("totalConnections", poolMXBean.getTotalConnections());
                    status.put("maxPoolSize", hikariDataSource.getMaximumPoolSize());
                    status.put("threadsAwaitingConnection", poolMXBean.getThreadsAwaitingConnection());
                    
                    double utilizationPercent = (double) poolMXBean.getActiveConnections() / hikariDataSource.getMaximumPoolSize() * 100;
                    status.put("utilizationPercent", String.format("%.1f%%", utilizationPercent));
                    
                    if (utilizationPercent > 90 || poolMXBean.getThreadsAwaitingConnection() > 0)
                    {
                        status.put("status", "WARN");
                        status.put("message", "High connection pool utilization or threads waiting");
                    }
                }
                catch (Exception e)
                {
                    status.put("status", "ERROR");
                    status.put("error", e.getMessage());
                }
            }
            else
            {
                status.put("status", "UNKNOWN");
                status.put("dataSourceType", dataSource.getClass().getSimpleName());
            }
            
            return status;
        }
    }
}