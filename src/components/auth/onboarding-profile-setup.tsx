import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { ImageCropperUploader } from "../misc/image-uploader";
import { Button } from "../ui/button";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TextareaAutosize } from "../ui/textarea";

export interface ProfileSetupData {
  profilePicture?: File | null;
  name?: string;
  bio?: string;
  skipped: boolean;
}

interface OnboardingProfileSetupProps {
  username: string;
  onSubmit: (profileData: ProfileSetupData) => Promise<void>;
  onClose: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function OnboardingProfileSetup({
  username,
  onSubmit,
  onClose,
  onBack,
  isLoading,
}: OnboardingProfileSetupProps) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [name, setName] = useState(username || "");
  const [bio, setBio] = useState("");

  const handleSubmit = async (skipped: boolean) => {
    await onSubmit({
      profilePicture: skipped ? undefined : profilePicture,
      name: skipped ? undefined : name || undefined,
      bio: skipped ? undefined : bio || undefined,
      skipped,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <DialogHeader>
        <DialogTitle className="text-base h-8 flex gap-2 items-center">
          <Button variant="ghost" onClick={onBack} aria-label="Close" size="sm" disabled={isLoading}>
            <ChevronLeft className="size-4" />
          </Button>
          Create your profile
        </DialogTitle>
      </DialogHeader>

      <p className="text-xs pt-4 pb-2 text-muted-foreground">
        Fill in your profile - or skip and do it later on your profile page.
      </p>

      <div className="space-y-2 flex flex-col items-start">
        <Label className="self-start">Profile picture</Label>
        <div className="w-32 h-32">
          <ImageCropperUploader label="" initialImage={""} aspectRatio={1} onImageChange={setProfilePicture} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display-name">Display name</Label>
        <Input
          id="display-name"
          placeholder="Enter display name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <TextareaAutosize
          id="bio"
          variant={"default"}
          placeholder="Add bio here..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          minRows={3}
          disabled={isLoading}
        />
      </div>

      <div className="mt-auto pt-4 w-full flex flex-col gap-2">
        <Button onClick={() => handleSubmit(false)} disabled={isLoading} className="w-full">
          {isLoading ? "Creating Account..." : "Save"}
        </Button>
        {/* <Button variant="ghost" onClick={() => handleSubmit(true)} disabled={isLoading} className="w-full">
          Skip for now
        </Button> */}
      </div>
    </div>
  );
}
