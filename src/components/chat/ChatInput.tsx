import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

interface ChatInputProps {
  onSendMessage: (message: { content: string; role: "user" | "assistant" }) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({ content: message.trim(), role: "user" });
      setMessage('');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 2,
        padding: 2,
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        size="small"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!message.trim()}
      >
        Send
      </Button>
    </Box>
  );
};

export default ChatInput;
