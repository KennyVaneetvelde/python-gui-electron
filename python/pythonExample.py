import sys
import json
from src.matrix_ops import SignalGenerator


def my_print(message):
    """Print formatted message with flush"""
    print(f"Python    : {json.dumps(message)}", flush=True)


def parse_command(cmd):
    """Parse command string into command and arguments"""
    try:
        cmd_dict = json.loads(cmd)
        return cmd_dict.get("command"), cmd_dict.get("args", {})
    except json.JSONDecodeError:
        return cmd, {}


# Initialize signal generator
generator = SignalGenerator()

# Print startup message
my_print({"type": "status", "message": "Signal Generator Started"})
# Send initial signal
my_print({"type": "signal", "data": generator.generate_sine()})

# Main loop
while True:
    line = sys.stdin.readline().strip()

    if not line:
        my_print({"type": "status", "message": "Terminating - no data"})
        exit(0)

    command, args = parse_command(line)

    if command == "terminate":
        my_print({"type": "status", "message": "Terminating by request"})
        exit(0)

    try:
        if command == "generate":
            wave_type = args.get("type", "sine")
            if wave_type == "sine":
                result = generator.generate_sine()
            elif wave_type == "square":
                result = generator.generate_square()
            elif wave_type == "sawtooth":
                result = generator.generate_sawtooth()
            elif wave_type == "noise":
                result = generator.generate_noise()
            else:
                result = generator.generate_sine()
            my_print({"type": "signal", "data": result})

        elif command == "parameters":
            frequency = args.get("frequency")
            amplitude = args.get("amplitude")
            phase = args.get("phase")
            result = generator.set_parameters(frequency, amplitude, phase)
            my_print({"type": "parameters", "data": result})
            # After updating parameters, send new signal
            my_print({"type": "signal", "data": generator.generate_sine()})

        else:
            my_print({"type": "error", "message": f"Unknown command: {command}"})

    except Exception as e:
        my_print({"type": "error", "message": str(e)})
