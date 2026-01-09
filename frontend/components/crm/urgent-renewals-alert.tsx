"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, ChevronDown, ChevronUp } from "lucide-react";

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

interface UrgentRenewalsAlertProps {
  renewals: RenewalPolicy[];
}

export function UrgentRenewalsAlert({ renewals }: UrgentRenewalsAlertProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (renewals.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-destructive">
                  Urgent: {renewals.length}{" "}
                  {renewals.length === 1 ? "Policy" : "Policies"} Expiring This
                  Week
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  These policies require immediate attention
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide
                  </>
                )}
              </Button>
            </div>
            {!isCollapsed && (
              <div className="space-y-2">
                {renewals.map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between rounded-lg bg-card border p-4"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/clients/${policy.client_id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {policy.client_first_name} {policy.client_last_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {policy.policy_number} - {policy.carrier} ({policy.type}
                        )
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-1">
                          {policy.days_until_expiration === 0
                            ? "Expires TODAY"
                            : policy.days_until_expiration === 1
                            ? "Expires TOMORROW"
                            : `${policy.days_until_expiration} days left`}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          ${Number(policy.premium).toLocaleString()}/yr
                        </p>
                      </div>
                      {policy.client_phone && (
                        <Button size="sm" variant="destructive" asChild>
                          <a href={`tel:${policy.client_phone}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
