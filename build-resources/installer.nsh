!macro customInit
  ; Check if Python is installed and show its location
  DetailPrint "Checking Python installation..."
  nsExec::ExecToStack 'cmd /c where python'
  Pop $0
  Pop $1
  ${If} $0 == 0
    DetailPrint "Python found at: $1"

    ; Get Python version
    nsExec::ExecToStack 'cmd /c python --version'
    Pop $0
    Pop $2
    DetailPrint "Python version: $2"

    ; Show this info to the user
    MessageBox MB_OK|MB_ICONINFORMATION "Python installation found:$\n$\nLocation: $1$\nVersion: $2$\n$\nThe application will manage its own dependencies when launched."
  ${Else}
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Python is required but not found in your PATH.$\n$\nWould you like to download Python now?" IDYES download IDNO continue
    download:
      ExecShell "open" "https://www.python.org/downloads/"
    continue:
  ${EndIf}
!macroend

!macro customInstall
  ; Just create the python directory structure
  DetailPrint "Creating application directories..."
  CreateDirectory "$INSTDIR\python"
  CreateDirectory "$INSTDIR\python\venv"

  DetailPrint "Installation complete. Python environment will be set up on first launch."
!macroend
