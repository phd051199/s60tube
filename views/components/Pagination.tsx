import { FC, memo } from "hono/jsx";

type PaginationProps = {
  pagination: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    baseUrl: string;
  };
};

const styles = {
  linkStyle: {
    margin: "0 3px",
    padding: "4px 8px",
    border: "1px solid #ddd",
    borderRadius: "3px",
    textDecoration: "none",
    display: "inline-block",
  },
  activeStyle: {
    margin: "0 3px",
    padding: "4px 8px",
    border: "1px solid #333",
    borderRadius: "3px",
    textDecoration: "none",
    display: "inline-block",
    backgroundColor: "#333",
    color: "white",
    fontWeight: "bold",
  },
  inactiveStyle: {
    margin: "0 3px",
    padding: "4px 8px",
    border: "1px solid #ddd",
    borderRadius: "3px",
    textDecoration: "none",
    display: "inline-block",
    color: "#333",
  },
};

const Pagination: FC<PaginationProps> = memo(({ pagination }) => {
  if (!pagination || !pagination.totalItems) return null;

  const { currentPage, totalItems, itemsPerPage, baseUrl } = pagination;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

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
        <a key={1} href={`${baseUrl}&page=1`} style={styles.inactiveStyle}>
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
          style={i === currentPage ? styles.activeStyle : styles.inactiveStyle}
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
          style={styles.inactiveStyle}
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
          <a
            href={`${baseUrl}&page=${currentPage - 1}`}
            style={styles.inactiveStyle}
          >
            &laquo;
          </a>
        )}

        {/* Page links */}
        {renderPageNumbers()}

        {/* Next button */}
        {currentPage < totalPages && (
          <a
            href={`${baseUrl}&page=${currentPage + 1}`}
            style={styles.inactiveStyle}
          >
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

export default Pagination;
