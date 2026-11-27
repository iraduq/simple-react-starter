interface RoomGalleryProps {
  images: string[];
  title: string;
}

export default function RoomGallery({ images, title }: RoomGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <img
        src={images[0]}
        alt={title}
        className="h-[300px] w-full rounded-2xl object-cover sm:col-span-2"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
        {images.slice(1, 3).map((src) => (
          <img
            key={src}
            src={src}
            alt={title}
            className="h-[144px] w-full rounded-2xl object-cover"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
