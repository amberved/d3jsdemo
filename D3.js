function init(){
   d3.csv("https://gist.githubusercontent.com/amberved/f8314f883cc95d18f5f3a205b1bd3cb8/raw/568725c0976c8cfa1054e2b45f2458c6dfbea39c/city_population_crossworld.csv", function(data) {

      displayChart(data);

   });

	
}



function drawInterval(func, waitTime, noOftimes){
   let interv = function(wait, time){
      return function(){
         if(typeof time === "undefined" || time-- > 0){
            setTimeout(interv, wait);
            try{
               func.call(null);
            }
            catch(e){
               time = 0;
               throw e.toString();
            }
         }
      };
   }(waitTime, noOftimes);
   setTimeout(interv, waitTime);
};




var populationArray, i=0, noOfYears=0, citiesArray=[];
var stop=0; 

function displayChart(data){

   populationArray = _.map(data, function(d){
      d.value = parseInt(d.value);
      return d;
   });

	//console.log(populationArray);

   populationArray =  _.sortBy(data, 'year');

   let years =  _.uniq(_.pluck(populationArray, 'year'),true);
   noOfYears= years.length;

   populationArray = _.groupBy(populationArray, function(num){
      return num.year;
   });


   var chart = new Chart('barChart'); // Creates new chart object

   chart.draw(_.sortBy(populationArray[years[i]], 'value').reverse());


   drawInterval(function(){

      document.getElementById("year").innerHTML = years[i];
      console.log("i",i);
      //console.log("populationArray[years[i]]",populationArray[years[i]]);
      
      if (stop == 0) {i++;}
      if (i < 0) {i=0;}
      if (i >= noOfYears) {i = 0;}

      var year_display = this.i;
      
      let chartData = _.first(_.sortBy(populationArray[years[year_display]], 'value').reverse(),20);
      //console.log("chartData",chartData);
      chart.draw(chartData);
   }, 400,  noOfYears-1);
}




function Chart(id){
   
   this.id = id;
   var self = this;
   this.margin = {top: 20, right: 20, bottom: 30, left: 40},
      this.width = 1024 - this.margin.left - this.margin.right,
      this.height = 600 - this.margin.top - this.margin.bottom;

   // Google Color pallete
   this.color = d3.scale.ordinal()
      .range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);

   this.x = d3.scale.ordinal()
      .rangeRoundBands([0, this.width], .15);

   this.y = d3.scale.linear()
      .range([this.height, 0]);

   // D3 Axis - renders a d3 scale in SVG
   this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

   this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");
   
   this.svg = d3.select("#" + this.id).append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      // .attr("id", "g-" + this.id)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

   this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")

   this.svg.append("g")
      .attr("class", "y axis")
      .append("text") // just for the title (ticks are automatic)
      .attr("transform", "rotate(-90)") // rotate the text!
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Population");

   this.legendPlaceholder = d3.select("#" + this.id).append("svg")
      .attr("class", "legend")
      .attr("width", 250)
      .attr("height", this.height )


   this.draw = function(data) {
      // measure the domain 
      // now the scales are finished and usable
      this.x.domain(data.map(function(d) { return d.name; }));
      this.y.domain([0, d3.max(data, function(d) { return d.value + 5; })]); //Added Y axis padding by 5

      // another g element, this time to move the origin to the bottom of the svg element
      
      this.svg.select('.x.axis').transition().duration(300).call(this.xAxis);

      // same for yAxis but with more transform and a title
     this.svg.select(".y.axis").transition().duration(300).call(this.yAxis)

      
      var bars = this.svg.selectAll(".bar").data(data, function(d) { return d.name; }) // (data) is an array/iterable thing, second argument is an ID generator function

      bars.exit()
         .transition()
         .duration(300)
         .attr("y", self.y(0))
         .attr("height", self.height - self.y(0))
         .style('fill-opacity', 1e-6)
         .remove();

      
      bars.enter().append("rect")
         .style("fill", function(d) { return self.color(d.name); })
         .attr("class", "bar")
         .attr("y", this.y(0))
         .attr("height", this.height - this.y(0));

      // the "UPDATE" set:
      bars.transition().duration(300).attr("x", function(d) { return self.x(d.name); }) // (d) is one item from the data array, x is the scale object from above
         .attr("width", self.x.rangeBand()) // constant, so no callback function(d) here
         .attr("y", function(d) { return self.y(d.value); })
         .attr("height", function(d) { return self.height - self.y(d.value); }); // flip the height, because y's domain is bottom up, but SVG renders top down


      

      var legends = this.legendPlaceholder.selectAll("g").data(data, function(d){ return d.name; });

      legends.exit().remove();

      var g = legends.enter().append("g")

      g.append("rect")
         .attr("width", 25)
         .attr("height", 25)
         .style("fill", function (d, i) { return self.color(d.name)}) ;

      g.append("text")
         .attr("x", 29)
         .attr("y", 9)
         .attr("dy", ".55em")
         .text(function(d) { return d.name; });

      this.legendPlaceholder.selectAll("g")  //Select all legend items and align them
         .transition()
         .duration(300)
         .attr("transform", function(d, i) {
            return "translate(0," + i * 30 + ")"; }
         );

	   
   }

	d3.select("#barchart")
	.on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
	.on("contextmenu",handleRightClick)
	.on("click",handleLeftClick);
	

/**/


}


      function handleMouseOver(d, t) {  // Add interactivity

            // Use D3 to select element, change color and size
            //d3.select(this).attr({
              //fill: "orange",
              //r: radius * 2
            //});
	    stop = 1;
		console.log(" stop = 1");

            // Specify where to put label of text
            //this.svg.append("text").attr({
            //   id: "tstop"  // Create an id for text so we can select it later for removing on mouseout
            //})
            //.text(function() {
            //  return "stop"; // Value of the text
            //});
	      //
	      //
	      //
	    const annotations = [
  		{
    		note: {
      			label: "Here is the annotation label",
      			title: "Annotation title"
    		},
    		type: d3.annotationCalloutCircle,
    		subject: {
      			radius: 20,         // circle radius
      			radiusPadding: 20   // white space around circle befor connector
    		},
    		color: ["red"],
    		x: 40,
    		y: 160,
    		dy: 70,
    		dx: 70
  		}
	     ]

	     // Add annotation to the chart
		const makeAnnotations = d3.annotation().annotations(annotations)

	      d3.select("#example4")
  		.append("g")
  		.call(makeAnnotations)

          }

      function handleMouseOut(d, t) {
            // Use D3 to select element, change color back to normal
            //d3.select(this).attr({
            //  fill: "black",
            //  r: radius
            //});
		console.log(" stop = 0");
	    stop = 0;
	    //this.svg.select("#tstop").remove(); 

            // Select text by id and then remove
            //d3.select("#t").remove();  // Remove text location
          }

     function handleLeftClick(d,t) {
	i++;
	console.log("handleLeftClick" + i);
     }

     function handleRightClick(d,t) {
        d3.event.preventDefault();
	i--;
	console.log("handleRightClick" + i);
	
     }
