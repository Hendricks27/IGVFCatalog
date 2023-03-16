
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import axios from "axios";
import Plot from 'react-plotly.js';

import * as pako from "pako";

import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

import React, {useContext, useEffect, useState, useReducer} from "react";
import {
    geneNameSearchURLConstructor,
    GoToEpiBrowserURLConstructor,
    UCSCClinvarURLConstructor,
    pseudoVariationResult,
    searchColorScheme,
    variationSearch,

    oneThousandGenomeVariationSearchURLConstructor,
    favorVariationSearchURLConstructor,
    AWSLambdaFunctionBase64StringToArray, GeneQueryByRegion
} from "./API";

import loader from "./images/loader.gif"
import {useD3} from "./D3Test";

import findOptimalTick from "./MyRandomTools";
import {LoadingContainer} from "./ReusableElements";


import ThousandGenomeLogo from "./images/1000GenomesLogo.jpeg";
import FavorLogo from "./images/FavorLogo.png";


export function Empty(props){
    return <></>
}


export function isNumber(num1){
    return typeof num1 == 'number'
}




export function GenomeBrowserRuler(props){

    const debug = false;

    let svgHeight = "50px";
    if (props.svgHeight){
        svgHeight = props.svgHeight
    }

    let tickNum = 10
    if (!isNaN(parseFloat(props.tickNum))){
        tickNum = parseFloat(props.tickNum)
    }
    const rulerStart = parseInt(props.RulerStart);
    const rulerEnd = parseInt(props.RulerEnd);

    let highlightRegion = false
    let highlightRegionStart = props.highlightRegionStart;
    let highlightRegionEnd = props.highlightRegionEnd;

    if (isNaN(parseFloat(highlightRegionStart))){
        highlightRegionStart = parseFloat(highlightRegionStart)
    }
    if (isNaN(parseFloat(highlightRegionEnd))){
        highlightRegionEnd = parseFloat(highlightRegionEnd)
    }
    if ( isNumber(highlightRegionStart) && isNumber(highlightRegionEnd) ){
        highlightRegion = true
    }


    function SVGRender (svg){
        const height = 100;
        const width = 100;
        const margin = { top: 10, right: 5, bottom: 10, left: 5 };

        const scaleX = d3.scaleLinear()
            .domain([rulerStart, rulerEnd])
            .rangeRound([margin.left, width - margin.right])
        const scaleY = d3.scaleLinear()
            .domain([0, 5])
            .rangeRound([height - margin.bottom, margin.top]);

        svg.selectAll('*').remove();
        svg.append("g").attr("class", "test")
        svg.append("g").attr("class", "localRuler")

        if (debug){
            svg.select(".test")
                .selectAll(".line")
                .data([{x1:"0%", x2:"100%", y1:"0%", y2:"100%"}])
                .join("line")
                .attr("x1", (d) => d.x1)
                .attr("y1", (d) => d.y1)
                .attr("x2", (d) => d.x2)
                .attr("y2", (d) => d.y2)
                .style("stroke", "green")
        }


        const chrMinMaxRange = rulerEnd - rulerStart;
        let localTicks = [];
        const chrLocalUnit = findOptimalTick(chrMinMaxRange, tickNum);
        const chrLocalSubUnit = chrLocalUnit / 10;
        // console.log(rulerStart, rulerEnd, chrMinMaxRange, chrLocalUnit)


        for (let tmp = 0; rulerStart+chrLocalSubUnit*tmp <= rulerEnd; tmp++){
            let localTickChrPos = Math.floor(rulerStart/chrLocalSubUnit+tmp) * chrLocalSubUnit;
            let tmp2 = {};
            tmp2.x = (chrLocalSubUnit*tmp / chrMinMaxRange * 100).toString() + "%"
            tmp2.y = "65%"
            tmp2.width = "0.1%"
            tmp2.height = "35%"
            tmp2.fill = "lightgrey"
            tmp2.text = ""
            if (localTickChrPos % chrLocalUnit == 0){
                tmp2.y = "35%"
                tmp2.width = "0.1%"
                tmp2.height = "65%"
                tmp2.fill = "black"

                tmp2.text = (localTickChrPos).toString()
                if (chrLocalUnit >= 1000){
                    tmp2.text = (localTickChrPos/1000).toString()+"K"
                }
                if (chrLocalUnit >= 1000*1000){
                    tmp2.text = (localTickChrPos/1000000).toString()+"M"
                }
            }
            localTicks.push(tmp2)

        }


        if (highlightRegion){
            let tmp2 = {};
            tmp2.x = ((highlightRegionStart - rulerStart) / chrMinMaxRange * 100).toString() + "%"
            tmp2.y = "35%"
            tmp2.width = ((highlightRegionEnd - highlightRegionStart) / chrMinMaxRange * 100).toString() + "%"
            tmp2.height = "65%"
            tmp2.fill = "green"
            tmp2.opacity = "40%"
            localTicks.unshift(tmp2)
        }


        svg.select(".localRuler")
            .selectAll(".rect")
            .data(localTicks)
            .join("rect")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("width", (d) => d.width)
            .attr("height", (d) => d.height)
            .attr("fill", (d) => d.fill)
            .attr("opacity", (d) => d.opacity)
        svg.select(".localRuler")
            .selectAll(".text")
            .data(localTicks)
            .join("text")
            .attr("x", (d) => d.x)
            .attr("y", "28%")
            .attr("font-size","10px")
            .attr("text-anchor","middle")
            .style("fill", (d) => (d.fill))
            .text((d) => (d.text))

    }

    const ref = useD3(
        SVGRender,
    );


    return <>

        <div style={{width: "100%", height: svgHeight}}>
            <svg ref={ref} style={{width: "100%", height: "100%", marginRight: "0px", marginLeft: "0px"}} >
            </svg>
        </div>

    </>
}


