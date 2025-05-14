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
              <span style={{ color: "#666" }}>Region:</span>{" "}
              <span style={{ color: "#28a745" }}>
                {Deno.env.get("DENO_REGION") || "Unknown"}
              </span>
            </div>

            <div
              style={{
                padding: "4px",
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
