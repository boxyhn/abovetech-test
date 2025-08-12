"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { colors } from "@/config/theme";

interface ReportModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  sessionId,
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/chat/report/${sessionId}`);
        const data = await response.json();

        console.log(data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch report");
        }

        setReport(data.report);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && sessionId) {
      fetchReport();
    }
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl h-[70vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2
              className="text-xl font-bold"
              style={{ color: colors.zendiBlack }}
            >
              사주 분석 리포트
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">리포트를 불러오는 중...</div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-600 mb-2">
                    아직 리포트가 준비되지 않았어요!
                  </div>
                  <div className="text-sm text-gray-500">
                    사주 분석이 완료되면 리포트를 확인할 수 있어요.
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && report && (
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1
                        className="text-2xl font-bold mb-4"
                        style={{ color: colors.zendiBlack }}
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2
                        className="text-xl font-bold mt-6 mb-3"
                        style={{ color: colors.zendiBlack }}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3
                        className="text-lg font-semibold mt-4 mb-2"
                        style={{ color: colors.zendiBlack }}
                      >
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-700">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong
                        className="font-semibold"
                        style={{ color: colors.zendiBlue }}
                      >
                        {children}
                      </strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        className="border-l-4 pl-4 my-4 italic"
                        style={{ borderColor: colors.zendiBlue }}
                      >
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {report}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportModal;
