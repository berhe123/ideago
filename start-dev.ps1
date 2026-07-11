# Ideago — start API + Web (run in PowerShell, NOT in browser console)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$env:DATABASE_URL = 'postgresql://ideago:ideago@localhost:55433/ideago?schema=public'
$env:PORT = '3001'

Write-Host 'Starting Ideago infrastructure (postgres, redis, mailhog)...' -ForegroundColor Cyan
docker compose up -d postgres redis mailhog

Write-Host ''
Write-Host 'Starting API on http://localhost:3001 ...' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$PSScriptRoot\backend'; `$env:DATABASE_URL='postgresql://ideago:ideago@localhost:55433/ideago?schema=public'; `$env:PORT='3001'; npm run start:dev"

Start-Sleep -Seconds 3

Write-Host 'Starting Web on http://localhost:5173 ...' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$PSScriptRoot\frontend'; `$env:VITE_API_URL='http://localhost:3001'; npm run dev"

Write-Host ''
Write-Host 'Ideago is starting!' -ForegroundColor Yellow
Write-Host '  Web:  http://localhost:5173'
Write-Host '  API:  http://localhost:3001/docs'
Write-Host '  Login: founder@ideago.com / Founder123!'
