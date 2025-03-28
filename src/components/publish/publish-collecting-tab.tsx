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
  User2Icon,
  AlertCircleIcon
} from "lucide-react";
import { FC, useEffect, useState, useRef } from "react";
import { ShoppingBag as ShoppingBagSvg } from "../icons/custom-icons";
import { usePublishDraft } from "../../hooks/use-publish-draft";
import { CollectingSettings as BaseCollectingSettings } from "../draft/draft";
import { Slider } from "@/components/ui/slider";
import { MentionableUser } from "../user/user-search";
import { toast } from "sonner";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccounts } from "@lens-protocol/client/actions";
import { UserSearchList } from "../user/user-search-list";
import { EvmAddress } from "../misc/evm-address";
import { UserLazyUsername } from "../user/user-lazy-username";
import { isValidEthereumAddress } from "@/lib/utils";

interface RecipientEntry {
  address: string;
  percentage: number;
  username?: string;
  picture?: string;
  emptyDisplay?: boolean;
}

// Extend the base CollectingSettings to include our extended recipient type
interface CollectingSettings extends Omit<BaseCollectingSettings, 'recipients'> {
  recipients: RecipientEntry[];
}

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

  const [errors, setErrors] = useState<{
    price?: string;
    referralPercent?: string;
    recipientPercentage?: string;
    collectLimit?: string;
    collectExpiryDays?: string;
    revenueSplitTotal?: string;
  }>({});

  const [priceInput, setPriceInput] = useState(settings.price);
  const [collectLimitInput, setCollectLimitInput] = useState(settings.collectLimit);
  const [collectExpiryDaysInput, setCollectExpiryDaysInput] = useState(
    settings.collectExpiryDays ? settings.collectExpiryDays.toString() : ''
  );

  const [newRecipientAddress, setNewRecipientAddress] = useState("");
  const [newRecipientPercentage, setNewRecipientPercentage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MentionableUser | null>(null);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [distributeEvenlyEnabled, setDistributeEvenlyEnabled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const referralPercent = typeof settings.referralPercent === 'number' ? settings.referralPercent : 25;
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    const draft = getDraft();
    if (!draft) return;

    if (draft.collectingSettings) {
      setSettings({
        ...draft.collectingSettings
      });

      setPriceInput(draft.collectingSettings.price);
      setCollectLimitInput(draft.collectingSettings.collectLimit);
      setCollectExpiryDaysInput(
        draft.collectingSettings.collectExpiryDays
          ? draft.collectingSettings.collectExpiryDays.toString()
          : ''
      );
    }

    setTimeout(() => {
      validateAllFields();
    }, 0);
  }, [getDraft]);

  useEffect(() => {
    if (documentId) {
      updateDraft({ collectingSettings: settings });
    }
  }, [settings, updateDraft, documentId]);

  useEffect(() => {
    if (settings.isRevenueSplitEnabled && settings.recipients.length > 0) {
      validateRevenueSplit();
    } else {
      setErrors(prev => ({ ...prev, revenueSplitTotal: undefined }));
    }
  }, [settings.recipients, settings.isRevenueSplitEnabled]);

  useEffect(() => {
    validateAllFields();
  }, [
    settings.isCollectingEnabled,
    settings.isChargeEnabled,
    settings.isReferralRewardsEnabled,
    settings.isRevenueSplitEnabled,
    settings.isLimitedEdition,
    settings.isCollectExpiryEnabled
  ]);

  useEffect(() => {
    if (settings.isCollectingEnabled) {
      validateAllFields();
    }
  }, [
    priceInput,
    collectLimitInput,
    collectExpiryDaysInput,
    settings.referralPercent,
    settings.recipients.length
  ]);

  useEffect(() => {
    if (settings.isCollectingEnabled && settings.isChargeEnabled && settings.isRevenueSplitEnabled) {
      validateRevenueSplit();
      validateAllFields();
    }
  }, [settings.recipients]);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + (settings.collectExpiryDays || 7));

  const updateSetting = <K extends keyof CollectingSettings>(key: K, value: CollectingSettings[K]) => {
    if (key === 'price' || key === 'collectLimit' || key === 'collectExpiryDays') {
      if (value === '' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
        setSettings(prev => ({
          ...prev,
          [key]: value
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
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

    const isDuplicate = settings.recipients.some(recipient =>
      recipient.address.toLowerCase() === address.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This recipient has already been added");
      return;
    }

    const currentTotal = calculateTotalPercentage();
    const willExceedTotal = currentTotal + newRecipientPercentage > 100;

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

    if (willExceedTotal) {
      const newTotal = currentTotal + newRecipientPercentage;
      setErrors(prev => ({
        ...prev,
        revenueSplitTotal: `Total exceeds 100%. Current total: ${newTotal}%`
      }));
    }

    setNewRecipientAddress("");
    setNewRecipientPercentage(50);
    setSelectedUser(null);
    setIsSearchOpen(false);
    setShowAddRecipient(false);

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

    setTimeout(() => {
      if (settings.isRevenueSplitEnabled) {
        const remainingRecipients = [...settings.recipients];
        remainingRecipients.splice(index, 1);

        if (remainingRecipients.length > 1) {
          const addresses = remainingRecipients.map(r => r.address.toLowerCase());
          const uniqueAddresses = new Set(addresses);

          if (uniqueAddresses.size === addresses.length) {
            setErrors(prev => ({ ...prev, revenueSplitTotal: undefined }));
          }
        }
      }
      validateAllFields();
    }, 0);
  };

  const updateRecipientPercentage = (index: number, percentage: number) => {
    if (percentage <= 0 || percentage > 100) return;

    const recipient = settings.recipients[index];
    if (!recipient) return;

    const currentTotal = calculateTotalPercentage();
    const newTotal = currentTotal - recipient.percentage + percentage;
    const willExceedTotal = newTotal > 100;

    setErrors(prev => ({ ...prev, recipientPercentage: undefined }));

    const updatedRecipients = [...settings.recipients];
    updatedRecipients[index] = {
      ...recipient,
      percentage
    };

    setSettings(prev => ({
      ...prev,
      recipients: updatedRecipients
    }));

    if (willExceedTotal) {
      setErrors(prev => ({
        ...prev,
        revenueSplitTotal: `Total exceeds 100%. Current total: ${newTotal}%`
      }));
      setIsFormValid(false);
    } else {
      setTimeout(() => {
        validateAllFields();
      }, 0);
    }
  };

  const distributeEvenly = () => {
    const evenPercentage = Math.floor(100 / settings.recipients.length);
    const remainder = 100 - (evenPercentage * settings.recipients.length);

    const updatedRecipients = settings.recipients.map((recipient, index) => {
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

    setTimeout(() => {
      validateAllFields();
    }, 0);
  };

  useEffect(() => {
    if (distributeEvenlyEnabled && settings.recipients.length >= 1) {
      distributeEvenly();
    }
  }, [distributeEvenlyEnabled, settings.recipients.length]);

  const handleSubmitButtonClick = () => {
    handleAddRecipient();
  };

  const calculateTotalPercentage = () => {
    return settings.recipients.reduce((sum, recipient) => sum + recipient.percentage, 0);
  };

  const validateRevenueSplit = () => {
    if (!settings.isRevenueSplitEnabled || settings.recipients.length === 0) {
      setErrors(prev => ({ ...prev, revenueSplitTotal: undefined }));
      return true;
    }

    const addresses = settings.recipients.map(r => r.address.toLowerCase());
    const uniqueAddresses = new Set(addresses);
    if (uniqueAddresses.size !== addresses.length) {
      setErrors(prev => ({ ...prev, revenueSplitTotal: 'Duplicate recipient addresses found' }));
      setIsFormValid(false);
      return false;
    }

    const hasZeroPercentage = settings.recipients.some(r => r.percentage === 0);
    if (hasZeroPercentage) {
      setErrors(prev => ({ ...prev, revenueSplitTotal: 'All recipients must have a percentage greater than 0' }));
      setIsFormValid(false);
      return false;
    }

    const total = calculateTotalPercentage();
    if (total !== 100) {
      setErrors(prev => ({ ...prev, revenueSplitTotal: `Total must be 100%. Current total: ${total}%` }));
      setIsFormValid(false);
      return false;
    }

    setErrors(prev => ({ ...prev, revenueSplitTotal: undefined }));
    return true;
  };

  const validateRequiredFields = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach(key => {
      newErrors[key as keyof typeof newErrors] = undefined;
    });

    if (!settings.isCollectingEnabled) {
      setErrors(newErrors);
      setIsFormValid(true);
      return true;
    }

    if (settings.isChargeEnabled) {
      const priceValue = parseFloat(priceInput);
      if (priceInput === '' || isNaN(priceValue) || priceValue <= 0) {
        newErrors.price = 'Price must be greater than 0';
        isValid = false;
      }

      if (settings.isReferralRewardsEnabled) {
        if (referralPercent <= 0 || referralPercent > 100) {
          newErrors.referralPercent = 'Referral percentage must be between 1 and 100';
          isValid = false;
        }
      }

      if (settings.isRevenueSplitEnabled) {
        if (settings.recipients.length === 0) {
          newErrors.revenueSplitTotal = 'At least one recipient is required';
          isValid = false;
        } else {
          const addresses = settings.recipients.map(r => r.address.toLowerCase());
          const uniqueAddresses = new Set(addresses);
          if (uniqueAddresses.size !== addresses.length) {
            newErrors.revenueSplitTotal = 'Duplicate recipient addresses found';
            isValid = false;
          } else {
            const hasZeroPercentage = settings.recipients.some(r => r.percentage === 0);
            if (hasZeroPercentage) {
              newErrors.revenueSplitTotal = 'All recipients must have a percentage greater than 0';
              isValid = false;
            } else {
              const total = calculateTotalPercentage();
              if (total !== 100) {
                newErrors.revenueSplitTotal = `Total must be 100%. Current total: ${total}%`;
                isValid = false;
              }
            }
          }
        }
      }
    }

    if (settings.isLimitedEdition) {
      const limitValue = Number(collectLimitInput);
      if (collectLimitInput === '' || isNaN(limitValue) || limitValue < 1) {
        newErrors.collectLimit = 'Maximum collects must be at least 1';
        isValid = false;
      }
    }

    if (settings.isCollectExpiryEnabled) {
      const daysValue = Number(collectExpiryDaysInput);
      if (collectExpiryDaysInput === '' || isNaN(daysValue) || daysValue < 1) {
        newErrors.collectExpiryDays = 'Expiry days must be at least 1';
        isValid = false;
      }
    }

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const validateAllFields = () => {
    return validateRequiredFields();
  };

  const handlePublishWithValidation = () => {
    if (validateRequiredFields()) {
      handlePublish();
    }
  };

  const validatePrice = (value: string) => {
    if (value === '') {
      setErrors(prev => ({ ...prev, price: settings.isChargeEnabled ? 'Price is required' : undefined }));
      const isValid = !settings.isChargeEnabled;
      setIsFormValid(prevValid => isValid && prevValid);
      return !settings.isChargeEnabled;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setErrors(prev => ({ ...prev, price: 'Invalid number' }));
      setIsFormValid(false);
      return false;
    }

    if (numValue <= 0) {
      setErrors(prev => ({ ...prev, price: 'Price must be greater than 0' }));
      setIsFormValid(false);
      return false;
    }

    setErrors(prev => ({ ...prev, price: undefined }));
    return true;
  };

  const validateReferralPercentage = (value: string | number) => {
    if (value === '' || value === 0) {
      setErrors(prev => ({
        ...prev, referralPercent: settings.isReferralRewardsEnabled ?
          'Referral percentage is required' : undefined
      }));
      const isValid = !settings.isReferralRewardsEnabled;
      setIsFormValid(prevValid => isValid && prevValid);
      return !settings.isReferralRewardsEnabled;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      setErrors(prev => ({ ...prev, referralPercent: 'Invalid number' }));
      setIsFormValid(false);
      return false;
    }

    if (numValue < 1) {
      setErrors(prev => ({ ...prev, referralPercent: 'Percentage must be at least 1' }));
      setIsFormValid(false);
      return false;
    }

    if (numValue > 100) {
      setErrors(prev => ({ ...prev, referralPercent: 'Percentage cannot exceed 100' }));
      setIsFormValid(false);
      return false;
    }

    setErrors(prev => ({ ...prev, referralPercent: undefined }));
    return true;
  };

  const validateCollectLimit = (value: string) => {
    if (value === '') {
      setErrors(prev => ({
        ...prev, collectLimit: settings.isLimitedEdition ?
          'Maximum collects is required' : undefined
      }));
      const isValid = !settings.isLimitedEdition;
      setIsFormValid(prevValid => isValid && prevValid);
      return !settings.isLimitedEdition;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setErrors(prev => ({ ...prev, collectLimit: 'Invalid number' }));
      setIsFormValid(false);
      return false;
    }

    if (numValue < 1) {
      setErrors(prev => ({ ...prev, collectLimit: 'Value must be at least 1' }));
      setIsFormValid(false);
      return false;
    }

    setErrors(prev => ({ ...prev, collectLimit: undefined }));
    return true;
  };

  const validateCollectExpiryDays = (value: string) => {
    if (value === '') {
      setErrors(prev => ({
        ...prev, collectExpiryDays: settings.isCollectExpiryEnabled ?
          'Expiry days is required' : undefined
      }));
      const isValid = !settings.isCollectExpiryEnabled;
      setIsFormValid(prevValid => isValid && prevValid);
      return !settings.isCollectExpiryEnabled;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setErrors(prev => ({ ...prev, collectExpiryDays: 'Invalid number' }));
      setIsFormValid(false);
      return false;
    }

    if (numValue < 1) {
      setErrors(prev => ({ ...prev, collectExpiryDays: 'Value must be at least 1' }));
      setIsFormValid(false);
      return false;
    }

    const MAX_DAYS = 365 * 100;
    if (numValue > MAX_DAYS) {
      setErrors(prev => ({ ...prev, collectExpiryDays: `Value cannot exceed ${MAX_DAYS}` }));
      setIsFormValid(false);
      return false;
    }

    setErrors(prev => ({ ...prev, collectExpiryDays: undefined }));
    return true;
  };

  const validateRecipientPercentage = (value: string | number) => {
    if (value === '' || value === 0) {
      setErrors(prev => ({ ...prev, recipientPercentage: undefined }));
      return true;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      setErrors(prev => ({ ...prev, recipientPercentage: 'Invalid number' }));
      return false;
    }

    if (numValue < 1) {
      setErrors(prev => ({ ...prev, recipientPercentage: 'Percentage must be at least 1' }));
      return false;
    }

    if (numValue > 100) {
      setErrors(prev => ({ ...prev, recipientPercentage: 'Percentage cannot exceed 100' }));
      return false;
    }

    setErrors(prev => ({ ...prev, recipientPercentage: undefined }));
    return true;
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
                              step="0.01"
                              placeholder="0.00"
                              value={priceInput}
                              className={`pl-7 no-spinners ${errors.price ? 'border-destructive' : ''}`}
                              onChange={(e) => {
                                const value = e.target.value;
                                setPriceInput(value);

                                if (value === '') {
                                  setErrors(prev => ({ ...prev, price: undefined }));
                                  updateSetting('price', '');
                                } else {
                                  if (validatePrice(value)) {
                                    const numValue = parseFloat(value);
                                    updateSetting('price', numValue.toString());
                                  }
                                }
                              }}
                              onBlur={() => {
                                if (settings.isChargeEnabled && (priceInput === '' || parseFloat(priceInput) <= 0)) {
                                  validatePrice(priceInput);
                                }
                              }}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          </div>
                        </div>
                        {errors.price && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <AlertCircleIcon className="h-3 w-3" />
                            {errors.price}
                          </p>
                        )}
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
                                    placeholder="25"
                                    className={`pr-6 no-spinners ${errors.referralPercent ? 'border-destructive' : ''}`}
                                    value={referralPercent === 0 ? '' : referralPercent}
                                    onChange={(e) => {
                                      const value = e.target.value;

                                      if (value === '') {
                                        updateSetting('referralPercent', 0);
                                        setErrors(prev => ({ ...prev, referralPercent: undefined }));
                                      } else {
                                        const numValue = Number(value);
                                        if (!isNaN(numValue)) {
                                          updateSetting('referralPercent', numValue);
                                          validateReferralPercentage(numValue);
                                        }
                                      }
                                    }}
                                    onBlur={() => {
                                      if (settings.isReferralRewardsEnabled) {
                                        validateReferralPercentage(referralPercent);
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
                                    onValueChange={([value]) => {
                                      const roundedValue = Math.round(value || 25);
                                      updateSetting('referralPercent', roundedValue);
                                      validateReferralPercentage(roundedValue);
                                    }}
                                  />
                                </div>
                              </div>
                              {errors.referralPercent && (
                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                  <AlertCircleIcon className="h-3 w-3" />
                                  {errors.referralPercent}
                                </p>
                              )}
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
                                      <div className="relative w-16">
                                        <Input
                                          type="number"
                                          placeholder="1"
                                          className={`pr-6 no-spinners ${errors.recipientPercentage ? 'border-destructive' : ''
                                            }`}
                                          value={recipient.percentage === 0 ? '' : recipient.percentage}
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (value === '') {
                                              const tempRecipient = { ...recipient, percentage: 0 };
                                              const updatedRecipients = [...settings.recipients];
                                              updatedRecipients[index] = tempRecipient;

                                              setSettings(prev => ({
                                                ...prev,
                                                recipients: updatedRecipients
                                              }));

                                              validateRevenueSplit();
                                              return;
                                            }

                                            const numValue = Number(value);
                                            if (!isNaN(numValue)) {
                                              setDistributeEvenlyEnabled(false);
                                              updateRecipientPercentage(index, numValue);
                                              validateRecipientPercentage(numValue);
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

                                {errors.revenueSplitTotal && (
                                  <p className="text-xs text-destructive flex items-center gap-1 mt-2 animate-in slide-in-from-top-1">
                                    <AlertCircleIcon className="h-3 w-3" />
                                    {errors.revenueSplitTotal}
                                  </p>
                                )}
                              </div>
                            )}

                            {showAddRecipient ? (
                              <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                <div className="grid grid-cols-[auto,1fr] gap-3">
                                  <div className="relative w-16">
                                    <Label className="mb-2 block">Percent</Label>
                                    <Input
                                      type="number"
                                      placeholder="50"
                                      className={`pr-6 no-spinners ${errors.recipientPercentage ? 'border-destructive' : ''
                                        }`}
                                      value={newRecipientPercentage === 0 ? '' : newRecipientPercentage}
                                      onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === '') {
                                          setNewRecipientPercentage(0);
                                          setErrors(prev => ({ ...prev, recipientPercentage: undefined }));
                                        } else {
                                          const numValue = Number(value);
                                          if (!isNaN(numValue)) {
                                            setNewRecipientPercentage(numValue);
                                            validateRecipientPercentage(numValue);
                                          }
                                        }
                                      }}
                                      disabled={distributeEvenlyEnabled}
                                    />
                                    <span className="absolute right-3 top-[calc(50%_+_0.5rem)] -translate-y-1/2 text-muted-foreground">%</span>
                                    {errors.recipientPercentage && (
                                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircleIcon className="h-3 w-3" />
                                        {errors.recipientPercentage}
                                      </p>
                                    )}
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
                                    disabled={
                                      !newRecipientAddress ||
                                      newRecipientPercentage < 0 ||
                                      newRecipientPercentage > 100 ||
                                      !!errors.recipientPercentage
                                    }
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
                        placeholder="100"
                        className={`no-spinners ${errors.collectLimit ? 'border-destructive' : ''}`}
                        value={collectLimitInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCollectLimitInput(value);

                          if (value === '') {
                            setErrors(prev => ({ ...prev, collectLimit: undefined }));
                            updateSetting('collectLimit', '');
                          } else {
                            if (validateCollectLimit(value)) {
                              const numValue = Number(value);
                              updateSetting('collectLimit', numValue.toString());
                            }
                          }
                        }}
                        onBlur={() => {
                          if (settings.isLimitedEdition) {
                            validateCollectLimit(collectLimitInput);
                          }
                        }}
                      />
                      {errors.collectLimit && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircleIcon className="h-3 w-3" />
                          {errors.collectLimit}
                        </p>
                      )}
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
                            placeholder="7"
                            className={`pr-12 no-spinners ${errors.collectExpiryDays ? 'border-destructive' : ''}`}
                            value={collectExpiryDaysInput}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCollectExpiryDaysInput(value);

                              if (value === '') {
                                setErrors(prev => ({ ...prev, collectExpiryDays: undefined }));
                                updateSetting('collectExpiryDays', 7);
                              } else {
                                if (validateCollectExpiryDays(value)) {
                                  const numValue = Number.parseInt(value);
                                  const date = new Date();
                                  date.setDate(date.getDate() + numValue);
                                  setSettings(prev => ({
                                    ...prev,
                                    collectExpiryDays: numValue,
                                    collectExpiryDate: date.toISOString()
                                  }));
                                }
                              }
                            }}
                            onBlur={() => {
                              if (settings.isCollectExpiryEnabled) {
                                validateCollectExpiryDays(collectExpiryDaysInput);
                              }
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">days</span>
                        </div>
                      </div>
                      {errors.collectExpiryDays && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircleIcon className="h-3 w-3" />
                          {errors.collectExpiryDays}
                        </p>
                      )}
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
        <Button
          onClick={handlePublishWithValidation}
          disabled={isPublishing || !isFormValid}
        >
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}; 