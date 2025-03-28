import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PlusIcon,
  CheckIcon,
  SearchIcon,
  XIcon,
  FileTextIcon,
  CreditCardIcon,
  Share2Icon,
  MegaphoneIcon,
  CalendarClockIcon,
  TimerIcon,
  DatabaseIcon,
  TicketPercentIcon,
  ChartPie,
  CircleFadingPlus,
  ClockFadingIcon,
  User2Icon
} from "lucide-react";
import { FC, useEffect, useState, useRef } from "react";
import { ShoppingBag as ShoppingBagSvg } from "../icons/custom-icons";
import { usePublishDraft } from "../../hooks/use-publish-draft";
import { CollectingSettings } from "../draft/draft";
import { Slider } from "@/components/ui/slider";
import { MentionableUser } from "../user/user-search";
import { toast } from "sonner";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccounts } from "@lens-protocol/client/actions";
import { UserSearchList } from "../user/user-search-list";
import { EvmAddress } from "../misc/evm-address";
import { UserLazyUsername } from "../user/user-lazy-username";
import { isValidEthereumAddress } from "@/lib/utils";

interface CollectingTabProps {
  isPublishing: boolean;
  handlePublish: () => void;
  documentId?: string;
}

const defaultSettings: CollectingSettings = {
  isCollectingEnabled: false,
  collectingLicense: "CC BY-NC 4.0",
  isChargeEnabled: false,
  price: "0",
  currency: "ETH",
  isReferralRewardsEnabled: false,
  referralPercent: 25,
  isRevenueSplitEnabled: false,
  recipients: [],
  isLimitedEdition: false,
  collectLimit: "100",
  isCollectExpiryEnabled: false,
  collectExpiryDays: 7,
  collectExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
};


