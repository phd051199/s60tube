import { type FC, memo } from "hono/jsx";
import { get } from "lodash";

import Logo from "./components/Logo.tsx";

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
            src={`https://img.youtube.com/vi/${id}/default.jpg`}
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
        <a href={`/video/${id}`} style={styles.titleLink} rel="prefetch">
          {truncateText(title, 75)}
        </a>

        <div style={styles.metaText}>
          {viewCount} • {publishedDate}
        </div>

        <div>{authorName}</div>
      </div>
    </div>
  );
});

const Pagination: FC = memo(({ pagination }) => {
  if (!pagination || !pagination.totalItems) return null;

  const { currentPage, totalItems, itemsPerPage, baseUrl } = pagination;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const linkStyle = {
    margin: "0 3px",
    padding: "4px 8px",
    border: "1px solid #ddd",
    borderRadius: "3px",
    textDecoration: "none",
    display: "inline-block",
  };

  const activeStyle = {
    ...linkStyle,
    backgroundColor: "#333",
    color: "white",
    fontWeight: "bold",
    border: "1px solid #333",
  };

  const inactiveStyle = {
    ...linkStyle,
    color: "#333",
  };

  const renderPageNumbers = () => {
    const pageLinks = [];

    const maxPages = 9;

    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (startPage > 1) {
      pageLinks.push(
        <a key={1} href={`${baseUrl}&page=1`} style={inactiveStyle}>
          1
        </a>,
      );

      if (startPage > 2) {
        pageLinks.push(
          <span key="ellipsis1" style={{ margin: "0 5px" }}>
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageLinks.push(
        <a
          key={i}
          href={i === currentPage ? "#" : `${baseUrl}&page=${i}`}
          style={i === currentPage ? activeStyle : inactiveStyle}
        >
          {i}
        </a>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageLinks.push(
          <span key="ellipsis2" style={{ margin: "0 5px" }}>
            ...
          </span>,
        );
      }

      pageLinks.push(
        <a
          key={totalPages}
          href={`${baseUrl}&page=${totalPages}`}
          style={inactiveStyle}
        >
          {totalPages}
        </a>,
      );
    }

    return pageLinks;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 0",
        fontSize: "13px",
        margin: "10px 0",
      }}
    >
      {/* Page numbers */}
      <div
        style={{ display: "flex", alignItems: "center", margin: "0 0 10px 0" }}
      >
        {/* Previous button */}
        {currentPage > 1 && (
          <a href={`${baseUrl}&page=${currentPage - 1}`} style={inactiveStyle}>
            &laquo;
          </a>
        )}

        {/* Page links */}
        {renderPageNumbers()}

        {/* Next button */}
        {currentPage < totalPages && (
          <a href={`${baseUrl}&page=${currentPage + 1}`} style={inactiveStyle}>
            &raquo;
          </a>
        )}
      </div>

      {/* Results info */}
      <div style={{ color: "#666" }}>
        {(currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
        results
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
        <div style={styles.headerContainer}>
          {q
            ? (
              <>
                Search results for "<strong>{q}</strong>"
              </>
            )
            : (
              "Trending videos"
            )}
          <span style={styles.resultCount}>
            {pagination?.totalItems > 0
              ? `(${pagination.totalItems} results)`
              : ""}
          </span>
        </div>

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
