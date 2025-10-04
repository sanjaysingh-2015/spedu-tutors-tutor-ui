function nextDateForDayOfWeek(baseDate, dayOfWeek) {
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const base = new Date(baseDate);
  const currentDay = base.getDay();
  const targetDay = days.indexOf(dayOfWeek);
  let diff = targetDay - currentDay;
  if (diff < 0) diff += 7; // move to next week
  base.setDate(base.getDate() + diff);
  return base;
}
export default nextDateForDayOfWeek;