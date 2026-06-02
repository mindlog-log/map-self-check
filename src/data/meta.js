export const ATTRIBUTES = {
  M: { name: "Mind", label: "状態", role: "今の状態・意識の向き", image: new URL("../assets/mind.png", import.meta.url).href },
  E: { name: "Emotion", label: "感情", role: "感情・反応・内側の揺れ", image: new URL("../assets/emotion.png", import.meta.url).href },
  D: { name: "Drive", label: "動力", role: "動力・行動へ向かう力", image: new URL("../assets/drive.png", import.meta.url).href },
  T: { name: "Thinking", label: "思考", role: "思考・認識・判断の流れ", image: new URL("../assets/thinking.png", import.meta.url).href },
  R: { name: "Reality", label: "現実", role: "現実・環境・表れている状態", image: new URL("../assets/reality.png", import.meta.url).href },
};

export const STATE_CODES = {
  A: { name: "ACTIVE", description: "自然に機能している状態" },
  D: { name: "DISTORTED", description: "少し歪みが出ている状態" },
  B: { name: "BLOCKED", description: "流れが止まりやすい状態" },
  O: { name: "OVERLOADED", description: "負荷がかかりすぎている状態" },
  I: { name: "INACTIVE", description: "動きが弱くなっている状態" },
  U: { name: "UNSTABLE", description: "揺れや不安定さがある状態" },
  S: { name: "DISPERSED", description: "意識や力が散りやすい状態" },
  C: { name: "COLLAPSED", description: "まとまりが崩れやすい状態" },
};

export const ABNORMAL_CODES = ["D", "B", "O", "I", "U", "S", "C"];
