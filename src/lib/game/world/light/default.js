const fogStart = 20.0;
const fogEnd = 200.0;
const fogRange = fogEnd - fogStart;

const values = {
  sunParams:          [-0.8,   -0.8, -0.8, 0.0],
  sunAmbientColor:    [ 0.5,    0.5,  0.5, 0.0],
  sunDiffuseColor:    [ 0.25,   0.5,  1.0, 0.0],
  fogParams:          [ -(1.0 / (fogRange)), (1.0 / fogRange) * fogEnd, 1.0, 0.0],
  fogColor:           [ 0.25,   0.5,  1.0, 0.0]
};

export default values;
