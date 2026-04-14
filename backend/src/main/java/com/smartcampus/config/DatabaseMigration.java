package com.smartcampus.config;

// @Configuration  <-- Disabled: all migrations already applied to DB.
//                      Re-enable only if setting up a completely fresh database.
//
// This class was causing a startup crash because its @PostConstruct ran
// ALTER TABLE commands on the same tables Hibernate was also migrating,
// causing a MySQL connection reset mid-migration.
public class DatabaseMigration {

    // Migrations that have already been applied:
    // 1. resources.status   → changed from ENUM to VARCHAR(50)
    // 2. bookings.status    → changed from ENUM to VARCHAR(50)
    // 3. users.is_active    → added BOOLEAN NOT NULL DEFAULT TRUE
}
