import React, { useState } from "react";
import axios from "axios";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
} from "@mui/material";
import { Sun, Moon } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [mode, setMode] = useState("text");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const NGROK_BASE_URL = "https://418d-34-42-155-102.ngrok-free.app";

  const handleModeChange = (_, newVal) => {
    setMode(newVal);
    setInput("");
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError(`Please enter ${mode === "text" ? "news text" : "a URL"}.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint =
        mode === "text" ? "/api/bert_predict" : "/api/bert_predict_url";
      const body = mode === "text" ? { text: input } : { url: input };
      const { data } = await axios.post(NGROK_BASE_URL + endpoint, body);
      setResult(data);
      setHistory((h) =>
        [
          {
            timestamp: new Date().toLocaleTimeString(),
            snippet: input.slice(0, 50) + (input.length > 50 ? "…" : ""),
            ...data,
          },
          ...h,
        ].slice(0, 5)
      );
    } catch (err) {
      console.error(err);
      setError("Server error—please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput("");
    setResult(null);
    setError("");
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const chartData = result && {
    labels: ["Real", "Fake"],
    datasets: [
      {
        data:
          result.prediction === "Real"
            ? [result.confidence * 100, (1 - result.confidence) * 100]
            : [(1 - result.confidence) * 100, result.confidence * 100],
        backgroundColor: ["#4bc0c0", "#ff6384"],
        borderWidth: 1,
      },
    ],
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
    components: {
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: darkMode ? "#fdd835" : "#333",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box className={`main-container ${darkMode ? "dark" : "light"}`}>
        <Container maxWidth="md">
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <IconButton onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </IconButton>
          </Box>

          <Typography
            variant="h3"
            className="page-title"
            align="center"
            gutterBottom
          >
            📰 Fake News Detector
          </Typography>

          <Paper className="paper-section">
            <Box component="form" onSubmit={handleSubmit} mt={2}>
              <TextField
                label={mode === "text" ? "News Text" : "Article URL"}
                fullWidth
                multiline={mode === "text"}
                rows={mode === "text" ? 6 : 1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />

              <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
                <Button type="button" variant="outlined" onClick={handleReset}>
                  Reset
                </Button>
              </Stack>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Paper className="paper-section">
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Chip
                    label={`${result.prediction} News`}
                    color={result.prediction === "Real" ? "success" : "error"}
                    size="medium"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h6">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Pie
                    data={chartData}
                    options={{ maintainAspectRatio: false }}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {history.length > 0 && (
            <Paper className="paper-section">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Recent Analyses</Typography>
                <Button size="small" onClick={handleClearHistory}>
                  Clear History
                </Button>
              </Box>
              <List>
                {history.map((h, i) => (
                  <ListItem key={i} divider>
                    <ListItemText
                      primary={`${h.timestamp} — ${h.snippet}`}
                      secondary={`${h.prediction} (${(
                        h.confidence * 100
                      ).toFixed(1)}%)`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
