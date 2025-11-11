'use client';

import { MapPin, Star, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertySidebarProps {
  property: {
    city: string;
    category: { name: string };
    rooms: any[];
    averageRating: number;
    totalReviews: number;
  };
}

export function PropertySidebar({ property }: PropertySidebarProps) {
  return (
    <div className="">
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle className="text-xl">Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <MapPin className="h-5 w-5 text-slate-700 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 mb-1 font-medium">Location</div>
                <div className="font-bold text-slate-900 break-words">{property.city}, Indonesia</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <div className="h-5 w-5 rounded bg-slate-900 flex items-center justify-center mt-0.5 flex-shrink-0">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 mb-1 font-medium">Category</div>
                <div className="font-bold text-slate-900 break-words">{property.category?.name || 'N/A'}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <Users className="h-5 w-5 text-slate-700 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 mb-1 font-medium">Available Rooms</div>
                <div className="font-bold text-slate-900">{property.rooms?.length || 0} rooms</div>
              </div>
            </div>
            
            {property.totalReviews > 0 && (
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 fill-slate-900 text-slate-900 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 mb-1 font-medium">Guest Rating</div>
                  <div className="font-bold text-slate-900">
                    {property.averageRating?.toFixed(1) || 0} <span className="text-sm font-normal text-slate-600">({property.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}