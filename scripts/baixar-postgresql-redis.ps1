# Execute este script no PowerShell como Administrador
# Clique com botão direito no PowerShell → "Executar como Administrador"
# Depois cole: cd "C:\xampp\htdocs\treinamento de xadrez\scripts" && .\baixar-postgresql-redis.ps1

$destino = "D:\downloads-xadrez"
New-Item -ItemType Directory -Force -Path $destino | Out-Null

# PostgreSQL 16
Write-Host "[1/2] Baixando PostgreSQL 16..." -ForegroundColor Cyan
$pgUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.8-1-windows-x64.exe"
$pgDest = "$destino\postgresql-instalador.exe"
Invoke-WebRequest -Uri $pgUrl -OutFile $pgDest -UseBasicParsing
Write-Host "PostgreSQL salvo em: $pgDest" -ForegroundColor Green
Write-Host "Execute o instalador e anote a senha do superusuário!" -ForegroundColor Yellow

# Redis (via Memurai - versão gratuita para Windows)
Write-Host ""
Write-Host "[2/2] Baixando Memurai (Redis para Windows)..." -ForegroundColor Cyan
$redisUrl = "https://www.memurai.com/get-memurai"
Write-Host "Acesse manualmente: $redisUrl" -ForegroundColor Yellow
Write-Host "Clique em 'Download Developer Edition' e salve em D:\downloads-xadrez\" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== Após instalar os dois ===" -ForegroundColor Green
Write-Host "PostgreSQL: abra o pgAdmin e crie o banco xadrez_escolar" -ForegroundColor White
Write-Host "Redis/Memurai: o serviço inicia automaticamente com o Windows" -ForegroundColor White
Write-Host ""
Write-Host "Depois edite o arquivo:" -ForegroundColor White
Write-Host "C:\xampp\htdocs\treinamento de xadrez\backend\.env" -ForegroundColor Cyan
