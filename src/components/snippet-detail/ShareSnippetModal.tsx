import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { ModalWrapper } from "../common/ModalWrapper.tsx";
import { useState } from "react";

type ShareSnippetModalProps = {
  open: boolean;
  onClose: () => void;
  onShare: (username: string) => void; // Cambiado para aceptar un username directamente
  loading: boolean;
};

export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const { open, onClose, onShare, loading } = props;
  const [username, setUsername] = useState("");

  const handleShare = () => {
    if (username.trim()) {
      onShare(username.trim()); // Envía el username al backend
    }
  };

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant="h5">Share your snippet</Typography>
        <Divider />
        <Box mt={2}>
          <TextField
              label="Enter friend's username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Actualiza el estado con el input del usuario
              fullWidth
          />
          <Box mt={4} display="flex" width="100%" justifyContent="flex-end">
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button
                disabled={!username.trim() || loading} // Deshabilita si no hay input o si está cargando
                onClick={handleShare}
                sx={{ marginLeft: 2 }}
                variant="contained"
            >
              Share
            </Button>
          </Box>
        </Box>
      </ModalWrapper>
  );
};
