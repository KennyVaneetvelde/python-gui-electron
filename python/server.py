import uvicorn
import sys
from src.api import app

if __name__ == "__main__":
    # Get port from command line argument or use default
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

    # Start the server with host as 127.0.0.1 explicitly
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info", ws="auto")
