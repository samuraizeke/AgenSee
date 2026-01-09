'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPolicy } from '@/app/actions/policies';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

interface PolicyFormProps {
  clients: Client[];
  preselectedClientId: string;
}

const policyTypes = [
  { value: 'auto', label: 'Auto' },
  { value: 'home', label: 'Home' },
  { value: 'life', label: 'Life' },
  { value: 'health', label: 'Health' },
  { value: 'business', label: 'Business' },
  { value: 'umbrella', label: 'Umbrella' },
  { value: 'other', label: 'Other' },
];

const policyStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function PolicyForm({ clients, preselectedClientId }: PolicyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: preselectedClientId,
    carrier: '',
    policy_number: '',
    type: 'auto',
    effective_date: '',
    expiration_date: '',
    premium: '',
    status: 'active',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate premium
    const premium = parseFloat(formData.premium);
    if (isNaN(premium) || premium < 0) {
      setError('Premium must be a valid positive number');
      setIsLoading(false);
      return;
    }

    try {
      // Use server action for cache revalidation
      const result = await createPolicy({
        client_id: formData.client_id,
        carrier: formData.carrier,
        policy_number: formData.policy_number,
        type: formData.type,
        effective_date: formData.effective_date,
        expiration_date: formData.expiration_date,
        premium: premium,
        status: formData.status,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create policy');
        return;
      }

      // Redirect to policies list - cache is already revalidated by server action
      router.push('/dashboard/policies');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <div>
        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
          Client <span className="text-red-500">*</span>
        </label>
        <select
          id="client_id"
          name="client_id"
          value={formData.client_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.first_name} {client.last_name}
              {client.email && ` (${client.email})`}
            </option>
          ))}
        </select>
        {clients.length === 0 && (
          <p className="mt-1 text-sm text-orange-600">
            No clients found. Please add a client first.
          </p>
        )}
      </div>

      {/* Policy Details Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">
            Carrier <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="carrier"
            name="carrier"
            value={formData.carrier}
            onChange={handleChange}
            required
            placeholder="e.g., State Farm, Allstate"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="policy_number" className="block text-sm font-medium text-gray-700">
            Policy Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="policy_number"
            name="policy_number"
            value={formData.policy_number}
            onChange={handleChange}
            required
            placeholder="e.g., POL-123456"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Type and Status Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Policy Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {policyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {policyStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700">
            Effective Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="effective_date"
            name="effective_date"
            value={formData.effective_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="expiration_date"
            name="expiration_date"
            value={formData.expiration_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Premium */}
      <div>
        <label htmlFor="premium" className="block text-sm font-medium text-gray-700">
          Annual Premium ($) <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            $
          </span>
          <input
            type="number"
            id="premium"
            name="premium"
            value={formData.premium}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading || clients.length === 0}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Policy'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
