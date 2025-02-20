"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

const data = {
  name: "You",
  children: [
    {
      name: "John Doe",
      children: [{ name: "Sarah Smith" }, { name: "Mike Johnson" }],
    },
    {
      name: "Jane Smith",
      children: [{ name: "Tom Wilson" }],
    },
  ],
}

export function ReferralTree() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = 800
    const height = 400
    const margin = { top: 20, right: 90, bottom: 30, left: 90 }

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height)

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const tree = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right])

    const root = d3.hierarchy(data)
    const treeData = tree(root)

    // Add links
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x),
      )
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)

    // Add nodes
    const node = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)

    node.append("circle").attr("r", 4).attr("fill", "currentColor")

    node
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => (d.children ? -8 : 8))
      .attr("text-anchor", (d: any) => (d.children ? "end" : "start"))
      .text((d: any) => d.data.name)
      .attr("font-size", "12px")
      .attr("fill", "currentColor")
  }, [])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}

