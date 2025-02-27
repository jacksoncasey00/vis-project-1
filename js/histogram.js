class Histogram {
  constructor(_config, _data, _selectedAttribute) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      //containerWidth: _config.containerWidth || 500,
      //containerHeight: _config.containerHeight || 200,
      contextHeight: 20,
      margin: _config.margin || {top: 10, right: 5, bottom: 70, left: 30},
      contextMargin: {top: 165, right: 5, bottom: 25, left: 30},
      reverseOrder: _config.reverseOrder || false,
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.selectedAttribute = _selectedAttribute;
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.config.containerWidth = document.getElementById(vis.config.parentElement.substring(1)).clientWidth;
    //console.log(vis.config.containerWidth);
    vis.config.containerHeight = document.getElementById(vis.config.parentElement.substring(1)).clientHeight;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales and axes
    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]) 

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width])
        //.paddingInner(0.2);

    vis.xScaleContext = d3.scaleLinear()
        .range([0, vis.width]);
    vis.yScaleContext = d3.scaleLinear()
        .range([vis.config.contextHeight, 0])
        .nice();

    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSizeOuter(0)
        .tickFormat(d => vis.selectedAttribute.includes("Percent") ? d + '%' : d);;

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSizeOuter(0);
        //.tickFormat(d3.formatPrefix('.0s', 1e6)); // Format y-axis ticks as millions
    
    vis.xAxisContext = d3.axisBottom(vis.xScaleContext).tickSizeOuter(0);

    vis.title = d3.select(vis.config.parentElement).append('h3')
      .attr('class', "hist-title");

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group 
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

     // Append both axis titles
    vis.xAxisTitle = vis.chart.append('text')
     .attr('class', 'axis-title')
     .attr('transform', `translate(${vis.width},${vis.height-20})`)
     .attr('dy', '.71em')
     .style('text-anchor', 'end')
     .text('Attribute Val.');

    vis.yAxisTitle = vis.svg.append('text')
     .attr('class', 'axis-title')
     .attr('x', 0)
     .attr('y', 0)
     .attr('dy', '.71em')
     .text('Num. Counties');

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

    vis.brush = d3.brushX()
      .extent([[0, 0], [vis.width, vis.config.contextHeight]])
        .on('brush', function({selection}) {
          if (selection) vis.brushed(selection);
        })
        .on('end', function({selection}) {
          if (!selection) vis.brushed(null);
        });;

  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;
    let elements=document.querySelectorAll(".hist-title"); 
    elements.forEach(element => {
      element.innerText = `County Distribution By ${vis.selectedAttribute}`;
    });

    // Reverse column order depending on user selection
    // if (vis.config.reverseOrder) {
    //   vis.data.reverse();
    // }

    // Specificy x- and y-accessor functions
    switch (vis.selectedAttribute) {
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
    vis.yValue = d => +d.length;
    //console.log(vis.xValue.call());

    // Bin the data.
    // vis.bins = d3.bin()
    //   .thresholds(10)
    //   .value((d) => vis.xValue(d))(vis.data);

    // let histogram = d3.histogram()
    //     .value(d => vis.xValue(d))   // I need to give the vector of value
    //     .domain(vis.xScale.domain())  // then the domain of the graphic
    //     .thresholds(vis.xScale.ticks(10)); // then the numbers of bins
  
    // // And apply this function to data to get the bins
    // bins = histogram(vis.data);
    //console.log(vis.bins(values));
    // Set the scale input domains
    vis.xScale.domain([0, d3.max(vis.data, d => vis.xValue(d))]);

    let histogram = d3.histogram()
        .value(d => vis.xValue(d))   // I need to give the vector of value
        .domain(vis.xScale.domain())  // then the domain of the graphic
        .thresholds(vis.xScale.ticks(60)); // then the numbers of bins
  
    // And apply this function to data to get the bins
    vis.bins = histogram(vis.data);

    vis.yScale.domain([0, d3.max(vis.bins, d => vis.yValue(d))]);

    vis.xScaleContext
      .domain(vis.xScale.domain());

    vis.yScaleContext
      .domain(vis.yScale.domain());

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add rectangles 
    vis.bars = vis.chart.selectAll('.bar')
        .data(vis.bins)
      .join('rect');
    
    vis.bars//.style('opacity', 0.5)
      //.transition().duration(1000)
        .style('opacity', 1)
        .attr('class', 'bar')
        .attr('x', (d) => vis.xScale(d.x0))
        //.attr('x', d => vis.xScale(vis.xValue(d)))
        //.attr("transform", d => "translate(" + (vis.xScale(d[0])) + "," + vis.yScale(d.length) + ")")
        .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
        .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
        .attr('y', d => vis.yScale(vis.yValue(d)))
        .attr('fill', vis.config.parentElement == "#histogram1" ? "#fdae61" : "#a6d854");
    
    // Tooltip event listeners
    vis.bars
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            // Format number with million and thousand separator
            .html(`<div class="tooltip-title">Number of Counties: ${vis.yValue(d)}</div>`);
        })
        .on('mousemove', (event) => {
          d3.select('#tooltip')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

    // Update axes
    vis.xAxisG
        //.transition().duration(1000)
        .call(vis.xAxis);

    vis.yAxisG.call(vis.yAxis);

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
    vis.bars
      .attr('x', (d) => vis.xScale(d.x0))
      .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1);
    vis.xAxisG.call(vis.xAxis);
  }
}