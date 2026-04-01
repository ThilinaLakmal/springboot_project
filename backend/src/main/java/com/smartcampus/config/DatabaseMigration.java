package com.smartcampus.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

@Configuration
public class DatabaseMigration {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void migrate() {
        try {
            // Fix strict ENUM constraints on MySQL to allow new statuses (like MAINTENANCE)
            jdbcTemplate.execute("ALTER TABLE resources MODIFY COLUMN status VARCHAR(50) NOT NULL");
            System.out.println("✅ SUCCESSFULLY MIGRATED 'resources.status' column to VARCHAR(50)!");
        } catch (Exception e) {
            System.out.println("⚠️ Migration skipped or failed for resources: " + e.getMessage());
        }

        try {
            // Fix strict ENUM constraints on MySQL to allow new statuses for bookings (like CHECKED_IN)
            jdbcTemplate.execute("ALTER TABLE bookings MODIFY COLUMN status VARCHAR(50) NOT NULL");
            System.out.println("✅ SUCCESSFULLY MIGRATED 'bookings.status' column to VARCHAR(50)!");
        } catch (Exception e) {
            System.out.println("⚠️ Migration skipped or failed for bookings: " + e.getMessage());
        }
    }
}
