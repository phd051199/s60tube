import { type FC } from "hono/jsx";

const Footer: FC = () => {
  return (
    <footer>
      <table width="100%" bgcolor="#FFFFFF" cellpadding="4">
        <tr>
          <td align="center" style={{ color: "#666" }}>
            <div
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#0066cc" }}>[SYS_INFO]</span>
              <br />
              <span style={{ color: "#666" }}>Runtime:</span>{" "}
              <span style={{ color: "#28a745" }}>2.3.1</span> |{" "}
              <span style={{ color: "#666" }}>TypeScript:</span>{" "}
              <span style={{ color: "#28a745" }}>5.8.3</span>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <span style={{ color: "#999" }}>$</span>{" "}
              <span style={{ color: "#0066cc" }}>TZ=</span>
              <span style={{ color: "#28a745" }}>
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
              <br />
              <span style={{ color: "#999" }}>$</span>{" "}
              <span style={{ color: "#0066cc" }}>LANG=</span>
              <span style={{ color: "#28a745" }}>
                {Deno.env.get("LANG") || "en_US.UTF-8"}
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "4px",
                border: "1px solid #ddd",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#28a745" }}>&gt;</span>{" "}
              <span style={{ color: "#0066cc" }}>S60Tube</span>{" "}
              <span style={{ color: "#666" }}>
                v1.0.0 © {new Date().getFullYear()}
              </span>
            </div>
          </td>
        </tr>
      </table>
    </footer>
  );
};

export default Footer;
