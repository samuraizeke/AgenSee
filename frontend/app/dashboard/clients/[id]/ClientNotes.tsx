'use client';

import { useState } from 'react';
import { createNoteAction, deleteNoteAction } from '@/app/actions/notes';

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ClientNotesProps {
  clientId: string;
  initialNotes: Note[];
}

export function ClientNotes({ clientId, initialNotes }: ClientNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createNoteAction(clientId, newNote.trim());

      if (!result.success) {
        setError(result.error || 'Failed to add note');
        return;
      }

      // Add the new note to the list
      const createdNote = result.data as Note;
      setNotes([createdNote, ...notes]);
      setNewNote('');
      setIsAdding(false);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setDeletingId(noteId);
    setError(null);

    try {
      const result = await deleteNoteAction(noteId, clientId);

      if (!result.success) {
        setError(result.error || 'Failed to delete note');
        return;
      }

      setNotes(notes.filter(n => n.id !== noteId));
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notes</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddNote} className="mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your note here..."
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !newNote.trim()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
                setError(null);
              }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No notes yet. Click the + button to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-md border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 whitespace-pre-wrap text-sm text-gray-700">
                  {note.content}
                </p>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  disabled={deletingId === note.id}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-600 disabled:opacity-50"
                  title="Delete note"
                >
                  {deletingId === note.id ? (
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(note.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
