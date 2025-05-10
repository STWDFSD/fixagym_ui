import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role }) => {
  const isUser = role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: "70%",
          backgroundColor: isUser ? "#1976d2" : "#f5f5f5",
          color: isUser ? "white" : "black",
          borderRadius: 2,
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;