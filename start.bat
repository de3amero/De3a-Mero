@echo off
title Wedding Invitation Local Server
echo ===================================================
echo Starting Local Server on http://localhost:8085 ...
echo Now you can edit data.json directly and refresh!
echo ===================================================

start http://localhost:8085
php -S localhost:8085

pause
