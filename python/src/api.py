from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from .matrix_ops import SignalGenerator

app = FastAPI()

# Initialize our signal generator
generator = SignalGenerator()

# Store active WebSocket connections
active_connections: List[WebSocket] = []

class ParametersUpdate(BaseModel):
    frequency: Optional[float] = None
    amplitude: Optional[float] = None
    phase: Optional[float] = None
    wave_type: Optional[str] = "sine"

def generate_wave(wave_type: str):
    if wave_type == "sine":
        return generator.generate_sine()
    elif wave_type == "square":
        return generator.generate_square()
    elif wave_type == "sawtooth":
        return generator.generate_sawtooth()
    elif wave_type == "noise":
        return generator.generate_noise()
    else:
        raise ValueError(f"Unknown wave type: {wave_type}")

@app.get("/")
async def read_root():
    return {"status": "Signal Generator API is running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            command = data.get("command")

            if command == "generate":
                wave_type = data.get("wave_type", "sine")
                try:
                    result = generate_wave(wave_type)
                    await websocket.send_json({"type": "signal_data", "data": result})
                except Exception as e:
                    await websocket.send_json({"error": str(e)})

            elif command == "update_parameters":
                try:
                    params = ParametersUpdate(**data.get("parameters", {}))
                    result = generator.set_parameters(
                        frequency=params.frequency,
                        amplitude=params.amplitude,
                        phase=params.phase
                    )
                    # Generate new signal with updated parameters using the current wave type
                    signal_data = generate_wave(params.wave_type)
                    await websocket.send_json({
                        "type": "parameters_updated",
                        "parameters": result,
                        "data": signal_data
                    })
                except Exception as e:
                    await websocket.send_json({"error": str(e)})

    except WebSocketDisconnect:
        active_connections.remove(websocket)
    except Exception as e:
        if not isinstance(e, WebSocketDisconnect):
            await websocket.send_json({"error": str(e)})
        active_connections.remove(websocket)
