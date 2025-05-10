import React, { useState, useRef, useEffect } from "react";
import { CircularProgress, Input, TextField, Button, Container } from '@mui/material';
import { FileUploader } from "react-drag-drop-files";
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
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
}

interface ApiResponse {
  status: string;
  message?: string;
}

const fileTypes = ["CSV", "PDF", "DOCX", "TXT"];

const ChatWindow: React.FC = () => {
  const API_URL = "https://gipqpxq24w.us-east-2.awsapprunner.com/api/chat";
  const TRAIN_API_URL = "https://gipqpxq24w.us-east-2.awsapprunner.com/api/train";
  const UPLOAD_URL = 'https://gipqpxq24w.us-east-2.awsapprunner.com/api/upload';

  // const API_URL = "http://3.149.70.213:8000/api/chat";
  // const TRAIN_API_URL = "http://3.149.70.213:8000/api/train";
  // const UPLOAD_URL = 'http://3.149.70.213:8000/api/upload';

  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [snackbarSetting, setSnackBarSetting] = useState<SnackBarInterface>({ open: false, message: "" });
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
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          prefix: "You are an AI assistant.",
          message: message.content,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newMessageContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            newMessageContent += data;

            setMessages((prev: MessageInterface[]) => {
              const newMessages = [...prev];
              const lastMessageIndex = newMessages.length - 1;

              if (
                lastMessageIndex >= 0 &&
                newMessages[lastMessageIndex].role === "assistant"
              ) {
                newMessages[lastMessageIndex].content = newMessageContent;
              } else {
                newMessages.push({ content: data, role: "assistant" });
              }
              return newMessages;
            });
          }
        });
      }
    } catch (error) {
      console.error(
        "Chat Error:",
        error instanceof Error ? error.message : error
      );
      setMessages((prev: MessageInterface[]) => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        if (
          lastMessageIndex >= 0 &&
          newMessages[lastMessageIndex].role === "assistant"
        ) {
          newMessages[lastMessageIndex].content =
            "Sorry, there was an error. Please try again.";
        } else {
          newMessages.push({
            content: "Sorry, there was an error. Please try again.",
            role: "assistant",
          });
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>(TRAIN_API_URL, { name });
      if (response.data.status !== 'Error') {
        setSnackBarSetting({ open: true, message: "Train successful!" });
      } else {
        setSnackBarSetting({ open: true, message: "Train Error!" });
      }
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || "Server Error!"
        : "Server Error!";
      setSnackBarSetting({ open: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files[0]) {
  //     setFile(event.target.files[0]);
  //     setFileStatus(`File selected: ${event.target.files[0].name}`);
  //     setUploadStatus("");
  //   }
  // };

  const handleChange = (file: File) => {
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackBarSetting({ open: true, message: "Please select a file first" });
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
      setSnackBarSetting({ open: true, message: 'Upload successful!' });
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || "Upload Error!"
        : "Upload Error!";
      setSnackBarSetting({ open: true, message: errorMessage });
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
    setSnackBarSetting({ open: false, message: "" });
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPath(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', width: '400px', justifyContent: "center", gap: "40px", padding: '20px', borderRight: 'rgba(0,0,0,0.1) 2px solid' }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', border: 'rgba(0, 0, 0, 0.2) 1px solid', borderRadius: '10px', padding: '20px', gap: '20px' }}>
          <div style={{ position: 'absolute', top: '-25px', left: '20px', padding: '15px', backgroundColor: 'white', fontWeight: '500' }}>Training with a local file</div>
          <p>You can upload the local file to the S3 bucket and use it for training.</p>
          <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
          <TextField
            label="S3 Bucket file path."
            variant="outlined"
            style={{ width: '100%' }}
            fullWidth
            onChange={handlePathChange}
          />
          <Button variant="contained" color="primary" onClick={handleUpload} style={{ width: '100%' }}>
            Upload & train
          </Button>
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', border: 'rgba(0, 0, 0, 0.2) 1px solid', borderRadius: '10px', padding: '20px', gap: '20px' }}>
          <div style={{ position: 'absolute', top: '-25px', left: '20px', padding: '15px', backgroundColor: 'white', fontWeight: '500' }}>Training with a file on S3 bucket</div>
          <p>You can directly upload the training file to the S3 bucket via the AWS console and initiate training using its file path.</p>
          <TextField
            label="S3 Bucket file path."
            variant="outlined"
            style={{ width: '100%' }}
            fullWidth
            onChange={handleNameChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleTrain}
            disabled={!name}
            style={{ width: '100%' }}
          >
            Train
          </Button>
        </div>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          message={snackbarSetting.message}
          open={snackbarSetting.open}
          autoHideDuration={3000}
          onClose={handleClose}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        <div
          style={{
            height: "calc(100vh - 60px)",
            overflowY: "auto",
            padding: "20px",
            position: "relative",
          }}
          ref={containerRef}
        >
          {messages.map((message: MessageInterface, index: number) => (
            <ChatMessage key={index} {...message} />
          ))}
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;