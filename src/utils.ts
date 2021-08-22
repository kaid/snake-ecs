export const randomFor = (max: number, start: number = 0) => {
  const delta = max - start;
  return start + Math.floor(Math.random() * delta);
}
