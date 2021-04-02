import EventEmitter from "events";
import * as d3 from "d3";

let counter = 100
function getId(){
  return counter++
}
class TreeView extends EventEmitter{
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

    // window.treeView = this
    this.createSvg(parentNode)

    let data = options.data
    if(data) {
      this.setState({data})

      this.hierarchy = d3.hierarchy(data)
      this.draw(this.hierarchy)
    }

    const interval = d3.interval(() => {
      const parent = this.nodes[Math.random() * this.nodes.length | 0];
      if (this.nodes.length >= 50) return interval.stop();
      this.addNode(parent)
    }, 1000)
    // this.node.style.width = window.innerWidth
    // this.node.style.height = window.innerHeight
  }

  createSvg(parentNode) {
    let me = this
    let width = 900
    let height = 600
    this.svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .call(d3.zoom().on("zoom", function (event) {
        zoom_g.attr("transform", event.transform)
        me.transformCache =  event.transform
      }));

    const zoom_g = this.svg.append("g")
    this.zoom_g = zoom_g
    parentNode.appendChild(this.svg.node())
  }

  // zoom(delta){
  //   if(!this.transformCache){
  //     return
  //   }
  //   this.transformCache.k =  this.transformCache.k + delta
  //   this.zoom_g.attr("transform", this.transformCache)
  // }

  tree (root) {
    return d3.tree().nodeSize([this.dx, this.dy])(root)
  }

  draw (hierarchy, isUpdate) {
    const me = this
    const root = this.tree(hierarchy)
    //平移缩放层

    if(!isUpdate){
      // 容器
      this.g = this.zoom_g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${this.dy / 3},${this.dx + 100})`)

      // 连线
      this.linkGroup = this.g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)

      // 节点
      this.nodeGroup = this.g.append("g")
      this.links = root.links()
      this.nodes = [root].concat(root.descendants())
    }

    const t = this.svg.transition().duration(750);


    this.linkGroup.selectAll("path")
      .data(this.links,  d => d.target.data.id)
      .join(
        // 新增曲线动画，从父节点运动
        enter => enter.append("path")
          .style("opacity", 0)
          .attr("d", d3.linkHorizontal()
            //水平方向偏移
            .source(d => [d.source.y + this.nodeWidth/2, d.source.x])
            .target(d => [d.source.y - this.nodeWidth/2, d.source.x]))
          .call(path => path.transition(t)
            .attr("d", d3.linkHorizontal()
              //水平方向偏移
              .source(d => [d.source.y + this.nodeWidth/2, d.source.x])
              .target(d => [d.target.y - this.nodeWidth/2, d.target.x])))
          .style("opacity", 1),
        update => update,
        exit => exit.remove()
      )
      .call(path => path.transition(t)
        .attr("d", d3.linkHorizontal()
          //水平方向偏移
          .source(d => [d.source.y + this.nodeWidth/2, d.source.x])
          .target(d => [d.target.y - this.nodeWidth/2, d.target.x])))


    this.nodeGroup.selectAll("g.video-node")
      .data(this.nodes, d => d.data.id)
      .join(// 新增曲线动画，从父节点运动
        enter => {
          const node = enter.append("g")
            .attr("class", "video-node")
            .attr("fill", "#fff")
            .style("opacity", 0)
            .attr("transform", d => {
              if(d.parent){
                return `translate(${d.parent.y},${d.parent.x})`
              }else{
                return `translate(${d.y},${d.x})`
              }
            }).call(path => path.transition(t)
              .attr("transform", d => `translate(${d.y},${d.x})`)
              .style("opacity", 1))
          me.renderNode(node)
        },
        update => update,
        exit => exit.remove()
      ).call(path => path.transition(t)
      .attr("transform", d => `translate(${d.y},${d.x})`)
    )

  }

  textOverflow(node, textWidth) {
    function wrap() {
      let self = d3.select(this)
      let textLength = self.node().getComputedTextLength()
      let text = self.text()

      while (textLength > textWidth && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + '...');
        textLength = self.node().getComputedTextLength();
      }
    }

    node.each(wrap)
  }

  redraw(data) {
    this.draw(data, true)
  }

  renderNode(g) {
    const rect = g.append("rect")
      // .attr("rx", "4")
      // .attr("ry", "4")
      .attr("width", this.nodeWidth)
      .attr("height", this.nodeHeight)

      .attr("transform", `translate(${-this.nodeWidth/2}, ${-this.nodeHeight/2})`);

    const icon = g.append("image")
      .attr("width", this.iconWidth)
      .attr("height", this.iconHeight)
      .attr("href", "/logo192.png")
      .attr("transform", `translate(${-this.nodeWidth/2}, ${-this.nodeHeight/2})`);


    const text = g.append("text")
      .attr("dy", "0.31em")
      .attr("font-size", 8)
      // 有孩子文本在左，没孩子文本在右
      .attr("x", d => this.iconWidth - this.nodeWidth/2 + 3)
      // .attr("x", d => d.children ? -6 : 6)
      // .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)

    this.textOverflow(text, 60)

    g.on('click', (event, parent) => {
      this.addNode(parent)
    })

    g.on('contextmenu', (event, parent) => {
      event.preventDefault()
      this.removeNode(parent)
    })
  }

  addNode(parent){
    let newData = {
      name: 'new Data',
      id: getId()
    }
    if (parent.data.children) {
      parent.data.children.push(newData)
    }else{
      parent.data.children = [newData];
    }

    const child = d3.hierarchy(newData);
    Object.assign(child, {parent, depth: parent.depth + 1})

    if (parent.children) {
      parent.children.push(child);
    } else {
      parent.children = [child];
    }

    this.nodes.push(child);
    //新增曲线
    this.links.push({source: parent, target: child});
    this.redraw(this.hierarchy)
  }

  removeNode(node){

    if(node.children && node.children.length) {
      return
    }

    let parent = node.parent

    let index = parent.data.children.indexOf(node.data)
    parent.data.children.splice(index, 1)
    if(parent.data.children.length == 0){
      parent.data.children = null
    }

    index = parent.children.indexOf(node)
    parent.children.splice(index, 1)
    if(parent.children.length == 0){
      parent.children = null
    }

    index = this.nodes.indexOf(node)
    this.nodes.splice(index, 1);

    for(let i in this.links){
      if(this.links[i].target == node){
        this.links.splice(i, 1);
      }
    }

    this.redraw(this.hierarchy)
  }
}

export default new TreeView()