class MathUtil {

  // Clamps value to range
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

}

export default MathUtil;
