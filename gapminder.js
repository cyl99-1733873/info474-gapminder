const margin = {top: 50, right: 50, bottom: 50, left: 50}
, width = 800 - margin.left - margin.right // Use the window's width
, height = 600 - margin.top - margin.bottom // Use the window's height

// load data
d3.csv('gapminder.csv').then((data) => {

    // append the div which will be the tooltip
    // append tooltipSvg to this div
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    // make an svg and append it to body
    const svg = d3.select('body').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    // append tooltip svg to the tooltip, which is called div
    const tooltipSvg = div.append("svg")
        .attr('id', 'tooltipSvg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    // get only data from year 1980
    data1980 = data.filter(d => d['year'] == "1980")

    // get min and max of population data and make a scale
    let popLimits = d3.extent(data1980, function(d) { return +d['population'] })
    let populationScale = d3.scaleLinear()
    .domain([popLimits[0], popLimits[1]])
    .range([5, 30])

    // get fertility min and max for us
    const fertilityLimits = d3.extent(data1980, d => d['fertility'])
    // get scaling function for years (x axis)
    const xScale = d3.scaleLinear()
        .domain([fertilityLimits[0], fertilityLimits[1]])
        .range([margin.left, width + margin.left])

    // make x axis
    // for hw, need different scaling functions for the axes in the tooltip
    const xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))

    // const yearLimits = d3.extent(data, d => d['year'])
    // const xScaleYear = d3.scaleLinear()
    //     .domain([yearLimits[0], yearLimits[1]])
    //     .range([margin.left, width + margin.left])
    //
    // tooltipSvg.append("g")
    //     .attr("transform", "translate(0," + (height + margin.top) + ")")
    //     .call(d3.axisBottom(xScaleYear))

    // get min and max life expectancy for US
    const lifeExpectancyLimits = d3.extent(data1980, d => d['life_expectancy'])

    // get scaling function for y axis
    const yScale = d3.scaleLinear()
        .domain([lifeExpectancyLimits[1], lifeExpectancyLimits[0]])
        .range([margin.top, margin.top + height])

    // make y axis
    const yAxis = svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))

    svg.selectAll('.dot').data(data1980)
        .enter()
        .append('circle')
            .attr('cx', d => xScale(d['fertility']))
            .attr('cy', d => yScale(d['life_expectancy']))
            .attr('r', function(d) { return populationScale(+d['population']) })
            .attr('fill', 'steelblue')
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style('opacity', 0.9)

                div.style('left', d3.event.pageX + "px")
                    .style('top', (d3.event.pageY - 28) + "px")

                let currentCoutry = d['country']
                let dataCountry = data.filter(d => d['country'] == currentCoutry)

                const yearLimits = d3.extent(dataCountry, d => +d['year'])
                const xScaleYear = d3.scaleLinear()
                    .domain([yearLimits[0], yearLimits[1]])
                    .range([margin.left, width + margin.left])

                tooltipSvg.append("g")
                    .attr("transform", "translate(0," + (height + margin.top) + ")")
                    .call(d3.axisBottom(xScaleYear))

                const populationLimits = d3.extent(dataCountry, d => +d['population'])
                const yScalePop = d3.scaleLinear()
                    .domain([populationLimits[1], populationLimits[0]])
                    .range([margin.top, margin.top + height])

                tooltipSvg.append("g")
                    .attr("transform", "translate(" + margin.left + ",0)")
                    .call(d3.axisLeft(yScalePop)
                            .tickFormat(d3.formatPrefix(".1", 1e6)))

                  //           var line = svg
                  // .append('g')
                  // .append("path")
                  //   .datum(data.filter(function(d){return d.name==allGroup[0]}))
                  //   .attr("d", d3.line()
                  //     .x(function(d) { return x(d.year) })
                  //     .y(function(d) { return y(+d.n) })
                  //   )
                // d3's line generator
                const line = d3.line()
                    .x(d => xScaleYear(+d['year'])) // set the x values for the line generator
                    .y(d => yScalePop(+d['population'])) // set the y values for the line generator

                // append line to svg
                tooltipSvg.append("path")
                    .datum(dataCountry)
                    .attr("d", function(d) { return line(d) })
                    .attr("fill", "steelblue")
                    .attr("stroke", "steelblue")
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(300)
                    .style('opacity', 0)
                d3.select("#tooltipSvg").selectAll("*").remove()
            })

    // if the population > 100,000,000, append a text label with country name above the point
    let population100 = data1980.filter(function(d) {return +d['population'] > 100000000})

    svg.selectAll('.text')
    .data(population100)
    .enter()
    .append('text')
    .attr('x', function(d) { return xScale(+d['fertility']) })
    .attr('y', function(d) { return yScale(+d['life_expectancy']) - 20 })
    .text(function(d) { return d['country'] })


})
