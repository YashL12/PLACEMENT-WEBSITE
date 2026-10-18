import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';

export const QuestionItem = ({ question, index }) => {
  if (!question) return null;

  return (
    <div className="py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 p-3 rounded-lg transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center mt-0.5">
            {question.order || index + 1}
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-line">
              {question.questionText}
            </h4>

            {/* Context / Code snippet / Constraints / Examples */}
            {question.context && (
              <div className="mt-2.5 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                <pre className="whitespace-pre-wrap">{question.context}</pre>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {question.topic && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {question.topic}
                </span>
              )}

              {question.sourceLocation && (
                <span className="text-[11px] text-slate-400">
                  Ref: {question.sourceLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* External Solution Reference Link if available */}
        {question.solutionUrl && (
          <a
            href={question.solutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
            title="Open external problem / solution reference"
          >
            <span>Solution</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
