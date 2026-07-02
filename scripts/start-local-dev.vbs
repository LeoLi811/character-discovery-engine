Option Explicit

Dim shell, fso, scriptDir, projectDir, nodePath, command

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)
nodePath = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

command = "cmd.exe /d /c cd /d """ & projectDir & """ && """ & nodePath & """ node_modules\next\dist\bin\next dev --hostname 127.0.0.1 --port 3000 > .next-dev.detached.log 2>&1"

shell.Run command, 0, False
