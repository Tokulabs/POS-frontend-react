import { FC } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const ResolutionSkeleton: FC = () => {
  return (
    <div className='rounded-xl border bg-card overflow-hidden'>
      <div className='flex'>
        {/* Left status strip */}
        <div className='w-1.5 bg-muted shrink-0' />
        <div className='flex-1 p-5 space-y-4'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-7 w-48' />
              <Skeleton className='h-5 w-16 rounded-full' />
            </div>
            <Skeleton className='h-6 w-12 rounded-full' />
          </div>

          {/* Data grid */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-5 w-32' />
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-3 w-12' />
            </div>
            <Skeleton className='h-2.5 w-full rounded-full' />
          </div>
        </div>
      </div>
    </div>
  )
}

export { ResolutionSkeleton }
