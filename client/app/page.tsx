"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EVENT_COUNTDOWN_END,
  EVENT_COUNTDOWN_START,
  EVENT_DEADLINE_ENDING,
  EVENT_DEADLINE_REMAINING,
  ONE_SECOND_IN_MS,
  useCountdown,
} from "./useCountdown";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMicVAD, utils } from "@ricky0123/vad-react";

interface EventLogEntry {
  id: string;
  label: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  content?: string;
  audioUrl?: string;
  createdAt: string;
}

const SAMPLE_RATE = 16000;
const VAD_ASSET_PATH = "/vad-web/"; // https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/
const ORT_ASSET_PATH = "/ort-wasm/"; // https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: crypto.randomUUID(),
      sender: "ai",
      content: "Chào bạn! Nhấn Start để bắt đầu trò chuyện bằng giọng nói.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [chatStarted, setChatStarted] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const audioUrlsRef = useRef<Set<string>>(new Set());

  const countdown = useCountdown({
    milestoneEvents: [
      { name: EVENT_DEADLINE_ENDING, remainingInMs: 10 * ONE_SECOND_IN_MS }, // 10 seconds remaining
      { name: EVENT_DEADLINE_REMAINING, remainingInMs: 30 * ONE_SECOND_IN_MS }, // 30 seconds remaining
    ],
    onEvent: (eventName, remainingInMs) => {
      if (eventName === EVENT_DEADLINE_REMAINING) {
        return;
      }
      if (eventName === EVENT_DEADLINE_ENDING) {
        return;
      }
      if (eventName === EVENT_COUNTDOWN_START) {
        return;
      }
      if (eventName === EVENT_COUNTDOWN_END) {
        return;
      }
    },
  });

  const vad = useMicVAD({
    startOnLoad: false,
    model: "v5",
    baseAssetPath: VAD_ASSET_PATH,
    onnxWASMBasePath: ORT_ASSET_PATH,
    onSpeechStart: () => {},
    onSpeechRealStart: () => {},
    onSpeechEnd: async (audioSamples: Float32Array) => {
      const wavBuffer = utils.encodeWAV(audioSamples, 1, SAMPLE_RATE, 1, 16);
      const audioBlob = new Blob([wavBuffer], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlsRef.current.add(audioUrl);

      const timestamp = new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "user",
          audioUrl,
          createdAt: timestamp,
        },
        {
          id: crypto.randomUUID(),
          sender: "ai",
          content: "AI đang phân tích đoạn ghi âm của bạn...",
          createdAt: timestamp,
        },
      ]);
    },
    onVADMisfire: () => {},
  });

  const {
    formatted,
    minutes,
    seconds,
    isRunning,
    start: startCountdown,
    pause: pauseCountdown,
    reset: resetCountdown,
  } = countdown;

  const {
    start: startListening,
    pause: pauseListening,
    listening,
    userSpeaking,
    loading: vadLoading,
    errored,
  } = vad;

  const start = () => {
    startCountdown();
    setChatStarted(true);
    void startListening();
  };

  const pause = () => {
    pauseCountdown();
    setChatStarted(false);
    void pauseListening();
  };

  const reset = () => {
    resetCountdown();
    setChatStarted(false);
    void pauseListening();
  };

  useEffect(() => {
    const container = chatBodyRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioUrlsRef.current.clear();
    };
  }, []);

  return (
    <div className="container mx-auto max-w-2xl py-10 space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-6xl font-mono font-semibold">{formatted}</p>
            <p className="text-sm text-muted-foreground">
              Minutes: {minutes} / Seconds: {seconds}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {isRunning ? "Running" : "Paused"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={start} disabled={isRunning || vadLoading}>
              Start
            </Button>
            <Button onClick={pause} disabled={!isRunning}>
              Pause
            </Button>
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm flex items-center justify-between">
            <div>
              <p className="font-medium">Trạng thái micro</p>
              <p className="text-xs text-muted-foreground">
                {vadLoading
                  ? "Đang khởi động..."
                  : listening
                  ? "Mic đang lắng nghe"
                  : "Mic đang tắt"}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${
                userSpeaking
                  ? "text-emerald-600"
                  : chatStarted
                  ? "text-amber-600"
                  : "text-muted-foreground"
              }`}
            >
              {userSpeaking
                ? "Bạn đang nói"
                : chatStarted
                ? "Hãy bắt đầu nói"
                : "Nhấn Start"}
            </span>
          </div>
          {errored && (
            <p className="text-sm text-destructive">Micro gặp lỗi: {errored}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuộc trò chuyện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="h-96 overflow-y-auto space-y-4 pr-2"
            ref={chatBodyRef}
          >
            {messages.map((message) => {
              const isUser = message.sender === "user";
              const timeLabel = new Date(
                message.createdAt
              ).toLocaleTimeString();

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground ml-12"
                        : "bg-muted text-foreground mr-12"
                    }`}
                  >
                    {message.content && (
                      <p className="whitespace-pre-line">{message.content}</p>
                    )}
                    {message.audioUrl && (
                      <audio
                        controls
                        className={`mt-2 h-[24px] w-full ${
                          isUser ? "filter drop-shadow" : ""
                        }`}
                        src={message.audioUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    <p
                      className={`mt-2 text-[10px] ${
                        isUser
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {timeLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
