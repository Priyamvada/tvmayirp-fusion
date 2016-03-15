;(function(w, d3, undefined){
    "use strict";

    var width, height, currentYear = parseInt($(document).find('#year-control input').attr('max'), 10);
    function getSize(){

        if(width === 0 || height === 0){
            setTimeout(function(){
                getSize();
            }, 100);
        }
        else {
            init({container:'#globe-viz'});
        }

    }

    function init(options){

        var $container = $(options.container);
        width = $container.width();
        height = $container.height();

        //Setup path for outerspace
        var space = d3.geo.azimuthal()
            .mode("equidistant")
            .translate([width / 2, height / 2]);

        space.scale(space.scale() * 3);

        var spacePath = d3.geo.path()
            .projection(space)
            .pointRadius(1);

        //Setup path for globe
        var projection = d3.geo.azimuthal()
            .mode("orthographic")
            .translate([width / 2, height / 2]);

        var scale0 = projection.scale();

        var path = d3.geo.path()
            .projection(projection)
            .pointRadius(2);

        //Setup path for sites
        var sitePath = d3.geo.path()
            .projection(projection)
            .pointRadius(0.4);

        //Setup zoom behavior
        var zoom = d3.behavior.zoom(true)
            .translate(projection.origin())
            .scale(projection.scale())
            .scaleExtent([100, 800])
            .on("zoom", move);

        var circle = d3.geo.greatCircle();

        var svg = d3.select(options.container)
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                    .call(zoom)
                    .on("dblclick.zoom", null);

        //Create a list of random stars and add them to outerspace
        var starList = createStars(300);
                
        var stars = svg.append("g")
            .selectAll("g")
            .data(starList)
            .enter()
            .append("path")
                .attr("class", "star")
                .attr("d", function(d){
                    spacePath.pointRadius(d.properties.radius);
                    return spacePath(d);
                });


        svg.append("rect")
            .attr("class", "frame")
            .attr("width", width)
            .attr("height", height);

        //Create the base globe
        var backgroundCircle = svg.append("circle")
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', projection.scale())
            .attr('class', 'globe')
            .attr("filter", "url(#glow)")
            .attr("fill", "url(#gradBlue)");


        var g = svg.append("g"), features, impactSites, siteList;

        // Add all of the countries to the globe
        d3.json("../data/world-countries.json", function(collection) {
            features = g.selectAll(".feature").data(collection.features);

            features.enter().append("path")
                .attr("class", "feature")
                .attr("d", function(d){ return path(circle.clip(d)); });
        });

        d3.json("../data/meteoritessize.json", function(collection) {
            siteList = generateImpactSites(collection.features);
            impactSites = svg.append("g")
                .selectAll("g")
                .data(siteList)
                .enter()
                .append("path")
                    .attr("d", function(d){
                        var siteRadius = 0.5 + d.properties.massBucket * 0.6;
                        sitePath.pointRadius(siteRadius);
                        return sitePath(circle.clip(d)); 
                    })
                    .attr("class", function(elem)   {
                        var classAttr = "impact-site";
                        if(currentYear - elem.properties.Year <= 100 && currentYear - elem.properties.Year >= 0)   {
                            classAttr = classAttr + " recent-year";
                        } else if(elem.properties.Year - currentYear <= 50 && elem.properties.Year - currentYear > 0)   {
                            classAttr = classAttr + " coming-year";
                        }
                        return classAttr;
                    })
                    // .attr("stroke-width", function(elem)    {
                    //     var siteRadius = 0.5 + Math.pow(elem.properties.massBucket,1.2);
                    //     return siteRadius;
                    // })
                    .attr("opacity", function(elem)   {
                        var opacity = 0;
                        if(elem.properties.Year > currentYear + 50)  {
                            opacity = 0;
                        }   else if(elem.properties.Year <= currentYear && elem.properties.Year >= currentYear - 100)   {
                            opacity = 1;
                        }   else if(elem.properties.Year - currentYear <= 50 && elem.properties.Year - currentYear > 0)   {
                            opacity = (1 - (elem.properties.Year - currentYear)/50) * 0.5; //gradient
                        }   else    {
                            opacity = 0.5;
                        }

                        return opacity;
                    });
        });

        /*$(window).on('resize', function()   {
            var newWidth = $container.width();
            var newHeight = $container.height();
            if(width !== newWidth || height !== newHeight)  {
                width = newWidth;
                height = newHeight;
                redraw();
            }
        });*/

        d3.select("#year-control input").on("input", function() {
          updateYear(+this.value);
        });

        updateYear(currentYear);


        //Redraw all items with new projections
        function redraw(){
            features.attr("d", function(d){
                return path(circle.clip(d));
            });

            stars.attr("d", function(d){
                spacePath.pointRadius(d.properties.radius);
                return spacePath(d);
            });

            impactSites.attr("d", function(d)   {
                var siteRadius = 0.5 + d.properties.massBucket * 0.6;
                sitePath.pointRadius(siteRadius);
                return sitePath(circle.clip(d));
            });
        }

        function updateYear(currYr) {

          currentYear = currYr;
          // adjust the text on the range slider
          if(currYr < 0)    {
            currYr = -currYr + ' BC';
          } else    {
            currYr = 'AD ' + currYr;
          }
          d3.select("#year-control .control-value").text(currYr);
          if(impactSites != null)   {
            repaintImpactSites();
          }
        }

        function repaintImpactSites()   {
            impactSites.attr("opacity", function(elem)   {
                var opacity = 0;
                if(elem.properties.Year > currentYear + 50)  {
                    opacity = 0;
                }   else if(elem.properties.Year <= currentYear && elem.properties.Year >= currentYear - 100)   {
                    opacity = 1 - (0.5 * (currentYear - elem.properties.Year))/100; //gradient
                }   else if(elem.properties.Year - currentYear <= 50 && elem.properties.Year - currentYear > 0)   {
                    opacity = (1 - (elem.properties.Year - currentYear)/50) * 0.5; //gradient
                }   else    {
                    opacity = 0.5;
                }

                return opacity;
            })
            .attr("class", function(elem)   {
                var classAttr = "impact-site";
                if(currentYear - elem.properties.Year <= 100 && currentYear - elem.properties.Year >= 0)   {
                    classAttr = classAttr + " recent-year";
                } else if(elem.properties.Year - currentYear <= 50 && elem.properties.Year - currentYear > 0)   {
                    classAttr = classAttr + " coming-year";
                }
                return classAttr;
            });
        }


        function move() {
            if(d3.event){
                var scale = d3.event.scale;
                var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];
                
                projection.scale(scale);
                space.scale(scale * 3);
                backgroundCircle.attr('r', scale);
                path.pointRadius(2 * scale / scale0);

                projection.origin(origin);
                circle.origin(origin);
                
                //globe and stars spin in the opposite direction because of the projection mode
                var spaceOrigin = [origin[0] * -1, origin[1] * -1];
                space.origin(spaceOrigin);
                redraw();
            }
        }


        function createStars(number){
            var data = [];
            for(var i = 0; i < number; i++){
                data.push({
                    geometry: {
                        type: 'Point',
                        coordinates: randomLonLat()
                    },
                    type: 'Feature',
                    properties: {
                        radius: Math.random() * 1.5
                    }
                });
            }
            return data;
        }

        function generateImpactSites(meteoriteFeatures) {
            var data = [];

            for(var i=0; i < meteoriteFeatures.length; i++) {
                meteoriteFeatures[i].Mass_g = parseFloat(meteoriteFeatures[i].Mass_g.replace(new RegExp(',', 'g'), ''));
                if(meteoriteFeatures[i].Year !== "" && meteoriteFeatures[i].latitude !== ""
                    && meteoriteFeatures[i].longitude !== ""
                    && (meteoriteFeatures[i].Fell_or_found === "Fell" /*|| meteoriteFeatures[i].Fell_or_found === "Found"*/))   {
                    

                    data.push({
                        "type": "Feature",
                        "geometry": {
                            type: "Point",
                            coordinates: [parseFloat(meteoriteFeatures[i].longitude), parseFloat(meteoriteFeatures[i].latitude)]
                        },
                        "properties": {
                            massBucket: Math.log10(meteoriteFeatures[i].Mass_g + 1),
                            Fell_or_found: meteoriteFeatures[i].Fell_or_found,
                            Year: parseInt(meteoriteFeatures[i].Year,10)
                        }
                    });
                }
            }
            return data;
        }

        function randomLonLat(){
            return [Math.random() * 360 - 180, Math.random() * 180 - 90];
        }
    }

    getSize();

}(window, d3));