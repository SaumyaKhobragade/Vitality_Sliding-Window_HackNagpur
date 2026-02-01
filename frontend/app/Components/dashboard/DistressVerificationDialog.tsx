"use client";

import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Activity, ShieldAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import * as ApiClient from "@/lib/api-client";
import { DistressEvent } from "@/lib/types";
import { getShortPatientId } from "@/lib/utils";

interface DistressVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: DistressEvent | null;
  onActionComplete: () => void;
}

const DistressVerificationDialog = ({
  isOpen,
  onClose,
  event,
  onActionComplete,
}: DistressVerificationDialogProps) => {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!event || !event.expiresAt) return;

    const calculateTime = () => {
      const expires = new Date(event.expiresAt!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        onClose(); // Close if expired
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event, onClose]);

  if (!event) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Supabase
      await ApiClient.updateDistressEvent(
        event.id,
        "CONFIRMED",
        note,
        "NURSE-01", // Mock nurse ID
        note,
        100 // Priority delta for confirmed
      );
      
      // 2. Sync to Simulation
      const patientId = event.cameraFeedId || event.id.split('-')[0]; // Extracting from mock ID if needed
      await ApiClient.confirmDistressSimulation(patientId);
      
      onActionComplete();
      onClose();
    } catch (error) {
      console.error("Failed to confirm distress", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Supabase
      await ApiClient.updateDistressEvent(
        event.id,
        "DISMISSED",
        note,
        "NURSE-01",
        note,
        0
      );
      
      // 2. Sync to Simulation
      const patientId = event.cameraFeedId || event.id.split('-')[0];
      await ApiClient.dismissDistressSimulation(patientId);
      
      onActionComplete();
      onClose();
    } catch (error) {
      console.error("Failed to dismiss distress", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                <Clock className="w-3 h-3" />
                EXPIRES IN {timeRemaining}s
              </div>
            )}
          </div>
          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Verify Distress Signal
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            A <strong>{event.type}</strong> signal was detected for patient{" "}
            <span className="font-mono text-blue-600 dark:text-blue-400">
              {getShortPatientId(event.id)}
            </span>{" "}
            with <strong>{event.confidenceScore}%</strong> confidence.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-4">
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden relative">
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white flex items-center gap-1">
              <Activity className="w-3 h-3 text-red-500" /> LIVE_FEED: {event.cameraFeedId || "CAM-04"}
            </div>
            <img 
              src={`https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400`} 
              alt="CCTV Feed Placeholder"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Visual Evidence Required</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Clinical Justification / Notes
            </label>
            <Textarea
              placeholder="e.g., Patient collapsed while reaching for water. Confirmed visual distress."
              className="min-h-[80px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isSubmitting}
            className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isSubmitting ? "Processing..." : "Confirm Signal"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DistressVerificationDialog;
