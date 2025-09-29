import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface AdvancedSearchFilterProps {
  onSearch: (filters: any[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AdvancedSearchFilter({ onSearch, open, setOpen }: AdvancedSearchFilterProps) {
  const [filters, setFilters] = useState({
    filename: '',
    mimeType: '',
    sizeMin: '',
    sizeMax: '',
    dateFrom: '',
    dateTo: '',
    tags: '',
    uploader: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Build query params from filters
    const params = new URLSearchParams();
    if (filters.filename) params.append('filename', filters.filename);
    if (filters.mimeType && filters.mimeType !== 'any') params.append('mimeType', filters.mimeType);
    if (filters.sizeMin) params.append('minSize', filters.sizeMin);
    if (filters.sizeMax) params.append('maxSize', filters.sizeMax);
    if (filters.dateFrom) params.append('startDate', filters.dateFrom);
    if (filters.dateTo) params.append('endDate', filters.dateTo);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.uploader) params.append('uploader', filters.uploader);
    // Optionally add limit/offset if needed
    // params.append('limit', '20');
    // params.append('offset', '0');
    try {
      const res = await fetch(`https://vit-2026-capstone-internship-hiring-task-jkaj.onrender.com/api/v1/file/search?${params.toString()}`);
      const data = await res.json();
      onSearch(data.data || []);
    } catch (err) {
      onSearch([]);
    }
  setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Remove the button, popup is triggered by parent icon */}
      <DialogContent className="max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white mb-4">
            <Filter className="w-6 h-6 text-blue-400" />
            <span>Advanced Search Filters</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <Input name="filename" placeholder="Search by filename" value={filters.filename} onChange={handleChange} className="bg-transparent border-none text-white flex-1 placeholder-gray-400" />
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <div className="w-full">
            <Select value={filters.mimeType} onValueChange={value => setFilters(f => ({ ...f, mimeType: value }))}>
              <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg">
                <SelectValue placeholder="MIME Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="application/pdf">PDF</SelectItem>
                <SelectItem value="image/jpeg">JPEG</SelectItem>
                <SelectItem value="image/png">PNG</SelectItem>
                <SelectItem value="video/mp4">MP4</SelectItem>
                <SelectItem value="audio/mpeg">MP3</SelectItem>
                {/* Add more MIME types as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Input name="sizeMin" type="number" placeholder="Min size (MB)" value={filters.sizeMin} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white rounded-lg" />
            <Input name="sizeMax" type="number" placeholder="Max size (MB)" value={filters.sizeMax} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Input name="dateFrom" type="date" placeholder="From" value={filters.dateFrom} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white rounded-lg" />
            <Input name="dateTo" type="date" placeholder="To" value={filters.dateTo} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white rounded-lg" />
          </div>
          <Input name="tags" placeholder="Tags (comma separated)" value={filters.tags} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white rounded-lg" />
          <Input name="uploader" placeholder="Uploader's name" value={filters.uploader} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white rounded-lg" />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mt-2">Apply Filters</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
