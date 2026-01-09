'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PolicyDetailsModal } from './PolicyDetailsModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';

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

interface PoliciesTableProps {
  policies: Policy[];
  total: number;
  page: number;
  totalPages: number;
  currentFilter: string;
  currentStatus: string;
  currentType: string;
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

export function PoliciesTable({
  policies,
  total,
  page,
  totalPages,
  currentStatus,
  currentType,
}: PoliciesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePolicyClick = (policy: Policy) => {
    setSelectedPolicy(policy);
    setModalOpen(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/dashboard/policies?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/policies?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/dashboard/policies');
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const hasFilters = currentStatus || currentType;

  return (
    <Card>
      <CardContent className="p-0">
        {/* Filters */}
        <div className="border-b p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={currentStatus || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <Select
                value={currentType || 'all'}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="life">Life</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="umbrella">Umbrella</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-4 font-medium">Policy</TableHead>
                <TableHead className="h-12 px-4 font-medium">Client</TableHead>
                <TableHead className="h-12 px-4 font-medium w-[100px]">
                  Type
                </TableHead>
                <TableHead className="h-12 px-4 font-medium">Premium</TableHead>
                <TableHead className="h-12 px-4 font-medium">
                  Expiration
                </TableHead>
                <TableHead className="h-12 px-4 font-medium w-[100px]">
                  Status
                </TableHead>
                <TableHead className="h-12 px-4 font-medium w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length > 0 ? (
                policies.map((policy) => {
                  const daysUntil = getDaysUntilExpiration(policy.expiration_date);
                  const isExpiringSoon =
                    policy.status === 'active' &&
                    daysUntil >= 0 &&
                    daysUntil <= 30;
                  const isUrgent = daysUntil <= 7 && daysUntil >= 0;

                  return (
                    <TableRow
                      key={policy.id}
                      className={`hover:bg-muted/50 ${
                        isExpiringSoon ? 'bg-secondary/20' : ''
                      }`}
                    >
                      <TableCell className="h-16 px-4">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => handlePolicyClick(policy)}
                            className="font-medium hover:text-primary transition-colors text-left"
                          >
                            {policy.policy_number}
                          </button>
                          <p className="text-sm text-muted-foreground">
                            {policy.carrier}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {policy.clients ? (
                          <Link
                            href={`/dashboard/clients/${policy.client_id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {policy.clients.first_name} {policy.clients.last_name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <Badge variant="secondary">
                          {typeLabels[policy.type] || policy.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <span className="font-medium">
                          ${Number(policy.premium).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">/yr</span>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <div className="space-y-0.5">
                          <p className="text-sm">
                            {new Date(policy.expiration_date).toLocaleDateString()}
                          </p>
                          {isExpiringSoon && (
                            <p
                              className={`flex items-center gap-1 text-xs font-medium ${
                                isUrgent ? 'text-destructive' : 'text-secondary-foreground'
                              }`}
                            >
                              <AlertCircle className="h-3 w-3" />
                              {daysUntil === 0
                                ? 'Expires today'
                                : `${daysUntil} days left`}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {getStatusBadge(policy.status)}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePolicyClick(policy)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        No policies found. Add your first policy to get started.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/dashboard/policies/new">
                          Add your first policy
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * 20, total)}</span>{' '}
              of <span className="font-medium">{total}</span> policies
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <PolicyDetailsModal
        policy={selectedPolicy}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </Card>
  );
}
