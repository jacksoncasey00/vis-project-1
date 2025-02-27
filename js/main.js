
let parsedData;
const groupedData = {};

let histogram1, histogram2, scatterplot, map1, map2, selectedAttribute1, selectedAttribute2, geoData1, geoData2, 
map1Selected, mapClassifier, mapFilter, geoData1Filtered, geoData2Filtered, mapFilterText;

/**
 * Load data from CSV file asynchronously and render area chart
 */
Promise.all([
  d3.csv('data/income.csv'),
  d3.csv('data/people.csv'),
  d3.json('data/counties-10m.json'),
  d3.json('data/counties-10m.json')
]).then(data => {
  transformData(data[0]);
  transformData(data[1]);
  parsedData = Object.values(groupedData);
  console.log(parsedData);

  geoData1 = data[2];
  geoData2 = data[3];

  selectedAttribute1 = "Percent 4-Year Degree or Higher";
  selectedAttribute2 = "Median Household Income";
  mapClassifier = "County";
  mapFilter = "00";
  mapFilterText = "United States";

  //geoData1.objects.counties.geometries = geoData1.objects.counties.geometries.filter(x => x.id.slice(0, -3) === "01");
  geoData1.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (+d.id === +parsedData[i].FIPS) {
        d.properties.attribute = +parsedData[i].Ed5CollegePlusPct;
      }
    }
  });

  geoData1.objects.states.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (parsedData[i].FIPS.slice(-3) === "000" && +d.id === +parsedData[i].FIPS.slice(0, -3)) {
        d.properties.attribute = +parsedData[i].Ed5CollegePlusPct;
      }
    }
  });

  //geoData2.objects.counties.geometries = geoData2.objects.counties.geometries.filter(x => x.id.slice(0, -3) === "01");
  geoData2.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (+d.id === +parsedData[i].FIPS) {
        d.properties.attribute = +parsedData[i].Median_HH_Inc_ACS;
      }
    }
  });

  geoData2.objects.states.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (parsedData[i].FIPS.slice(-3) === "000" && +d.id === +parsedData[i].FIPS.slice(0, -3)) {
        d.properties.attribute = +parsedData[i].Median_HH_Inc_ACS;
      }
    }
  });

  geoData1Filtered = JSON.parse(JSON.stringify(geoData1));
  geoData2Filtered = JSON.parse(JSON.stringify(geoData2));

  map1Selected = true;

  histogram1 = new Histogram({ parentElement: '#histogram1' }, parsedData, selectedAttribute1);
  histogram1.updateVis();

  histogram2 = new Histogram({ parentElement: '#histogram2' }, parsedData, selectedAttribute2);
  histogram2.updateVis();

  scatterplot = new Scatterplot({ parentElement: '#scatterplot' }, parsedData, selectedAttribute1, selectedAttribute2);
  scatterplot.updateVis();

  map1 = new ChloroplethMap({ 
    parentElement: '#map1'
  }, geoData1, mapClassifier, selectedAttribute1, mapFilterText);
  map1.updateVis();

  // map2 = new ChloroplethMap({ 
  //   parentElement: '#map2'
  // }, geoData2);
  // map2.updateVis();
}).catch(error => console.error(error));

function transformData(data) {

  data.forEach(row => {
    const { FIPS, State, County, Attribute, Value } = row;
    const key = `${FIPS}-${State}-${County}`;

    if (!groupedData[key]) {
      groupedData[key] = { FIPS, State, County };
    }

    // Assign each attribute's value as a new property
    groupedData[key][Attribute] = Value;
  });
}

function attributeGeoData(d, i, selectedAttribute) {
  switch (selectedAttribute) {
    case "Percent Under 18":
      d.properties.attribute = +parsedData[i].Under18Pct2020;
      break;
    case "Percent 65 or Older":
      d.properties.attribute = +parsedData[i].Age65AndOlderPct2020;
      break;
    case "Percent White":
      d.properties.attribute = +parsedData[i].WhiteNonHispanicPct2020;
      break;
    case "Percent African American":
      d.properties.attribute = +parsedData[i].BlackNonHispanicPct2020;
      break;
    case "Percent Asian":
      d.properties.attribute = +parsedData[i].AsianNonHispanicPct2020;
      break;
    case "Percent Native American":
      d.properties.attribute = +parsedData[i].NativeAmericanNonHispanicPct2020;
      break;
    case "Percent Hispanic":
      d.properties.attribute = +parsedData[i].HispanicPct2020;
      break;
    case "Percent Multiple Race":
      d.properties.attribute = +parsedData[i].MultipleRacePct2020;
      break;
    case "Percent Foreign Born":
      d.properties.attribute = +parsedData[i].ForeignBornPct;
      break;
    case "Percent Europe Born":
      d.properties.attribute = +parsedData[i].ForeignBornEuropePct;
      break;
    case "Percent Mexican Born":
      d.properties.attribute = +parsedData[i].ForeignBornMexPct;
      break;
    case "Percent  Non-English Households":
      d.properties.attribute = +parsedData[i].NonEnglishHHPct;
      break;
    case "Percent No High School Diploma":
      d.properties.attribute = +parsedData[i].Ed1LessThanHSPct;
      break;
    case "Percent High School Only":
      d.properties.attribute = +parsedData[i].Ed2HSDiplomaOnlyPct;
      break;
    case "Percent Some College":
      d.properties.attribute = +parsedData[i].Ed3SomeCollegePct;
      break;
    case "Percent Associate's Degree":
      d.properties.attribute = +parsedData[i].Ed4AssocDegreePct;
      break;
    case "Percent 4-Year Degree or Higher":
      d.properties.attribute = +parsedData[i].Ed5CollegePlusPct;
      break;
    case "Average Household Size":
      d.properties.attribute = +parsedData[i].AvgHHSize;
      break;
    case "Percent Female-Lead Families":
      d.properties.attribute = +parsedData[i].FemaleHHPct;
      break;
    case "Median Household Income":
      d.properties.attribute = +parsedData[i].Median_HH_Inc_ACS;
      break;
    case "Income Per Capita":
      d.properties.attribute = +parsedData[i].PerCapitaInc;
      break;
    case "Poverty Rate":
      d.properties.attribute = +parsedData[i].Poverty_Rate_ACS;
      break;
    case "Child Poverty Rate":
      d.properties.attribute = +parsedData[i].Poverty_Rate_0_17_ACS;
      break;
    case "Deep Poverty Rate":
      d.properties.attribute = +parsedData[i].Deep_Pov_All;
      break;
    case "Child Deep Poverty Rate":
      d.properties.attribute = +parsedData[i].Deep_Pov_Children;
      break;
    default:
      d.properties.attribute = +parsedData[i].Ed5CollegePlusPct;
      break;
  }
}

