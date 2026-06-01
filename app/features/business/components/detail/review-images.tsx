import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components";

interface ReviewImagesProps {
  urls: string[];
}

export function ReviewImages({ urls }: ReviewImagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ảnh ({urls.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={`Ảnh ${i + 1}`}
                width={300}
                height={300}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="aspect-square w-full rounded-md border object-cover transition-opacity hover:opacity-80"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
