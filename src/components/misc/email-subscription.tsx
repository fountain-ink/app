"use client";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const EmailSubscription = () => {
  const [success, setSuccess] = useState<boolean | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [showValidation, setShowValidation] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === "" || emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowValidation(true);

    if (!isEmailValid || !email) return;

    try {
      const response = await fetch(`https://kualta.dev/api/subscribe?email=${email}&list=3`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.status === 200) {
        setSuccess(true);
        setEmail("");
        setShowValidation(false);
      } else {
        setSuccess(false);
      }
    } catch (error) {
      setSuccess(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center sm:items-start justify-center w-full">
      {success === undefined ? (
        <form onSubmit={handleSubmit} className="w-full sm:w-auto">
          <div className="flex flex-col w-full gap-2">
            <div className="flex flex-row gap-2">
              <div className="flex-1">
                <Input
                  className={`bg-muted w-full ${!isEmailValid && showValidation ? "border-destructive" : ""}`}
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  placeholder="E-mail"
                />
                {!isEmailValid && showValidation && (
                  <span className="text-sm text-destructive">Please enter a valid email address</span>
                )}
              </div>
              <Button name="submit" type="submit" disabled={!isEmailValid || !email}>
                Join Waitlist
              </Button>
            </div>
          </div>
        </form>
      ) : success ? (
        <div>
          <div className="p-4 w-full flex flex-row items-center justify-center gap-4">
            Joined!
            <MailCheck size={24} />
          </div>
        </div>
      ) : (
        <div className="text-destructive">Failed to subscribe. Please try again.</div>
      )}
    </div>
  );
};
