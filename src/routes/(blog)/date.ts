export const formatDate = (date: Temporal.PlainDate) =>
  Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
