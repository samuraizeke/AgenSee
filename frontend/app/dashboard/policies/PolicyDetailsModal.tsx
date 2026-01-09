'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Calendar, DollarSign, FileText, Building } from 'lucide-react';

interface Policy {
  id: string;
  client_id: string;
  carrier: string;
  policy_number: string;
  type: string;
  effective_date: string;
  expiration_date: string;
  premium: number;
  status: string;
  created_at: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface PolicyDetailsModalProps {
  policy: Policy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function PolicyDetailsModal({
  policy,
  open,
  onOpenChange,
}: PolicyDetailsModalProps) {
  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {policy.policy_number}
          </DialogTitle>
          <DialogDescription>
            {policy.carrier} - {typeLabels[policy.type] || policy.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge(policy.status)}
          </div>

          {/* Client */}
          {policy.clients && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Client
              </span>
              <Link
                href={`/dashboard/clients/${policy.client_id}`}
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => onOpenChange(false)}
              >
                {policy.clients.first_name} {policy.clients.last_name}
              </Link>
            </div>
          )}

          {/* Carrier */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Carrier
            </span>
            <span className="text-sm font-medium">{policy.carrier}</span>
          </div>

          {/* Premium */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Annual Premium
            </span>
            <span className="text-sm font-medium">
              ${Number(policy.premium).toLocaleString()}
            </span>
          </div>

          {/* Effective Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Effective Date
            </span>
            <span className="text-sm font-medium">
              {new Date(policy.effective_date).toLocaleDateString()}
            </span>
          </div>

          {/* Expiration Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiration Date
            </span>
            <span className="text-sm font-medium">
              {new Date(policy.expiration_date).toLocaleDateString()}
            </span>
          </div>

          {/* Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <Badge variant="secondary">
              {typeLabels[policy.type] || policy.type}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
