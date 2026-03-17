export function customRounded(val) {
  return (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2);
}
