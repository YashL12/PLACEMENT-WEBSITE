import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';
import { QuestionItem } from './QuestionItem';

export const RoundAccordion = ({ round, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!round) return null;

  const questionsCount = round.questions?.length || 0;

  return (
    <div className="border border-slate-200 rounded-xl bg-white mb-3 shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs text-slate-700 border border-slate-200">
            R{round.roundNumber}
          </span>
          <h3 className="text-base font-semibold text-slate-900 mr-2">{round.roundName}</h3>
          <Badge variant={round.roundType}>{round.roundType}</Badge>

          <span className="text-xs text-slate-500 font-medium ml-auto sm:ml-2">
            {questionsCount} {questionsCount === 1 ? 'Question' : 'Questions'}
          </span>
        </div>

        <div className="ml-3 text-slate-400 p-1">
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30">
          {/* Description */}
          {round.description && (
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              {round.description}
            </p>
          )}

          {/* Special Instructions (e.g., TSS no-library rule) */}
          {round.instructions && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Special Interview Instruction:</span>
                <span>{round.instructions}</span>
              </div>
            </div>
          )}

          {/* Questions List */}
          {questionsCount > 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 p-2">
              {round.questions.map((q, idx) => (
                <QuestionItem key={q._id || idx} question={q} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-3 text-center">
              Detailed question descriptions are recorded in the process overview above.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
