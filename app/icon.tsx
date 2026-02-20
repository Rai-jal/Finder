import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)",
          borderRadius: 8,
        }}
      >
        {/* Finder-style face: eyes and smile */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Eyes */}
          <div
            style={{
              display: "flex",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "white",
              }}
            />
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "white",
              }}
            />
          </div>
          {/* Smile */}
          <div
            style={{
              width: 12,
              height: 6,
              borderBottom: "2px solid white",
              borderRadius: "0 0 12px 12px",
              marginTop: 1,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
