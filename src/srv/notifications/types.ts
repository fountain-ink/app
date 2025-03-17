export enum SNSMessageType {
  SubscriptionConfirmation = 'SubscriptionConfirmation',
  Notification = 'Notification',
  UnsubscribeConfirmation = 'UnsubscribeConfirmation',
}

export interface SNSBaseMessage {
  Type: SNSMessageType;
  MessageId: string;
  TopicArn: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
}

export interface SNSSubscriptionConfirmation extends SNSBaseMessage {
  Type: SNSMessageType.SubscriptionConfirmation;
  Token: string;
  Message: string;
  SubscribeURL: string;
}

export interface SNSUnsubscribeConfirmation extends SNSBaseMessage {
  Type: SNSMessageType.UnsubscribeConfirmation;
  Token: string;
  Message: string;
  SubscribeURL: string;
}

export interface SNSNotification extends SNSBaseMessage {
  Type: SNSMessageType.Notification;
  Message: string;
  Subject?: string;
  UnsubscribeURL: string;
}

export interface PostCreatedNotification {
  post_id: string;
  parent_post?: string;
  post_types?: string[];
  author: string;
  feed: string;
  app?: string;
  timestamp: string;
  metadata?: string;
}

export type SNSMessage = SNSSubscriptionConfirmation | SNSUnsubscribeConfirmation | SNSNotification;

export interface ListmonkCampaignResponse {
  data: {
    id: number;
    created_at: string;
    updated_at: string;
    views: number;
    clicks: number;
    bounces: number;
    lists: Array<{
      id: number;
      name: string;
    }>;
    started_at: string | null;
    to_send: number;
    sent: number;
    uuid: string;
    type: string;
    name: string;
    subject: string;
    from_email: string;
    body: string;
    altbody: string | null;
    send_at: string | null;
    status: string;
    content_type: string;
    tags: string[];
    template_id: number;
    messenger: string;
  };
}

export interface BlogRecord {
  id: number;
  handle: string;
  display_name?: string;
  mail_list_id?: number;
  lens_group_address?: string;
} 