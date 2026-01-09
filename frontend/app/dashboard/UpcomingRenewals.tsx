'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, User, Calendar, DollarSign, FileText, Building } from 'lucide-react';

interface RenewalPolicy {
  id: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string | null;
  client_phone: string | null;
  policy_number: string;
  carrier: string;
  type: string;
  expiration_date: string;
  days_until_expiration: number;
  premium: number;
}

interface UpcomingRenewalsProps {
  renewals: RenewalPolicy[];
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

export function UpcomingRenewals({ renewals }: UpcomingRenewalsProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<RenewalPolicy | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePolicyClick = (policy: RenewalPolicy) => {
    setSelectedPolicy(policy);
    setModalOpen(true);
  };

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">
            Upcoming Renewals
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/policies?filter=expiring">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {renewals.length > 0 ? (
            <div className="space-y-4">
              {renewals.slice(0, 5).map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${
                      policy.days_until_expiration <= 14
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {policy.days_until_expiration}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/clients/${policy.client_id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {policy.client_first_name} {policy.client_last_name}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      {policy.policy_number} - {policy.carrier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(policy.expiration_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${Number(policy.premium).toLocaleString()}/yr
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePolicyClick(policy)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No policies expiring in the next 8-30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                {/* Days Until Expiration */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={selectedPolicy.days_until_expiration <= 7 ? 'destructive' : 'secondary'}
                  >
                    {selectedPolicy.days_until_expiration === 0
                      ? 'Expires Today'
                      : selectedPolicy.days_until_expiration === 1
                      ? 'Expires Tomorrow'
                      : `${selectedPolicy.days_until_expiration} days until expiration`}
                  </Badge>
                </div>

                {/* Client */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client
                  </span>
                  <Link
                    href={`/dashboard/clients/${selectedPolicy.client_id}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setModalOpen(false)}
                  >
                    {selectedPolicy.client_first_name} {selectedPolicy.client_last_name}
                  </Link>
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
