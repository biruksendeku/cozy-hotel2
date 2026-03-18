function startOfToday(date = new Date()) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  return today;
}

function startOfYesterday(date = new Date()) {
  const yesterday = startOfToday(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

function endOfYesterday(date = new Date()) {
  return new Date(startOfToday(date).getTime() - 1);
}

function endOfDay(date) {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function weekBounds(date = new Date()) {
  const start = startOfToday(date);
  start.setDate(start.getDate() - start.getDay());

  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - 7);
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);

  return { start, previousStart, previousEnd: endOfDay(previousEnd) };
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const previousStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const previousEnd = new Date(date.getFullYear(), date.getMonth(), 0);

  return { start, previousStart, previousEnd: endOfDay(previousEnd) };
}

function yearBounds(date = new Date()) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const previousStart = new Date(year - 1, 0, 1);
  const previousEnd = new Date(year - 1, 11, 31);

  return { start, previousStart, previousEnd: endOfDay(previousEnd) };
}

module.exports = {
  startOfToday,
  startOfYesterday,
  endOfYesterday,
  weekBounds,
  monthBounds,
  yearBounds,
};
