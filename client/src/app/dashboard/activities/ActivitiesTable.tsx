'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getClientApiUrl } from '@/lib/client-api-url';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  CheckSquare,
  Calendar,
  FileText,
  Activity,
} from 'lucide-react';
import type { ActivityType } from '@/types';

interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  client_id: string | null;
  client_name?: string;
  policy_id: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface ActivitiesTableProps {
  activities: ActivityItem[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  typeFilter: string;
  completedFilter: string;
  accessToken: string;
}

const activityTypeConfig: Record<ActivityType, { icon: React.ElementType; label: string; color: string }> = {
  call: { icon: Phone, label: 'Call', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  email: { icon: Mail, label: 'Email', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  task: { icon: CheckSquare, label: 'Task', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  note: { icon: FileText, label: 'Note', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

export function ActivitiesTable({
  activities: initialActivities,
  total,
  page,
  totalPages,
  search: initialSearch,
  typeFilter: initialTypeFilter,
  completedFilter: initialCompletedFilter,
  accessToken,
}: ActivitiesTableProps) {
  const [search, setSearch] = useState(initialSearch);
  const [activities, setActivities] = useState(initialActivities);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleToggleComplete = async (id: string, completed: boolean) => {
    // Optimistically update UI
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, completed, completed_at: completed ? new Date().toISOString() : null }
          : a
      )
    );

    try {
      const response = await fetch(
        `${getClientApiUrl()}/activities/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ completed }),
        }
      );

      if (!response.ok) {
        // Revert on error
        setActivities((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, completed: !completed, completed_at: !completed ? new Date().toISOString() : null }
              : a
          )
        );
      }
    } catch {
      // Revert on error
      setActivities((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, completed: !completed, completed_at: !completed ? new Date().toISOString() : null }
            : a
        )
      );
    }
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set('page', '1');
    router.push(`/dashboard/activities?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/activities?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/dashboard/activities');
  };

  const hasFilters = initialSearch || initialTypeFilter || initialCompletedFilter;

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, className: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'text-orange-600 dark:text-orange-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'text-yellow-600 dark:text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, className: 'text-muted-foreground' };
    }
    return { text: date.toLocaleDateString(), className: 'text-muted-foreground' };
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search and filters */}
        <div className="border-b p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search activities..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
            <div className="flex gap-2">
              <Select
                value={initialTypeFilter || 'all'}
                onValueChange={(value) => updateParams({ type: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={initialCompletedFilter || 'all'}
                onValueChange={(value) => updateParams({ completed: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button type="button" variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-4 font-medium w-[50px]">Done</TableHead>
                <TableHead className="h-12 px-4 font-medium w-[100px]">Type</TableHead>
                <TableHead className="h-12 px-4 font-medium">Description</TableHead>
                <TableHead className="h-12 px-4 font-medium">Client</TableHead>
                <TableHead className="h-12 px-4 font-medium">Due Date</TableHead>
                <TableHead className="h-12 px-4 font-medium">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const config = activityTypeConfig[activity.type];
                  const Icon = config.icon;
                  const dueInfo = formatDueDate(activity.due_date);

                  return (
                    <TableRow
                      key={activity.id}
                      className={`hover:bg-muted/50 ${activity.completed ? 'opacity-60' : ''}`}
                    >
                      <TableCell className="h-16 px-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Checkbox
                                  checked={activity.completed}
                                  onCheckedChange={(checked) =>
                                    handleToggleComplete(activity.id, checked as boolean)
                                  }
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {activity.completed ? 'Mark as pending' : 'Mark as complete'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <Badge variant="secondary" className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <span className={activity.completed ? 'line-through' : ''}>
                          {activity.description}
                        </span>
                      </TableCell>
                      <TableCell className="h-16 px-4 text-muted-foreground">
                        {activity.client_name || '-'}
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        {dueInfo ? (
                          <span className={dueInfo.className}>{dueInfo.text}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="h-16 px-4 text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Activity className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        {hasFilters
                          ? 'No activities found matching your filters.'
                          : 'No activities yet. Create your first activity to get started.'}
                      </p>
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
              <span className="font-medium">{Math.min(page * 20, total)}</span> of{' '}
              <span className="font-medium">{total}</span> activities
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
