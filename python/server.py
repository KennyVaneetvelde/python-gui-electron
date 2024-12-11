import uvicorn
import sys
import os
from dotenv import load_dotenv
from src.api import app

if __name__ == "__main__":
    # Load environment variables from .env file
    load_dotenv()

    # Get port from command line argument or use default
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

    # Start the server with host as 127.0.0.1 explicitly
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info", ws="auto")
