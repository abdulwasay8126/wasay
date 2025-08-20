import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';

export const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow ${isUser ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
        <div>{message.text}</div>
        <div className={`mt-1 text-[10px] ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(message.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

