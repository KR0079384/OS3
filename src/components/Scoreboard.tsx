import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface Score {
  id: string;
  team: string;
  score: number;
  category: string;
  judgedBy: string;
}

const Scoreboard = () => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const q = query(collection(db, "scores"), orderBy("score", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Score[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Score, "id">),
      }));

      setScores(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        🏆 Live Scoreboard
      </h1>

      {/* Table Container */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 overflow-hidden">
        <table className="w-full">
          {/* Table Head */}
          <thead>
            <tr className="bg-white/10 text-gray-300 text-sm uppercase tracking-wider">
              <th className="p-4 text-left">Team</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4 text-center">Category</th>
              <th className="p-4 text-center">Judge</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {scores.map((s, index) => (
              <tr
                key={s.id}
                className={`border-t border-white/10 text-gray-200 transition duration-200 hover:bg-white/10 ${
                  index === 0 ? "bg-green-500/10" : ""
                }`}
              >
                <td className="p-4 font-semibold">{s.team}</td>
                <td className="p-4 text-center font-bold text-lg text-green-400">
                  {s.score}
                </td>
                <td className="p-4 text-center">{s.category}</td>
                <td className="p-4 text-center text-sm text-gray-400">
                  {s.judgedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scoreboard;