export function GenomeBrowserRefGene(props){

    const debug = false;

    let svgHeight = "50px";
    if (props.svgHeight){
        svgHeight = props.svgHeight
    }

    const chromosome = props.chromosome
    const positionStart = parseInt(props.positionStart);
    const positionEnd = parseInt(props.positionEnd);

    let verticalGeneNum = 5;
    if (isNumber(parseInt(props.verticalGeneNum))){
        verticalGeneNum = parseInt(props.verticalGeneNum)
    }

    const [refGenesInThisRegion, setRefGenesInThisRegion] = useState([]);

    const getMinimumVerticalNum = function (d){
        let res = 0;

        d = d.sort((a, b) => {

            let al = a.txEnd - a.txStart;
            let bl = b.txEnd - b.txStart;

            if (al !== bl){
                return bl - al
            }

            let i = "name";
            if (a[i] > b[i]){
                return 1
            }
            return -1
        })

        let rangeMin = 1000000000000000000000000000000
        let rangeMax = 0
        for (let rg of d){
            let s = rg.txStart;
            let e = rg.txEnd;

            // rg.cdsStart, rg.cdsEnd,

            rangeMin = Math.min(rangeMin, s)
            rangeMax = Math.max(rangeMax, e)
        }
        console.log(rangeMin, rangeMax)


        for (let p=rangeMin; p <= rangeMax; p++){
            let thisPosGeneCount = 0;

            for (let rg of d){
                if (rg.txStart <= p && p <= rg.txEnd){
                    rg.verticalPos = thisPosGeneCount
                    thisPosGeneCount += 1
                }
            }

            res = Math.max(res, thisPosGeneCount)
        }

        let verticalPostionArrangement = [];
        for (let rg of d){
            let thisRange = [rg.txStart, rg.txEnd];
            let thisVerticalPos = [];
            for (let i=1; i<=res; i++){
                thisVerticalPos.push(i)
            }


            for (let otherVPA of verticalPostionArrangement){
                let overlap1 = thisRange[0] <= otherVPA[0] && otherVPA[0] <= thisRange[1]
                let overlap2 = thisRange[0] <= otherVPA[1] && otherVPA[1] <= thisRange[1]
                let overlapFlag = overlap1 || overlap2

                if (overlapFlag){
                    let ri = thisVerticalPos.indexOf(thisRange[2]);
                    if (ri !== -1){
                        thisVerticalPos = thisVerticalPos.pop(ri);
                    }
                }
            }

            if (thisVerticalPos.length > 0){
                thisVerticalPos = thisVerticalPos[0]
            } else {
                thisVerticalPos = 1
            }

            thisRange.push(thisVerticalPos)
            verticalPostionArrangement.push(thisRange)

        }


        return res
    }


    function SVGRender (svg){
        const height = 100;
        const width = 100;
        const margin = { top: 10, right: 5, bottom: 10, left: 5 };

        const scaleX = d3.scaleLinear()
            .domain([positionStart, positionEnd])
            .rangeRound([margin.left, width - margin.right])
        const scaleY = d3.scaleLinear()
            .domain([0, 5])
            .rangeRound([height - margin.bottom, margin.top]);

        svg.selectAll('*').remove();
        svg.append("g").attr("class", "test")
        svg.append("g").attr("class", "localRuler")

        if (debug){
            svg.select(".test")
                .selectAll(".line")
                .data([{x1:"0%", x2:"100%", y1:"0%", y2:"100%"}])
                .join("line")
                .attr("x1", (d) => d.x1)
                .attr("y1", (d) => d.y1)
                .attr("x2", (d) => d.x2)
                .attr("y2", (d) => d.y2)
                .style("stroke", "green")
        }


        const chrMinMaxRange = positionEnd - positionStart;
        const geneRect = [];
        const geneText = [];

        let genes = [];
        for (let rg of refGenesInThisRegion){
            let tmp = [
                rg.id,
                rg._id,

                rg.name,
                rg.transcriptionClass,
                rg.strand,
                rg.description,

                rg.chrom,

                rg.txStart,
                rg.txEnd,

                rg.exonStarts,
                rg.exonEnds,

                rg.cdsStart,
                rg.cdsEnd,
            ]
            genes.push(tmp)

        }


        let mvn = getMinimumVerticalNum(refGenesInThisRegion);

        if (mvn > verticalGeneNum){
            console.log("Too Dense")
            console.log(mvn, verticalGeneNum)
            return
        }

        for (let rg of refGenesInThisRegion){
            let fillColor = "black";
            if (rg.transcriptionClass === "nonCoding"){
                fillColor = "green"
            } else if (rg.transcriptionClass === "coding"){
                fillColor = "purple"
            } else if (rg.transcriptionClass === ""){
                fillColor = "black"
            }


            let y = 100/(mvn+1) * (rg.verticalPos + 1);

            let tmpTx = {
                x: scaleX(rg.txStart).toString() + "%",
                y: y.toString() + "%",
                width: ((rg.txEnd - rg.txStart)/chrMinMaxRange*100).toString() + "%",
                height: "1%",
                fill: fillColor,
            }
            geneRect.push(tmpTx)

            let tmpTxt = {
                x: scaleX((rg.txStart+rg.txEnd)/2).toString() + "%",
                y: (y-2).toString() + "%",
                width: ((rg.txEnd - rg.txStart)/chrMinMaxRange*100).toString() + "%",
                fill: fillColor,
                text: rg.name
            }
            geneText.push(tmpTxt)

            let exonStarts = rg.exonStarts.split(",");
            let exonEnds = rg.exonEnds.split(",");

            if (exonStarts.length === exonEnds.length){
                for (let ei in exonStarts){
                    let es = parseInt(exonStarts[ei]);
                    let ee = parseInt(exonEnds[ei]);
                    console.log(es, ee)

                    let tmpExon = {
                        x: scaleX(es).toString() + "%",
                        y: (y-1).toString() + "%",
                        width: ((ee - es)/chrMinMaxRange*100).toString() + "%",
                        height: "3%",
                        fill: fillColor,
                    }
                    console.log(tmpExon)
                    geneRect.push(tmpExon)
                }
            }


        }





        svg.select(".localRuler")
            .selectAll(".rect")
            .data(geneRect)
            .join("rect")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("width", (d) => d.width)
            .attr("height", (d) => d.height)
            .attr("fill", (d) => d.fill)

        svg.select(".localRuler")
            .selectAll(".text")
            .data(geneText)
            .join("text")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .text((d) => d.text)
            .attr("font-size","8px")
            .attr("text-anchor", "middle")
            .attr("fill", (d) => d.fill)



    }



    const queryRefGenesByRegion = function (){
        let rurl = GeneQueryByRegion("hg38", chromosome, positionStart, positionEnd);
        axios.get(rurl)
            .then(function (response) {
                setRefGenesInThisRegion(response.data)
            })
            .catch(function (error) {
                // console.log(geneName, error);
            });
    }

    const ref = useD3(
        SVGRender,
        [refGenesInThisRegion]
    );

    useEffect(
        queryRefGenesByRegion,
        [chromosome, positionStart, positionEnd]
    )




    return <>

        <div style={{width: "100%", height: svgHeight}}>
            <svg ref={ref} style={{width: "100%", height: "100%", marginRight: "0px", marginLeft: "0px"}} >
            </svg>
        </div>

    </>
}




export default function GenomeBrowserTest(){
    let start = 50000
    let end   = 250000

    let nstart = 30000
    let nend = 60000

    return <>

        <div className={"resultContainer"}>
            <div>-------</div>
            <GenomeBrowserRuler
                svgHeight={"30px"}

                tickNum={10}

                RulerStart={start}
                RulerEnd={end}

                highlightRegionStart={nstart}
                highlightRegionEnd={nend}
            />
            <div>-------</div>
            <GenomeBrowserRefGene
                svgHeight={"300px"}

                verticalGeneNum={10}

                chromosome={"chr1"}
                positionStart={start}
                positionEnd={end}
            />
            <div>-------</div>
            <GenomeBrowserRuler
                svgHeight={"30px"}

                tickNum={10}

                RulerStart={start}
                RulerEnd={end}

                highlightRegionStart={nstart}
                highlightRegionEnd={nend}
            />
            <div>-------</div>

        </div>

    </>
}




