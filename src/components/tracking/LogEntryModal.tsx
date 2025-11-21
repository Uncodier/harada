'use client';

import { useState } from 'react';
import { Task } from '@/types/app.types';
import { X } from 'lucide-react';

interface LogEntryModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: number, notes?: string, date?: string) => Promise<void>;
  existingValue?: number;
  existingNotes?: string;
  existingDate?: string;
}

export function LogEntryModal({
  task,
  isOpen,
  onClose,
  onSubmit,
  existingValue,
  existingNotes,
  existingDate,
}: LogEntryModalProps) {
  const [value, setValue] = useState<number>(
    existingValue !== undefined ? existingValue : task.tracking_type === 'boolean' ? 0 : 0
  );
  const [notes, setNotes] = useState(existingNotes || '');
  const [date, setDate] = useState(existingDate || new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(value, notes || undefined, date);
      onClose();
      setValue(task.tracking_type === 'boolean' ? 0 : 0);
      setNotes('');
    } catch (error) {
      console.error('Failed to submit log:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {task.tracking_type === 'boolean' ? 'Completed?' : `Value (${task.unit || 'units'})`}
            </label>
            {task.tracking_type === 'boolean' ? (
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="value"
                    value="1"
                    checked={value === 1}
                    onChange={() => setValue(1)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="value"
                    value="0"
                    checked={value === 0}
                    onChange={() => setValue(0)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors">No</span>
                </label>
              </div>
            ) : (
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                required
                min="0"
                placeholder="0.00"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white resize-none"
              rows={4}
              placeholder="Add any notes about this entry..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                'Save Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

