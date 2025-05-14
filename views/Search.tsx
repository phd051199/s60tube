import type { FC } from "hono/jsx";
import { get } from "lodash";

import Footer from "./components/Footer.tsx";
import Logo from "./components/Logo.tsx";

const SearchBar: FC = ({ q }) => {
  return (
    <form action="/search" method="get">
      <div style={{ display: "flex" }}>
        <input
          id="inputField"
          name="q"
          type="text"
          maxLength={128}
          style={{
            flex: 4,
            padding: 4,
            fontSize: "small",
            border: "1px solid #ccc",
          }}
          value={q}
          placeholder="Search Youtube"
        />
        <input
          type="submit"
          value="Search"
          style={{
            flex: 1,
            padding: 4,
            fontSize: "small",
            height: "100%",
            border: "1px solid #ccc",
          }}
        />
      </div>
    </form>
  );
};

const Video: FC = ({ item }) => {
  const type = get(item, "thumbnail_overlays", []);
  const isReel = get(type, "[0].text", "").toUpperCase() === "SHORTS";

  return (
    <div
      style={{
        paddingTop: "8px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <table width="100%" style={{ fontSize: "small" }}>
        <tbody>
          <tr>
            <td>
              <table width="100%" style={{ marginBottom: 2 }}>
                <tbody>
                  <tr valign="top">
                    <td width="42">
                      <a href={"/video/" + get(item, "id")}>
                        <img
                          src={`https://img.youtube.com/vi/${
                            get(
                              item,
                              "id",
                            )
                          }/mqdefault.jpg`}
                          alt="video"
                          width="120"
                          height="68"
                        />
                      </a>
                      <div
                        style={{
                          color: "#666",
                          fontSize: "11px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 400,
                            border: "1px solid #ccc",
                            padding: "1px 4px",
                            borderRadius: "2px",
                          }}
                        >
                          {isReel ? "Shorts" : "Video"}
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 500,
                            backgroundColor: "#212529",
                            border: "1px solid #212529",
                            padding: "1px 4px",
                            borderRadius: "2px",
                          }}
                        >
                          {get(item, "duration.text")}
                        </span>
                      </div>
                    </td>
                    <td width="4"></td>
                    <td>
                      <table width="100%">
                        <tbody>
                          <tr>
                            <td style={{ paddingBottom: 2 }}>
                              <a
                                href={"/video/" + get(item, "id")}
                                style={{
                                  textDecoration: "none",
                                }}
                              >
                                {truncateText(get(item, "title.text", ""), 75)}
                              </a>
                            </td>
                          </tr>

                          <tr>
                            <td
                              style={{
                                color: "#666",
                                paddingBottom: 2,
                              }}
                            >
                              {get(item, "short_view_count.text")} •{" "}
                              {get(item, "published.text")}
                            </td>
                          </tr>
                          <tr>
                            <td>{get(item, "author.name")}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const SearchPage: FC = ({ q, data }) => {
  const videos = data.map((item: any) => <Video item={item} key={item.id} />);

  return (
    <div style={{ fontSize: "small" }}>
      <table width="100%" bgcolor="#FFFFFF">
        <tbody>
          <tr>
            <td valign="top">
              {/* Logo */}
              <table width="100%" style={{ margin: "2px 2px 0 2px" }}>
                <tbody>
                  <tr>
                    <td align="left">
                      <Logo center={false} large={false} />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Search Bar */}
              <table width="100%" style={{ marginLeft: 2 }}>
                <tbody>
                  <tr>
                    <td>
                      <SearchBar q={q} />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Main Content - Videos */}
              <table width="100%">
                <tbody>
                  <tr>
                    <td>{videos}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <Footer />
    </div>
  );
};

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export default SearchPage;
