import EventEmitter from "events";
import * as d3 from "d3";
//convert TopoJSON to GeoJSON.
import * as topojson from "topojson-client"
// const china = require ('../data/china-geoJSON.json')
const china = require ('../data/china_geojson_edit.json')

class PowerNetMap extends EventEmitter{
  constructor() {
    super()

    this.state = {
      data: null,
      root: null
    }

    Object.assign(this,{
      dx : 60,
      dy : 160,
      nodeWidth : 120,
      nodeHeight : 40,
      iconWidth : 50,
      iconHeight: 40,

    })
    // this.transformCache = {
    //   x: 0,
    //   y: 0,
    //   k: 1
    // }
  }

  setState(change, callback = null) {
    if (typeof change === 'function') {
      change = change(this.state)
    }

    Object.assign(this.state, change)

    this.emit('change', {change, callback})
  }

  init(parentNode, options) {
    this.parentNode = parentNode
    parentNode.innerHTML = null

    this.createSvg(parentNode)

    this.drawChina2()
  }

  createSvg(parentNode) {
    let me = this
    let width = 1000
    let height = 700
    this.svg = d3.create("svg")
      // .attr('transform', "scale(1,-1)")
      .attr("viewBox", [0, 0, width, height])
      .call(d3.zoom().on("zoom", function (event) {
        zoom_g.attr("transform", event.transform)
        me.transformCache =  event.transform
      }));

    const zoom_g = this.svg.append("g")
    this.zoom_g = zoom_g
    parentNode.appendChild(this.svg.node())
  }

  async draw () {

    const path = d3.geoPath();
    //平移缩放层
    const us = await d3.json("https://unpkg.com/us-atlas@1/us/10m.json");

    us.objects.lower48 = {
      type: "GeometryCollection",
      geometries: us.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")
    };

    this.zoom_g.append("path")
      .datum(topojson.merge(us, us.objects.lower48.geometries))
      .attr("fill", "#ddd")
      .attr("d", path);

    this.zoom_g.append("path")
      .datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

  }

  drawChina () {

    const path = d3.geoPath();

    china.objects.lower48 = {
      type: "GeometryCollection",
      geometries: china.objects['regions.geo'].geometries
    };

    this.zoom_g.append("path")
      .datum(topojson.merge(china, china.objects.lower48.geometries))
      .attr("fill", "#ddd")
      .attr("d", path);

    // this.zoom_g.append("path")
    //   .datum(topojson.mesh(china, china.objects.lower48, (a, b) => a !== b))
    //   .attr("fill", "none")
    //   .attr("stroke", "white")
    //   .attr("stroke-linejoin", "round")
    //   .attr("d", path);

  }

  async drawChina2 () {

    var width = 1000, height = 700;
    //1.定义投影和生成器
    //定义地图投影
    var projection=d3.geoMercator()
      .center([107,31]) //地图中心位置,107是经度，31是纬度
      .scale(600) //设置缩放量
      .translate([width/2,height/2]);

    // const countries = await d3.json("https://geo.datav.aliyun.com/areas_v2/bound/100000.json");
    // var projection = d3.geoMercator()
    const path = d3.geoPath().projection(projection);

    this.zoom_g.append("g")
      .selectAll("path")
      .data(china.features)
      .join('path')
      .attr("d", path)
      .attr("fill", '#fff')
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 0.5)
      .attr("title", d => d.properties.name)
      .attr("stroke-dasharray", 3)

    this.zoom_g.append("g")
      .selectAll("circle")
      .data([{pos : [116.4,40]}])
      .join('circle')
      .attr('r',5)
      .attr('cx',function(d) { return projection(d.pos)[0]})
      .attr('cy',function(d) { return projection(d.pos)[1]})
      .attr("fill", '#f00')

    this.zoom_g.append("g")
      .selectAll("text")
      .data([{pos : [116.4,40], name: '北京: [116,40]'}])
      .join('text')
      .attr("dy", "-1em")
      .attr("font-size", 8)
      // 有孩子文本在左，没孩子文本在右
      .attr('x',function(d) { return projection(d.pos)[0]})
      .attr('y',function(d) { return projection(d.pos)[1]})
      // .attr("x", d => d.children ? -6 : 6)
      // .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.name)
  }


}

export default new PowerNetMap()