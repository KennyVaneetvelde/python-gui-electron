# Signal Generator

A desktop application for generating and visualizing various types of signals.

## Prerequisites

Before installing Signal Generator, make sure you have the following prerequisites installed:

1. **Python 3.8 or higher**
   - Download from [python.org](https://www.python.org/downloads/)
   - During installation, make sure to check "Add Python to PATH"
   - Verify installation by running `python --version` in a terminal

## Installation

### Windows

1. Download the latest `Signal Generator Setup.exe` from the releases page
2. Run the installer
   - If Python is not detected, the installer will prompt you to install it
   - The installer will create a virtual environment and install Python dependencies
3. Launch Signal Generator from the Start Menu or Desktop shortcut

If the Python setup fails during installation, you can set it up manually:
1. Open Command Prompt as Administrator
2. Navigate to the installation directory
3. Run the following commands:
   ```bash
   cd python
   python -m venv venv
   venv\Scripts\python -m pip install -r requirements.txt
   ```

### Portable Version

A portable version is also available that doesn't require installation:
1. Download `Signal Generator.exe` from the releases page
2. Make sure Python is installed on your system
3. On first run, the application will set up the Python environment

## Development

To set up the development environment:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

To build the application:
```bash
npm run dist:win  # For Windows
npm run dist:mac  # For macOS
npm run dist:linux  # For Linux
```

## Troubleshooting

### Python Issues
- Make sure Python is added to PATH
- Try running `python --version` to verify Python installation
- Check if pip is installed: `python -m pip --version`

### Application Won't Start
1. Check if Python is properly installed
2. Verify Python dependencies are installed
3. Check the application logs in:
   - Windows: `%APPDATA%\Signal Generator\logs`

## License

MIT License - see LICENSE file for details
