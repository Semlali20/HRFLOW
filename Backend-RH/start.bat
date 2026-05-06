@echo off
set JAVA_HOME=C:\Users\PC\.jdks\openjdk-21.0.1
set PATH=%JAVA_HOME%\bin;%PATH%
echo Using Java:
java -version
echo.
echo Starting GestionRH backend on port 8090...
for %%f in (target\GestionRH-*.jar) do set JAR=%%f
echo Running: %JAR%
java -jar %JAR%
pause
