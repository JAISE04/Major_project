import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [newsText, setNewsText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newsText.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/bert_predict",
        {
          text: newsText,
        }
      );

      setResult({
        prediction: response.data.prediction,
        probability: response.data.confidence,
      });
    } catch (error) {
      console.error("Error making prediction:", error);
      setError("Error connecting to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Setup chart data
  const chartData = result ? (() => {
    let realConfidence, fakeConfidence;
  
    if (result.prediction.toLowerCase().includes("real")) {
      realConfidence = result.probability * 100;
      fakeConfidence = (1 - result.probability) * 100;
    } else {
      fakeConfidence = result.probability * 100;
      realConfidence = (1 - result.probability) * 100;
    }
  
    return {
      labels: ['Real News', 'Fake News'],
      datasets: [
        {
          data: [realConfidence, fakeConfidence],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };
  })() : null;
  
  

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Fake News Detector
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Enter News Text
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="News Text"
            multiline
            rows={6}
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Analyze"}
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Analysis Result
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Verdict:
                </Typography>
                <Alert
                  severity={result.prediction === "Real" ? "success" : "error"}
                  variant="filled"
                  icon={false}
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    justifyContent: "center",
                  }}
                >
                  {result.prediction.toUpperCase()} NEWS
                </Alert>
              </Box>

              <Typography variant="body1">
                Confidence: {(result.probability * 100).toFixed(2)}%
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              {chartData && (
                <Box
                  sx={{
                    height: 200,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Pie
                    data={chartData}
                    options={{ maintainAspectRatio: false }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
}

export default App;
