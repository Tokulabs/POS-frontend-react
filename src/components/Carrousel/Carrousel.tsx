import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import LogoWhite from '@/assets/logos/Kiospot-Horizontal-Logo-white.webp'

const ImageCarousel = () => {
  const imagesArray = [
    {
      id: 1,
      src: 'https://kiospot-frontend-images.s3.us-east-1.amazonaws.com/carousel-1.webp',
      alt: 'Imagen 1',
    },
    {
      id: 2,
      src: 'https://kiospot-frontend-images.s3.us-east-1.amazonaws.com/carousel-2.webp',
      alt: 'Imagen 2',
    },
    {
      id: 3,
      src: 'https://kiospot-frontend-images.s3.us-east-1.amazonaws.com/carousel-3.webp',
      alt: 'Imagen 3',
    },
  ]
  return (
    <Carousel className='w-full h-full m-0 p-0' autoplay={3000}>
      <CarouselContent className='w-full h-screen m-0 p-0'>
        {imagesArray.map((image) => (
          <CarouselItem key={image.id} className='w-full h-full m-0 p-0'>
            <div className='h-full w-full flex items-center justify-center m-0 p-0'>
              <Card className='w-full h-full shadow-none border-none m-0 p-0'>
                <CardContent className='flex items-center justify-center h-full w-full p-0 m-0'>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className='object-cover w-full h-full scale-y-105 brightness-[85%]'
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* White logo on left top */}
      <img src={LogoWhite} alt='Logo' className='h-[85px] md:h-[155px] absolute top-4 left-4 p-2' />
    </Carousel>
  )
}
export default ImageCarousel
