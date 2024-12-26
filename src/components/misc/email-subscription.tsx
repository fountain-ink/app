"use client";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const EmailSubscription = () => {
  const [success, setSuccess] = useState<boolean | undefined>(undefined);

  const handleSubmit = (event: any) => {
    event.preventDefault();

    fetch(`https://kualta.dev/api/subscribe?email=${event.target.email.value}&list=3`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          setSuccess(true);
        } else {
          setSuccess(false);
        }
      });

    event.target.email.value = "";
  };

  return (
    <div className="flex flex-col gap-4 items-center sm:items-start justify-center w-full">
      {success === undefined ? (
        <form onSubmit={handleSubmit} className="w-full sm:w-auto">
          <div className="flex flex-row w-full gap-2">
            <Input
              className="bg-muted w-full sm:w-auto lg:w-64"
              type="email"
              name="email"
              required
              placeholder="E-mail"
            />

            <Button name="submit" type="submit">
              Join Waitlist
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <div className="p-4 w-full flex flex-row items-center justify-center gap-4">
            Joined!
            <MailCheck size={24} />
          </div>
        </div>
      )}
    </div>
  );
};
