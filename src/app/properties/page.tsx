'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Star, Loader2, Filter } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatPrice';

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  rooms: {
    id: string;
    basePrice: number;
  }[];
  averageRating: number;
  totalReviews: number;
}

export default function PropertiesPage() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, [searchQuery, city, sortBy, page]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(city && { city }),
        sortBy,
      });

      const response = await fetch(`/api/properties?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data properti');
      }

      setProperties(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMinPrice = (rooms: any[]) => {
    if (rooms.length === 0) return 0;
    return Math.min(...rooms.map(r => r.basePrice));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Explore Properties</h1>
          <p className="text-slate-300 text-lg">
            Discover the best accommodations tailored to your needs
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 -mt-16">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Search properties..."
                className="pl-12 h-14 bg-white border-0 shadow-xl text-base focus-visible:ring-2 focus-visible:ring-slate-900"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div>
            <Select
              value={city || 'all'}
              onValueChange={(value) => {
                setCity(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-14 bg-white border-0 shadow-xl text-base focus:ring-2 focus:ring-slate-900">
                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg [&_[role=option]]:font-medium [&_[role=option]]:text-slate-900">
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="Jakarta">Jakarta</SelectItem>
                <SelectItem value="Bandung">Bandung</SelectItem>
                <SelectItem value="Surabaya">Surabaya</SelectItem>
                <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                <SelectItem value="Bali">Bali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-14 bg-white border-0 shadow-xl text-base focus:ring-2 focus:ring-slate-900">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Latest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-slate-900 mx-auto mb-4" />
              <p className="text-slate-600">Loading properties...</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <Card className="py-16 border-2 border-dashed bg-white">
            <CardContent className="text-center">
              <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">No Properties Found</h3>
              <p className="text-slate-600">No properties match your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {properties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`} className="group">
                  <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white">
                    <div className="relative h-72 w-full overflow-hidden bg-slate-200">
                      {property.images.length > 0 ? (
                        <Image
                          src={property.images[0]}
                          alt={property.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900/90 text-white backdrop-blur-sm">
                          {property.category.name}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-bold text-xl mb-1 text-white line-clamp-1">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 text-white/90">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">{property.city}</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        {property.totalReviews > 0 && (
                          <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-slate-900 text-slate-900" />
                            <span className="font-bold text-sm">
                              {property.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-600">({property.totalReviews})</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 line-clamp-2 mb-4 text-sm">
                        {property.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-xs text-slate-500">Starting from</span>
                          <p className="text-slate-900 font-bold text-2xl">
                            {formatPrice(getMinPrice(property.rooms))}
                            <span className="text-sm font-normal text-slate-500">/night</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="font-semibold border-2 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="px-6 py-3 bg-white rounded-xl shadow-lg border-2 border-slate-900">
                  <span className="font-bold text-slate-900">
                    Page {page} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="font-semibold border-2 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
