'use client';

import { addComment, listenToComments } from '@/app/lib/comments';
import { auth } from '@/app/util/firebase-client';
import { Comment } from '@/app/types/Ticket';
import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react';

interface Props {
  ticketId: string,
  isOpen: boolean,
  onClose: () => void,
  role: 'user' | 'it';
}

const CommentModal = ({ ticketId, isOpen, onClose, role }: Props) => {
  const user = auth.currentUser;

  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  //Real-time comments
  useEffect(() => {
    if(!ticketId || !isOpen) return

    const unsub = listenToComments(ticketId, (data) => {
      setComments(data as Comment[]);
    });

    return () => unsub();
  }, [ticketId, isOpen]);

  const handleSend = async () => {
    if(!user || !text.trim()) return;

    setLoading(true);

    try {
      await addComment(
        ticketId,
        text,
        user,
        role,
        role === 'it' ? 'public' : 'public'
      );

      setText('');
    } catch (err) {
      console.error("COMMENT ERROR: ", err);
    } finally {
      setLoading(false);
    }
  };

  if(!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">Ticket Comments</h2>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-white cursor-pointer" />
          </button>
        </div>

        {/* Comments */}
        <div className="flex-1 max-h-[100] overflow-y-auto px-5 py-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            comments.map((c) => {
              const isUser = c.role === 'user';

              return (
                <div
                  key={c.id}
                  className={`flex flex-col ${
                    isUser ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-sm max-w-[75%]
                      ${
                        isUser
                          ? 'bg-gray-700 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                  >
                    {c.text}
                  </div>

                  <span className="text-[10px] text-gray-500 mt-1">
                    {c.userName}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 p-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg outline-none"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default CommentModal