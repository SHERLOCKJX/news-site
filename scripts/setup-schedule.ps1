$Action = New-ScheduledTaskAction -Execute "curl" -Argument "http://localhost:3000/api/cron"
$Principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount
$Settings = New-ScheduledTaskSettingsSet

$TaskName = "NewsSiteUpdate"

# Define triggers for 8:00 AM, 1:00 PM, and 6:00 PM
$Trigger1 = New-ScheduledTaskTrigger -Daily -At 8am
$Trigger2 = New-ScheduledTaskTrigger -Daily -At 1pm
$Trigger3 = New-ScheduledTaskTrigger -Daily -At 6pm

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Register with multiple triggers
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger @($Trigger1, $Trigger2, $Trigger3) -Principal $Principal -Settings $Settings

Write-Host "Successfully scheduled daily updates for 8:00 AM, 1:00 PM, and 6:00 PM."
