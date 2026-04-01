'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { contractsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, DollarSign, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';

interface Contract {
  id: string;
  jobTitle: string;
  counterparty: {
    name: string;
    role: 'CLIENT' | 'DEV';
    avatarUrl?: string | null;
  };
  amount: number;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
}

function toNumber(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export default function ContractsPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContracts = async () => {
      if (!isAuthenticated || !user) {
        setContracts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await contractsAPI.getMine({ page: 1, limit: 50, sortOrder: 'desc' });
      if (!response.success) {
        setContracts([]);
        setError(response.error?.message || 'Failed to load contracts');
        setLoading(false);
        return;
      }

      const mapped = (response.data?.items || []).map((item: any) => {
        const counterparty =
          user.role === 'CLIENT'
            ? item.users_contracts_devIdTousers
            : item.users_contracts_clientIdTousers;

        return {
          id: item.id,
          jobTitle: item.jobs?.title || 'Untitled job',
          counterparty: {
            name: counterparty?.name || (user.role === 'CLIENT' ? 'Developer' : 'Client'),
            role: user.role === 'CLIENT' ? 'DEV' : 'CLIENT',
            avatarUrl: counterparty?.avatarUrl,
          },
          amount: toNumber(item.agreedAmount),
          createdAt: item.createdAt,
          status: item.status,
        } as Contract;
      });

      setContracts(mapped);
      setLoading(false);
    };

    loadContracts();
  }, [isAuthenticated, user]);

  const filteredContracts = useMemo(
    () =>
      contracts.filter(
        (c) =>
          c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.counterparty.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [contracts, searchQuery],
  );

  const contractsByStatus = {
    all: filteredContracts,
    active: filteredContracts.filter(c => c.status === 'ACTIVE'),
    completed: filteredContracts.filter(c => c.status === 'COMPLETED'),
    disputed: filteredContracts.filter(c => c.status === 'DISPUTED'),
    cancelled: filteredContracts.filter(c => c.status === 'CANCELLED')
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-info/20 text-info border-info/30';
      case 'COMPLETED': return 'bg-success/20 text-success border-success/30';
      case 'DISPUTED': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'CANCELLED': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Contracts</h1>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading contracts...</p>
        ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({contractsByStatus.all.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({contractsByStatus.active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({contractsByStatus.completed.length})</TabsTrigger>
            <TabsTrigger value="disputed">Disputed ({contractsByStatus.disputed.length})</TabsTrigger>
          </TabsList>

          {Object.entries(contractsByStatus).map(([key, items]) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No contracts found</p>
                  <Button variant="outline" asChild>
                    <Link href="/jobs">Find work</Link>
                  </Button>
                </div>
              ) : (
                items.map((contract) => (
                  <Link key={contract.id} href={`/contracts/${contract.id}`}>
                    <Card className="hover:border-primary transition cursor-pointer">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {contract.jobTitle}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              {contract.counterparty.name}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge variant="outline" className={getStatusColor(contract.status)}>
                              {contract.status}
                            </Badge>
                            <p className="text-2xl font-bold text-foreground">
                              ${contract.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mb-4 py-4 border-y border-border">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Created</p>
                              <p className="text-sm font-medium text-foreground">
                                {formatDate(contract.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Counterparty role</p>
                            <p className="text-sm font-medium text-foreground">
                              {contract.counterparty.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Contract value</span>
                          </div>
                          <Button size="sm" variant="outline">
                            View details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
        )}
      </div>
    </div>
  );
}
