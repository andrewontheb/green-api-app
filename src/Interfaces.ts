export interface IProps {
    creds: IFormData;
    apiUrl: string;
};

export interface IMessage {
    text: string;
    time: string;
    isOwn: boolean;
}

export interface IFormData {
    instanceId: string;
    apiToken: string;
    phone: string;
    isLoggedIn: boolean;
};

export type ReceieveNotificationResponse = {
    receiptId: number;
    body: {
        typeWebhook: string;
        instanceData: {
            idInstance: number;
            wid: string;
            typeInstance: string;
        };
        timestamp: number;
        idMessage: string;
        senderData: {
            chatId: string;
            sender: string;
            senderName: string;
            senderContactName: string;
        };
        messageData: {
            typeMessage: string;
            textMessageData: {
                textMessage: string;
            };
        };
    };
} | null;
