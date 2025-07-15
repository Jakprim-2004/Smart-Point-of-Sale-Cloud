@echo off

cd api || goto :error

call npm install || goto :error

call npx nodemon server.js || goto :error

call code . || goto :error

goto :EOF

:error
echo Failed with error #%errorlevel%.
pause
exit /b %errorlevel%



