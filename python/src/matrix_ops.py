import numpy as np


class SignalGenerator:
    def __init__(self):
        self.t = np.linspace(0, 2 * np.pi, 100)  # Time array
        self.frequency = 1.0
        self.amplitude = 1.0
        self.phase = 0.0

    def generate_sine(self):
        """Generate a sine wave"""
        signal = self.amplitude * np.sin(self.frequency * self.t + self.phase)
        return {"x": self.t.tolist(), "y": signal.tolist(), "type": "sine"}

    def generate_square(self):
        """Generate a square wave"""
        signal = self.amplitude * np.sign(np.sin(self.frequency * self.t + self.phase))
        return {"x": self.t.tolist(), "y": signal.tolist(), "type": "square"}

    def generate_sawtooth(self):
        """Generate a sawtooth wave"""
        signal = self.amplitude * (
            2 * (self.frequency * self.t + self.phase) % (2 * np.pi) / (2 * np.pi) - 1
        )
        return {"x": self.t.tolist(), "y": signal.tolist(), "type": "sawtooth"}

    def generate_noise(self):
        """Generate random noise"""
        signal = self.amplitude * np.random.randn(len(self.t))
        return {"x": self.t.tolist(), "y": signal.tolist(), "type": "noise"}

    def set_parameters(self, frequency=None, amplitude=None, phase=None):
        """Update signal parameters"""
        if frequency is not None:
            self.frequency = frequency
        if amplitude is not None:
            self.amplitude = amplitude
        if phase is not None:
            self.phase = phase
        return {
            "frequency": self.frequency,
            "amplitude": self.amplitude,
            "phase": self.phase,
        }
