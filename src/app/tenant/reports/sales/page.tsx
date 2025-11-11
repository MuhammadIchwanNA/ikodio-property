'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { SummaryCards } from '@/components/SalesReport/SummaryCards';
import { ReportFilters } from '@/components/SalesReport/ReportFilters';
import { SalesTable } from '@/components/SalesReport/SalesTable';
import { useSalesReport } from './useSalesReport';

export default function SalesReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    properties,
    isLoading,
    selectedProperty,
    setSelectedProperty,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    summary,
    groupedData,
    filteredSales,
    exportToCSV,
  } = useSalesReport();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader onExport={exportToCSV} />
        <SummaryCards summary={summary} />
        <ReportFilters
          selectedProperty={selectedProperty}
          startDate={startDate}
          endDate={endDate}
          sortBy={sortBy}
          groupBy={groupBy}
          properties={properties}
          onPropertyChange={setSelectedProperty}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSortChange={(value) => setSortBy(value as 'date' | 'total')}
          onGroupChange={(value) => setGroupBy(value as 'property' | 'transaction' | 'user')}
        />
        <SalesTable
          groupBy={groupBy}
          groupedData={groupedData}
          filteredSalesCount={filteredSales.length}
        />
      </div>
    </div>
  );
}

function PageHeader({ onExport }: { onExport: () => void }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Analisis pendapatan dan transaksi properti Anda
        </p>
      </div>
      <Button onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}