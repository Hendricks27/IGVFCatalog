
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
            tmp2.y = "17.5%"
            tmp2.width = "0.1%"
            tmp2.height = "30%"
            tmp2.fill = "lightgrey"
            tmp2.text = ""

            if (localTickChrPos % (chrLocalSubUnit*5) == 0) {
                tmp2.fill = "black"
            }
            if (localTickChrPos % chrLocalUnit == 0){
                tmp2.y = "5%"
                tmp2.width = "0.15%"
                tmp2.height = "50%"

                tmp2.text = (localTickChrPos).toString()
                if (chrLocalUnit >= 1000){
                    tmp2.text = (localTickChrPos/1000).toString()+"K"
                }
                if (chrLocalUnit >= 1000*1000){
                    tmp2.text = (localTickChrPos/1000000).toString()+"M"
                }
                if (chrLocalUnit >= 1000*1000*1000){
                    tmp2.text = (localTickChrPos/1000000000).toString()+"G"
                }
            }
            localTicks.push(tmp2)

        }


        if (highlightRegion){
            let tmp2 = {};
            tmp2.x = ((highlightRegionStart - rulerStart) / chrMinMaxRange * 100).toString() + "%"
            tmp2.y = "0%"
            tmp2.width = ((highlightRegionEnd - highlightRegionStart) / chrMinMaxRange * 100).toString() + "%"
            tmp2.height = "60%"
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
            .attr("y", "94%")
            .attr("font-size","11px")
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

export function GenomeBrowserRefGeneSubTrack(props){

    const debug = false;
    let trackHeight = "50px";
    if (props.trackHeight){
        trackHeight = props.trackHeight
    }

    let positionStart = props.positionStart;
    let positionEnd = props.positionEnd;
    let refGenesInThisRegion = props.refGenesInThisRegion;
    let layerIndex = props.layerIndex;



    function SVGRender (svg){
        const scaleX = d3.scaleLinear()
            .domain([positionStart, positionEnd])
            .range([0, 100])

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
        let strandIndicator = [];
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



        for (let rg of refGenesInThisRegion){
            let fillColor = "black";
            if (rg.transcriptionClass === "nonCoding"){
                fillColor = "green"
            } else if (rg.transcriptionClass === "coding"){
                fillColor = "purple"
            } else if (rg.transcriptionClass === ""){
                fillColor = "black"
            }

            if (rg.verticalPos != layerIndex){
                continue
            }

            let tmpTx = {
                x: scaleX(rg.txStart).toString() + "%",
                y: "65%",
                width: ((rg.txEnd - rg.txStart)/chrMinMaxRange*100).toString() + "%",
                height: "10%",
                fill: fillColor,
            }
            geneRect.push(tmpTx)

            let tmpTxt = {
                x: scaleX((rg.txStart+rg.txEnd)/2).toString() + "%",
                y: "32%",
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

                    let tmpExon = {
                        x: scaleX(es).toString() + "%",
                        y: "49%",
                        width: ((ee - es)/chrMinMaxRange*100).toString() + "%",
                        height: "42%",
                        fill: fillColor,
                    }
                    geneRect.push(tmpExon)
                }

                for (let i=0; i<exonStarts.length-1; i++){
                    let is = parseInt(exonEnds[i]);
                    let ie = parseInt(exonStarts[i+1]);

                    let intronPercentageLength = (ie - is)/chrMinMaxRange*100
                    if (intronPercentageLength < 2){
                        continue
                    }

                    let centerPoint = scaleX((ie+is)/2)

                    let tmpIntron1 = {
                        x1: (centerPoint-1).toString()+"%",
                        x2: (centerPoint+1).toString()+"20%",
                        y1: "55%",
                        y2: "70%",
                        width: "2px",
                        stroke: fillColor,
                    }
                    let tmpIntron2 = JSON.parse(JSON.stringify(tmpIntron1))
                    tmpIntron2.y1 = "85%"
                    strandIndicator.push(tmpIntron1)
                    strandIndicator.push(tmpIntron2)

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
            .attr("font-size","16px")
            .attr("text-anchor", "middle")
            .attr("fill", (d) => d.fill)

        svg.select(".localRuler")
            .selectAll(".rect")
            .data(strandIndicator)
            .join("line")
            .attr("x1", (d) => d.x1)
            .attr("y1", (d) => d.y1)
            .attr("x2", (d) => d.x2)
            .attr("y2", (d) => d.y2)
            .style("stroke", (d) => d.stroke)


    }



    const ref = useD3(
        SVGRender,
        [refGenesInThisRegion, positionStart, positionEnd, layerIndex]
    );

    return <svg ref={ref} style={{width: "100%", height: trackHeight, marginRight: "0px", marginLeft: "0px"}} ></svg>

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


    let verticalGeneNumLimit = 5;
    if (isNumber(props.verticalGeneNumLimit)){
        verticalGeneNumLimit = parseInt(props.verticalGeneNumLimit)
    }

    const [refGenesInThisRegion, setRefGenesInThisRegion] = useState([]);
    const [minimumVerticalNum, setMinimumVerticalNum] = useState(1);

    const getMinimumVerticalNum = function (d, offset){
        let res = 0;

        function getAllNums(d){
            let res = [d.cdsStart, d.cdsEnd, d.txStart, d.txEnd];
            for (let p of d.exonStarts.split(",")){
                res.push(parseInt(p))
            }
            for (let p of d.exonEnds.split(",")){
                res.push(parseInt(p))
            }
            d.absStart = Math.min(...res)
            d.absEnd   = Math.max(...res)
            return res
        }
        for (let d0 of d){
            getAllNums(d0)
        }
        d = d.sort((a, b) => {

            let al = a.absEnd - a.absStart;
            let bl = b.absEnd - b.absStart;

            return a.absStart - b.absStart

            if (a.absStart !== b.absStart){
                return b.absStart - a.absStart
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
            let s = rg.absStart;
            let e = rg.absEnd;

            rangeMin = Math.min(rangeMin, s)
            rangeMax = Math.max(rangeMax, e)
        }
        // console.log(rangeMin, rangeMax)


        for (let p=rangeMin; p <= rangeMax; p++){
            let thisPosGeneCount = 0;

            for (let rg of d){
                if (rg.absStart <= p && p <= rg.absEnd){
                    rg.verticalPos = thisPosGeneCount
                    thisPosGeneCount += 1
                }
            }

            res = Math.max(res, thisPosGeneCount)
        }

        res = res + offset
        if (res > d.length){
            res = d.length
        }

        let vPos = 0;
        for (let rg of d){
            rg.verticalPos = vPos;
            vPos += 1;
            if (vPos >= res){
                vPos = 0;
            }
        }


        return res
    }



    const queryRefGenesByRegion = function (){
        let rurl = GeneQueryByRegion("hg38", chromosome, positionStart, positionEnd);
        axios.get(rurl)
            .then(function (response) {
                let d = response.data;
                let mvn = getMinimumVerticalNum(d, 3);
                setMinimumVerticalNum(mvn)
                setRefGenesInThisRegion(d)
                // console.log(d, mvn)
            })
            .catch(function (error) {
                // console.log(geneName, error);
            });
    }



    useEffect(
        queryRefGenesByRegion,
        [chromosome, positionStart, positionEnd]
    )

    return <>

        <div style={{width: "100%"}}>

            {
                Array(Math.min(minimumVerticalNum, verticalGeneNumLimit)).fill(0).map((_, i) => {
                    return <GenomeBrowserRefGeneSubTrack
                        positionStart={positionStart}
                        positionEnd={positionEnd}
                        minimumVerticalNum={minimumVerticalNum}
                        refGenesInThisRegion={refGenesInThisRegion}
                        layerIndex={i}
                        trackHeight="40px"
                    ></GenomeBrowserRefGeneSubTrack>
                })
            }

            {
                minimumVerticalNum > verticalGeneNumLimit ? <div style={{width: "100%", height: "20px", textAlign: "center", color: "gray"}}>Can't show all genes...</div> : <></>
            }
        </div>

    </>
}



export function ChromosomeCytoBand(props){

    const genomeAssembly = props.genomeAssembly;

    const chromosome = props.chromosome;
    const positionStart = parseInt(props.positionStart);
    const positionEnd = parseInt(props.positionEnd);


    let searchResultFiltered = [];

    let chrMin = positionStart, chrMax = positionEnd;


    const cytoBandData = {"chr1": [[0, 2300000, "p36.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [2300000, 5300000, "p36.32", "gpos25", "rgb(218, 218, 218)", "white"], [5300000, 7100000, "p36.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [7100000, 9100000, "p36.23", "gpos25", "rgb(218, 218, 218)", "white"], [9100000, 12500000, "p36.22", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [12500000, 15900000, "p36.21", "gpos50", "rgb(188, 188, 188)", "white"], [15900000, 20100000, "p36.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [20100000, 23600000, "p36.12", "gpos25", "rgb(218, 218, 218)", "white"], [23600000, 27600000, "p36.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27600000, 29900000, "p35.3", "gpos25", "rgb(218, 218, 218)", "white"], [29900000, 32300000, "p35.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [32300000, 34300000, "p35.1", "gpos25", "rgb(218, 218, 218)", "white"], [34300000, 39600000, "p34.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [39600000, 43700000, "p34.2", "gpos25", "rgb(218, 218, 218)", "white"], [43700000, 46300000, "p34.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [46300000, 50200000, "p33", "gpos75", "rgb(158, 158, 158)", "white"], [50200000, 55600000, "p32.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [55600000, 58500000, "p32.2", "gpos50", "rgb(188, 188, 188)", "white"], [58500000, 60800000, "p32.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [60800000, 68500000, "p31.3", "gpos50", "rgb(188, 188, 188)", "white"], [68500000, 69300000, "p31.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [69300000, 84400000, "p31.1", "gpos100", "rgb(128, 128, 128)", "white"], [84400000, 87900000, "p22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [87900000, 91500000, "p22.2", "gpos75", "rgb(158, 158, 158)", "white"], [91500000, 94300000, "p22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [94300000, 99300000, "p21.3", "gpos75", "rgb(158, 158, 158)", "white"], [99300000, 101800000, "p21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [101800000, 106700000, "p21.1", "gpos100", "rgb(128, 128, 128)", "white"], [106700000, 111200000, "p13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [111200000, 115500000, "p13.2", "gpos50", "rgb(188, 188, 188)", "white"], [115500000, 117200000, "p13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [117200000, 120400000, "p12", "gpos50", "rgb(188, 188, 188)", "white"], [120400000, 121700000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [121700000, 123400000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [123400000, 125100000, "q11", "acen", "rgb(131, 68, 56)", "white"], [125100000, 143200000, "q12", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [143200000, 147500000, "q21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [147500000, 150600000, "q21.2", "gpos50", "rgb(188, 188, 188)", "white"], [150600000, 155100000, "q21.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [155100000, 156600000, "q22", "gpos50", "rgb(188, 188, 188)", "white"], [156600000, 159100000, "q23.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [159100000, 160500000, "q23.2", "gpos50", "rgb(188, 188, 188)", "white"], [160500000, 165500000, "q23.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [165500000, 167200000, "q24.1", "gpos50", "rgb(188, 188, 188)", "white"], [167200000, 170900000, "q24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [170900000, 173000000, "q24.3", "gpos75", "rgb(158, 158, 158)", "white"], [173000000, 176100000, "q25.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [176100000, 180300000, "q25.2", "gpos50", "rgb(188, 188, 188)", "white"], [180300000, 185800000, "q25.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [185800000, 190800000, "q31.1", "gpos100", "rgb(128, 128, 128)", "white"], [190800000, 193800000, "q31.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [193800000, 198700000, "q31.3", "gpos100", "rgb(128, 128, 128)", "white"], [198700000, 207100000, "q32.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [207100000, 211300000, "q32.2", "gpos25", "rgb(218, 218, 218)", "white"], [211300000, 214400000, "q32.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [214400000, 223900000, "q41", "gpos100", "rgb(128, 128, 128)", "white"], [223900000, 224400000, "q42.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [224400000, 226800000, "q42.12", "gpos25", "rgb(218, 218, 218)", "white"], [226800000, 230500000, "q42.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [230500000, 234600000, "q42.2", "gpos50", "rgb(188, 188, 188)", "white"], [234600000, 236400000, "q42.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [236400000, 243500000, "q43", "gpos75", "rgb(158, 158, 158)", "white"], [243500000, 248956422, "q44", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr10": [[0, 3000000, "p15.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [3000000, 3800000, "p15.2", "gpos25", "rgb(218, 218, 218)", "white"], [3800000, 6600000, "p15.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [6600000, 12200000, "p14", "gpos75", "rgb(158, 158, 158)", "white"], [12200000, 17300000, "p13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [17300000, 18300000, "p12.33", "gpos75", "rgb(158, 158, 158)", "white"], [18300000, 18400000, "p12.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [18400000, 22300000, "p12.31", "gpos75", "rgb(158, 158, 158)", "white"], [22300000, 24300000, "p12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [24300000, 29300000, "p12.1", "gpos50", "rgb(188, 188, 188)", "white"], [29300000, 31100000, "p11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [31100000, 34200000, "p11.22", "gpos25", "rgb(218, 218, 218)", "white"], [34200000, 38000000, "p11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [38000000, 39800000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [39800000, 41600000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [41600000, 45500000, "q11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [45500000, 48600000, "q11.22", "gpos25", "rgb(218, 218, 218)", "white"], [48600000, 51100000, "q11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [51100000, 59400000, "q21.1", "gpos100", "rgb(128, 128, 128)", "white"], [59400000, 62800000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [62800000, 68800000, "q21.3", "gpos100", "rgb(128, 128, 128)", "white"], [68800000, 73100000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [73100000, 75900000, "q22.2", "gpos50", "rgb(188, 188, 188)", "white"], [75900000, 80300000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [80300000, 86100000, "q23.1", "gpos100", "rgb(128, 128, 128)", "white"], [86100000, 87700000, "q23.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [87700000, 91100000, "q23.31", "gpos75", "rgb(158, 158, 158)", "white"], [91100000, 92300000, "q23.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [92300000, 95300000, "q23.33", "gpos50", "rgb(188, 188, 188)", "white"], [95300000, 97500000, "q24.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [97500000, 100100000, "q24.2", "gpos50", "rgb(188, 188, 188)", "white"], [100100000, 101200000, "q24.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [101200000, 103100000, "q24.32", "gpos25", "rgb(218, 218, 218)", "white"], [103100000, 104000000, "q24.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [104000000, 110100000, "q25.1", "gpos100", "rgb(128, 128, 128)", "white"], [110100000, 113100000, "q25.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [113100000, 117300000, "q25.3", "gpos75", "rgb(158, 158, 158)", "white"], [117300000, 119900000, "q26.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [119900000, 121400000, "q26.12", "gpos50", "rgb(188, 188, 188)", "white"], [121400000, 125700000, "q26.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [125700000, 128800000, "q26.2", "gpos50", "rgb(188, 188, 188)", "white"], [128800000, 133797422, "q26.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr11": [[0, 2800000, "p15.5", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [2800000, 11700000, "p15.4", "gpos50", "rgb(188, 188, 188)", "white"], [11700000, 13800000, "p15.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [13800000, 16900000, "p15.2", "gpos50", "rgb(188, 188, 188)", "white"], [16900000, 22000000, "p15.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [22000000, 26200000, "p14.3", "gpos100", "rgb(128, 128, 128)", "white"], [26200000, 27200000, "p14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27200000, 31000000, "p14.1", "gpos75", "rgb(158, 158, 158)", "white"], [31000000, 36400000, "p13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [36400000, 43400000, "p12", "gpos100", "rgb(128, 128, 128)", "white"], [43400000, 48800000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [48800000, 51000000, "p11.12", "gpos75", "rgb(158, 158, 158)", "white"], [51000000, 53400000, "p11.11", "acen", "rgb(131, 68, 56)", "white"], [53400000, 55800000, "q11", "acen", "rgb(131, 68, 56)", "white"], [55800000, 60100000, "q12.1", "gpos75", "rgb(158, 158, 158)", "white"], [60100000, 61900000, "q12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [61900000, 63600000, "q12.3", "gpos25", "rgb(218, 218, 218)", "white"], [63600000, 66100000, "q13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [66100000, 68700000, "q13.2", "gpos25", "rgb(218, 218, 218)", "white"], [68700000, 70500000, "q13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [70500000, 75500000, "q13.4", "gpos50", "rgb(188, 188, 188)", "white"], [75500000, 77400000, "q13.5", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [77400000, 85900000, "q14.1", "gpos100", "rgb(128, 128, 128)", "white"], [85900000, 88600000, "q14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [88600000, 93000000, "q14.3", "gpos100", "rgb(128, 128, 128)", "white"], [93000000, 97400000, "q21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [97400000, 102300000, "q22.1", "gpos100", "rgb(128, 128, 128)", "white"], [102300000, 103000000, "q22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [103000000, 110600000, "q22.3", "gpos100", "rgb(128, 128, 128)", "white"], [110600000, 112700000, "q23.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [112700000, 114600000, "q23.2", "gpos50", "rgb(188, 188, 188)", "white"], [114600000, 121300000, "q23.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [121300000, 124000000, "q24.1", "gpos50", "rgb(188, 188, 188)", "white"], [124000000, 127900000, "q24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [127900000, 130900000, "q24.3", "gpos50", "rgb(188, 188, 188)", "white"], [130900000, 135086622, "q25", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr12": [[0, 3200000, "p13.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [3200000, 5300000, "p13.32", "gpos25", "rgb(218, 218, 218)", "white"], [5300000, 10000000, "p13.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [10000000, 12600000, "p13.2", "gpos75", "rgb(158, 158, 158)", "white"], [12600000, 14600000, "p13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [14600000, 19800000, "p12.3", "gpos100", "rgb(128, 128, 128)", "white"], [19800000, 21100000, "p12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [21100000, 26300000, "p12.1", "gpos100", "rgb(128, 128, 128)", "white"], [26300000, 27600000, "p11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27600000, 30500000, "p11.22", "gpos50", "rgb(188, 188, 188)", "white"], [30500000, 33200000, "p11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [33200000, 35500000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [35500000, 37800000, "q11", "acen", "rgb(131, 68, 56)", "white"], [37800000, 46000000, "q12", "gpos100", "rgb(128, 128, 128)", "white"], [46000000, 48700000, "q13.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [48700000, 51100000, "q13.12", "gpos25", "rgb(218, 218, 218)", "white"], [51100000, 54500000, "q13.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [54500000, 56200000, "q13.2", "gpos25", "rgb(218, 218, 218)", "white"], [56200000, 57700000, "q13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [57700000, 62700000, "q14.1", "gpos75", "rgb(158, 158, 158)", "white"], [62700000, 64700000, "q14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [64700000, 67300000, "q14.3", "gpos50", "rgb(188, 188, 188)", "white"], [67300000, 71100000, "q15", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [71100000, 75300000, "q21.1", "gpos75", "rgb(158, 158, 158)", "white"], [75300000, 79900000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [79900000, 86300000, "q21.31", "gpos100", "rgb(128, 128, 128)", "white"], [86300000, 88600000, "q21.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [88600000, 92200000, "q21.33", "gpos100", "rgb(128, 128, 128)", "white"], [92200000, 95800000, "q22", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [95800000, 101200000, "q23.1", "gpos75", "rgb(158, 158, 158)", "white"], [101200000, 103500000, "q23.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [103500000, 108600000, "q23.3", "gpos50", "rgb(188, 188, 188)", "white"], [108600000, 111300000, "q24.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [111300000, 111900000, "q24.12", "gpos25", "rgb(218, 218, 218)", "white"], [111900000, 113900000, "q24.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [113900000, 116400000, "q24.21", "gpos50", "rgb(188, 188, 188)", "white"], [116400000, 117700000, "q24.22", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [117700000, 120300000, "q24.23", "gpos50", "rgb(188, 188, 188)", "white"], [120300000, 125400000, "q24.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [125400000, 128700000, "q24.32", "gpos50", "rgb(188, 188, 188)", "white"], [128700000, 133275309, "q24.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr13": [[0, 4600000, "p13", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4600000, 10100000, "p12", "stalk", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [10100000, 16500000, "p11.2", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [16500000, 17700000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [17700000, 18900000, "q11", "acen", "rgb(131, 68, 56)", "white"], [18900000, 22600000, "q12.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [22600000, 24900000, "q12.12", "gpos25", "rgb(218, 218, 218)", "white"], [24900000, 27200000, "q12.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27200000, 28300000, "q12.2", "gpos25", "rgb(218, 218, 218)", "white"], [28300000, 31600000, "q12.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [31600000, 33400000, "q13.1", "gpos50", "rgb(188, 188, 188)", "white"], [33400000, 34900000, "q13.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [34900000, 39500000, "q13.3", "gpos75", "rgb(158, 158, 158)", "white"], [39500000, 44600000, "q14.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [44600000, 45200000, "q14.12", "gpos25", "rgb(218, 218, 218)", "white"], [45200000, 46700000, "q14.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [46700000, 50300000, "q14.2", "gpos50", "rgb(188, 188, 188)", "white"], [50300000, 54700000, "q14.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [54700000, 59000000, "q21.1", "gpos100", "rgb(128, 128, 128)", "white"], [59000000, 61800000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [61800000, 65200000, "q21.31", "gpos75", "rgb(158, 158, 158)", "white"], [65200000, 68100000, "q21.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [68100000, 72800000, "q21.33", "gpos100", "rgb(128, 128, 128)", "white"], [72800000, 74900000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [74900000, 76700000, "q22.2", "gpos50", "rgb(188, 188, 188)", "white"], [76700000, 78500000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [78500000, 87100000, "q31.1", "gpos100", "rgb(128, 128, 128)", "white"], [87100000, 89400000, "q31.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [89400000, 94400000, "q31.3", "gpos100", "rgb(128, 128, 128)", "white"], [94400000, 97500000, "q32.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [97500000, 98700000, "q32.2", "gpos25", "rgb(218, 218, 218)", "white"], [98700000, 101100000, "q32.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [101100000, 104200000, "q33.1", "gpos100", "rgb(128, 128, 128)", "white"], [104200000, 106400000, "q33.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [106400000, 109600000, "q33.3", "gpos100", "rgb(128, 128, 128)", "white"], [109600000, 114364328, "q34", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr14": [[0, 3600000, "p13", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [3600000, 8000000, "p12", "stalk", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [8000000, 16100000, "p11.2", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [16100000, 17200000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [17200000, 18200000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [18200000, 24100000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [24100000, 32900000, "q12", "gpos100", "rgb(128, 128, 128)", "white"], [32900000, 34800000, "q13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [34800000, 36100000, "q13.2", "gpos50", "rgb(188, 188, 188)", "white"], [36100000, 37400000, "q13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [37400000, 43000000, "q21.1", "gpos100", "rgb(128, 128, 128)", "white"], [43000000, 46700000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [46700000, 50400000, "q21.3", "gpos100", "rgb(128, 128, 128)", "white"], [50400000, 53600000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [53600000, 55000000, "q22.2", "gpos25", "rgb(218, 218, 218)", "white"], [55000000, 57600000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [57600000, 61600000, "q23.1", "gpos75", "rgb(158, 158, 158)", "white"], [61600000, 64300000, "q23.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [64300000, 67400000, "q23.3", "gpos50", "rgb(188, 188, 188)", "white"], [67400000, 69800000, "q24.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [69800000, 73300000, "q24.2", "gpos50", "rgb(188, 188, 188)", "white"], [73300000, 78800000, "q24.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [78800000, 83100000, "q31.1", "gpos100", "rgb(128, 128, 128)", "white"], [83100000, 84400000, "q31.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [84400000, 89300000, "q31.3", "gpos100", "rgb(128, 128, 128)", "white"], [89300000, 91400000, "q32.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [91400000, 94200000, "q32.12", "gpos25", "rgb(218, 218, 218)", "white"], [94200000, 95800000, "q32.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [95800000, 100900000, "q32.2", "gpos50", "rgb(188, 188, 188)", "white"], [100900000, 102700000, "q32.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [102700000, 103500000, "q32.32", "gpos50", "rgb(188, 188, 188)", "white"], [103500000, 107043718, "q32.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr15": [[0, 4200000, "p13", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4200000, 9700000, "p12", "stalk", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [9700000, 17500000, "p11.2", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [17500000, 19000000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [19000000, 20500000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [20500000, 25500000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [25500000, 27800000, "q12", "gpos50", "rgb(188, 188, 188)", "white"], [27800000, 30000000, "q13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [30000000, 30900000, "q13.2", "gpos50", "rgb(188, 188, 188)", "white"], [30900000, 33400000, "q13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [33400000, 39800000, "q14", "gpos75", "rgb(158, 158, 158)", "white"], [39800000, 42500000, "q15.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [42500000, 43300000, "q15.2", "gpos25", "rgb(218, 218, 218)", "white"], [43300000, 44500000, "q15.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [44500000, 49200000, "q21.1", "gpos75", "rgb(158, 158, 158)", "white"], [49200000, 52600000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [52600000, 58800000, "q21.3", "gpos75", "rgb(158, 158, 158)", "white"], [58800000, 59000000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [59000000, 63400000, "q22.2", "gpos25", "rgb(218, 218, 218)", "white"], [63400000, 66900000, "q22.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [66900000, 67000000, "q22.32", "gpos25", "rgb(218, 218, 218)", "white"], [67000000, 67200000, "q22.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [67200000, 72400000, "q23", "gpos25", "rgb(218, 218, 218)", "white"], [72400000, 74900000, "q24.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [74900000, 76300000, "q24.2", "gpos25", "rgb(218, 218, 218)", "white"], [76300000, 78000000, "q24.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [78000000, 81400000, "q25.1", "gpos50", "rgb(188, 188, 188)", "white"], [81400000, 84700000, "q25.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [84700000, 88500000, "q25.3", "gpos50", "rgb(188, 188, 188)", "white"], [88500000, 93800000, "q26.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [93800000, 98000000, "q26.2", "gpos50", "rgb(188, 188, 188)", "white"], [98000000, 101991189, "q26.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr16": [[0, 7800000, "p13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [7800000, 10400000, "p13.2", "gpos50", "rgb(188, 188, 188)", "white"], [10400000, 12500000, "p13.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [12500000, 14700000, "p13.12", "gpos50", "rgb(188, 188, 188)", "white"], [14700000, 16700000, "p13.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [16700000, 21200000, "p12.3", "gpos50", "rgb(188, 188, 188)", "white"], [21200000, 24200000, "p12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [24200000, 28500000, "p12.1", "gpos50", "rgb(188, 188, 188)", "white"], [28500000, 35300000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [35300000, 36800000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [36800000, 38400000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [38400000, 47000000, "q11.2", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [47000000, 52600000, "q12.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [52600000, 56000000, "q12.2", "gpos50", "rgb(188, 188, 188)", "white"], [56000000, 57300000, "q13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [57300000, 66600000, "q21", "gpos100", "rgb(128, 128, 128)", "white"], [66600000, 70800000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [70800000, 72800000, "q22.2", "gpos50", "rgb(188, 188, 188)", "white"], [72800000, 74100000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [74100000, 79200000, "q23.1", "gpos75", "rgb(158, 158, 158)", "white"], [79200000, 81600000, "q23.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [81600000, 84100000, "q23.3", "gpos50", "rgb(188, 188, 188)", "white"], [84100000, 87000000, "q24.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [87000000, 88700000, "q24.2", "gpos25", "rgb(218, 218, 218)", "white"], [88700000, 90338345, "q24.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr17": [[0, 3400000, "p13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [3400000, 6500000, "p13.2", "gpos50", "rgb(188, 188, 188)", "white"], [6500000, 10800000, "p13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [10800000, 16100000, "p12", "gpos75", "rgb(158, 158, 158)", "white"], [16100000, 22700000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [22700000, 25100000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [25100000, 27400000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [27400000, 33500000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [33500000, 39800000, "q12", "gpos50", "rgb(188, 188, 188)", "white"], [39800000, 40200000, "q21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [40200000, 42800000, "q21.2", "gpos25", "rgb(218, 218, 218)", "white"], [42800000, 46800000, "q21.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [46800000, 49300000, "q21.32", "gpos25", "rgb(218, 218, 218)", "white"], [49300000, 52100000, "q21.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [52100000, 59500000, "q22", "gpos75", "rgb(158, 158, 158)", "white"], [59500000, 60200000, "q23.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [60200000, 63100000, "q23.2", "gpos75", "rgb(158, 158, 158)", "white"], [63100000, 64600000, "q23.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [64600000, 66200000, "q24.1", "gpos50", "rgb(188, 188, 188)", "white"], [66200000, 69100000, "q24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [69100000, 72900000, "q24.3", "gpos75", "rgb(158, 158, 158)", "white"], [72900000, 76800000, "q25.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [76800000, 77200000, "q25.2", "gpos25", "rgb(218, 218, 218)", "white"], [77200000, 83257441, "q25.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr18": [[0, 2900000, "p11.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [2900000, 7200000, "p11.31", "gpos50", "rgb(188, 188, 188)", "white"], [7200000, 8500000, "p11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [8500000, 10900000, "p11.22", "gpos25", "rgb(218, 218, 218)", "white"], [10900000, 15400000, "p11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [15400000, 18500000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [18500000, 21500000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [21500000, 27500000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27500000, 35100000, "q12.1", "gpos100", "rgb(128, 128, 128)", "white"], [35100000, 39500000, "q12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [39500000, 45900000, "q12.3", "gpos75", "rgb(158, 158, 158)", "white"], [45900000, 50700000, "q21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [50700000, 56200000, "q21.2", "gpos75", "rgb(158, 158, 158)", "white"], [56200000, 58600000, "q21.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [58600000, 61300000, "q21.32", "gpos50", "rgb(188, 188, 188)", "white"], [61300000, 63900000, "q21.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [63900000, 69100000, "q22.1", "gpos100", "rgb(128, 128, 128)", "white"], [69100000, 71000000, "q22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [71000000, 75400000, "q22.3", "gpos25", "rgb(218, 218, 218)", "white"], [75400000, 80373285, "q23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr19": [[0, 6900000, "p13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [6900000, 12600000, "p13.2", "gpos25", "rgb(218, 218, 218)", "white"], [12600000, 13800000, "p13.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [13800000, 16100000, "p13.12", "gpos25", "rgb(218, 218, 218)", "white"], [16100000, 19900000, "p13.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [19900000, 24200000, "p12", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [24200000, 26200000, "p11", "acen", "rgb(131, 68, 56)", "white"], [26200000, 28100000, "q11", "acen", "rgb(131, 68, 56)", "white"], [28100000, 31900000, "q12", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [31900000, 35100000, "q13.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [35100000, 37800000, "q13.12", "gpos25", "rgb(218, 218, 218)", "white"], [37800000, 38200000, "q13.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [38200000, 42900000, "q13.2", "gpos25", "rgb(218, 218, 218)", "white"], [42900000, 44700000, "q13.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [44700000, 47500000, "q13.32", "gpos25", "rgb(218, 218, 218)", "white"], [47500000, 50900000, "q13.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [50900000, 53100000, "q13.41", "gpos25", "rgb(218, 218, 218)", "white"], [53100000, 55800000, "q13.42", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [55800000, 58617616, "q13.43", "gpos25", "rgb(218, 218, 218)", "white"]], "chr2": [[0, 4400000, "p25.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4400000, 6900000, "p25.2", "gpos50", "rgb(188, 188, 188)", "white"], [6900000, 12000000, "p25.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [12000000, 16500000, "p24.3", "gpos75", "rgb(158, 158, 158)", "white"], [16500000, 19000000, "p24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [19000000, 23800000, "p24.1", "gpos75", "rgb(158, 158, 158)", "white"], [23800000, 27700000, "p23.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27700000, 29800000, "p23.2", "gpos25", "rgb(218, 218, 218)", "white"], [29800000, 31800000, "p23.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [31800000, 36300000, "p22.3", "gpos75", "rgb(158, 158, 158)", "white"], [36300000, 38300000, "p22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [38300000, 41500000, "p22.1", "gpos50", "rgb(188, 188, 188)", "white"], [41500000, 47500000, "p21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [47500000, 52600000, "p16.3", "gpos100", "rgb(128, 128, 128)", "white"], [52600000, 54700000, "p16.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [54700000, 61000000, "p16.1", "gpos100", "rgb(128, 128, 128)", "white"], [61000000, 63900000, "p15", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [63900000, 68400000, "p14", "gpos50", "rgb(188, 188, 188)", "white"], [68400000, 71300000, "p13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [71300000, 73300000, "p13.2", "gpos50", "rgb(188, 188, 188)", "white"], [73300000, 74800000, "p13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [74800000, 83100000, "p12", "gpos100", "rgb(128, 128, 128)", "white"], [83100000, 91800000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [91800000, 93900000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [93900000, 96000000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [96000000, 102100000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [102100000, 105300000, "q12.1", "gpos50", "rgb(188, 188, 188)", "white"], [105300000, 106700000, "q12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [106700000, 108700000, "q12.3", "gpos25", "rgb(218, 218, 218)", "white"], [108700000, 112200000, "q13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [112200000, 118100000, "q14.1", "gpos50", "rgb(188, 188, 188)", "white"], [118100000, 121600000, "q14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [121600000, 129100000, "q14.3", "gpos50", "rgb(188, 188, 188)", "white"], [129100000, 131700000, "q21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [131700000, 134300000, "q21.2", "gpos25", "rgb(218, 218, 218)", "white"], [134300000, 136100000, "q21.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [136100000, 141500000, "q22.1", "gpos100", "rgb(128, 128, 128)", "white"], [141500000, 143400000, "q22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [143400000, 147900000, "q22.3", "gpos100", "rgb(128, 128, 128)", "white"], [147900000, 149000000, "q23.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [149000000, 149600000, "q23.2", "gpos25", "rgb(218, 218, 218)", "white"], [149600000, 154000000, "q23.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [154000000, 158900000, "q24.1", "gpos75", "rgb(158, 158, 158)", "white"], [158900000, 162900000, "q24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [162900000, 168900000, "q24.3", "gpos75", "rgb(158, 158, 158)", "white"], [168900000, 177100000, "q31.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [177100000, 179700000, "q31.2", "gpos50", "rgb(188, 188, 188)", "white"], [179700000, 182100000, "q31.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [182100000, 188500000, "q32.1", "gpos75", "rgb(158, 158, 158)", "white"], [188500000, 191100000, "q32.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [191100000, 196600000, "q32.3", "gpos75", "rgb(158, 158, 158)", "white"], [196600000, 202500000, "q33.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [202500000, 204100000, "q33.2", "gpos50", "rgb(188, 188, 188)", "white"], [204100000, 208200000, "q33.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [208200000, 214500000, "q34", "gpos100", "rgb(128, 128, 128)", "white"], [214500000, 220700000, "q35", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [220700000, 224300000, "q36.1", "gpos75", "rgb(158, 158, 158)", "white"], [224300000, 225200000, "q36.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [225200000, 230100000, "q36.3", "gpos100", "rgb(128, 128, 128)", "white"], [230100000, 234700000, "q37.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [234700000, 236400000, "q37.2", "gpos50", "rgb(188, 188, 188)", "white"], [236400000, 242193529, "q37.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr20": [[0, 5100000, "p13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [5100000, 9200000, "p12.3", "gpos75", "rgb(158, 158, 158)", "white"], [9200000, 12000000, "p12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [12000000, 17900000, "p12.1", "gpos75", "rgb(158, 158, 158)", "white"], [17900000, 21300000, "p11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [21300000, 22300000, "p11.22", "gpos25", "rgb(218, 218, 218)", "white"], [22300000, 25700000, "p11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [25700000, 28100000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [28100000, 30400000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [30400000, 33500000, "q11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [33500000, 35800000, "q11.22", "gpos25", "rgb(218, 218, 218)", "white"], [35800000, 39000000, "q11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [39000000, 43100000, "q12", "gpos75", "rgb(158, 158, 158)", "white"], [43100000, 43500000, "q13.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [43500000, 47800000, "q13.12", "gpos25", "rgb(218, 218, 218)", "white"], [47800000, 51200000, "q13.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [51200000, 56400000, "q13.2", "gpos75", "rgb(158, 158, 158)", "white"], [56400000, 57800000, "q13.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [57800000, 59700000, "q13.32", "gpos50", "rgb(188, 188, 188)", "white"], [59700000, 64444167, "q13.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr21": [[0, 3100000, "p13", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [3100000, 7000000, "p12", "stalk", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [7000000, 10900000, "p11.2", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [10900000, 12000000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [12000000, 13000000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [13000000, 15000000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [15000000, 22600000, "q21.1", "gpos100", "rgb(128, 128, 128)", "white"], [22600000, 25500000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [25500000, 30200000, "q21.3", "gpos75", "rgb(158, 158, 158)", "white"], [30200000, 34400000, "q22.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [34400000, 36400000, "q22.12", "gpos50", "rgb(188, 188, 188)", "white"], [36400000, 38300000, "q22.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [38300000, 41200000, "q22.2", "gpos50", "rgb(188, 188, 188)", "white"], [41200000, 46709983, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr22": [[0, 4300000, "p13", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4300000, 9400000, "p12", "stalk", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [9400000, 13700000, "p11.2", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [13700000, 15000000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [15000000, 17400000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [17400000, 21700000, "q11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [21700000, 23100000, "q11.22", "gpos25", "rgb(218, 218, 218)", "white"], [23100000, 25500000, "q11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [25500000, 29200000, "q12.1", "gpos50", "rgb(188, 188, 188)", "white"], [29200000, 31800000, "q12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [31800000, 37200000, "q12.3", "gpos50", "rgb(188, 188, 188)", "white"], [37200000, 40600000, "q13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [40600000, 43800000, "q13.2", "gpos50", "rgb(188, 188, 188)", "white"], [43800000, 48100000, "q13.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [48100000, 49100000, "q13.32", "gpos50", "rgb(188, 188, 188)", "white"], [49100000, 50818468, "q13.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr3": [[0, 2800000, "p26.3", "gpos50", "rgb(188, 188, 188)", "white"], [2800000, 4000000, "p26.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4000000, 8100000, "p26.1", "gpos50", "rgb(188, 188, 188)", "white"], [8100000, 11600000, "p25.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [11600000, 13200000, "p25.2", "gpos25", "rgb(218, 218, 218)", "white"], [13200000, 16300000, "p25.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [16300000, 23800000, "p24.3", "gpos100", "rgb(128, 128, 128)", "white"], [23800000, 26300000, "p24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [26300000, 30800000, "p24.1", "gpos75", "rgb(158, 158, 158)", "white"], [30800000, 32000000, "p23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [32000000, 36400000, "p22.3", "gpos50", "rgb(188, 188, 188)", "white"], [36400000, 39300000, "p22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [39300000, 43600000, "p22.1", "gpos75", "rgb(158, 158, 158)", "white"], [43600000, 44100000, "p21.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [44100000, 44200000, "p21.32", "gpos50", "rgb(188, 188, 188)", "white"], [44200000, 50600000, "p21.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [50600000, 52300000, "p21.2", "gpos25", "rgb(218, 218, 218)", "white"], [52300000, 54400000, "p21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [54400000, 58600000, "p14.3", "gpos50", "rgb(188, 188, 188)", "white"], [58600000, 63800000, "p14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [63800000, 69700000, "p14.1", "gpos50", "rgb(188, 188, 188)", "white"], [69700000, 74100000, "p13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [74100000, 79800000, "p12.3", "gpos75", "rgb(158, 158, 158)", "white"], [79800000, 83500000, "p12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [83500000, 87100000, "p12.1", "gpos75", "rgb(158, 158, 158)", "white"], [87100000, 87800000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [87800000, 90900000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [90900000, 94000000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [94000000, 98600000, "q11.2", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [98600000, 100300000, "q12.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [100300000, 101200000, "q12.2", "gpos25", "rgb(218, 218, 218)", "white"], [101200000, 103100000, "q12.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [103100000, 106500000, "q13.11", "gpos75", "rgb(158, 158, 158)", "white"], [106500000, 108200000, "q13.12", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [108200000, 111600000, "q13.13", "gpos50", "rgb(188, 188, 188)", "white"], [111600000, 113700000, "q13.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [113700000, 117600000, "q13.31", "gpos75", "rgb(158, 158, 158)", "white"], [117600000, 119300000, "q13.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [119300000, 122200000, "q13.33", "gpos75", "rgb(158, 158, 158)", "white"], [122200000, 124100000, "q21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [124100000, 126100000, "q21.2", "gpos25", "rgb(218, 218, 218)", "white"], [126100000, 129500000, "q21.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [129500000, 134000000, "q22.1", "gpos25", "rgb(218, 218, 218)", "white"], [134000000, 136000000, "q22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [136000000, 139000000, "q22.3", "gpos25", "rgb(218, 218, 218)", "white"], [139000000, 143100000, "q23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [143100000, 149200000, "q24", "gpos100", "rgb(128, 128, 128)", "white"], [149200000, 152300000, "q25.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [152300000, 155300000, "q25.2", "gpos50", "rgb(188, 188, 188)", "white"], [155300000, 157300000, "q25.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [157300000, 159300000, "q25.32", "gpos50", "rgb(188, 188, 188)", "white"], [159300000, 161000000, "q25.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [161000000, 167900000, "q26.1", "gpos100", "rgb(128, 128, 128)", "white"], [167900000, 171200000, "q26.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [171200000, 176000000, "q26.31", "gpos75", "rgb(158, 158, 158)", "white"], [176000000, 179300000, "q26.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [179300000, 183000000, "q26.33", "gpos75", "rgb(158, 158, 158)", "white"], [183000000, 184800000, "q27.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [184800000, 186300000, "q27.2", "gpos25", "rgb(218, 218, 218)", "white"], [186300000, 188200000, "q27.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [188200000, 192600000, "q28", "gpos75", "rgb(158, 158, 158)", "white"], [192600000, 198295559, "q29", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr4": [[0, 4500000, "p16.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4500000, 6000000, "p16.2", "gpos25", "rgb(218, 218, 218)", "white"], [6000000, 11300000, "p16.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [11300000, 15000000, "p15.33", "gpos50", "rgb(188, 188, 188)", "white"], [15000000, 17700000, "p15.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [17700000, 21300000, "p15.31", "gpos75", "rgb(158, 158, 158)", "white"], [21300000, 27700000, "p15.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27700000, 35800000, "p15.1", "gpos100", "rgb(128, 128, 128)", "white"], [35800000, 41200000, "p14", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [41200000, 44600000, "p13", "gpos50", "rgb(188, 188, 188)", "white"], [44600000, 48200000, "p12", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [48200000, 50000000, "p11", "acen", "rgb(131, 68, 56)", "white"], [50000000, 51800000, "q11", "acen", "rgb(131, 68, 56)", "white"], [51800000, 58500000, "q12", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [58500000, 65500000, "q13.1", "gpos100", "rgb(128, 128, 128)", "white"], [65500000, 69400000, "q13.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [69400000, 75300000, "q13.3", "gpos75", "rgb(158, 158, 158)", "white"], [75300000, 78000000, "q21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [78000000, 81500000, "q21.21", "gpos50", "rgb(188, 188, 188)", "white"], [81500000, 83200000, "q21.22", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [83200000, 86000000, "q21.23", "gpos25", "rgb(218, 218, 218)", "white"], [86000000, 87100000, "q21.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [87100000, 92800000, "q22.1", "gpos75", "rgb(158, 158, 158)", "white"], [92800000, 94200000, "q22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [94200000, 97900000, "q22.3", "gpos75", "rgb(158, 158, 158)", "white"], [97900000, 100100000, "q23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [100100000, 106700000, "q24", "gpos50", "rgb(188, 188, 188)", "white"], [106700000, 113200000, "q25", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [113200000, 119900000, "q26", "gpos75", "rgb(158, 158, 158)", "white"], [119900000, 122800000, "q27", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [122800000, 127900000, "q28.1", "gpos50", "rgb(188, 188, 188)", "white"], [127900000, 130100000, "q28.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [130100000, 138500000, "q28.3", "gpos100", "rgb(128, 128, 128)", "white"], [138500000, 140600000, "q31.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [140600000, 145900000, "q31.21", "gpos25", "rgb(218, 218, 218)", "white"], [145900000, 147500000, "q31.22", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [147500000, 150200000, "q31.23", "gpos25", "rgb(218, 218, 218)", "white"], [150200000, 154600000, "q31.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [154600000, 160800000, "q32.1", "gpos100", "rgb(128, 128, 128)", "white"], [160800000, 163600000, "q32.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [163600000, 169200000, "q32.3", "gpos100", "rgb(128, 128, 128)", "white"], [169200000, 171000000, "q33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [171000000, 175400000, "q34.1", "gpos75", "rgb(158, 158, 158)", "white"], [175400000, 176600000, "q34.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [176600000, 182300000, "q34.3", "gpos100", "rgb(128, 128, 128)", "white"], [182300000, 186200000, "q35.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [186200000, 190214555, "q35.2", "gpos25", "rgb(218, 218, 218)", "white"]], "chr5": [[0, 4400000, "p15.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4400000, 6300000, "p15.32", "gpos25", "rgb(218, 218, 218)", "white"], [6300000, 9900000, "p15.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [9900000, 15000000, "p15.2", "gpos50", "rgb(188, 188, 188)", "white"], [15000000, 18400000, "p15.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [18400000, 23300000, "p14.3", "gpos100", "rgb(128, 128, 128)", "white"], [23300000, 24600000, "p14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [24600000, 28900000, "p14.1", "gpos100", "rgb(128, 128, 128)", "white"], [28900000, 33800000, "p13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [33800000, 38400000, "p13.2", "gpos25", "rgb(218, 218, 218)", "white"], [38400000, 42500000, "p13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [42500000, 46100000, "p12", "gpos50", "rgb(188, 188, 188)", "white"], [46100000, 48800000, "p11", "acen", "rgb(131, 68, 56)", "white"], [48800000, 51400000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [51400000, 59600000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [59600000, 63600000, "q12.1", "gpos75", "rgb(158, 158, 158)", "white"], [63600000, 63900000, "q12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [63900000, 67400000, "q12.3", "gpos75", "rgb(158, 158, 158)", "white"], [67400000, 69100000, "q13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [69100000, 74000000, "q13.2", "gpos50", "rgb(188, 188, 188)", "white"], [74000000, 77600000, "q13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [77600000, 82100000, "q14.1", "gpos50", "rgb(188, 188, 188)", "white"], [82100000, 83500000, "q14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [83500000, 93000000, "q14.3", "gpos100", "rgb(128, 128, 128)", "white"], [93000000, 98900000, "q15", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [98900000, 103400000, "q21.1", "gpos100", "rgb(128, 128, 128)", "white"], [103400000, 105100000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [105100000, 110200000, "q21.3", "gpos100", "rgb(128, 128, 128)", "white"], [110200000, 112200000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [112200000, 113800000, "q22.2", "gpos50", "rgb(188, 188, 188)", "white"], [113800000, 115900000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [115900000, 122100000, "q23.1", "gpos100", "rgb(128, 128, 128)", "white"], [122100000, 127900000, "q23.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [127900000, 131200000, "q23.3", "gpos100", "rgb(128, 128, 128)", "white"], [131200000, 136900000, "q31.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [136900000, 140100000, "q31.2", "gpos25", "rgb(218, 218, 218)", "white"], [140100000, 145100000, "q31.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [145100000, 150400000, "q32", "gpos75", "rgb(158, 158, 158)", "white"], [150400000, 153300000, "q33.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [153300000, 156300000, "q33.2", "gpos50", "rgb(188, 188, 188)", "white"], [156300000, 160500000, "q33.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [160500000, 169000000, "q34", "gpos100", "rgb(128, 128, 128)", "white"], [169000000, 173300000, "q35.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [173300000, 177100000, "q35.2", "gpos25", "rgb(218, 218, 218)", "white"], [177100000, 181538259, "q35.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr6": [[0, 2300000, "p25.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [2300000, 4200000, "p25.2", "gpos25", "rgb(218, 218, 218)", "white"], [4200000, 7100000, "p25.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [7100000, 10600000, "p24.3", "gpos50", "rgb(188, 188, 188)", "white"], [10600000, 11600000, "p24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [11600000, 13400000, "p24.1", "gpos25", "rgb(218, 218, 218)", "white"], [13400000, 15200000, "p23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [15200000, 25200000, "p22.3", "gpos75", "rgb(158, 158, 158)", "white"], [25200000, 27100000, "p22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [27100000, 30500000, "p22.1", "gpos50", "rgb(188, 188, 188)", "white"], [30500000, 32100000, "p21.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [32100000, 33500000, "p21.32", "gpos25", "rgb(218, 218, 218)", "white"], [33500000, 36600000, "p21.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [36600000, 40500000, "p21.2", "gpos25", "rgb(218, 218, 218)", "white"], [40500000, 46200000, "p21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [46200000, 51800000, "p12.3", "gpos100", "rgb(128, 128, 128)", "white"], [51800000, 53000000, "p12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [53000000, 57200000, "p12.1", "gpos100", "rgb(128, 128, 128)", "white"], [57200000, 58500000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [58500000, 59800000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [59800000, 62600000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [62600000, 62700000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [62700000, 69200000, "q12", "gpos100", "rgb(128, 128, 128)", "white"], [69200000, 75200000, "q13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [75200000, 83200000, "q14.1", "gpos50", "rgb(188, 188, 188)", "white"], [83200000, 84200000, "q14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [84200000, 87300000, "q14.3", "gpos50", "rgb(188, 188, 188)", "white"], [87300000, 92500000, "q15", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [92500000, 98900000, "q16.1", "gpos100", "rgb(128, 128, 128)", "white"], [98900000, 100000000, "q16.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [100000000, 105000000, "q16.3", "gpos100", "rgb(128, 128, 128)", "white"], [105000000, 114200000, "q21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [114200000, 117900000, "q22.1", "gpos75", "rgb(158, 158, 158)", "white"], [117900000, 118100000, "q22.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [118100000, 125800000, "q22.31", "gpos100", "rgb(128, 128, 128)", "white"], [125800000, 126800000, "q22.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [126800000, 130000000, "q22.33", "gpos75", "rgb(158, 158, 158)", "white"], [130000000, 130900000, "q23.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [130900000, 134700000, "q23.2", "gpos50", "rgb(188, 188, 188)", "white"], [134700000, 138300000, "q23.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [138300000, 142200000, "q24.1", "gpos75", "rgb(158, 158, 158)", "white"], [142200000, 145100000, "q24.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [145100000, 148500000, "q24.3", "gpos75", "rgb(158, 158, 158)", "white"], [148500000, 152100000, "q25.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [152100000, 155200000, "q25.2", "gpos50", "rgb(188, 188, 188)", "white"], [155200000, 160600000, "q25.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [160600000, 164100000, "q26", "gpos50", "rgb(188, 188, 188)", "white"], [164100000, 170805979, "q27", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr7": [[0, 2800000, "p22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [2800000, 4500000, "p22.2", "gpos25", "rgb(218, 218, 218)", "white"], [4500000, 7200000, "p22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [7200000, 13700000, "p21.3", "gpos100", "rgb(128, 128, 128)", "white"], [13700000, 16500000, "p21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [16500000, 20900000, "p21.1", "gpos100", "rgb(128, 128, 128)", "white"], [20900000, 25500000, "p15.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [25500000, 27900000, "p15.2", "gpos50", "rgb(188, 188, 188)", "white"], [27900000, 28800000, "p15.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [28800000, 34900000, "p14.3", "gpos75", "rgb(158, 158, 158)", "white"], [34900000, 37100000, "p14.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [37100000, 43300000, "p14.1", "gpos75", "rgb(158, 158, 158)", "white"], [43300000, 45400000, "p13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [45400000, 49000000, "p12.3", "gpos75", "rgb(158, 158, 158)", "white"], [49000000, 50500000, "p12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [50500000, 53900000, "p12.1", "gpos75", "rgb(158, 158, 158)", "white"], [53900000, 58100000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [58100000, 60100000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [60100000, 62100000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [62100000, 67500000, "q11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [67500000, 72700000, "q11.22", "gpos50", "rgb(188, 188, 188)", "white"], [72700000, 77900000, "q11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [77900000, 86700000, "q21.11", "gpos100", "rgb(128, 128, 128)", "white"], [86700000, 88500000, "q21.12", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [88500000, 91500000, "q21.13", "gpos75", "rgb(158, 158, 158)", "white"], [91500000, 93300000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [93300000, 98400000, "q21.3", "gpos75", "rgb(158, 158, 158)", "white"], [98400000, 104200000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [104200000, 104900000, "q22.2", "gpos50", "rgb(188, 188, 188)", "white"], [104900000, 107800000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [107800000, 115000000, "q31.1", "gpos75", "rgb(158, 158, 158)", "white"], [115000000, 117700000, "q31.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [117700000, 121400000, "q31.31", "gpos75", "rgb(158, 158, 158)", "white"], [121400000, 124100000, "q31.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [124100000, 127500000, "q31.33", "gpos75", "rgb(158, 158, 158)", "white"], [127500000, 129600000, "q32.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [129600000, 130800000, "q32.2", "gpos25", "rgb(218, 218, 218)", "white"], [130800000, 132900000, "q32.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [132900000, 138500000, "q33", "gpos50", "rgb(188, 188, 188)", "white"], [138500000, 143400000, "q34", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [143400000, 148200000, "q35", "gpos75", "rgb(158, 158, 158)", "white"], [148200000, 152800000, "q36.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [152800000, 155200000, "q36.2", "gpos25", "rgb(218, 218, 218)", "white"], [155200000, 159345973, "q36.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr8": [[0, 2300000, "p23.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [2300000, 6300000, "p23.2", "gpos75", "rgb(158, 158, 158)", "white"], [6300000, 12800000, "p23.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [12800000, 19200000, "p22", "gpos100", "rgb(128, 128, 128)", "white"], [19200000, 23500000, "p21.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [23500000, 27500000, "p21.2", "gpos50", "rgb(188, 188, 188)", "white"], [27500000, 29000000, "p21.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [29000000, 36700000, "p12", "gpos75", "rgb(158, 158, 158)", "white"], [36700000, 38500000, "p11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [38500000, 39900000, "p11.22", "gpos25", "rgb(218, 218, 218)", "white"], [39900000, 43200000, "p11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [43200000, 45200000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [45200000, 47200000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [47200000, 51300000, "q11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [51300000, 51700000, "q11.22", "gpos75", "rgb(158, 158, 158)", "white"], [51700000, 54600000, "q11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [54600000, 60600000, "q12.1", "gpos50", "rgb(188, 188, 188)", "white"], [60600000, 61300000, "q12.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [61300000, 65100000, "q12.3", "gpos50", "rgb(188, 188, 188)", "white"], [65100000, 67100000, "q13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [67100000, 69600000, "q13.2", "gpos50", "rgb(188, 188, 188)", "white"], [69600000, 72000000, "q13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [72000000, 74600000, "q21.11", "gpos100", "rgb(128, 128, 128)", "white"], [74600000, 74700000, "q21.12", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [74700000, 83500000, "q21.13", "gpos75", "rgb(158, 158, 158)", "white"], [83500000, 85900000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [85900000, 92300000, "q21.3", "gpos100", "rgb(128, 128, 128)", "white"], [92300000, 97900000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [97900000, 100500000, "q22.2", "gpos25", "rgb(218, 218, 218)", "white"], [100500000, 105100000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [105100000, 109500000, "q23.1", "gpos75", "rgb(158, 158, 158)", "white"], [109500000, 111100000, "q23.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [111100000, 116700000, "q23.3", "gpos100", "rgb(128, 128, 128)", "white"], [116700000, 118300000, "q24.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [118300000, 121500000, "q24.12", "gpos50", "rgb(188, 188, 188)", "white"], [121500000, 126300000, "q24.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [126300000, 130400000, "q24.21", "gpos50", "rgb(188, 188, 188)", "white"], [130400000, 135400000, "q24.22", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [135400000, 138900000, "q24.23", "gpos75", "rgb(158, 158, 158)", "white"], [138900000, 145138636, "q24.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chr9": [[0, 2200000, "p24.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [2200000, 4600000, "p24.2", "gpos25", "rgb(218, 218, 218)", "white"], [4600000, 9000000, "p24.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [9000000, 14200000, "p23", "gpos75", "rgb(158, 158, 158)", "white"], [14200000, 16600000, "p22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [16600000, 18500000, "p22.2", "gpos25", "rgb(218, 218, 218)", "white"], [18500000, 19900000, "p22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [19900000, 25600000, "p21.3", "gpos100", "rgb(128, 128, 128)", "white"], [25600000, 28000000, "p21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [28000000, 33200000, "p21.1", "gpos100", "rgb(128, 128, 128)", "white"], [33200000, 36300000, "p13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [36300000, 37900000, "p13.2", "gpos25", "rgb(218, 218, 218)", "white"], [37900000, 39000000, "p13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [39000000, 40000000, "p12", "gpos50", "rgb(188, 188, 188)", "white"], [40000000, 42200000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [42200000, 43000000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [43000000, 45500000, "q11", "acen", "rgb(131, 68, 56)", "white"], [45500000, 61500000, "q12", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [61500000, 65000000, "q13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [65000000, 69300000, "q21.11", "gpos25", "rgb(218, 218, 218)", "white"], [69300000, 71300000, "q21.12", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [71300000, 76600000, "q21.13", "gpos50", "rgb(188, 188, 188)", "white"], [76600000, 78500000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [78500000, 81500000, "q21.31", "gpos50", "rgb(188, 188, 188)", "white"], [81500000, 84300000, "q21.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [84300000, 87800000, "q21.33", "gpos50", "rgb(188, 188, 188)", "white"], [87800000, 89200000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [89200000, 91200000, "q22.2", "gpos25", "rgb(218, 218, 218)", "white"], [91200000, 93900000, "q22.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [93900000, 96500000, "q22.32", "gpos25", "rgb(218, 218, 218)", "white"], [96500000, 99800000, "q22.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [99800000, 105400000, "q31.1", "gpos100", "rgb(128, 128, 128)", "white"], [105400000, 108500000, "q31.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [108500000, 112100000, "q31.3", "gpos25", "rgb(218, 218, 218)", "white"], [112100000, 114900000, "q32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [114900000, 119800000, "q33.1", "gpos75", "rgb(158, 158, 158)", "white"], [119800000, 123100000, "q33.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [123100000, 127500000, "q33.3", "gpos25", "rgb(218, 218, 218)", "white"], [127500000, 130600000, "q34.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [130600000, 131100000, "q34.12", "gpos25", "rgb(218, 218, 218)", "white"], [131100000, 133100000, "q34.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [133100000, 134500000, "q34.2", "gpos25", "rgb(218, 218, 218)", "white"], [134500000, 138394717, "q34.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chrX": [[0, 4400000, "p22.33", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [4400000, 6100000, "p22.32", "gpos50", "rgb(188, 188, 188)", "white"], [6100000, 9600000, "p22.31", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [9600000, 17400000, "p22.2", "gpos50", "rgb(188, 188, 188)", "white"], [17400000, 19200000, "p22.13", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [19200000, 21900000, "p22.12", "gpos50", "rgb(188, 188, 188)", "white"], [21900000, 24900000, "p22.11", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [24900000, 29300000, "p21.3", "gpos100", "rgb(128, 128, 128)", "white"], [29300000, 31500000, "p21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [31500000, 37800000, "p21.1", "gpos100", "rgb(128, 128, 128)", "white"], [37800000, 42500000, "p11.4", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [42500000, 47600000, "p11.3", "gpos75", "rgb(158, 158, 158)", "white"], [47600000, 50100000, "p11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [50100000, 54800000, "p11.22", "gpos25", "rgb(218, 218, 218)", "white"], [54800000, 58100000, "p11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [58100000, 61000000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [61000000, 63800000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [63800000, 65400000, "q11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [65400000, 68500000, "q12", "gpos50", "rgb(188, 188, 188)", "white"], [68500000, 73000000, "q13.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [73000000, 74700000, "q13.2", "gpos50", "rgb(188, 188, 188)", "white"], [74700000, 76800000, "q13.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [76800000, 85400000, "q21.1", "gpos100", "rgb(128, 128, 128)", "white"], [85400000, 87000000, "q21.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [87000000, 92700000, "q21.31", "gpos100", "rgb(128, 128, 128)", "white"], [92700000, 94300000, "q21.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [94300000, 99100000, "q21.33", "gpos75", "rgb(158, 158, 158)", "white"], [99100000, 103300000, "q22.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [103300000, 104500000, "q22.2", "gpos50", "rgb(188, 188, 188)", "white"], [104500000, 109400000, "q22.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [109400000, 117400000, "q23", "gpos75", "rgb(158, 158, 158)", "white"], [117400000, 121800000, "q24", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [121800000, 129500000, "q25", "gpos100", "rgb(128, 128, 128)", "white"], [129500000, 131300000, "q26.1", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [131300000, 134500000, "q26.2", "gpos25", "rgb(218, 218, 218)", "white"], [134500000, 138900000, "q26.3", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [138900000, 141200000, "q27.1", "gpos75", "rgb(158, 158, 158)", "white"], [141200000, 143000000, "q27.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [143000000, 148000000, "q27.3", "gpos100", "rgb(128, 128, 128)", "white"], [148000000, 156040895, "q28", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]], "chrY": [[0, 300000, "p11.32", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [300000, 600000, "p11.31", "gpos50", "rgb(188, 188, 188)", "white"], [600000, 10300000, "p11.2", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [10300000, 10400000, "p11.1", "acen", "rgb(131, 68, 56)", "white"], [10400000, 10600000, "q11.1", "acen", "rgb(131, 68, 56)", "white"], [10600000, 12400000, "q11.21", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [12400000, 17100000, "q11.221", "gpos50", "rgb(188, 188, 188)", "white"], [17100000, 19600000, "q11.222", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [19600000, 23800000, "q11.223", "gpos50", "rgb(188, 188, 188)", "white"], [23800000, 26600000, "q11.23", "gneg", "rgb(255, 255, 255)", "rgb(158, 158, 158)"], [26600000, 57227415, "q12", "gvar", "rgb(255, 255, 255)", "rgb(158, 158, 158)"]]};
    let chrLength = cytoBandData[chromosome][cytoBandData[chromosome].length-1][1]

    const chartRender = (svg) => {

        const scaleXPercentage = (x) => {return x.toString() + "%"}

        let cytoBandText = [];
        for (let tmp of cytoBandData[chromosome]){
            if ( (tmp[1]-tmp[0])/chrLength > 0.04 ){
                cytoBandText.push({"x":((tmp[0]+tmp[0])/2/chrLength*100+1).toString()+"%","fill":tmp[5], "t":tmp[2]})
            }
        }


        svg.selectAll('*').remove();
        svg.append("g").attr("class", "cytoBand")
        svg.append("g").attr("class", "plot-area")
        svg.append("g").attr("class", "test")
        svg.append("g").attr("class", "localRuler")


        svg.select(".cytoBand")
            .selectAll(".rect")
            .data(cytoBandData[chromosome])
            .join("rect")
            .attr("x", (d) => (d[0]/chrLength*100).toString()+"%")
            .attr("y", "30%")
            .attr("width", (d) => ((d[1]-d[0])/chrLength*100).toString()+"%")
            .attr("height", "50%")
            .attr("fill", (d) => d[4])
            .attr("stroke", "lightgrey")
        svg.select(".cytoBand")
            .selectAll(".text")
            .data(cytoBandText)
            .join("text")
            .attr("x", (d) => (d.x))
            .attr("y", "92.5%")
            .attr("font-size","8px")
            .attr("text-anchor","start")
            .style("fill", (d) => (d.fill))
            .text((d) => (d["t"]))

        const zoomLines = [];
        zoomLines.push({"x1":"0%", "y1":"0%", "x2":(chrMin/chrLength*100).toString()+"%", "y2":"15%"})
        zoomLines.push({"x1":"100%", "y1":"0%", "x2":(chrMax/chrLength*100).toString()+"%", "y2":"15%"})
        zoomLines.push({"x1":(chrMin/chrLength*100).toString()+"%", "y1":"100%", "x2":(chrMin/chrLength*100).toString()+"%", "y2":"15%"})
        zoomLines.push({"x1":(chrMax/chrLength*100).toString()+"%", "y1":"100%", "x2":(chrMax/chrLength*100).toString()+"%", "y2":"15%"})

        svg.select(".localRuler")
            .selectAll(".line")
            .data(zoomLines)
            .join("line")
            .attr("x1", (d) => d.x1)
            .attr("y1", (d) => d.y1)
            .attr("x2", (d) => d.x2)
            .attr("y2", (d) => d.y2)
            .style("stroke", "green")
    }

    const ref = useD3(
        chartRender,
        [searchResultFiltered, chromosome, chrMin, chrMax]
    );

    return <>
        <div style={{width: "100%", height: "50px"}}>
            <svg ref={ref} style={{width: "100%", height: "100%", marginRight: "0px", marginLeft: "0px"}} ></svg>
        </div>
        <GenomeBrowserRuler
            svgHeight={"30px"}

            tickNum={10}

            RulerStart={0}
            RulerEnd={chrLength}

            highlightRegionStart={positionStart}
            highlightRegionEnd={positionEnd}
        />
    </>
}




export default function GenomeBrowserTest(){
    // chr7:27053397-27373765

    let chromosome = "chr7"

    let start = 27100000
    let end   = 27260000

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

                verticalGeneNumLimit={10}

                chromosome={chromosome}
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
            <ChromosomeCytoBand
                chromosome={chromosome}
                positionStart={start}
                positionEnd={end}
                svgHeight={"80px"}
            ></ChromosomeCytoBand>

        </div>

    </>
}