export const CollectingTab: FC<CollectingTabProps> = ({
  isPublishing,
  handlePublish,
  documentId
}) => {
  const { getDraft, updateDraft } = usePublishDraft(documentId);
  const [settings, setSettings] = useState<CollectingSettings>(getDraft()?.collectingSettings || defaultSettings);

  const [newRecipientAddress, setNewRecipientAddress] = useState("");
  const [newRecipientPercentage, setNewRecipientPercentage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MentionableUser | null>(null);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [distributeEvenlyEnabled, setDistributeEvenlyEnabled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const referralPercent = typeof settings.referralPercent === 'number' ? settings.referralPercent : 25;

  useEffect(() => {
    const draft = getDraft();
    if (!draft) return;

    if (draft.collectingSettings) {
      setSettings({
        ...draft.collectingSettings
      });
    }
  }, [getDraft]);

  useEffect(() => {
    if (documentId) {
      updateDraft({ collectingSettings: settings });
    }
  }, [settings, updateDraft, documentId]);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + (settings.collectExpiryDays || 7));

  const updateSetting = <K extends keyof CollectingSettings>(key: K, value: CollectingSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewRecipientAddress(value);

    if (value.startsWith("@") && value.length > 1) {
      setSearchQuery(value.substring(1));
      setIsSearchOpen(true);
    }
    else if (value.length > 0 && !isValidEthereumAddress(value)) {
      setSearchQuery(value);
      setIsSearchOpen(true);
    }
    else {
      setSearchQuery("");
      if (isSearchOpen) {
        setIsSearchOpen(false);
      }
      setSelectedUser(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isSearchOpen && !isValidEthereumAddress(newRecipientAddress)) {
        e.preventDefault();
        return;
      }

      if (isValidEthereumAddress(newRecipientAddress) || selectedUser) {
        e.preventDefault();
        handleAddRecipient();
      }
    }

    if (e.key === 'Escape' && isSearchOpen) {
      e.preventDefault();
      setIsSearchOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (newRecipientAddress.length > 0 &&
      (newRecipientAddress.startsWith("@") || !isValidEthereumAddress(newRecipientAddress))) {
      setIsSearchOpen(true);
      if (newRecipientAddress.startsWith("@") && newRecipientAddress.length > 1) {
        setSearchQuery(newRecipientAddress.substring(1));
      }
      else if (newRecipientAddress.length > 0) {
        setSearchQuery(newRecipientAddress);
      }
    }
  };

  const handleUserSelect = (user: MentionableUser) => {
    if (user) {
      setSelectedUser(user);
      setNewRecipientAddress(user.key);
      setIsSearchOpen(false);
      handleAddRecipient(user);
    }
  };

  const handleAddRecipient = (userToAdd?: MentionableUser) => {
    const address = userToAdd ? userToAdd.key : newRecipientAddress;

    if (!address || newRecipientPercentage <= 0 || newRecipientPercentage > 100) {
      return;
    }

    if (!isValidEthereumAddress(address) && !userToAdd) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    const newRecipient: {
      address: string;
      percentage: number;
      username?: string;
      picture?: string
    } = {
      address,
      percentage: newRecipientPercentage,
    };

    if (userToAdd || selectedUser) {
      const selectedOne = userToAdd || selectedUser;
      if (selectedOne) {
        newRecipient.username = selectedOne.username;
        newRecipient.picture = selectedOne.picture;
      }
    }

    setSettings(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient]
    }));

    setNewRecipientAddress("");
    setNewRecipientPercentage(50);
    setSelectedUser(null);
    setIsSearchOpen(false);
    setShowAddRecipient(false);

    // Focus back on the input after adding
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleRemoveRecipient = (index: number) => {
    setSettings(prev => {
      const newRecipients = [...prev.recipients];
      newRecipients.splice(index, 1);
      return {
        ...prev,
        recipients: newRecipients
      };
    });
  };

  const updateRecipientPercentage = (index: number, percentage: number) => {
    if (percentage <= 0 || percentage > 100) return;

    const recipient = settings.recipients[index];
    if (!recipient) return;

    const updatedRecipients = [...settings.recipients];
    updatedRecipients[index] = {
      ...recipient,
      percentage
    };

    setSettings(prev => ({
      ...prev,
      recipients: updatedRecipients
    }));
  };

  const distributeEvenly = () => {

    const evenPercentage = Math.floor(100 / settings.recipients.length);
    // Calculate remainder to ensure total is always 100%
    const remainder = 100 - (evenPercentage * settings.recipients.length);

    const updatedRecipients = settings.recipients.map((recipient, index) => {
      // Add the remainder to the first recipient to make sure total is 100%
      const adjustedPercentage = index === 0 ?
        evenPercentage + remainder :
        evenPercentage;

      return {
        ...recipient,
        percentage: adjustedPercentage
      };
    });

    setSettings(prev => ({
      ...prev,
      recipients: updatedRecipients
    }));
  };

  useEffect(() => {
    if (distributeEvenlyEnabled && settings.recipients.length >= 1) {
      distributeEvenly();
    }
  }, [distributeEvenlyEnabled, settings.recipients.length]);

  const handleSubmitButtonClick = () => {
    handleAddRecipient();
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0 overflow-auto pr-2">
        <div className="space-y-6 p-2">
          <div>
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-medium">Collecting</h3>
                <p className="text-sm text-muted-foreground">
                  Let readers collect your post. You can set a license for the piece,
                  and decide if you want to charge for the collect.
                </p>
              </div>
              <Switch
                checked={settings.isCollectingEnabled}
                onCheckedChange={(checked) => updateSetting('isCollectingEnabled', checked)}
              />
            </div>

            {!settings.isCollectingEnabled && (
              <div className="flex justify-center items-center py-6">
                <ShoppingBagSvg />
              </div>
            )}

            {settings.isCollectingEnabled && (
              <div className="space-y-4 pt-4">
                <div className="border rounded-sm p-4 space-y-4 bg-background/50 hover:bg-background/80 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">License</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You can grant the collector a license to use the post. By default you retain all rights.
                      </p>
                    </div>
                  </div>
                  <Select
                    value={settings.collectingLicense}
                    onValueChange={(value) => updateSetting('collectingLicense', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a license" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="z-[60]" side="bottom">
                      <SelectItem value="CC BY 4.0">Creative Commons (CC BY 4.0)</SelectItem>
                      <SelectItem value="CC BY-SA 4.0">CC BY-SA 4.0</SelectItem>
                      <SelectItem value="CC BY-NC 4.0">CC BY-NC 4.0</SelectItem>
                      <SelectItem value="CC BY-ND 4.0">CC BY-ND 4.0</SelectItem>
                      <SelectItem value="CC BY-NC-SA 4.0">CC BY-NC-SA 4.0</SelectItem>
                      <SelectItem value="CC BY-NC-ND 4.0">CC BY-NC-ND 4.0</SelectItem>
                      <SelectItem value="CC0 1.0">CC0 1.0 (Public Domain)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-sm p-4 space-y-4 bg-background/50 hover:bg-background/80 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Charge for collecting</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get paid in crypto when someone collects your post
                      </p>
                    </div>
                    <Switch
                      checked={settings.isChargeEnabled}
                      onCheckedChange={(checked) => updateSetting('isChargeEnabled', checked)}
                    />
                  </div>

                  {settings.isChargeEnabled && (
                    <div className="space-y-6 pt-2">
                      <div className="space-y-2 max-w-xs">
                        <Label>Price</Label>
                        <div className="flex items-center">
                          <div className="relative w-full">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={Number(settings.price)}
                              className="pl-7 no-spinners"
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateSetting('price', value.toString());
                              }}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <MegaphoneIcon className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-medium">Referral rewards</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Share a portion of your collect revenue with people who repost your content
                            </p>
                          </div>
                          <Switch
                            checked={settings.isReferralRewardsEnabled}
                            onCheckedChange={(checked) => updateSetting('isReferralRewardsEnabled', checked)}
                          />
                        </div>

                        {settings.isReferralRewardsEnabled && (
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4 pt-4">
                                <div className="relative w-16">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="pr-6 no-spinners"
                                    value={referralPercent}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);
                                      if (!isNaN(value) && value >= 1 && value <= 100) {
                                        updateSetting('referralPercent', value);
                                      }
                                    }}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                </div>
                                <div className="flex-1">
                                  <Slider
                                    value={[referralPercent] as [number]}
                                    min={1}
                                    max={100}
                                    step={0.01}
                                    onValueChange={([value]) => updateSetting('referralPercent', Math.round(value || 25))}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <ChartPie className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-medium">Revenue split</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Share your collect revenue with others</p>
                          </div>
                          <Switch
                            checked={settings.isRevenueSplitEnabled}
                            onCheckedChange={(checked) => updateSetting('isRevenueSplitEnabled', checked)}
                          />
                        </div>

                        {settings.isRevenueSplitEnabled && (
                          <div className="space-y-4 pt-2">
                            {settings.recipients.length > 0 && (
                              <div className="space-y-2">
                                {settings.recipients.length >= 1 && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Checkbox
                                      id="distribute-evenly"
                                      checked={distributeEvenlyEnabled}
                                      onCheckedChange={(checked) => setDistributeEvenlyEnabled(checked as boolean)}
                                    />
                                    <Label htmlFor="distribute-evenly" className="cursor-pointer text-sm">
                                      Distribute evenly
                                    </Label>
                                  </div>
                                )}

                                {settings.recipients.map((recipient, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {/* Percentage input now on the left */}
                                      <div className="relative w-16">
                                        <Input
                                          type="number"
                                          min="1"
                                          max="100"
                                          className="pr-6 no-spinners"
                                          value={recipient.percentage}
                                          onChange={(e) => {
                                            const value = Number(e.target.value);
                                            if (!isNaN(value) && value >= 1 && value <= 100) {
                                              setDistributeEvenlyEnabled(false);
                                              updateRecipientPercentage(index, value);
                                            }
                                          }}
                                          disabled={distributeEvenlyEnabled}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                      </div>

                                      {recipient.picture ? (
                                        <img
                                          src={recipient.picture}
                                          alt={recipient.username || "recipient"}
                                          className="w-8 h-8 rounded-full border border-border"
                                        />
                                      ) : (
                                        <div className="flex h-8 w-8 border border-border rounded-full items-center justify-center">
                                          <User2Icon size={16} className="text-muted-foreground" />
                                        </div>
                                      )}
                                      <span className="text-sm flex items-center gap-1 truncate max-w-[400px]">
                                        {recipient.username ? (
                                          <>
                                            <UserLazyUsername username={recipient.username} />
                                            <EvmAddress address={recipient.address} truncate showCopy />
                                          </>
                                        ) : (
                                          <EvmAddress address={recipient.address} showCopy />
                                        )}
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveRecipient(index)}
                                    >
                                      <XIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {showAddRecipient ? (
                              <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                <div className="grid grid-cols-[auto,1fr] gap-3">
                                  <div className="relative w-16">
                                    <Label className="mb-2 block">Percent</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="100"
                                      className="pr-6 no-spinners"
                                      value={newRecipientPercentage}
                                      onChange={(e) => setNewRecipientPercentage(Number(e.target.value))}
                                      disabled={distributeEvenlyEnabled}
                                    />
                                    <span className="absolute right-3 top-[calc(50%_+_0.5rem)] -translate-y-1/2 text-muted-foreground">%</span>
                                  </div>
                                  <div>
                                    <Label className="mb-2 block">Recipient</Label>
                                    <div className="relative">
                                      <Input
                                        ref={inputRef}
                                        placeholder="@username or 0x address..."
                                        value={selectedUser ? `@${selectedUser.username}` : newRecipientAddress}
                                        onChange={handleInputChange}
                                        onFocus={handleInputFocus}
                                        onKeyDown={handleKeyDown}
                                        className={`
                                          ${selectedUser?.picture ? "pl-10" : ""} 
                                          ${selectedUser ? "pr-24" : ""} 
                                          ${isSearchOpen && !selectedUser ? "pr-10 border-primary ring-1 ring-primary/30 shadow-sm" : ""}
                                          transition-all duration-200
                                        `}
                                        autoFocus
                                      />
                                      {isSearchOpen && !selectedUser && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                          <SearchIcon className="h-4 w-4 text-primary animate-pulse" />
                                        </div>
                                      )}
                                      {selectedUser && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-background/80 pl-1">
                                          <EvmAddress address={selectedUser.key} truncate className="text-xs" />
                                        </div>
                                      )}
                                      {selectedUser && selectedUser.picture && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                          <img
                                            src={selectedUser.picture}
                                            alt={selectedUser.username}
                                            className="w-6 h-6 rounded-full"
                                          />
                                        </div>
                                      )}
                                      {isSearchOpen && newRecipientAddress.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50">
                                          <UserSearchList
                                            query={searchQuery}
                                            onSelect={handleUserSelect}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAddRecipient(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSubmitButtonClick}
                                    disabled={!newRecipientAddress || newRecipientPercentage <= 0 || newRecipientPercentage > 100}
                                  >
                                    Submit
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="animate-in slide-in-from-bottom-2 fade-in duration-200"
                                  onClick={() => setShowAddRecipient(true)}
                                >
                                  <PlusIcon className="w-4 h-4" />
                                  Add recipient
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border rounded-sm p-4 space-y-4 bg-background/50 hover:bg-background/80 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CircleFadingPlus className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Limited edition</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Only allow a certain number of collects</p>
                    </div>
                    <Switch
                      checked={settings.isLimitedEdition}
                      onCheckedChange={(checked) => updateSetting('isLimitedEdition', checked)}
                    />
                  </div>

                  {settings.isLimitedEdition && (
                    <div className="space-y-2 max-w-[200px] pt-2">
                      <Label>Maximum collects</Label>
                      <Input
                        type="number"
                        min="1"
                        className="no-spinners"
                        placeholder="100"
                        value={Number(settings.collectLimit)}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (!isNaN(value) && value >= 1) {
                            updateSetting('collectLimit', value.toString());
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="border rounded-sm p-4 space-y-4 bg-background/50 hover:bg-background/80 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ClockFadingIcon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Collect expiry</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Only allow collecting until a certain time
                      </p>
                    </div>
                    <Switch
                      checked={settings.isCollectExpiryEnabled}
                      onCheckedChange={(checked) => updateSetting('isCollectExpiryEnabled', checked)}
                    />
                  </div>

                  {settings.isCollectExpiryEnabled && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-[120px]">
                          <Input
                            type="number"
                            min="1"
                            className="pr-12 no-spinners"
                            value={settings.collectExpiryDays}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value);
                              if (!Number.isNaN(value) && value >= 1) {
                                const date = new Date();
                                date.setDate(date.getDate() + value);
                                setSettings(prev => ({
                                  ...prev,
                                  collectExpiryDays: value,
                                  collectExpiryDate: date.toISOString()
                                }));
                              }
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">days</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires on {expiryDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      <div className="flex items-center p-2">
        <Button onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}; 