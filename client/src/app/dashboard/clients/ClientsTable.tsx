'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Users,
} from 'lucide-react';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  policy_count: number;
  active_policies: number;
  total_premium: number;
  created_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
}

export function ClientsTable({
  clients,
  total,
  page,
  totalPages,
  search: initialSearch,
}: ClientsTableProps) {
  const [search, setSearch] = useState(initialSearch);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/dashboard/clients?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/clients?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearch('');
    router.push('/dashboard/clients');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search bar */}
        <div className="border-b p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            {initialSearch && (
              <Button type="button" variant="ghost" onClick={clearSearch}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-4 font-medium">Client</TableHead>
                <TableHead className="h-12 px-4 font-medium">Contact</TableHead>
                <TableHead className="h-12 px-4 font-medium w-[140px]">
                  Policies
                </TableHead>
                <TableHead className="h-12 px-4 font-medium">
                  Total Premium
                </TableHead>
                <TableHead className="h-12 px-4 font-medium">Created</TableHead>
                <TableHead className="h-12 px-4 font-medium w-[100px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell className="h-16 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(client.first_name, client.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {client.first_name} {client.last_name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="h-16 px-4">
                      <div className="space-y-1">
                        {client.email && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={`mailto:${client.email}`}
                                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="truncate max-w-[180px]">
                                    {client.email}
                                  </span>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Send email</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {client.phone && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={`tel:${client.phone}`}
                                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  {client.phone}
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Call client</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {!client.email && !client.phone && (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="h-16 px-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-0"
                        >
                          {client.active_policies} active
                        </Badge>
                        {client.policy_count > client.active_policies && (
                          <span className="text-xs text-muted-foreground">
                            / {client.policy_count} total
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="h-16 px-4">
                      <span className="font-medium">
                        ${Number(client.total_premium || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="h-16 px-4 text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="h-16 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/dashboard/clients/${client.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        {initialSearch
                          ? 'No clients found matching your search.'
                          : 'No clients yet. Add your first client to get started.'}
                      </p>
                      {!initialSearch && (
                        <Button className="mt-4" asChild>
                          <Link href="/dashboard/clients/new">
                            Add your first client
                          </Link>
                        </Button>
                      )}
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
              <span className="font-medium">
                {(page - 1) * 20 + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(page * 20, total)}
              </span>{' '}
              of <span className="font-medium">{total}</span> clients
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
    </Card>
  );
}
