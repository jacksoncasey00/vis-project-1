class ChloroplethMap {
  constructor(_config, _data, _classifier, _selectedAttribute, _selectedArea) {
    this.config = {
      parentElement: _config.parentElement,
      //containerWidth: _config.containerWidth || 1000,
      //containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendTop: 0,
      legendLeft: 500,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.data = _data;
    this.classifier = _classifier;
    this.selectedAttribute = _selectedAttribute;
    this.selectedArea = _selectedArea;
    // this.config = _config;

    this.us = _data;

    this.active = d3.select(null);

    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
    vis.config.containerWidth = document.getElementById(vis.config.parentElement.substring(1)).clientWidth;
    vis.config.containerHeight = document.getElementById(vis.config.parentElement.substring(1)).clientHeight;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.title = d3.select(vis.config.parentElement).append('h3')
      .attr('id', "map-title");

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth ) //height + margin.top + margin.bottom)
            .attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
            .on('click', vis.clicked);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom);

            vis.counties = vis.g.append("g")
                .attr("id", "counties");

    vis.borders = vis.g.append("path");

    // Initialize gradient that we will later use for the legend
    vis.linearGradient = vis.svg.append('defs').append('linearGradient')
        .attr("id", "legend-gradient");

    // Append legend
    vis.legend = vis.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${vis.config.legendLeft},${vis.config.legendTop})`);
    
    vis.legendRect = vis.legend.append('rect')
        .attr('width', vis.config.legendRectWidth)
        .attr('height', vis.config.legendRectHeight);

    vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y', -10)
        .text('Pop. density per square km')
  }

  updateVis() {
    let vis = this;
    console.log(vis.data);
    let element=document.querySelector("#map-title"); 
    element.innerText = `${vis.classifier} Distribution of ${vis.selectedAttribute} in ${vis.selectedArea}`;
    let values;
    switch (vis.classifier) {
      case "County":
        values = topojson.feature(vis.data, vis.data.objects.counties);
        break;
      case "State":
        values = topojson.feature(vis.data, vis.data.objects.states);
        break;
      default:
        values = topojson.feature(vis.data, vis.data.objects.counties);
        break;
    }

    vis.projection = d3.geoAlbersUsa()
            .translate([vis.width /2 , vis.height / 2])
            .scale(vis.width);
    
    vis.projection.fitSize([vis.width, vis.height], values);

    const dataExtent = d3.extent(vis.classifier == "County" ? vis.data.objects.counties.geometries : vis.data.objects.states.geometries, d => d.properties.attribute);
    vis.legendStops = [
      { color: '#cfe2f2', value: dataExtent[0], offset: 0},
      { color: '#0d306b', value: dataExtent[1], offset: 100},
    ];

    vis.colorScale = d3.scaleLinear()
      .domain(d3.extent(vis.classifier == "County" ? vis.data.objects.counties.geometries : vis.data.objects.states.geometries, d => d.properties.attribute))
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath()
            .projection(vis.projection);

            d3.select("#counties").remove();

            vis.counties = vis.g.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(values.features)
                .join("path")
                .attr("d", vis.path)
                .attr("class", vis.classifier == "County" ? "county-boundary" : "state-boundary")
                .attr('fill', d => {
                      if (d.properties.attribute) {
                        return vis.colorScale(d.properties.attribute);
                      } else {
                        return 'url(#lightstripe)';
                      }
                    });

      vis.counties
                .on('mousemove', (event,d) => {
                    const attributeValue = d.properties.attribute ? `<strong>${vis.selectedAttribute}: ${d.properties.attribute}</strong>` : 'No data available'; 
                    d3.select('#tooltip')
                      .style('display', 'block')
                      .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                      .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                      .html(`
                        <div class="tooltip-title">${d.properties.name} ${vis.selectedArea}</div>
                        <div>${attributeValue}</div>
                      `);
                  })
                  .on('mouseleave', () => {
                    d3.select('#tooltip').style('display', 'none');
                  });


    if (vis.classifier == 'County') {
      vis.borders
                  .datum(topojson.mesh(vis.data, vis.data.objects.states, function(a, b) { return a !== b; }))
                  .attr("id", "state-borders")
                  .attr("d", vis.path);
    }

    // Add legend labels
    vis.legend.selectAll('.legend-label')
        .data(vis.legendStops)
      .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 20)
        .attr('x', (d,index) => {
          return index == 0 ? 0 : vis.config.legendRectWidth;
        })
        .text(d => Math.round(d.value * 10 ) / 10);

    // Update gradient for legend
    vis.linearGradient.selectAll('stop')
        .data(vis.legendStops)
      .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    vis.legendRect.attr('fill', 'url(#legend-gradient)');
  }
}