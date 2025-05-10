import React, { useState, useRef, useEffect } from "react";
import { CircularProgress, TextField, Button, Paper, Box, Typography, Alert, Snackbar } from '@mui/material';
import { FileUploader } from "react-drag-drop-files";
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import axios, { AxiosError } from "axios";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

interface MessageInterface {
  content: string;
  role: "user" | "assistant";
}

interface SnackBarInterface {
  open: boolean;
  message: string;
  severity?: 'success' | 'error' | 'info';
}

interface ApiResponse {
  status: string;
  message?: string;
}

const fileTypes = ["CSV", "PDF", "DOCX", "TXT"];

const ChatWindow: React.FC = () => {
  const API_URL = "https://gipqpxq24w.us-east-2.awsapprunner.com/api/chat";
  const TRAIN_API_URL = "http://3.149.70.213:8080/train";
  const UPLOAD_URL = 'http://3.149.70.213:8080/upload';

  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [snackbarSetting, setSnackBarSetting] = useState<SnackBarInterface>({
    open: false,
    message: "",
    severity: 'info'
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [path, setPath] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message: MessageInterface) => {
    setMessages((prevMessages: MessageInterface[]) => [...prevMessages, message]);
    setLoading(true);

    try {
      const response = await axios.post(API_URL, {
        messages: [...messages, message].map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      setMessages(prev => [...prev, {
        content: response.data.response,
        role: "assistant"
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setSnackBarSetting({
        open: true,
        message: "Sorry, there was an error. Please try again.",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!name.trim()) {
      setSnackBarSetting({
        open: true,
        message: "Please enter a valid file path",
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>(TRAIN_API_URL, { name });
      if (response.data.status !== 'Error') {
        setSnackBarSetting({
          open: true,
          message: "Training started successfully!",
          severity: 'success'
        });
      } else {
        setSnackBarSetting({
          open: true,
          message: "Training failed. Please try again.",
          severity: 'error'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || "Server Error!"
        : "Server Error!";
      setSnackBarSetting({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (file: File) => {
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackBarSetting({
        open: true,
        message: "Please select a file first",
        severity: 'error'
      });
      return;
    }

    if (!path.trim()) {
      setSnackBarSetting({
        open: true,
        message: "Please enter a valid S3 path",
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSnackBarSetting({
        open: true,
        message: 'File uploaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || "Upload Error!"
        : "Upload Error!";
      setSnackBarSetting({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarSetting({ open: false, message: "", severity: 'info' });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <Paper
        elevation={3}
        sx={{
          width: '400px',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          borderRight: '1px solid rgba(0,0,0,0.1)',
          bgcolor: 'white',
          justifyContent: "center"
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 3,
            position: 'relative',
            borderRadius: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              top: -15,
              left: 20,
              bgcolor: 'white',
              px: 2
            }}
          >
            Upload Local File
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a local file to the S3 bucket for training
          </Typography>
          <FileUploader
            handleChange={handleChange}
            name="file"
            types={fileTypes}
            multiple={false}
            label="Drag and drop a file here"
          />
          <TextField
            label="S3 Bucket Path"
            variant="outlined"
            fullWidth
            value={path}
            onChange={(e) => setPath(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter S3 bucket path"
          />
          <Button
            variant="contained"
            onClick={handleUpload}
            fullWidth
            sx={{ mt: 2 }}
            disabled={!file || !path.trim()}
          >
            Upload & Train
          </Button>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            position: 'relative',
            borderRadius: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              top: -15,
              left: 20,
              bgcolor: 'white',
              px: 2
            }}
          >
            Train with S3 File
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Train using a file already in the S3 bucket
          </Typography>
          <TextField
            label="S3 Bucket Path"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter S3 bucket path"
          />
          <Button
            variant="contained"
            onClick={handleTrain}
            fullWidth
            sx={{ mt: 2 }}
            disabled={!name.trim()}
          >
            Start Training
          </Button>
        </Paper>
      </Paper>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          position: 'relative'
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {messages.map((message: MessageInterface, index: number) => (
            <ChatMessage key={index} {...message} />
          ))}
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <ChatInput onSendMessage={handleSendMessage} />
        </Box>
      </Box>

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.7)',
            zIndex: 1000
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Snackbar
        open={snackbarSetting.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarSetting.severity}
          sx={{ width: '100%' }}
        >
          {snackbarSetting.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatWindow;