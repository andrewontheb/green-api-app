import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchWithExponentialBackoff } from '../Utils';
import { ReceieveNotificationResponse } from '../Interfaces'

/**
 * Custom hook to poll for notifications from a specified API and update the state with the latest response.
 *
 * @param {string} apiUrl - The base URL of the API.
 * @param {string} instanceId - The instance ID to be used in the API endpoint.
 * @param {string} apiToken - The API token for authentication.
 * @param {string} chatId - The chat ID to filter incoming messages.
 * @returns {ReceieveNotificationResponse | null} - The latest notification response or null if no response is received.
 */
export function useNotification(apiUrl: string, instanceId: string, apiToken: string, chatId: string) {
    const [lastResponse, setLastResponse] = useState<ReceieveNotificationResponse>(null);
    const isMountedRef = useRef(true);

    const pollNotifications = useCallback(
        async function pollNotifications() {
            try {
                const response = await fetchWithExponentialBackoff(`${apiUrl}/waInstance${instanceId}/receiveNotification/${apiToken}?receiveTimeout=15`);
                const data: ReceieveNotificationResponse = await response.json();
                if (data !== null) {
                    if (isMountedRef.current && data?.body.typeWebhook === 'incomingMessageReceived' && chatId === data.body.senderData.chatId) {
                        setLastResponse(data);
                    }
                    await fetchWithExponentialBackoff(`${apiUrl}/waInstance${instanceId}/deleteNotification/${apiToken}/${data.receiptId}`, {
                        method: 'DELETE'
                    });
                }

            } catch (error) {
                console.error('Poll error:', error);
            }

            if (isMountedRef.current) {
                pollNotifications();
            }
        }, [apiUrl, apiToken, instanceId, chatId]
    );

    useEffect(() => {
        isMountedRef.current = true;
        pollNotifications();
        return () => {
            isMountedRef.current = false;
        };
    }, [apiUrl, apiToken, instanceId, pollNotifications]);

    return useMemo(() => lastResponse, [lastResponse]);
}
