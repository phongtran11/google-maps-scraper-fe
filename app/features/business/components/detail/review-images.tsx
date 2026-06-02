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
            <a href={url} key={i} rel="noopener noreferrer" target="_blank">
              <img
                alt={`Ảnh ${i + 1}`}
                className="aspect-square w-full rounded-md border object-cover transition-opacity hover:opacity-80"
                height={300}
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                src={url}
                width={300}
              />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
