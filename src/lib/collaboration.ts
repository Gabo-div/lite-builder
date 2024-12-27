export const defaultNames = [
  "Schema Surfer",
  "Query Cowboy",
  "Data Diver",
  "Index Intruder",
  "Table Troublemaker",
  "Byte Bandit",
  "Row Wrangler",
  "Column Commander",
];

export const defaultColors = [
  "#e11d48",
  "#c026d3",
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#65a30d",
  "#d97706",
];

export const getRandomUsername = () => {
  return defaultNames[Math.floor(Math.random() * defaultNames.length)];
};

export const getRandomColor = () => {
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
};

export const createSync = <T>({
  syncFn,
  updatesPerSecond,
}: {
  syncFn: (data: T) => void;
  updatesPerSecond: number;
}) => {
  let timer: NodeJS.Timeout | null = null;
  let lastData: T | null = null;

  const sync = (data: T) => {
    lastData = data;

    if (timer) {
      return;
    }

    timer = setTimeout(() => {
      if (lastData) {
        syncFn(lastData);
      }

      timer = null;
      lastData = null
    }, 1000 / updatesPerSecond);
  };

  const getLastData = () => lastData;

  return { sync, getLastData };
};
