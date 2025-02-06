import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

const ImageCarousel = () => {
  return (
    
    <Carousel className="w-full h-full m-0 p-0" autoplay={3000}>
      <CarouselContent className="w-full h-screen m-0 p-0">
        {/* Image 1 */}
        <CarouselItem key={1} className="w-full h-full m-0 p-0">
          <div className="h-full w-full flex items-center justify-center m-0 p-0">
            
            <Card className="w-full h-full shadow-none border-none m-0 p-0">
              <CardContent className="flex items-center justify-center h-full w-full p-0 m-0">
                <img
                  src="src/assets/logos/foto.jpeg"
                  alt="Imagen 1"
                  className="object-cover w-full h-full scale-y-105"
                />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>

        {/* Image 2 */}
        <CarouselItem key={2} className="w-full h-full m-0 p-0">
          <div className="h-full w-full flex items-center justify-center m-0 p-0">
            <Card className="w-full h-full shadow-none border-none m-0 p-0">
              <CardContent className="flex items-center justify-center h-full w-full p-0 m-0">
                <img
                  src="src/assets/logos/foto2.jpeg"
                  alt="Imagen 2"
                  className="object-cover w-full h-full scale-y-100"
                />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>

        {/* Image 3 */}
        <CarouselItem key={3} className="w-full h-full m-0 p-0">
          <div className="h-full w-full flex items-center justify-center m-0 p-0">
            <Card className="w-full h-full shadow-none border-none m-0 p-0">
              <CardContent className="flex items-center justify-center h-full w-full p-0 m-0">
                <img
                  src="src/assets/logos/foto3.jpeg"
                  alt="Imagen 3"
                  className="object-cover w-full h-full scale-y-105"
                />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>

        {/* White logo on left top */}
        <img 
            src="src/assets/logos/Kiospot-Horizontal-Logo-white.webp" 
            alt="Logo" 
            className="h-[85px] md:h-[155px] absolute top-4 left-4 p-2" 
          />

    </Carousel>
  );
};
export default ImageCarousel;