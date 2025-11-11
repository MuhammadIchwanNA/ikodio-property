'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { PropertyHeader } from '@/components/PropertyDetail/PropertyHeader';
import { PropertySidebar } from '@/components/PropertyDetail/PropertySidebar';
import { ImageGallery } from '@/components/PropertyDetail/ImageGallery';
import { ReviewsSection } from '@/components/PropertyDetail/ReviewsSection';
import { PriceCalendar } from '@/components/PropertyDetail/PriceCalendar';
import { QuickPriceChecker } from '@/components/PropertyDetail/QuickPriceChecker';
import { RoomAvailabilityFilter } from '@/components/PropertyDetail/RoomAvailabilityFilter';
import { RoomList } from '@/components/PropertyDetail/RoomList';
import { CompareFeature } from '@/components/PropertyDetail/CompareFeature';
import { BookingDialog } from '@/components/PropertyDetail/BookingDialog';
import { ConfirmationDialog } from '@/components/PropertyDetail/ConfirmationDialog';

interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    profileImage: string | null;
  };
  reply: {
    comment: string;
    createdAt: string;
  } | null;
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  images: string[];
  category: {
    name: string;
  };
  rooms: Room[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function PropertyDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingDates, setBookingDates] = useState({ 
    checkIn: '', 
    checkOut: '' 
  });
  const [guestCount, setGuestCount] = useState(1);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<any>(null);

  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareDates, setCompareDates] = useState({ 
    checkIn: '', 
    checkOut: '' 
  });
  const [isComparingPrices, setIsComparingPrices] = useState(false);
  const [compareResults, setCompareResults] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [calendarPrices, setCalendarPrices] = useState<any>({});
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  const [checkerDates, setCheckerDates] = useState({ 
    checkIn: '', 
    checkOut: '' 
  });
  const [checkerResults, setCheckerResults] = useState<any>({});
  const [isLoadingChecker, setIsLoadingChecker] = useState(false);

  const [filterDates, setFilterDates] = useState({ 
    checkIn: '', 
    checkOut: '' 
  });
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filteredRoomIds, setFilteredRoomIds] = useState<string[]>([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [resolvedParams.id]);

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${resolvedParams.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const response = await res.json();
      
      // API returns { success: true, data: {...} }
      const propertyData = response.data || response;
      
      setProperty(propertyData);
      if (propertyData.rooms && propertyData.rooms.length > 0) {
        setSelectedRoomId(propertyData.rooms[0].id);
      }
    } catch (error) {
      console.error('Fetch property error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load property', 
        variant: 'destructive' 
      });
      router.push('/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const openGallery = (images: string[], index: number, title: string) => {
    setGalleryImages(images);
    setSelectedImageIndex(index);
    setGalleryTitle(title);
    setIsGalleryOpen(true);
  };

  const openPropertyGallery = (index: number) => {
    if (property) {
      openGallery(property.images, index, property.name);
    }
  };

  const openRoomGallery = (room: Room, index: number) => {
    openGallery(room.images, index, room.name);
  };

  const handleBookClick = (room: Room) => {
    if (!session) {
      toast({ 
        title: 'Login Required', 
        description: 'Please login to book' 
      });
      router.push('/login');
      return;
    }
    setSelectedRoom(room);
    setIsBookingDialogOpen(true);
    setAvailabilityMessage(null);
    setPriceBreakdown(null);
  };

  const checkAvailability = async () => {
    if (!selectedRoom || !bookingDates.checkIn || !bookingDates.checkOut) {
      return;
    }
    
    setIsCheckingAvailability(true);
    try {
      const res = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn: bookingDates.checkIn,
          checkOut: bookingDates.checkOut,
        }),
      });
      const data = await res.json();
      
      if (data.available) {
        setAvailabilityMessage('✅ Room is available!');
        setPriceBreakdown(data.priceBreakdown);
      } else {
        setAvailabilityMessage('❌ Room not available for selected dates');
        setPriceBreakdown(null);
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to check availability', 
        variant: 'destructive' 
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedRoom || !priceBreakdown) return;
    
    setBookingSummary({
      roomName: selectedRoom.name,
      checkIn: bookingDates.checkIn,
      checkOut: bookingDates.checkOut,
      guests: guestCount,
      nights: priceBreakdown.nights,
      totalPrice: priceBreakdown.total,
    });
    setIsConfirmDialogOpen(true);
  };

  const processBooking = async () => {
    if (!selectedRoom) return;
    
    setIsBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkInDate: bookingDates.checkIn,
          checkOutDate: bookingDates.checkOut,
          numberOfGuests: guestCount,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }
      
      toast({ 
        title: 'Success', 
        description: 'Booking created! Please upload payment proof.' 
      });
      
      // Redirect to payment page
      router.push(`/bookings/${data.data.id}/payment`);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Booking failed', 
        variant: 'destructive' 
      });
    } finally {
      setIsBooking(false);
      setIsConfirmDialogOpen(false);
      setIsBookingDialogOpen(false);
    }
  };

  const toggleCompareRoom = (roomId: string) => {
    setSelectedForCompare(prev =>
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId) 
        : [...prev, roomId]
    );
  };

  const comparePrices = async () => {
    if (selectedForCompare.length < 2) return;
    
    setIsComparingPrices(true);
    try {
      const results = await Promise.all(
        selectedForCompare.map(async (roomId) => {
          const res = await fetch('/api/bookings/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId,
              checkIn: compareDates.checkIn,
              checkOut: compareDates.checkOut,
            }),
          });
          const data = await res.json();
          return { 
            roomId, 
            available: data.available, 
            price: data.priceBreakdown?.total || 0 
          };
        })
      );
      setCompareResults(results);
      setShowCompareModal(true);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to compare prices', 
        variant: 'destructive' 
      });
    } finally {
      setIsComparingPrices(false);
    }
  };

  const bookFromCompare = (roomId: string) => {
    const room = property?.rooms.find(r => r.id === roomId);
    if (room) {
      setShowCompareModal(false);
      setBookingDates({ 
        checkIn: compareDates.checkIn, 
        checkOut: compareDates.checkOut 
      });
      handleBookClick(room);
    }
  };

  const getDaysInMonth = (): (Date | null)[] => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const loadCalendarPrices = async (month: Date, roomId: string) => {
    setIsLoadingCalendar(true);
    try {
      const res = await fetch(
        `/api/rooms/${roomId}/calendar?month=${month.toISOString()}`
      );
      const response = await res.json();
      // API returns { success: true, data: {...} }
      const calendarData = response.data || response;
      setCalendarPrices(calendarData);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load calendar', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (selectedRoomId) {
      loadCalendarPrices(selectedMonth, selectedRoomId);
    }
  }, [selectedMonth, selectedRoomId]);

  const handleCalendarDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (!bookingDates.checkIn || (bookingDates.checkIn && bookingDates.checkOut)) {
      setBookingDates({ checkIn: dateStr, checkOut: '' });
    } else {
      setBookingDates(prev => ({ ...prev, checkOut: dateStr }));
    }
  };

  const bookFromCalendar = () => {
    if (!selectedRoomId || !bookingDates.checkIn || !bookingDates.checkOut) {
      return;
    }
    const room = property?.rooms.find(r => r.id === selectedRoomId);
    if (room) {
      handleBookClick(room);
    }
  };

  const checkAllPrices = async () => {
    if (!checkerDates.checkIn || !checkerDates.checkOut || !property) {
      return;
    }
    
    setIsLoadingChecker(true);
    try {
      const results: any = {};
      for (const room of property.rooms) {
        const res = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: room.id,
            checkIn: checkerDates.checkIn,
            checkOut: checkerDates.checkOut,
          }),
        });
        const data = await res.json();
        results[room.id] = { 
          price: data.priceBreakdown?.total || 0, 
          available: data.available 
        };
      }
      setCheckerResults(results);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to check prices', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingChecker(false);
    }
  };

  const bookFromChecker = (room: Room, price: number) => {
    setBookingDates({ 
      checkIn: checkerDates.checkIn, 
      checkOut: checkerDates.checkOut 
    });
    handleBookClick(room);
  };

  const applyFilter = async () => {
    if (!filterDates.checkIn || !filterDates.checkOut || !property) {
      return;
    }
    
    setIsLoadingFilter(true);
    try {
      const available: string[] = [];
      for (const room of property.rooms) {
        const res = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: room.id,
            checkIn: filterDates.checkIn,
            checkOut: filterDates.checkOut,
          }),
        });
        const data = await res.json();
        if (data.available) {
          available.push(room.id);
        }
      }
      setFilteredRoomIds(available);
      setIsFilterActive(true);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to filter rooms', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingFilter(false);
    }
  };

  const resetFilter = () => {
    setIsFilterActive(false);
    setFilteredRoomIds([]);
    setFilterDates({ checkIn: '', checkOut: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-slate-900" />
      </div>
    );
  }

  if (!property) return null;

  const displayRooms = isFilterActive
    ? property.rooms?.filter(r => filteredRoomIds.includes(r.id)) || []
    : property.rooms || [];

  const selectedRoomsForCompare = property.rooms?.filter(r =>
    selectedForCompare.includes(r.id)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <PropertyHeader
              property={property}
              onImageClick={openPropertyGallery}
            />

            <RoomAvailabilityFilter
              dates={filterDates}
              onDatesChange={setFilterDates}
              isFilterActive={isFilterActive}
              isLoading={isLoadingFilter}
              onApply={applyFilter}
              onReset={resetFilter}
              filteredCount={filteredRoomIds.length}
              totalCount={property.rooms?.length || 0}
            />

            <RoomList
              rooms={displayRooms}
              selectedForCompare={selectedForCompare}
              onCompareToggle={toggleCompareRoom}
              onBookClick={handleBookClick}
              onImageClick={openRoomGallery}
              compareCount={selectedForCompare.length}
              onCompareClick={comparePrices}
              isComparingPrices={isComparingPrices}
            />

            {selectedForCompare.length > 0 && (
              <CompareFeature
                selectedRooms={selectedRoomsForCompare}
                compareDates={compareDates}
                onDatesChange={setCompareDates}
                onCompare={comparePrices}
                isComparing={isComparingPrices}
                compareResults={compareResults}
                showCompareModal={showCompareModal}
                onCloseModal={() => setShowCompareModal(false)}
                onBookRoom={bookFromCompare}
              />
            )}

            <ReviewsSection 
              reviews={property.reviews || []}
              totalReviews={property.totalReviews || 0}
            />
          </div>

          <div className="lg:sticky lg:top-20 space-y-8 self-start">
            <PropertySidebar property={property} />

            <PriceCalendar
              rooms={property.rooms || []}
              selectedRoomId={selectedRoomId}
              onRoomSelect={setSelectedRoomId}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              calendarPrices={calendarPrices}
              isLoading={isLoadingCalendar}
              getDaysInMonth={getDaysInMonth}
              onDateSelect={handleCalendarDateSelect}
              bookingDates={bookingDates}
              onBookNow={bookFromCalendar}
            />

            <QuickPriceChecker
              rooms={property.rooms || []}
              dates={checkerDates}
              onDatesChange={setCheckerDates}
              results={checkerResults}
              isLoading={isLoadingChecker}
              onCheck={checkAllPrices}
              onBookRoom={bookFromChecker}
            />
          </div>
        </div>
      </div>

      <ImageGallery
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title={galleryTitle}
        currentIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
      />

      <BookingDialog
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        room={selectedRoom}
        bookingDates={bookingDates}
        onDatesChange={setBookingDates}
        guestCount={guestCount}
        onGuestCountChange={setGuestCount}
        isCheckingAvailability={isCheckingAvailability}
        availabilityMessage={availabilityMessage}
        priceBreakdown={priceBreakdown}
        onConfirmBooking={handleConfirmBooking}
        isBooking={isBooking}
        onCheckAvailability={checkAvailability}
      />

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        bookingSummary={bookingSummary}
        onConfirm={processBooking}
        isProcessing={isBooking}
      />
    </div>
  );
}
