"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { generateWarningMessage, getStepNames, type ProjectStep } from "@/lib/step-dependencies";

interface StepChangeWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changedStep: ProjectStep;
  affectedSteps: ProjectStep[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function StepChangeWarningDialog({
  open,
  onOpenChange,
  changedStep,
  affectedSteps,
  onConfirm,
  onCancel,
}: StepChangeWarningDialogProps) {
  const warningMessage = generateWarningMessage(changedStep, affectedSteps);
  const affectedStepNames = getStepNames(affectedSteps);

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // If no steps are affected, don't show dialog
  if (affectedSteps.length === 0) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-black/95 border border-red-500/30 text-white max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Confirm Step Change
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/80 whitespace-pre-line text-left">
            {warningMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {affectedStepNames.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 my-4">
            <h4 className="text-sm font-medium text-red-300 mb-2">Steps that will be reset:</h4>
            <ul className="text-sm text-white/70 space-y-1">
              {affectedStepNames.map((name, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white border-red-500"
          >
            Continue & Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default StepChangeWarningDialog;
