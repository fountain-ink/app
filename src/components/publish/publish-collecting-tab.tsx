import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";

import {
  PlusIcon,
  SearchIcon,
  XIcon,
  FileTextIcon,
  CreditCardIcon,
  MegaphoneIcon,
  ChartPie,
  CircleFadingPlus,
  ClockFadingIcon,
  User2Icon,
  AlertCircleIcon
} from "lucide-react";
import { ShoppingBag as ShoppingBagSvg } from "../icons/custom-icons";

import { usePublishDraft } from "../../hooks/use-publish-draft";
import { CollectingSettings } from "../draft/draft";
import { isValidEthereumAddress } from "@/lib/utils";
import { toast } from "sonner";
import { MentionableUser } from "../user/user-search";
import { UserSearchList } from "../user/user-search-list";
import { EvmAddress } from "../misc/evm-address";
import { UserLazyUsername } from "../user/user-lazy-username";

export const collectingFormSchema = z.object({
  isCollectingEnabled: z.boolean().default(false),
  collectingLicense: z.string().min(1, { message: "License is required" }).default("CC BY-NC 4.0"),

  isChargeEnabled: z.boolean().default(false),
  price: z.string().default("")
    .refine(val => {
      if (val === "") return true;
      const num = Number(val);
      return !isNaN(num);
    }, { message: "Please enter a valid number" })
    .transform(val => val === "" ? 0 : Number(val)),
  currency: z.string().min(1, { message: "Currency is required" }).default("GHO"),

  isReferralRewardsEnabled: z.boolean().default(false),
  referralPercent: z.number()
    .default(25),

  isRevenueSplitEnabled: z.boolean().default(false),
  recipients: z.array(
    z.object({
      address: z.string().min(1, { message: "Address is required" })
        .refine(addr => isValidEthereumAddress(addr), {
          message: "Must be a valid Ethereum address"
        }),
      percentage: z.number()
        .min(0.01, { message: "Minimum percentage is 0.01%" })
        .max(100, { message: "Maximum percentage is 100%" }),
      username: z.string().optional().nullable(),
      picture: z.string().optional().nullable(),
    })
  ).default([])
  ,

  isLimitedEdition: z.boolean().default(false),
  collectLimit: z.preprocess(
    val => (val === "" || val == null) ? undefined : Number(val),
    z.number().int().positive("Collect limit must be a positive number").optional()
  ),

  isCollectExpiryEnabled: z.boolean().default(false),
  collectExpiryDays: z.preprocess(
    val => (val === "" || val == null) ? undefined : Number(val),
    z.number().positive("Expiry days must be a positive number").optional()
  )
}).superRefine((data, ctx) => {

  if (data.isChargeEnabled) {
    const priceNum = typeof data.price === "string" ? (data.price === "" ? 0 : Number(data.price)) : data.price;

    if (priceNum <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be greater than 0",
        path: ["price"],
      });
    }

    if (!data.currency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Currency is required",
        path: ["currency"],
      });
    }

    if (data.isReferralRewardsEnabled) {
      if (data.referralPercent < 1 || data.referralPercent > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Referral percent must be between 1% and 100%",
          path: ["referralPercent"],
        });
      }
    }

    if (data.isRevenueSplitEnabled) {
      if (data.recipients.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one recipient is required",
          path: ["recipients"],
        });
      } else {
        const addresses = data.recipients.map(r => r.address.toLowerCase());
        const uniqueAddresses = new Set(addresses);
        if (uniqueAddresses.size !== addresses.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recipient addresses must be unique",
            path: ["recipients"],
          });
        }

        const totalPercentage = data.recipients.reduce((sum, r) => sum + r.percentage, 0);
        if (Math.abs(totalPercentage - 100) >= 0.1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Total percentage must equal 100% (current: ${totalPercentage.toFixed(2)}%)`,
            path: ["recipients"],
          });
        }
      }
    }
  }

  if (data.isLimitedEdition) {
    if (data.collectLimit === undefined || data.collectLimit < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Collect limit must be at least 1",
        path: ["collectLimit"],
      });
    }
  }

  if (data.isCollectExpiryEnabled) {
    if (data.collectExpiryDays === undefined || data.collectExpiryDays < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiry days must be at least 1",
        path: ["collectExpiryDays"],
      });
    } else if (data.collectExpiryDays > 36500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum expiry is 36500 days (100 years)",
        path: ["collectExpiryDays"],
      });
    }
  }
});

export type CollectingFormValues = z.infer<typeof collectingFormSchema>;

type RecipientEntry = {
  address: string;
  percentage: number;
  username?: string | null;
  picture?: string | null;
};

interface CollectingTabProps {
  isPublishing: boolean;
  handlePublish: () => void;
  documentId?: string;
}

export const CollectingTab = ({
  isPublishing,
  handlePublish,
  documentId
}: CollectingTabProps): JSX.Element => {
  const { getDraft, updateDraft } = usePublishDraft(documentId);
  const [distributeEvenlyEnabled, setDistributeEvenlyEnabled] = useState(false);
  const [newRecipientAddress, setNewRecipientAddress] = useState("");
  const [newRecipientPercentage, setNewRecipientPercentage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MentionableUser | null>(null);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CollectingFormValues>({
    resolver: zodResolver(collectingFormSchema),
    mode: "onChange",
    defaultValues: getDraft()?.collectingSettings || {
      isCollectingEnabled: false,
      collectingLicense: "CC BY-NC 4.0",
      isChargeEnabled: false,
      price: 1,
      currency: "GHO",
      isReferralRewardsEnabled: false,
      referralPercent: 25,
      isRevenueSplitEnabled: false,
      recipients: [],
      isLimitedEdition: false,
      collectLimit: 100,
      isCollectExpiryEnabled: false,
      collectExpiryDays: 7,
    }
  });

  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid }
  } = form;

  const values = watch();

  const isCollectingEnabled = values.isCollectingEnabled;
  const isChargeEnabled = values.isChargeEnabled;
  const isReferralRewardsEnabled = values.isReferralRewardsEnabled;
  const isRevenueSplitEnabled = values.isRevenueSplitEnabled;
  const isLimitedEdition = values.isLimitedEdition;
  const isCollectExpiryEnabled = values.isCollectExpiryEnabled;
  const recipients = values.recipients;

  useEffect(() => {
    if (documentId) {
      const collectingSettings: CollectingSettings = {
        isCollectingEnabled: values.isCollectingEnabled,
        collectingLicense: values.collectingLicense,
        isChargeEnabled: values.isChargeEnabled,
        price: values.price,
        currency: values.currency,
        isReferralRewardsEnabled: values.isReferralRewardsEnabled,
        referralPercent: values.referralPercent,
        isRevenueSplitEnabled: values.isRevenueSplitEnabled,
        recipients: values.recipients,
        isLimitedEdition: values.isLimitedEdition,
        collectLimit: values.collectLimit ?? 0,
        isCollectExpiryEnabled: values.isCollectExpiryEnabled,
        collectExpiryDays: values.collectExpiryDays ?? 0,
      };

      updateDraft({ collectingSettings });
    }
  }, [updateDraft, documentId, JSON.stringify(values)]);

  useEffect(() => {
    form.trigger();
  }, [form, documentId]);

  const roundPercentage = (value: number): number => {
    return Math.round(value * 100) / 100;
  };

  const validateRecipientsTotal = (updatedRecipients: z.infer<typeof collectingFormSchema>["recipients"]) => {
    if (isRevenueSplitEnabled && updatedRecipients.length > 0) {
      const totalPercentage = updatedRecipients.reduce((sum, r) => sum + r.percentage, 0);
      const isValid = Math.abs(totalPercentage - 100) < 0.1;

      form.trigger("recipients").catch(console.error);

      return {
        isValid,
        total: roundPercentage(totalPercentage)
      };
    }

    return { isValid: true, total: 0 };
  };

  const handleAddRecipient = (userToAdd?: MentionableUser) => {
    const address = userToAdd ? userToAdd.key : newRecipientAddress;

    if (!address || newRecipientPercentage <= 0 || newRecipientPercentage > 100) {
      return;
    }

    const isDuplicate = recipients.some(recipient =>
      recipient.address.toLowerCase() === address.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Recipient already added", {
        description: "This address or user is already in the split list."
      });
      return;
    }

    const roundedPercentage = roundPercentage(newRecipientPercentage);

    const newRecipient: RecipientEntry = {
      address,
      percentage: roundedPercentage,
    };

    if (userToAdd || selectedUser) {
      const selectedOne = userToAdd || selectedUser;
      if (selectedOne) {
        newRecipient.username = selectedOne.username;
        newRecipient.picture = selectedOne.picture;
      }
    }

    let updatedRecipients: RecipientEntry[];

    if (distributeEvenlyEnabled) {
      updatedRecipients = [...recipients, newRecipient];

      const evenPercentage = Math.floor((100 / updatedRecipients.length) * 100) / 100;
      const remainder = roundPercentage(100 - (evenPercentage * (updatedRecipients.length - 1)));

      updatedRecipients = updatedRecipients.map((recipient, index) => ({
        ...recipient,
        percentage: index === 0 ? remainder : evenPercentage
      }));
    } else {
      updatedRecipients = [...recipients, newRecipient];
    }

    setValue("recipients", updatedRecipients);

    validateRecipientsTotal(updatedRecipients);

    setNewRecipientAddress("");
    setNewRecipientPercentage(50);
    setSelectedUser(null);
    setIsSearchOpen(false);
    setShowAddRecipient(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveRecipient = (index: number) => {
    const updatedRecipients = [...recipients];
    updatedRecipients.splice(index, 1);

    if (distributeEvenlyEnabled && updatedRecipients.length > 0) {
      const evenPercentage = Math.floor((100 / updatedRecipients.length) * 100) / 100;
      const remainder = roundPercentage(100 - (evenPercentage * (updatedRecipients.length - 1)));

      const redistributedRecipients = updatedRecipients.map((recipient, idx) => ({
        ...recipient,
        percentage: idx === 0 ? remainder : evenPercentage
      }));

      setValue("recipients", redistributedRecipients);

      validateRecipientsTotal(redistributedRecipients);
    } else {
      setValue("recipients", updatedRecipients);

      validateRecipientsTotal(updatedRecipients);
    }
  };

  const updateRecipientPercentage = (index: number, percentage: number) => {
    if (percentage < 0 || percentage > 100) return;

    if (distributeEvenlyEnabled) {
      setDistributeEvenlyEnabled(false);
    }

    const updatedRecipients = [...recipients];
    if (!updatedRecipients[index]) return;

    const roundedPercentage = roundPercentage(percentage);

    updatedRecipients[index] = {
      ...updatedRecipients[index],
      address: updatedRecipients[index].address,
      percentage: roundedPercentage
    };

    setValue("recipients", updatedRecipients);

    validateRecipientsTotal(updatedRecipients);
  };

  const distributeEvenly = () => {
    if (recipients.length === 0) return;

    const evenPercentage = Math.floor((100 / recipients.length) * 100) / 100;
    const remainder = roundPercentage(100 - (evenPercentage * (recipients.length - 1)));

    const updatedRecipients = recipients.map((recipient, index) => ({
      ...recipient,
      percentage: index === 0 ? remainder : evenPercentage
    }));

    setValue("recipients", updatedRecipients);

    validateRecipientsTotal(updatedRecipients);
  };

  useEffect(() => {
    if (distributeEvenlyEnabled && recipients.length >= 1) {
      distributeEvenly();
    }
  }, [distributeEvenlyEnabled, recipients.length]);

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

  const onPublish = React.useCallback(async () => {
    if (!isValid) {
      toast.error("Please fix the form errors before publishing", {
        description: "Review the highlighted sections and correct any issues."
      });
      console.log("Form Errors:", errors);
      return;
    }

    handlePublish();
  }, [handlePublish, getValues, form, isValid, errors, updateDraft]);

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <form className="space-y-6 p-1">
              <div className="border rounded-lg p-4 space-y-4 bg-background/30">

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Collecting</h3>
                    <p className="text-sm text-muted-foreground">
                      Let readers collect your post. You can set a license for the piece,
                      and decide if you want to charge for the collect.
                    </p>
                  </div>
                  <FormField
                    control={control}
                    name="isCollectingEnabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {isCollectingEnabled && (
                  <div className="space-y-6 pt-4 border-t border-border/50">

                    <div className="space-y-4">
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
                      <FormField
                        control={control}
                        name="collectingLicense"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className={`w-full ${errors.collectingLicense ? "border-destructive" : ""}`}>
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
                            </FormControl>
                            {isCollectingEnabled && <FormMessage />}
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4 border-t pt-6 border-border/50">
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
                        <FormField
                          control={control}
                          name="isChargeEnabled"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (!checked) {
                                      form.clearErrors(["price", "currency", "referralPercent", "recipients"]);
                                    } else {
                                      form.trigger();
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {isChargeEnabled && (
                        <div className="space-y-6 pt-2">
                          <FormField
                            control={control}
                            name="price"
                            render={({ field, fieldState }) => (
                              <FormItem className={`space-y-2 ${(errors.price || errors.currency) ? 'bg-destructive/5 rounded-sm p-2 -m-2' : ''}`}>
                                <FormLabel>Price</FormLabel>
                                <div className="flex items-center">
                                  <div className="relative w-full">
                                    <FormControl>
                                      <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        className={`pl-7 max-w-xs ${fieldState.error ? "border-destructive" : ""}`}
                                        value={field.value}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                            field.onChange(value);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                  </div>
                                </div>
                                {isChargeEnabled && <FormMessage />}
                              </FormItem>
                            )}
                          />

                          <div className={`border-t pt-4 mt-4 border-border ${isReferralRewardsEnabled && errors.referralPercent ? 'bg-destructive/5 rounded-sm p-2 -m-2' : ''}`}>
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
                              <FormField
                                control={control}
                                name="isReferralRewardsEnabled"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                          field.onChange(checked);
                                          if (!checked) {
                                            form.clearErrors("referralPercent");
                                          } else {
                                            form.trigger("referralPercent");
                                          }
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {isReferralRewardsEnabled && (
                              <div className="space-y-4 pt-2">
                                <FormField
                                  control={control}
                                  name="referralPercent"
                                  render={({ field, fieldState }) => (
                                    <FormItem className="space-y-2">
                                      <div className="flex items-center gap-4 pt-4">
                                        <div className="relative w-16">
                                          <FormControl>
                                            <Input
                                              type="number"
                                              placeholder="25"
                                              className={`pr-6 no-spinners ${fieldState.error ? "border-destructive" : ""}`}
                                              value={field.value === 0 ? "" : field.value}
                                              onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === "" ? 0 : Number(value));
                                              }}
                                            />
                                          </FormControl>
                                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                        </div>
                                        <div className="flex-1">
                                          <FormControl>
                                            <Slider
                                              value={[field.value]}
                                              min={1}
                                              max={100}
                                              step={1}
                                              onValueChange={([value]) => {
                                                field.onChange(Math.round(value || 25));
                                              }}
                                            />
                                          </FormControl>
                                        </div>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          <div className={`border-t pt-4 mt-4 border-border ${isRevenueSplitEnabled && errors.recipients ? 'bg-destructive/5 rounded-sm p-2 -m-2' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <ChartPie className="h-4 w-4 text-muted-foreground" />
                                  <h4 className="font-medium">Revenue split</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">Share your collect revenue with others</p>
                              </div>
                              <FormField
                                control={control}
                                name="isRevenueSplitEnabled"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                          field.onChange(checked);
                                          if (!checked) {
                                            form.clearErrors("recipients");
                                          } else {
                                            form.trigger("recipients");
                                          }
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {isRevenueSplitEnabled && (
                              <div className="space-y-4 pt-2">
                                <FormField
                                  control={control}
                                  name="recipients"
                                  render={({ field, fieldState }) => (
                                    <FormItem className="space-y-2">
                                      {recipients.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                              <Checkbox
                                                id="distribute-evenly"
                                                checked={distributeEvenlyEnabled}
                                                onCheckedChange={(checked) => {
                                                  setDistributeEvenlyEnabled(checked as boolean);
                                                }}
                                              />
                                              <Label htmlFor="distribute-evenly" className="cursor-pointer text-sm">
                                                Distribute evenly
                                              </Label>
                                            </div>

                                          </div>

                                          {recipients.map((recipient, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="relative min-w-16 w-20">
                                                  <Input
                                                    type="number"
                                                    min="0.01"
                                                    max="100"
                                                    placeholder="1"
                                                    className="pr-6 no-spinners"
                                                    value={recipient.percentage === 0 ? "" : recipient.percentage}
                                                    onChange={(e) => {
                                                      const value = e.target.value;
                                                      const numValue = value === '' ? 0 : Number(value);
                                                      updateRecipientPercentage(index, numValue);
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
                                                <span className="text-sm flex items-center gap-1 truncate flex-1 min-w-0">
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
                                          <div className="flex flex-wrap gap-3 items-end">
                                            <div className="relative min-w-16 w-20">
                                              <Label className="mb-2 block">Percent</Label>
                                              <Input
                                                type="number"
                                                min="0.01"
                                                max="100"
                                                placeholder="50"
                                                className="pr-6 no-spinners"
                                                value={newRecipientPercentage === 0 ? "" : newRecipientPercentage}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  setNewRecipientPercentage(value === '' ? 0 : Number(value));
                                                }}
                                                disabled={distributeEvenlyEnabled}
                                              />
                                              <span className="absolute right-3 top-[calc(50%_+_0.5rem)] -translate-y-1/2 text-muted-foreground">%</span>
                                            </div>
                                            <div className="flex-1 min-w-[200px]">
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
                                              onClick={() => {
                                                setShowAddRecipient(false);
                                                form.trigger("recipients").catch(console.error);
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              variant="default"
                                              size="sm"
                                              onClick={() => handleAddRecipient()}
                                              disabled={
                                                !newRecipientAddress ||
                                                newRecipientPercentage < 0 ||
                                                newRecipientPercentage > 100 ||
                                                (recipients.reduce((sum, r) => sum + r.percentage, 0) + newRecipientPercentage > 100 && !distributeEvenlyEnabled)
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

                                      {fieldState.error && (
                                        <div className="text-sm font-medium text-destructive mt-2 flex items-center gap-1">
                                          <AlertCircleIcon className="h-4 w-4" />
                                          {fieldState.error.message}
                                        </div>
                                      )}
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`space-y-4 border-t pt-6 border-border/50 ${isLimitedEdition && errors.collectLimit ? 'bg-destructive/5 rounded-sm p-2 -m-2' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CircleFadingPlus className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-medium">Limited edition</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">Only allow a certain number of collects</p>
                        </div>
                        <FormField
                          control={control}
                          name="isLimitedEdition"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {isLimitedEdition && (
                        <FormField
                          control={control}
                          name="collectLimit"
                          render={({ field, fieldState }) => (
                            <FormItem className="space-y-2 max-w-[200px] pt-2">
                              <FormLabel>Maximum collects</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  className={`no-spinners ${fieldState.error ? "border-destructive" : ""}`}
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^[0-9]+$/.test(value)) {
                                      field.onChange(value);
                                    }
                                  }}
                                />
                              </FormControl>
                              {isLimitedEdition && <FormMessage />}
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className={`space-y-4 border-t pt-6 border-border/50 ${isCollectExpiryEnabled && errors.collectExpiryDays ? 'bg-destructive/5 rounded-sm p-2 -m-2' : ''}`}>
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
                        <FormField
                          control={control}
                          name="isCollectExpiryEnabled"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {isCollectExpiryEnabled && (
                        <FormField
                          control={control}
                          name="collectExpiryDays"
                          render={({ field, fieldState }) => (
                            <FormItem className="space-y-2 pt-2">
                              <div className="flex items-center gap-2">
                                <div className="relative w-full max-w-[120px]">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="7"
                                      className={`pr-12 no-spinners ${fieldState.error ? "border-destructive" : ""}`}
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^[0-9]+$/.test(value)) {
                                          field.onChange(value);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">days</span>
                                </div>
                              </div>
                              {isCollectExpiryEnabled && <FormMessage />}
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!isCollectingEnabled && (
                <div className="flex justify-center items-center py-6 text-muted-foreground">
                  <span className="w-12 h-12 opacity-30">
                    <ShoppingBagSvg />
                  </span>
                  <span className="ml-4 text-sm">Enable collecting to set options</span>
                </div>
              )}
            </form>
          </ScrollArea>

          <div className="flex items-center gap-2 p-2 mt-auto">
            <Button
              onClick={onPublish}
              disabled={isPublishing || !isValid}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CollectingTab; 