import { mockProperties } from "@/lib/mock-data";
import InfiniteScroller from "@/components/InfiniteScroller";

export default function HomePage() {
  return (
    <main>
      <InfiniteScroller properties={mockProperties} />
    </main>
  );
}
