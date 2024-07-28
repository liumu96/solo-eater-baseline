// components/ConfirmationDialog.tsx
"use client";
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <DialogTitle className="text-xl font-semibold text-gray-900">
          Confirm End of Meal
        </DialogTitle>
        <DialogContent className="text-gray-700 mt-4 mb-6">
          <p className="text-base">Do you want to end your meal?</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
            className="text-base font-semibold text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </Button>

          {/* <Link href="/userdata" passHref> */}
          <Button
            onClick={onConfirm}
            color="primary"
            className="text-base font-semibold text-white bg-blue-500 hover:bg-blue-600"
          >
            Confirm
          </Button>
          {/* </Link> */}
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;
