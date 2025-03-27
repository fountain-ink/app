import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusIcon } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { ShoppingBag as ShoppingBagSvg } from "../icons/custom-icons";
import { usePublishDraft } from "../../hooks/use-publish-draft";
import { toast } from "sonner";
import { CollectingSettings } from "../draft/draft";

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
  referralPercent: 10,
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

  const handleAddRecipient = () => {
    if (!newRecipientAddress || newRecipientPercentage <= 0 || newRecipientPercentage > 100) {
      return;
    }

    const newRecipient = {
      address: newRecipientAddress,
      percentage: newRecipientPercentage,
    };

    setSettings(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient]
    }));

    setNewRecipientAddress("");
    setNewRecipientPercentage(50);
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
                  <div className="space-y-2">
                    <Label>License</Label>
                    <p className="text-sm text-muted-foreground">
                      You can grant the collector a license to use the post. By default you retain all rights.
                    </p>
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
                </div>

                <div className="border rounded-sm p-4 space-y-4 bg-background/50 hover:bg-background/80 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Charge for collecting</h3>
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
                    <div className="space-y-2 max-w-xs pt-2">
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
                  )}
                </div>

                <div className="border rounded-sm p-4 space-y-4 bg-background/50 hover:bg-background/80 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Revenue split</h3>
                      <p className="text-sm text-muted-foreground">Share your collect revenue with others</p>
                    </div>
                    <Switch
                      checked={settings.isRevenueSplitEnabled}
                      onCheckedChange={(checked) => updateSetting('isRevenueSplitEnabled', checked)}
                    />
                  </div>

                  {settings.isRevenueSplitEnabled && (
                    <div className="space-y-4 max-w-md pt-2">
                      {settings.recipients.length > 0 && (
                        <div className="space-y-2">
                          {settings.recipients.map((recipient, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm truncate max-w-[200px]">{recipient.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{recipient.percentage}%</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveRecipient(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-[1fr,auto] gap-2">
                        <div>
                          <Label>Recipient</Label>
                          <Input
                            placeholder="@username or 0x address..."
                            value={newRecipientAddress}
                            onChange={(e) => setNewRecipientAddress(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Percent</Label>
                          <div className="flex items-center gap-2">
                            <div className="relative w-16">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                className="pr-6 no-spinners"
                                value={newRecipientPercentage}
                                onChange={(e) => setNewRecipientPercentage(Number(e.target.value))}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleAddRecipient}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add recipient
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border rounded-sm p-4 space-y-4 bg-background/50 hover:bg-background/80 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Limited edition</h3>
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
                      <h3 className="font-medium">Collect expiry</h3>
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
                        <div className="relative w-16">
                          <Input
                            type="number"
                            min="1"
                            className="no-spinners"
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
                        </div>
                        <span>days</span>
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