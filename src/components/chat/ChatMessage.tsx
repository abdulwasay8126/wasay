import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';

export const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'} mb-3 gap-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm">B</div>
      )}
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${isUser ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
        <div className="whitespace-pre-wrap">{message.text}</div>
        <div className={`mt-1 text-[10px] ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm">U</div>
      )}
    </div>
  );
};

