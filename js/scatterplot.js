class Scatterplot {

  constructor(_config, _data, _selectedAttribute1, _selectedAttribute2) {
    this.config = {
      parentElement: _config.parentElement,
      //containerWidth: 700,
      //containerHeight: 300,
      contextHeight: 30,
      margin: {top: 25, right: 20, bottom: 50, left: 50},
      contextMargin: {top: 300, right: 20, bottom: 20, left: 50},
      tooltipPadding: 15
    }
    this.data = _data;
    this.selectedAttribute1 = _selectedAttribute1;
    this.selectedAttribute2 = _selectedAttribute2;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Initialize scales
    // vis.colorScale = d3.scaleOrdinal()
    //     .range(['#d3eecd', '#7bc77e', '#2a8d46']) // light green to dark green
    //     .domain(['Easy','Intermediate','Difficult']);

    vis.xScale = d3.scaleLinear();
    vis.yScale = d3.scaleLinear();

    vis.xScaleContext = d3.scaleLinear();
    vis.yScaleContext = d3.scaleLinear()
        .range([vis.config.contextHeight, 0])
        .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickPadding(10)
        .tickFormat(d => vis.selectedAttribute1.includes("Percent") ? d + '%' : d);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickPadding(10)
        .tickFormat(d => vis.selectedAttribute2.includes("Percent") ? d + '%' : d);

    vis.xAxisContext = d3.axisBottom(vis.xScaleContext).tickSizeOuter(0);

    vis.title = d3.select(vis.config.parentElement).append('h3')
      .attr('id', "scatter-title");

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg');
    // .attr('width', vis.config.containerWidth)
    // .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis');
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append both axis titles
    vis.xAxisTitle = vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(`${vis.selectedAttribute1}`);

    vis.yAxisTitle = vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .text(`${vis.selectedAttribute2}`);

    // Append context group with x- and y-axes
    vis.context = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.contextMargin.left},${vis.config.contextMargin.top})`);

    vis.contextAreaPath = vis.context.append('path')
        .attr('class', 'chart-area');

    vis.xAxisContextG = vis.context.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.config.contextHeight})`);

    vis.brushG = vis.context.append('g')
        .attr('class', 'brush x-brush');


    // Initialize brush component
    vis.brush = d3.brushX();
  }

  /**
   * Set the size of the SVG container, and prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    let element=document.querySelector("#scatter-title"); 
    element.innerText = `${vis.selectedAttribute1} (x) vs. ${vis.selectedAttribute2} (y)`;

    // Update all dimensions based on the current screen size
    vis.config.containerWidth = document.getElementById(vis.config.parentElement.substring(1)).clientWidth;
    vis.config.containerHeight = document.getElementById(vis.config.parentElement.substring(1)).clientHeight;
    //console.log(vis.config.containerHeight);

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
    vis.svg
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.xAxisG
        .attr('transform', `translate(0,${vis.config.height})`);

    vis.xAxisTitle
        .attr('y', vis.config.height - 15)
        .attr('x', vis.config.width + 10);

    vis.xAxis
        .tickSize(-vis.config.height - 10);

    vis.yAxis
        .tickSize(-vis.config.width - 10);

    vis.brush
        .extent([[0, 0], [vis.config.width, vis.config.contextHeight]])
        .on('brush', function({selection}) {
          if (selection) vis.brushed(selection);
        })
        .on('end', function({selection}) {
          if (!selection) vis.brushed(null);
        });
    
    // Specificy accessor functions
    //vis.colorValue = d => d.difficulty;
    //vis.xValue = d => +d.Ed5CollegePlusPct;
    switch (vis.selectedAttribute1) {
      case "Percent Under 18":
        vis.xValue = d => +d.Under18Pct2020;
        break;
      case "Percent 65 or Older":
        vis.xValue = d => +d.Age65AndOlderPct2020;
        break;
      case "Percent White":
        vis.xValue = d => +d.WhiteNonHispanicPct2020;
        break;
      case "Percent African American":
        vis.xValue = d => +d.BlackNonHispanicPct2020;
        break;
      case "Percent Asian":
        vis.xValue = d => +d.AsianNonHispanicPct2020;
        break;
      case "Percent Native American":
        vis.xValue = d => +d.NativeAmericanNonHispanicPct2020;
        break;
      case "Percent Hispanic":
        vis.xValue = d => +d.HispanicPct2020;
        break;
      case "Percent Multiple Race":
        vis.xValue = d => +d.MultipleRacePct2020;
        break;
      case "Percent Foreign Born":
        vis.xValue = d => +d.ForeignBornPct;
        break;
      case "Percent Europe Born":
        vis.xValue = d => +d.ForeignBornEuropePct;
        break;
      case "Percent Mexican Born":
        vis.xValue = d => +d.ForeignBornMexPct;
        break;
      case "Percent  Non-English Households":
        vis.xValue = d => +d.NonEnglishHHPct;
        break;
      case "Percent No High School Diploma":
        vis.xValue = d => +d.Ed1LessThanHSPct;
        break;
      case "Percent High School Only":
        vis.xValue = d => +d.Ed2HSDiplomaOnlyPct;
        break;
      case "Percent Some College":
        vis.xValue = d => +d.Ed3SomeCollegePct;
        break;
      case "Percent Associate's Degree":
        vis.xValue = d => +d.Ed4AssocDegreePct;
        break;
      case "Percent 4-Year Degree or Higher":
        vis.xValue = d => +d.Ed5CollegePlusPct;
        break;
      case "Average Household Size":
        vis.xValue = d => +d.AvgHHSize;
        break;
      case "Percent Female-Lead Families":
        vis.xValue = d => +d.FemaleHHPct;
        break;
      case "Median Household Income":
        vis.xValue = d => +d.Median_HH_Inc_ACS;
        break;
      case "Income Per Capita":
        vis.xValue = d => +d.PerCapitaInc;
        break;
      case "Poverty Rate":
        vis.xValue = d => +d.Poverty_Rate_ACS;
        break;
      case "Child Poverty Rate":
        vis.xValue = d => +d.Poverty_Rate_0_17_ACS;
        break;
      case "Deep Poverty Rate":
        vis.xValue = d => +d.Deep_Pov_All;
        break;
      case "Child Deep Poverty Rate":
        vis.xValue = d => +d.Deep_Pov_Children;
        break;
      default:
        vis.xValue = d => +d.Ed5CollegePlusPct;
        break;
    }

    switch (vis.selectedAttribute2) {
      case "Percent Under 18":
        vis.yValue = d => +d.Under18Pct2020;
        break;
      case "Percent 65 or Older":
        vis.yValue = d => +d.Age65AndOlderPct2020;
        break;
      case "Percent White":
        vis.yValue = d => +d.WhiteNonHispanicPct2020;
        break;
      case "Percent African American":
        vis.yValue = d => +d.BlackNonHispanicPct2020;
        break;
      case "Percent Asian":
        vis.yValue = d => +d.AsianNonHispanicPct2020;
        break;
      case "Percent Native American":
        vis.yValue = d => +d.NativeAmericanNonHispanicPct2020;
        break;
      case "Percent Hispanic":
        vis.yValue = d => +d.HispanicPct2020;
        break;
      case "Percent Multiple Race":
        vis.yValue = d => +d.MultipleRacePct2020;
        break;
      case "Percent Foreign Born":
        vis.yValue = d => +d.ForeignBornPct;
        break;
      case "Percent Europe Born":
        vis.yValue = d => +d.ForeignBornEuropePct;
        break;
      case "Percent Mexican Born":
        vis.yValue = d => +d.ForeignBornMexPct;
        break;
      case "Percent  Non-English Households":
        vis.yValue = d => +d.NonEnglishHHPct;
        break;
      case "Percent No High School Diploma":
        vis.yValue = d => +d.Ed1LessThanHSPct;
        break;
      case "Percent High School Only":
        vis.yValue = d => +d.Ed2HSDiplomaOnlyPct;
        break;
      case "Percent Some College":
        vis.yValue = d => +d.Ed3SomeCollegePct;
        break;
      case "Percent Associate's Degree":
        vis.yValue = d => +d.Ed4AssocDegreePct;
        break;
      case "Percent 4-Year Degree or Higher":
        vis.yValue = d => +d.Ed5CollegePlusPct;
        break;
      case "Average Household Size":
        vis.yValue = d => +d.AvgHHSize;
        break;
      case "Percent Female-Lead Families":
        vis.yValue = d => +d.FemaleHHPct;
        break;
      case "Median Household Income":
        vis.yValue = d => +d.Median_HH_Inc_ACS;
        break;
      case "Income Per Capita":
        vis.yValue = d => +d.PerCapitaInc;
        break;
      case "Poverty Rate":
        vis.yValue = d => +d.Poverty_Rate_ACS;
        break;
      case "Child Poverty Rate":
        vis.yValue = d => +d.Poverty_Rate_0_17_ACS;
        break;
      case "Deep Poverty Rate":
        vis.yValue = d => +d.Deep_Pov_All;
        break;
      case "Child Deep Poverty Rate":
        vis.yValue = d => +d.Deep_Pov_Children;
        break;
      default:
        vis.yValue = d => +d.Ed5CollegePlusPct;
        break;
    }

    // Set the scale input domains
    vis.xScale
        .range([0, vis.config.width])
        .domain([0, d3.max(vis.data, vis.xValue)]);
    
    vis.yScale
        .range([vis.config.height, 0])
        .domain([0, d3.max(vis.data, vis.yValue)]);

    vis.xScaleContext
      .range([0, vis.config.width])
      .domain(vis.xScale.domain());

    vis.yScaleContext
      .domain(vis.yScale.domain());

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // vis.focusLinePath
    //     .datum(vis.data)
    //     .attr('d', vis.line);

    // vis.contextAreaPath
    //     .datum(vis.data)
    //     .attr('d', vis.area);

    // Add circles
    vis.circles = vis.chart.selectAll('.point')
        .data(vis.data)
      .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr('fill', "#e7298a");

    // Tooltip event listeners
    vis.circles
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.County} County, ${d.State}</div>
              <div>${vis.selectedAttribute1} (x): ${vis.xValue(d)}</div>
              <div>${vis.selectedAttribute2} (y): ${vis.yValue(d)}</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
    
    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())
    
    //vis.xAxisContextG.call(vis.xAxisContext);
    
    // Update the brush and define a default position
    const defaultBrushSelection = [vis.xScale(0), vis.xScaleContext.range()[1]];
    vis.brushG
        .call(vis.brush)
        .call(vis.brush.move, defaultBrushSelection);
  }

  /**
   * React to brush events
   */
  brushed(selection) {
    let vis = this;

    // Check if the brush is still active or if it has been removed
    if (selection) {
      // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
      const selectedDomain = selection.map(vis.xScaleContext.invert, vis.xScaleContext);
      //console.log(selectedDomain);
      // Update x-scale of the focus view accordingly
      vis.xScale.domain(selectedDomain);
    } else {
      // Reset x-scale of the focus view (full time period)
      vis.xScale.domain(vis.xScaleContext.domain());
    }

    // Redraw line and update x-axis labels in focus view
    vis.circles
      .attr('cx', d => vis.xScale(vis.xValue(d)));
    vis.xAxisG.call(vis.xAxis);
  }
}