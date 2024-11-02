export function getRandomUid() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 10);
}
