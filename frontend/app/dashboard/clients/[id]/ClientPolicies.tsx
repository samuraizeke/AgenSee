'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, DollarSign, FileText, Building } from 'lucide-react';

interface Policy {
  id: string;
  carrier: string;
  policy_number: string;
  type: string;
  effective_date: string;
  expiration_date: string;
  premium: number;
  status: string;
}

interface ClientPoliciesProps {
  policies: Policy[];
  clientId: string;
  clientName: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const typeLabels: Record<string, string> = {
  auto: 'Auto',
  home: 'Home',
  life: 'Life',
  health: 'Health',
  business: 'Business',
  umbrella: 'Umbrella',
  other: 'Other',
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 border-0"
        >
          Active
        </Badge>
      );
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-700 border-0"
        >
          Pending
        </Badge>
      );
    case 'expired':
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-0"
        >
          Expired
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/15 text-rose-700 border-0"
        >
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-0">
          {status}
        </Badge>
      );
  }
}

export function ClientPolicies({ policies, clientId, clientName }: ClientPoliciesProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePolicyClick = (policy: Policy) => {
    setSelectedPolicy(policy);
    setModalOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Policies</h2>
            <Link
              href={`/dashboard/policies/new?client_id=${clientId}`}
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
            </Link>
          </div>
        </div>

        {policies && policies.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
              >
                <div>
                  <button
                    onClick={() => handlePolicyClick(policy)}
                    className="font-medium text-gray-900 hover:text-blue-600 text-left"
                  >
                    {policy.policy_number}
                  </button>
                  <p className="text-sm text-gray-500">
                    {policy.carrier} &middot; {policy.type}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${Number(policy.premium).toLocaleString()}/yr
                    </p>
                    <p className="text-xs text-gray-500">
                      Exp: {new Date(policy.expiration_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[policy.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {policy.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No policies yet
          </div>
        )}
      </div>

      {/* Policy Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedPolicy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedPolicy.policy_number}
                </DialogTitle>
                <DialogDescription>
                  {selectedPolicy.carrier} - {typeLabels[selectedPolicy.type] || selectedPolicy.type}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedPolicy.status)}
                </div>

                {/* Client */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client
                  </span>
                  <span className="text-sm font-medium">{clientName}</span>
                </div>

                {/* Carrier */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Carrier
                  </span>
                  <span className="text-sm font-medium">{selectedPolicy.carrier}</span>
                </div>

                {/* Premium */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Annual Premium
                  </span>
                  <span className="text-sm font-medium">
                    ${Number(selectedPolicy.premium).toLocaleString()}
                  </span>
                </div>

                {/* Effective Date */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Effective Date
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(selectedPolicy.effective_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Expiration Date */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expiration Date
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(selectedPolicy.expiration_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="secondary">
                    {typeLabels[selectedPolicy.type] || selectedPolicy.type}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
