$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Request-CricfyKey {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Prompt
    )

    if (-not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($Name, 'Process'))) {
        return
    }

    $secureValue = Read-Host -Prompt $Prompt -AsSecureString
    if ($secureValue.Length -eq 0) {
        $secureValue.Dispose()
        return
    }

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try {
        $plainText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        [Environment]::SetEnvironmentVariable($Name, $plainText, 'Process')
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        $plainText = $null
        $secureValue.Dispose()
    }
}

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
$pythonLauncher = Get-Command py -ErrorAction SilentlyContinue
if (-not $pythonCommand -and -not $pythonLauncher) {
    throw 'Python 3 is required. Install Python, then run this script again.'
}

Request-CricfyKey -Name 'CRICFY_CRICKET_API_KEY' -Prompt 'CricketData API key (required for live scores; Enter to skip)'
Request-CricfyKey -Name 'OPENAI_API_KEY' -Prompt 'OpenAI API key (required for general AI chat; Enter to skip)'

if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable('CRICFY_CRICKET_API_KEY', 'Process'))) {
    Write-Warning 'Live scores will show provider setup instructions until CRICFY_CRICKET_API_KEY is configured.'
}
if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable('OPENAI_API_KEY', 'Process'))) {
    Write-Warning 'General AI chat will use its built-in cricket answers until OPENAI_API_KEY is configured.'
}

Write-Host 'Starting Cricfy API server on http://127.0.0.1:8000'
Write-Host 'You can keep the website open on Live Server at port 5500; API requests will use this server.'
$serverFile = Join-Path $PSScriptRoot 'tools\live_server.py'
if ($pythonCommand) {
    & $pythonCommand.Source $serverFile
}
else {
    & $pythonLauncher.Source -3 $serverFile
}
