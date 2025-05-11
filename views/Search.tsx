// deno-lint-ignore-file no-explicit-any
import type { FC } from "hono/jsx";
import { get } from "lodash";

const SearchBar: FC = ({ q }) => {
  return (
    <form action="/search" method="get" style={{ marginBottom: "12px" }}>
      <input
        id="inputField"
        className="input-field"
        name="q"
        placeholder="Search Youtube"
        value={q}
        style={{
          width: "72%",
          marginRight: "4px",
        }}
      />
      <button
        type="submit"
        className="submit-button"
        style={{
          width: "24%",
        }}
      >
        Search
      </button>
    </form>
  );
};

const Video: FC = ({ item }) => {
  return (
    <div style={styles.videoContainer}>
      <a href={"/video/" + get(item, "id")}>
        <div>
          <div style={{ display: "flex" }}>
            <img
              src={`https://img.youtube.com/vi/${get(item, "id")}/default.jpg`}
              alt={get(item, "id")}
              style={styles.thumbnail}
            />
            <div>
              <p style={styles.title}>
                {truncateText(get(item, "title.text", ""), 100)}
              </p>
              <p style={styles.publishedDate}>
                {get(item, "published.text")} | {get(item, "duration.text")}
              </p>
              <p style={styles.publishedDate}>
                {get(item, "short_view_count.text")}
              </p>
              <p style={styles.channel}>{get(item, "author.name")}</p>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

const SearchPage: FC = ({ q, data }) => {
  const videos = data.map((item: any) => <Video item={item} key={item.id} />);

  return (
    <main
      style={{
        width: "100%",
      }}
    >
      <SearchBar q={q} />
      {videos}
    </main>
  );
};

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

const styles = {
  videoContainer: {
    marginBottom: "12px",
  },
  thumbnail: {
    width: "40px",
    marginRight: "10px",
  },
  title: {
    margin: 0,
    fontSize: "12px",
  },
  publishedDate: {
    margin: 0,
    fontSize: "12px",
    color: "black",
  },
  channel: {
    margin: 0,
    fontSize: "12px",
    color: "gray",
  },
};

export default SearchPage;
