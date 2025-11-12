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
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Confirm Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
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
    <Card className="border shadow-lg bg-white">
      <CardContent className="py-4 sm:py-6 space-y-3 sm:space-y-4 px-4 sm:px-6">
        <div>
          <p className="text-xs sm:text-sm text-slate-500">Room</p>
          <p className="font-bold text-base sm:text-lg text-slate-900 break-words">{summary.roomName}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-slate-500">Check-in</p>
            <p className="font-medium text-sm sm:text-base text-slate-900">{summary.checkIn}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500">Check-out</p>
            <p className="font-medium text-sm sm:text-base text-slate-900">{summary.checkOut}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-slate-500">Guests</p>
            <p className="font-medium text-sm sm:text-base text-slate-900">{summary.guests} guests</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500">Nights</p>
            <p className="font-medium text-sm sm:text-base text-slate-900">{summary.nights} nights</p>
          </div>
        </div>
        <div className="pt-3 sm:pt-4 border-t-2 border-slate-200">
          <p className="text-xs sm:text-sm text-slate-500 mb-1">Total Price</p>
          <p className="font-bold text-2xl sm:text-3xl text-slate-900">{formatPrice(summary.totalPrice)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentWarning() {
  return (
    <Card className="border-2 border-yellow-500 bg-yellow-50 shadow-md">
      <CardContent className="py-3 sm:py-4 px-4 sm:px-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm sm:text-base text-yellow-900 mb-1">Payment Required</p>
            <p className="text-xs sm:text-sm text-yellow-800">
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
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <Button
        onClick={onCancel}
        variant="outline"
        disabled={isProcessing}
        className="flex-1 w-full order-2 sm:order-1"
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isProcessing}
        className="flex-1 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold order-1 sm:order-2"
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