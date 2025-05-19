import { type FC, memo } from "hono/jsx";
import { get } from "lodash";

import Logo from "./components/Logo.tsx";
import Pagination from "./components/Pagination.tsx";

const styles = {
  searchInput: {
    flex: 4,
    padding: 4,
    fontSize: "small",
    border: "1px solid #ccc",
  },
  searchButton: {
    flex: 1,
    padding: 4,
    fontSize: "small",
    height: "100%",
    border: "1px solid #ccc",
  },
  videoItem: {
    paddingTop: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    fontSize: "small",
  },
  videoMetaContainer: {
    color: "#666",
    fontSize: "11px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "2px",
  },
  videoTypeTag: {
    fontWeight: 400,
    border: "1px solid #ccc",
    padding: "1px 4px",
    borderRadius: "2px",
  },
  durationTag: {
    color: "#fff",
    fontWeight: 500,
    backgroundColor: "#212529",
    border: "1px solid #212529",
    padding: "1px 4px",
    borderRadius: "2px",
  },
  titleLink: {
    textDecoration: "none",
    display: "block",
    paddingBottom: 2,
  },
  metaText: {
    color: "#666",
    paddingBottom: 2,
  },
  mainContainer: {
    fontSize: "small",
  },
  thumbnailContainer: {
    position: "relative",
  },
  videoInfoContainer: {
    marginLeft: "8px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    color: "#333",
    borderBottom: "1px solid #ebebeb",
    paddingBottom: "6px",
    display: "flex",
    alignItems: "center",
    margin: "6px 2px",
  },
  resultCount: {
    marginLeft: "8px",
    color: "#606060",
  },
};

const SearchBar: FC = memo(({ q }) => {
  return (
    <form action="/search" method="get">
      <div style={{ display: "flex" }}>
        <input
          id="inputField"
          name="q"
          type="text"
          maxLength={128}
          style={styles.searchInput}
          value={q}
          placeholder="Search Youtube"
        />
        <input type="submit" value="Search" style={styles.searchButton} />
      </div>
    </form>
  );
});

const LazyImage: FC = memo(({ src, alt, width, height }) => {
  const placeholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 68'%3E%3Crect width='120' height='68' fill='%23f1f1f1'/%3E%3C/svg%3E";

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      style={{ backgroundColor: "#f1f1f1" }}
      onError={(e: any) => {
        const target = e.currentTarget as any;
        target.src = placeholder;
      }}
    />
  );
});

const Video: FC = memo(({ item }) => {
  const id = get(item, "id");
  const type = get(item, "thumbnail_overlays", []);
  const isReel = get(type, "[0].text", "").toUpperCase() === "SHORTS";
  const title = get(item, "title.text", "");
  const viewCount = get(item, "short_view_count.text");
  const publishedDate = get(item, "published.text");
  const authorName = get(item, "author.name");
  const duration = get(item, "duration.text");

  return (
    <div style={styles.videoItem}>
      <div style={styles.thumbnailContainer}>
        <a href={`/video/${id}`} rel="prefetch">
          <LazyImage
            src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
            alt={title}
            width="120"
            height="68"
          />
        </a>
        <div style={styles.videoMetaContainer}>
          <span style={styles.videoTypeTag}>{isReel ? "Shorts" : "Video"}</span>
          <span style={styles.durationTag}>{duration}</span>
        </div>
      </div>

      <div style={styles.videoInfoContainer}>
        <a href={`/video/${id}`} style={styles.titleLink}>
          {truncateText(title, 65)}
        </a>

        <div style={styles.metaText}>
          {viewCount} • {publishedDate}
        </div>

        <div>{authorName}</div>
      </div>
    </div>
  );
});

const SearchPage: FC = memo(({ q, data, pagination }) => {
  const videos = data.map((item: any) => <Video item={item} key={item.id} />);

  return (
    <div style={styles.mainContainer}>
      <div>
        {/* Logo */}
        <div style={{ margin: "2px 2px 0 2px" }}>
          <Logo center={false} large={false} />
        </div>

        {/* Search Bar */}
        <div style={{ margin: "2px" }}>
          <SearchBar q={q} />
        </div>

        {/* Search Results Title */}
        {q && (
          <div style={styles.headerContainer}>
            Search results for "<strong>{truncateText(q, 25)}</strong>"
            <span style={styles.resultCount}>
              {pagination?.totalItems > 0
                ? `(${pagination.totalItems} results)`
                : ""}
            </span>
          </div>
        )}

        {/* Main Content - Videos */}
        <div>
          {videos.length > 0 ? videos : (
            <div
              style={{ padding: "20px 0", textAlign: "center", color: "#666" }}
            >
              No videos found. Try a different search term.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && <Pagination pagination={pagination} />}
      </div>
    </div>
  );
});

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export default SearchPage;
