const updatePlot = (data) => {
  const trace = {
    x: data.x,
    y: data.y,
    type: 'scatter',
    mode: 'lines',
    line: { color: '#2196f3', width: 2 }
  };

  const layout = {
    title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Wave`,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#666' },
    xaxis: {
      title: 'Time',
      gridcolor: '#ddd',
      zerolinecolor: '#666'
    },
    yaxis: {
      title: 'Amplitude',
      gridcolor: '#ddd',
      zerolinecolor: '#666'
    }
  };

  Plotly.newPlot('signal-plot', [trace], layout);
};

const updateParameters = () => {
  const frequency = parseFloat(document.getElementById('frequency').value);
  const amplitude = parseFloat(document.getElementById('amplitude').value);
  const phase = parseFloat(document.getElementById('phase').value);

  document.getElementById('frequency-value').textContent = frequency.toFixed(1);
  document.getElementById('amplitude-value').textContent = amplitude.toFixed(1);
  document.getElementById('phase-value').textContent = phase.toFixed(1);

  window.electronAPI.sendToPython(
    JSON.stringify({
      command: 'parameters',
      args: { frequency, amplitude, phase }
    })
  );
};

const generateSignal = () => {
  const type = document.getElementById('wave-type').value;
  window.electronAPI.sendToPython(
    JSON.stringify({
      command: 'generate',
      args: { type }
    })
  );
};

// Handle Python process output
window.electronAPI.onPythonOutput((data) => {
  try {
    const response = JSON.parse(data.replace('Python    : ', ''));

    if (response.type === 'signal') {
      updatePlot(response.data);
    } else if (response.type === 'status') {
      console.log('Python:', response.message);
    } else if (response.type === 'error') {
      console.error('Python error:', response.message);
    }
  } catch (e) {
    console.error('Error parsing Python output:', e);
  }
});

// Start the Python process immediately when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Start Python process
  await window.electronAPI.startPython();

  // Add event listeners for controls
  document.getElementById('wave-type').addEventListener('change', generateSignal);
  document.getElementById('frequency').addEventListener('input', updateParameters);
  document.getElementById('amplitude').addEventListener('input', updateParameters);
  document.getElementById('phase').addEventListener('input', updateParameters);
});

// Clean up when the window is closed
window.addEventListener('beforeunload', () => {
  window.electronAPI.cleanup();
});
