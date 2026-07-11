$ports = @(5000, 5173)
$pids = @()
foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    if ($c.OwningProcess) { $pids += $c.OwningProcess }
  }
}
$pids = $pids | Sort-Object -Unique
if ($pids.Count -eq 0) { Write-Output 'No processes found on ports 5000 or 5173'; exit 0 }
foreach ($id in $pids) {
  try {
    Stop-Process -Id $id -Force -ErrorAction Stop
    Write-Output "Stopped PID $id"
  } catch {
    Write-Output "Failed to stop PID $id"
  }
}
Start-Sleep -Milliseconds 300
foreach ($port in $ports) {
  if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) { Write-Output "$port still-listening" } else { Write-Output "$port free" }
}
