'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home, Folder } from 'lucide-react';

interface DriveBreadcrumbProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  maxItems?: number;
}

export default function DriveBreadcrumb({ 
  currentPath, 
  onNavigate, 
  maxItems = 5 
}: DriveBreadcrumbProps) {
  
  // Parse the path into segments
  const getPathSegments = (path: string) => {
    if (!path || path === '/' || path === '/home') return [];
    
    // Remove leading slash and split, filter out 'home' if it's the first segment
    const segments = path.replace(/^\/+/, '').split('/').filter(Boolean);
    
    // Remove 'home' from the beginning if present
    const filteredSegments = segments[0] === 'home' ? segments.slice(1) : segments;
    
    // Build cumulative paths for navigation
    return filteredSegments.map((segment, index) => {
      const isFirst = index === 0;
      const fullPath = isFirst ? `/${segment}` : '/' + filteredSegments.slice(0, index + 1).join('/');
      
      return {
        name: segment,
        path: fullPath,
        isLast: index === filteredSegments.length - 1
      };
    });
  };

  const pathSegments = getPathSegments(currentPath);
  const showEllipsis = pathSegments.length > maxItems;
  const visibleSegments = showEllipsis 
    ? [
        ...pathSegments.slice(0, 2),
        ...pathSegments.slice(-(maxItems - 3))
      ]
    : pathSegments;

  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList className="text-gray-300">
          {/* Home/Root */}
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => onNavigate('/home')}
              className="flex items-center gap-1 text-gray-400 hover:text-white cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">My Drive</span>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Path segments */}
          {pathSegments.length > 0 && (
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </BreadcrumbSeparator>
          )}

          {/* Show ellipsis if path is too long */}
          {showEllipsis && pathSegments.length > maxItems && (
            <>
              <BreadcrumbItem>
                <BreadcrumbEllipsis className="text-gray-500" />
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </BreadcrumbSeparator>
            </>
          )}

          {/* Render visible segments */}
          {visibleSegments.map((segment, index) => (
            <React.Fragment key={segment.path}>
              <BreadcrumbItem>
                {segment.isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1 text-white font-medium">
                    <Folder className="w-4 h-4" />
                    <span className="capitalize">{segment.name}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => onNavigate(segment.path)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <Folder className="w-4 h-4" />
                    <span className="capitalize">{segment.name}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              
              {!segment.isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Path info */}
      <div className="mt-2 text-xs text-gray-500">
        Current path: <code className="bg-zinc-800/50 px-1 py-0.5 rounded text-gray-400">
          {currentPath || '/home'}
        </code>
      </div>
    </div>
  );
}