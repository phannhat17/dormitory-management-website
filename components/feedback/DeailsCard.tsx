"use client";

import { getFbInfo } from "@/actions/admin/feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react";
import { toast } from "sonner";


interface ReusableAlertDialogProps {
  isOpen: boolean;
  fbId: string;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}

const FeedBackDetails: React.FC<ReusableAlertDialogProps> = ({ isOpen, fbId, setIsOpen, onConfirm }) => {
  const [feedbackId, setFeedbackId] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [feedbackContent, setFeedbackContent] = useState<string>("");


  useEffect(() => {
    const fetchUserInfo = async () => {
      const response = await getFbInfo(fbId);
      if (response && !("error" in response)) {
        setFeedbackId(response.id);
        setUserId(response.User.id || '');
        setUserName(response.User.name || '');
        setUserEmail(response.User.email || '');
        setFeedbackContent(response.content || '');
      } else {
        toast.error("Failed to fetch user information");
      }
    };

    if (isOpen) {
      fetchUserInfo();
    }
  }, [fbId, isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Feedback {feedbackId} Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              User ID
            </Label>
            <Label>
              {userId}
            </Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              User Name
            </Label>
            <Label>
              {userName}
            </Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              User Email
            </Label>
            <Label>
              {userEmail}
            </Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="AmountDue" className="text-right">
              Content
            </Label>
            <p className="font-bold">{feedbackContent}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FeedBackDetails;
