/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for math rendering

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const onSubmit = async (data) => {
    const userMessage = { role: 'user', parts: [{ text: data.message }] };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    reset();
    setIsLoading(true);

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode
      });

      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: response.data.message }]
      }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "Sorry, I couldn't process that. Please try again." }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-base-100 rounded-lg border border-base-300 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-base-200 px-4 py-3 border-b border-base-300 flex items-center gap-2">
        <Bot size={20} className="text-primary" />
        <h2 className="font-semibold text-sm">AI Tutor</h2>
        <span className="text-xs text-base-content/50 ml-auto">Powered by Gemini</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-base-content/40 gap-3">
            <Bot size={48} className="opacity-50" />
            <p className="text-sm max-w-sm">
              Hi! I'm your AI tutor. I won't write the full code for you, but I'll guide you through the logic, help debug, and explain the concepts.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUser ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content'
              }`}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] rounded-lg p-4 text-sm ${
                isUser 
                  ? 'bg-primary text-primary-content rounded-tr-none' 
                  : 'bg-base-200 rounded-tl-none'
              }`}>
                {isUser ? (
                  msg.parts[0].text
                ) : (
                  /* Render Markdown for AI messages */
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-pre:bg-base-300 prose-pre:text-base-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        // Custom styling for inline code
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline ? (
                            <div className="rounded-md overflow-hidden my-2 border border-base-300">
                              <div className="bg-base-300 px-3 py-1 text-xs text-base-content/60 font-mono border-b border-base-300">
                                {match ? match[1] : 'code'}
                              </div>
                              <pre className="p-3 text-xs overflow-x-auto bg-base-300/50 m-0">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          ) : (
                            <code className="bg-base-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {msg.parts[0].text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-base-200 rounded-lg rounded-tl-none p-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-base-content/50" />
              <span className="text-sm text-base-content/50">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-base-100 border-t border-base-300">
        <div className="flex gap-2">
          <input
            placeholder="Ask for a hint, debug help, or explanation..."
            className="input input-bordered flex-1 focus:outline-none focus:border-primary text-sm"
            autoComplete="off"
            {...register("message", { required: true, minLength: 2 })}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary btn-square"
            disabled={isLoading || errors.message}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;