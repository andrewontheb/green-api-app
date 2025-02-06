import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNotification } from '../hooks/useNotification';
import { IProps, IMessage } from '../Interfaces';
import { formatPhoneNumber, getCurrentTime, fetchWithExponentialBackoff, validateEmptySpaces } from '../Utils';
import classNames from 'classnames';

export function Chat({ creds, apiUrl }: IProps): React.ReactElement<IProps> {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        console.log('message', error);
        if (!message || !validateEmptySpaces(message)) {
            return;
        }
        const chatId: string = `${creds.phone}@c.us`
        const reqBody: object = {
            chatId,
            message
        };
        setIsLoading(true);
        try {
            const response = await fetchWithExponentialBackoff(`${apiUrl}/waInstance${creds.instanceId}/sendMessage/${creds.apiToken}`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(reqBody),
                }
            )
            const data = await response.json();
            if (data && data.idMessage) {
                setMessages([...messages, { text: message, isOwn: true, time: getCurrentTime() }]);
                setMessage('');
                setIsLoading(false);
            }
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const notification = useNotification(apiUrl, creds.instanceId, creds.apiToken, `${creds.phone}@c.us`);
    useEffect(() => {
        if (notification) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: notification.body.messageData.textMessageData.textMessage, isOwn: false, time: getCurrentTime() }
            ]);
        }
    }, [notification]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    return (
        <div className='fade-in-out flex flex-col min-h-[550px]  max-h-[550px] overflow-scroll bg-gray-100 rounded-lg relative'>
            <div className='bg-green-500 text-white py-3 px-4 font-bold text-lg flex items-center rounded-t-lg sticky shadow-[0px_10px_15px_rgba(255,255,255,0.5)] z-10'>
                Chat with: {formatPhoneNumber(creds.phone)}
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-4' ref={containerRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex message-fade-in ${message.isOwn ? 'justify-end' : 'justify-start'
                            }`}>
                        <div className={`max-w-xs text-left relative pl-4 pr-12 pb-[15px] rounded-lg break-words text-wrap ${message.isOwn
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-black'
                            }`}>
                            {message.text}
                            <span className='text-xs text-gray-500 absolute bottom-[2px] right-[5px]'>{message.time}</span>
                        </div>
                    </div>
                ))}
            </div>
            <form className='flex items-center p-4 bg-gray-100 border-t rounded-b-lg' onSubmit={sendMessage}>
                <input
                    type='text'
                    placeholder='Type a message...'
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='flex-1 bg-white text-black border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-green-300'
                />
                <button
                    disabled={isLoading || !message}
                    className={classNames(`ml-2 flex bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 min-w-[145px]`, { 'cursor-not-allowed pointer-events-none': isLoading })}>
                    {isLoading ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
};

export default Chat;