document.getElementById("attribute1").addEventListener("change", function () {
  selectedAttribute1 = this.value;
  histogram1.selectedAttribute = selectedAttribute1;
  scatterplot.selectedAttribute1 = selectedAttribute1;
  map1.selectedAttribute = selectedAttribute1;
  geoData1.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (+d.id === +parsedData[i].FIPS) {
        attributeGeoData(d, i, selectedAttribute1);
      }
    }
  });
  geoData1.objects.states.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (parsedData[i].FIPS.slice(-3) === "000" && +d.id === +parsedData[i].FIPS.slice(0, -3)) {
        attributeGeoData(d, i, selectedAttribute2);
      }
    }
  });
  if (mapFilter !== "00") {
    geoData1Filtered.objects.counties.geometries = geoData1.objects.counties.geometries.filter(x => x.id.slice(0, -3) === mapFilter);
  }
  else {
    geoData1Filtered = JSON.parse(JSON.stringify(geoData1));
  }
  map1.data = geoData1Filtered;
  map1Selected = true;
  histogram1.updateVis();
  scatterplot.updateVis();
  map1.updateVis();
});

document.getElementById("attribute2").addEventListener("change", function () {
  selectedAttribute2 = this.value;
  histogram2.selectedAttribute = selectedAttribute2;
  scatterplot.selectedAttribute2 = selectedAttribute2;
  map1.selectedAttribute = selectedAttribute2;
  geoData2.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (+d.id === +parsedData[i].FIPS) {
        attributeGeoData(d, i);
      }
    }
  });
  geoData2.objects.states.geometries.forEach(d => {
    for (let i = 0; i < parsedData.length; i++) {
      if (parsedData[i].FIPS.slice(-3) === "000" && +d.id === +parsedData[i].FIPS.slice(0, -3)) {
        attributeGeoData(d, i);
      }
    }
  });
  if (mapFilter !== "00") {
    geoData2Filtered.objects.counties.geometries = geoData2.objects.counties.geometries.filter(x => x.id.slice(0, -3) === mapFilter);
  }
  else {
    geoData2Filtered = JSON.parse(JSON.stringify(geoData2));
  }
  map1.data = geoData2Filtered;
  map1Selected = false;

  histogram2.updateVis();
  scatterplot.updateVis();
  map1.updateVis();
});

document.getElementById("mapSwitch").addEventListener("click", function () {
  if (map1Selected) {
    map1.selectedAttribute = selectedAttribute2;
    map1.data = geoData2Filtered;
  }
  else {
    map1.selectedAttribute = selectedAttribute1;
    map1.data = geoData1Filtered;
  }
  map1Selected = !map1Selected;
  map1.updateVis();
});

document.getElementById("mapClassifier").addEventListener("change", function () {
  mapClassifier = this.value;
  if (mapClassifier == "State") {
    mapFilter = "00";
    geoData1Filtered = JSON.parse(JSON.stringify(geoData1));
    geoData2Filtered = JSON.parse(JSON.stringify(geoData2));
  }
  if (map1Selected) {
    map1.selectedAttribute = selectedAttribute1;
    map1.data = geoData1Filtered;
  }
  else {
    map1.selectedAttribute = selectedAttribute2;
    map1.data = geoData2Filtered;
  }
  map1.classifier = mapClassifier;
  map1.updateVis();
});

document.getElementById("mapFilter").addEventListener("change", function () {
  const selectElement = document.getElementById('mapFilter');
  const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;

  mapFilter = this.value;
  mapFilterText = selectedOptionText;
  map1.selectedArea = mapFilterText;
  if (mapFilter !== "00") {
    geoData1Filtered.objects.counties.geometries = geoData1.objects.counties.geometries.filter(x => x.id.slice(0, -3) === mapFilter);
    geoData2Filtered.objects.counties.geometries = geoData2.objects.counties.geometries.filter(x => x.id.slice(0, -3) === mapFilter);
  }
  else {
    geoData1Filtered = JSON.parse(JSON.stringify(geoData1));
    geoData2Filtered = JSON.parse(JSON.stringify(geoData2));
  }
  if (map1Selected) {
    map1.selectedAttribute = selectedAttribute1;
    map1.data = geoData1Filtered;
  }
  else {
    map1.selectedAttribute = selectedAttribute2;
    map1.data = geoData2Filtered;
  }
  console.log(geoData1);

  map1.updateVis();
});