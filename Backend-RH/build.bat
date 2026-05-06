@echo off
set JAVA_HOME=C:\Users\PC\.jdks\openjdk-21.0.1
set PATH=%JAVA_HOME%\bin;%PATH%
echo Using Java:
java -version
echo.
echo Building GestionRH...
call mvn clean package -DskipTests
echo.
if %ERRORLEVEL% == 0 (
    echo BUILD SUCCESS - JAR is in target\
) else (
    echo BUILD FAILED
)
pause
