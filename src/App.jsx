import { useRef, useEffect, useState } from "react";

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState("draw");
  const [color, setColor] = useState("deepskyblue"); // 攻撃：青

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = "round";
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
    }

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Skyscraper 2F</h1>

      {/* 操作パネル */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("draw")}>✏️ ペン</button>
        <button onClick={() => setMode("erase")}>🧽 消しゴム</button>

        <span style={{ margin: "0 10px" }}>|</span>

        <button onClick={() => setColor("deepskyblue")}>
          🔵 攻撃
        </button>
        <button onClick={() => setColor("red")}>
          🔴 防衛
        </button>

        <span style={{ margin: "0 10px" }}>|</span>

        <button onClick={clearAll}>🗑 全消去</button>
      </div>

      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src="/maps/skyscraper/2f.png"
          alt="Skyscraper 2F Map"
          width={800}
        />

        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            cursor: mode === "erase" ? "not-allowed" : "crosshair"
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}

export default App;