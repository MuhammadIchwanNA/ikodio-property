'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/helpers';

interface BookingSummary {
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingSummary: BookingSummary | null;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  bookingSummary,
  onConfirm,
  isProcessing,
}: ConfirmationDialogProps) {
  if (!bookingSummary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <BookingSummaryDisplay summary={bookingSummary} />
          <PaymentWarning />
          <ConfirmationActions
            onConfirm={onConfirm}
            onCancel={onClose}
            isProcessing={isProcessing}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingSummaryDisplay({ summary }: { summary: BookingSummary }) {
  return (
    <Card className="border-0 shadow-lg bg-slate-50">
      <CardContent className="py-6 space-y-4">
        <div>
          <p className="text-sm text-slate-500">Room</p>
          <p className="font-bold text-lg text-slate-900">{summary.roomName}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Check-in</p>
            <p className="font-medium text-slate-900">{summary.checkIn}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Check-out</p>
            <p className="font-medium text-slate-900">{summary.checkOut}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Guests</p>
            <p className="font-medium text-slate-900">{summary.guests} guests</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Nights</p>
            <p className="font-medium text-slate-900">{summary.nights} nights</p>
          </div>
        </div>
        <div className="pt-4 border-t-2 border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Price</p>
          <p className="font-bold text-3xl text-slate-900">{formatPrice(summary.totalPrice)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentWarning() {
  return (
    <Card className="border-2 border-yellow-500 bg-yellow-50 shadow-md">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-900 mb-1">Payment Required</p>
            <p className="text-sm text-yellow-800">
              You have <span className="font-bold">1 hour</span> to upload payment proof after confirmation. Failure to do so will result in automatic booking cancellation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfirmationActions({ onConfirm, onCancel, isProcessing }: any) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onCancel}
        variant="outline"
        disabled={isProcessing}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isProcessing}
        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Confirm Booking'
        )}
      </Button>
    </div>
  );
}
