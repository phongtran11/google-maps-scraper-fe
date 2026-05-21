import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/card";

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
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {urls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={`Ảnh ${i + 1}`}
                className="w-full aspect-square object-cover rounded-md border hover:opacity-80 transition-opacity"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
