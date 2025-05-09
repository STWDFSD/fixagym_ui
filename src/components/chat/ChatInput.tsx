import { Button, TextField } from "@mui/material";
import React, { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: {
    content: string;
    role: "user" | "assistant";
  }) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState<{
    content: string;
    role: "user" | "assistant";
  }>({
    content: "",
    role: "user",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage({ ...message, content: event.target.value });
  };

  const handleSendMessage = () => {
    onSendMessage(message);
    setMessage({ content: "", role: "user" });
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && message.content.length > 0) {
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "20px",
      }}
    >
      <TextField
        label="Enter your message"
        variant="outlined"
        style={{ marginBottom: "20px" }}
        fullWidth
        value={message.content}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={message.content.length === 0}
        onClick={handleSendMessage}
        fullWidth
      >
        Send
      </Button>
    </div>
  );
};

export default ChatInput;
