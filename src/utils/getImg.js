function getImgUrl(name) {
  return new URL(`../assets/food/${name}`, import.meta.url);
}
export { getImgUrl };
