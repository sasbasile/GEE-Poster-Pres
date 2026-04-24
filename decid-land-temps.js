//// Script by Dr. Amber Ignatius and Samantha Basile, UNG IESA. SPIS7000K spring 2026 ////
//// Script to calculate and visualize thermal infrared for AOI//// Bands 4,3,2

// Load AOI
var AOI = ee.FeatureCollection("users/ssbasile/ChickAOI");
Map.centerObject(AOI, 16);

// Filter Landsat 8
var filteredIC = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate('2013-09-01', '2013-11-30')
  .filterBounds(AOI);

// Median composite
var medianImage = filteredIC.median();

// Clip to AOI
var clippedImage = medianImage.clip(AOI);

// True color layer
var trueColor = clippedImage.select(['B4','B3','B2']);
Map.addLayer(trueColor, {min:0, max:0.3, gamma:1.4}, 'True Color');

// Thermal band → Celsius
var lstCelsius = clippedImage.select('B10').subtract(273.15);

// Add temperature layer
Map.addLayer(lstCelsius, {
  min:05,
  max:32,
  palette:['blue','green','yellow','red']
}, 'LST (°C)');

// ---- STATS GO HERE ----
var stats = lstCelsius.reduceRegion({
  reducer: ee.Reducer.minMax()
    .combine({
      reducer2: ee.Reducer.mean(),
      sharedInputs: true
    }),
  geometry: AOI,
  scale: 30,
  bestEffort: true
});

print('LST Stats (°C)', stats);

// Export.image.toDrive({
//   image: lstCelsius,
//   description: 'CW13_LST',
//   fileNamePrefix: 'CW13_LST',
//   region: AOI,
//   scale: 20,
//   maxPixels: 1e13
// });

// Export True Color
Export.image.toDrive({
  image: trueColor,
  description: 'CW_TrueColor_13',
  fileNamePrefix: 'CW_TrueColor_13',
  region: AOI,
  scale: 30,
  maxPixels: 1e13
});
