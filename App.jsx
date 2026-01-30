import { useEffect, useRef, useState } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import mapImg from "./assets/skyscraper-2f.png";

function App() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room") ||"skyscraper-2f";

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [pins, setPins] = useState([]);
  const [strokes, setStrokes] = useState([]);

  const [drawing, setDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);

  
  /* --------------------
     画像クリック → ピン追加
  -------------------- */
  const handleMapClick = async (e) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    await addDoc(
      collection(db, "rooms", roomId, "pins"),
      { x, y, createdAt: Date.now() }
    );
  };

  /* --------------------
     Canvas 座標取得
  -------------------- */
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  /* --------------------
     描画イベント
  -------------------- */
  const startDraw = (e) => {
    setDrawing(true);
    setCurrentStroke([getCanvasPos(e)]);
  };

  const draw = (e) => {
    if (!drawing) return;
    setCurrentStroke((prev) => [...prev, getCanvasPos(e)]);
  };

  const endDraw = async () => {
    setDrawing(false);
    if (currentStroke.length < 2) {
      setCurrentStroke([]);
      return;
    }

    await addDoc(
      collection(db, "rooms", roomId, "strokes"),
      {
        points: currentStroke,
        color: "blue",
        width: 3,
        createdAt: Date.now()
      }
    );
    setCurrentStroke([]);
  };

  /* --------------------
     Firestore 同期
  -------------------- */
  useEffect(() => {
    const unsubPins = onSnapshot(
      collection(db, "rooms", roomId, "pins"),
      (snapshot) => {
        setPins(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubStrokes = onSnapshot(
      collection(db, "rooms", roomId, "strokes"),
      (snapshot) => {
        setStrokes(snapshot.docs.map((d) => d.data()));
      }
    );

    return () => {
      unsubPins();
      unsubStrokes();
    };
  },);

  /* --------------------
     Canvas サイズ同期
  -------------------- */
  useEffect(() => {
    if (!imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = imgRef.current.clientWidth;
    canvas.height = imgRef.current.clientHeight;
  }, []);

  /* --------------------
     Canvas 再描画
  -------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawStroke = (stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.stroke();
    };

    strokes.forEach(drawStroke);
    if (currentStroke.length > 1) {
      drawStroke({ points: currentStroke, color: "blue", width: 3 });
    }
  }, [strokes, currentStroke]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Skyscraper 2F - Tactical Board</h2>

      <div
        style={{
          position: "relative",
          display: "inline-block"
        }}
        onClick={handleMapClick}
      >
        <img
          ref={imgRef}
          src={mapImg}
          alt="map"
          style={{ maxWidth: 800, width: "100%" }}
        />

        {/* Canvas（描画用） */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            cursor: "crosshair"
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />

        {/* ピン表示 */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            style={{
              position: "absolute",
              left: pin.x - 6,
              top: pin.y - 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "red",
              pointerEvents: "none"
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;