import React from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon } from '@mui/icons-material';

import PrimaryButton from '../Common/PrimaryButton';

const humanFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let u = -1;
  let size = bytes;
  do {
    size /= thresh;
    ++u;
  } while (Math.abs(size) >= thresh && u < units.length - 1);
  return `${size.toFixed(1)} ${units[u]}`;
};

const AttachmentsTab = ({ formData, updateFormData }) => {
  const attachments = formData.attachments || [];

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    const newAttachments = acceptedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));

    updateFormData({ attachments: [...attachments, ...newAttachments] });
  };

  const removeAttachment = (index) => {
    updateFormData({ attachments: attachments.filter((_, i) => i !== index) });
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Attachments
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          color: isDragActive ? 'primary.main' : 'text.secondary',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          mb: 3,
        }}
      >
        <input {...getInputProps()} />
        <AttachFileIcon sx={{ fontSize: 36, mb: 1 }} color={isDragActive ? 'primary' : 'action'} />
        <Typography variant="body2">
          Drag & drop files here, or click to select
        </Typography>
      </Box>

      {attachments.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          No files uploaded yet.
        </Typography>
      )}

      {attachments.length > 0 && (
        <List>
          {attachments.map((attachment, index) => (
            <ListItem key={`${attachment.name}-${index}`} divider>
              <ListItemText
                primary={attachment.name}
                secondary={humanFileSize(attachment.size)}
              />
              {attachment.type && (
                <Chip label={attachment.type.split('/')[0]} size="small" sx={{ mr: 2 }} />
              )}
              <ListItemSecondaryAction>
                <IconButton edge="end" color="error" onClick={() => removeAttachment(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <PrimaryButton variant="outlined" onClick={open} sx={{ mt: 2 }}>
        Browse Files
      </PrimaryButton>
    </Box>
  );
};

export default AttachmentsTab;

