export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-CA", {
    day: "numeric",
    month: "2-digit",
    year: "numeric",
  });
};
