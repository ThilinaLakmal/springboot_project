@echo off
echo =======================================
echo     Starting Smart Campus Backend...
echo =======================================
echo.

set JAVA_HOME=C:\Program Files\Java\jdk-25.0.2

echo [INFO] JAVA_HOME set to %JAVA_HOME%
echo [INFO] Starting Spring Boot (this may take a moment)...
echo.

call mvnw.cmd spring-boot:run
