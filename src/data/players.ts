export interface Batter {
  id: string;
  name: string;
  team: "Tamil Nadu" | "Kerala";
  matches: number;
  runs: number;
  strikeRate: number;
  finalScore: number;
  pressureScore: number;
  consistencyScore: number;
  oppositionQualityScore: number;
}

export interface Bowler {
  id: string;
  name: string;
  team: "Tamil Nadu" | "Kerala";
  matches: number;
  finalScore: number;
  pressureScore: number;
  consistencyScore: number;
  oppositionQualityScore: number;
}

export const batters: Batter[] = [
  {
    id: "b1",
    name: "N Jagadeesan",
    team: "Tamil Nadu",
    matches: 24,
    runs: 1842,
    strikeRate: 82.4,
    finalScore: 88,
    pressureScore: 91,
    consistencyScore: 85,
    oppositionQualityScore: 79,
  },
  {
    id: "b2",
    name: "B Sai Sudharsan",
    team: "Tamil Nadu",
    matches: 18,
    runs: 1256,
    strikeRate: 78.9,
    finalScore: 84,
    pressureScore: 82,
    consistencyScore: 88,
    oppositionQualityScore: 81,
  },
  {
    id: "b3",
    name: "Sanju Samson",
    team: "Kerala",
    matches: 22,
    runs: 1634,
    strikeRate: 92.1,
    finalScore: 82,
    pressureScore: 76,
    consistencyScore: 72,
    oppositionQualityScore: 86,
  },
  {
    id: "b4",
    name: "B Indrajith",
    team: "Tamil Nadu",
    matches: 26,
    runs: 1478,
    strikeRate: 71.2,
    finalScore: 79,
    pressureScore: 84,
    consistencyScore: 81,
    oppositionQualityScore: 72,
  },
  {
    id: "b5",
    name: "Rohan Kunnummal",
    team: "Kerala",
    matches: 16,
    runs: 892,
    strikeRate: 68.4,
    finalScore: 71,
    pressureScore: 68,
    consistencyScore: 74,
    oppositionQualityScore: 69,
  },
  {
    id: "b6",
    name: "Sachin Baby",
    team: "Kerala",
    matches: 28,
    runs: 1124,
    strikeRate: 65.8,
    finalScore: 68,
    pressureScore: 71,
    consistencyScore: 69,
    oppositionQualityScore: 64,
  },
  {
    id: "b7",
    name: "Vijay Shankar",
    team: "Tamil Nadu",
    matches: 20,
    runs: 1045,
    strikeRate: 74.6,
    finalScore: 75,
    pressureScore: 78,
    consistencyScore: 72,
    oppositionQualityScore: 76,
  },
  {
    id: "b8",
    name: "Mohammed Azharuddeen",
    team: "Kerala",
    matches: 14,
    runs: 682,
    strikeRate: 88.2,
    finalScore: 64,
    pressureScore: 58,
    consistencyScore: 61,
    oppositionQualityScore: 71,
  },
];

export const bowlers: Bowler[] = [
  {
    id: "w1",
    name: "R Sai Kishore",
    team: "Tamil Nadu",
    matches: 22,
    finalScore: 86,
    pressureScore: 89,
    consistencyScore: 84,
    oppositionQualityScore: 82,
  },
  {
    id: "w2",
    name: "M Mohammed",
    team: "Tamil Nadu",
    matches: 26,
    finalScore: 81,
    pressureScore: 78,
    consistencyScore: 86,
    oppositionQualityScore: 79,
  },
  {
    id: "w3",
    name: "Basil Thampi",
    team: "Kerala",
    matches: 18,
    finalScore: 78,
    pressureScore: 82,
    consistencyScore: 74,
    oppositionQualityScore: 76,
  },
  {
    id: "w4",
    name: "Sandeep Warrier",
    team: "Kerala",
    matches: 24,
    finalScore: 74,
    pressureScore: 71,
    consistencyScore: 78,
    oppositionQualityScore: 72,
  },
  {
    id: "w5",
    name: "T Natarajan",
    team: "Tamil Nadu",
    matches: 16,
    finalScore: 72,
    pressureScore: 76,
    consistencyScore: 68,
    oppositionQualityScore: 74,
  },
  {
    id: "w6",
    name: "Jalaj Saxena",
    team: "Kerala",
    matches: 30,
    finalScore: 69,
    pressureScore: 65,
    consistencyScore: 76,
    oppositionQualityScore: 68,
  },
];
