"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { SubscriberDataTable } from "./subscriber-data-table";

interface SubscriberManagementProps {
  blogAddress: string;
  mailListId: number | null;
  subscriberCount: number;
}

export function SubscriberManagement({ blogAddress, mailListId, subscriberCount }: SubscriberManagementProps) {
  const [emails, setEmails] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmails = (emailString: string): boolean => {
    if (!emailString.trim()) {
      setValidationError("Please enter at least one email address");
      return false;
    }

    const emailList = emailString
      .split(",")
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      setValidationError(`Invalid email format: ${invalidEmails.join(", ")}`);
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleAddEmails = async () => {
    if (!validateEmails(emails)) {
      return;
    }

    setIsAdding(true);
    
    try {
      // Parse and validate emails
      const emailList = emails
        .split(",")
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const response = await fetch(`/api/newsletter/${blogAddress}/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails: emailList }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add subscribers");
      }

      const result = await response.json();
      if (result.message) {
        toast.success(result.message);
      } else {
        toast.success("Successfully processed subscribers");
      }
      setEmails("");
      
      // Trigger table refresh
      window.dispatchEvent(new CustomEvent("subscriber-added"));
    } catch (error) {
      console.error("Error adding subscribers:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add subscribers");
    } finally {
      setIsAdding(false);
    }
  };

  if (!mailListId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Add Subscribers Section */}
      <div className="space-y-4 mt-6">
        <h4 className="text-sm font-medium">Add subscribers manually</h4>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter email addresses, comma separated"
            value={emails}
            onChange={(e) => {
              setEmails(e.target.value);
              if (validationError) {
                validateEmails(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isAdding && emails.trim()) {
                e.preventDefault();
                handleAddEmails();
              }
            }}
            className="flex-1"
            disabled={isAdding}
            autoComplete="off"
          />
          <Button 
            onClick={handleAddEmails} 
            disabled={isAdding || !emails.trim()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add emails
          </Button>
        </div>
        {validationError && (
          <p className="text-sm text-destructive">{validationError}</p>
        )}
      </div>

      {/* Subscribers Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">All subscribers ({subscriberCount})</h4>
          <p className="text-sm text-muted-foreground">Updated just now</p>
        </div>
        
        <SubscriberDataTable 
          blogAddress={blogAddress} 
          mailListId={mailListId}
        />
      </div>
    </div>
  );
}