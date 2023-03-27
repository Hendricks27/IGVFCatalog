
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
    AWSLambdaFunctionBase64StringToArray
} from "./API";

import loader from "./images/loader.gif"
import {useD3} from "./D3Test";

import findOptimalTick from "./MyRandomTools";
import {LoadingContainer} from "./ReusableElements";


import ThousandGenomeLogo from "./images/1000GenomesLogo.jpeg";
import FavorLogo from "./images/FavorLogo.png";
import GenomeBrowserTest, {GenomeBrowserRefGene, GenomeBrowserRuler, ChromosomeCytoBand} from "./GenomeBrowser";


export function Empty(props){
    return <></>
}

function AvailableDataset(props) {

    let availableDatasetByGenomeAssembly = props.availableDatasetByGenomeAssembly;
    let setAvailableDatasetByGenomeAssembly = props.setAvailableDatasetByGenomeAssembly;

    let genomeAssembly = props.genomeAssembly;
    let setGenomeAssembly = props.setGenomeAssembly;

    let selectedDataset = props.selectedDataset;
    let setSelectedDataset = props.setSelectedDataset;

    return (
        <table>
            <thead>
                <tr><td></td><td>Dataset Name</td></tr>
            </thead>
            <tbody>
            {availableDatasetByGenomeAssembly[genomeAssembly] === undefined ? <></> : availableDatasetByGenomeAssembly[genomeAssembly].map( (dataset) => {
                // TODO defaultChecked={true}
                return <tr><td><input type={"checkbox"} value={dataset} onChange={ (e) => {
                    let d = selectedDataset;
                    // TODO select no dataset by default
                    availableDatasetByGenomeAssembly[genomeAssembly].map( (dataset) => {
                        Object.keys(d).includes(dataset) ? void(0) : d[dataset] = false;
                    })
                    d[e.target.value] = e.target.checked;

                    setSelectedDataset(d);
                } } /></td><td>{dataset}</td></tr>
            })}
            </tbody>
        </table>
    )
}


export function GenomeAssemblySelection(props){

    let availableDatasetByGenomeAssembly = props.availableDatasetByGenomeAssembly;
    let setAvailableDatasetByGenomeAssembly = props.setAvailableDatasetByGenomeAssembly;

    let genomeAssembly = props.genomeAssembly;
    let setGenomeAssembly = props.setGenomeAssembly;

    let selectedDataset = props.selectedDataset;
    let setSelectedDataset = props.setSelectedDataset;

    let setDefaultGenome = true;

    useEffect(() => {

        // TODO change this to the real API URL once implemented
        fetch("https://cdn.jsdelivr.net/gh/Hendricks27/Glycan_hierarchical_relationship_viewer/Archive/manualcheck.json")
            .then(res => res.json())
            .then(
                (result) => {
                    let x = {}
                    x["hg19"] = ["Fake X", "Fake Y", "ClinVar (hg19)"];
                    x["hg38"] = ["ClinVar (hg38)", "Fake 1", "Fake 2"];
                    x["chm13"] = ["QWE", "ASD", "ZXC"];

                    // setAvailableDatasetByGenomeAssembly(x);

                    if (genomeAssembly === ""){
                        // setGenomeAssembly("hg38");
                    }
                },
                (error) => {

                }
            )
    }, [genomeAssembly])


    return (
        <div>
            <label>Genome Assembly: </label>
            <select value={genomeAssembly} onChange={ (e) => { setGenomeAssembly(e.target.value) } }>
                { Object.keys(availableDatasetByGenomeAssembly).map( (ga) => {
                    if (ga === genomeAssembly){
                        return <option value={ga} selected>{ga}</option>
                    }
                    return <option value={ga}>{ga}</option>
                } ) }
            </select>
        </div>
    )

}






function VariationSearchResultTable(props){

    const genomeAssembly = props.genomeAssembly;
    const searchResult = props.searchResult;

    const dataSourceFilter = props.dataSourceFilter;
    const variationTypeFilter = props.variationTypeFilter;

    const [tableSortKey, setTableSortKey] = useState(["variantType", 1]);

    let searchResultSorted = searchResult.sort(function (a, b){
        let x =  a[tableSortKey[0]] > b[tableSortKey[0]]
        if (x){
            return 1 * tableSortKey[1]
        }
        return -1 * tableSortKey[1]
    });

    return (<>
        <span>Click position to go to <a href={"http://epigenomegateway.wustl.edu/browser/"}>WashU Epigenome Browser</a></span>
        <table style={{width: "100%"}} >
            <thead>
            <tr>
                <td onClick={() => {
                    let thisKey1 = "startPos"
                    if (tableSortKey[0] === thisKey1){
                        setTableSortKey([thisKey1, tableSortKey[1]*-1])
                    } else{
                        setTableSortKey([thisKey1, 1])
                    }
                    } }>Position</td>
                <td onClick={() => {
                    let thisKey1 = "variantType"
                    if (tableSortKey[0] === thisKey1){
                        setTableSortKey([thisKey1, tableSortKey[1]*-1])
                    } else{
                        setTableSortKey([thisKey1, 1])
                    }
                } }>Variation Type</td>
                <td onClick={() => {
                    let thisKey1 = "conversion"
                    if (tableSortKey[0] === thisKey1){
                        setTableSortKey([thisKey1, tableSortKey[1]*-1])
                    } else{
                        setTableSortKey([thisKey1, 1])
                    }
                } }>Conversion</td>
                <td onClick={() => {
                    let thisKey1 = "dbSNPID"
                    if (tableSortKey[0] === thisKey1){
                        setTableSortKey([thisKey1, tableSortKey[1]*-1])
                    } else{
                        setTableSortKey([thisKey1, 1])
                    }
                } }>dbSNP ID</td>
                <td onClick={() => {
                    let thisKey1 = "description"
                    if (tableSortKey[0] === thisKey1){
                        setTableSortKey([thisKey1, tableSortKey[1]*-1])
                    } else{
                        setTableSortKey([thisKey1, 1])
                    }
                } }>Description</td>
                <td onClick={() => {
                    let thisKey1 = "source"
                    if (tableSortKey[0] === thisKey1){
                        setTableSortKey([thisKey1, tableSortKey[1]*-1])
                    } else{
                        setTableSortKey([thisKey1, 1])
                    }
                } }>Source</td>
            </tr>
            </thead>
            <tbody className={"resultTableBody"}>
            { searchResultSorted.map((r) => {

                if (!dataSourceFilter[r.source]){
                    return
                }

                if (!variationTypeFilter[r.variantType]){
                    return
                }

                let halfrange = 1000;
                let startpos = parseInt(r.startPos) - halfrange;
                let endpos = parseInt(r.endPos) + halfrange;
                if (startpos < 1){
                    startpos = 1
                }

                let span = parseInt(r.endPos) - parseInt(r.startPos) + 1
                let pos = r.chr + ":" + r.startPos.toString() + "(+" + span.toString() + ")"

                return <tr>
                    <td onClick={() => {
                        const gotourl = GoToEpiBrowserURLConstructor(genomeAssembly, r.chr, startpos, endpos);
                        window.open(gotourl, "_blank");
                    }
                    }>{pos}</td>
                    <td><div style={{backgroundColor: searchColorScheme[r.variantType], opacity: 0.5, width: "10px", height: "10px"}}> </div>{r.variantType}</td>
                    <td>{r.conversion}</td>
                    <td>{r.dbSNPID}</td>
                    <td>{r.description}</td>
                    <td>{r.source}</td>
                </tr>
            }) }
            </tbody>
        </table>
        <div style={{"height": "300px"}}></div>
    </>)

}


function VariationSearchResultFilter(props) {

    const dataSourceFilter = props.dataSourceFilter;
    const setDataSourceFilter = props.setDataSourceFilter;

    const variationTypeFilter = props.variationTypeFilter;
    const setVariationTypeFilter = props.setVariationTypeFilter;

    const [ignored, forceUpdate] = useReducer(x => x+1, 0);

    return <>
        <div>
            <span>Data Source: </span>
            {Object.keys(dataSourceFilter).map( (ds) => {
                return <span>
                    <input type={"checkbox"} value={ds} onClick={(e) => {
                        let newdsf = JSON.parse(JSON.stringify(dataSourceFilter));
                        newdsf[e.target.value] = e.target.checked;
                        setDataSourceFilter(newdsf);
                        forceUpdate();
                    }} checked={dataSourceFilter[ds]}
                    />
                    <label>{ds}</label>
                </span>
            })}
        </div>

        <div>
            <span>Variation Type: </span>
            {Object.keys(variationTypeFilter).map( (ds) => {
                return <span  style={{backgroundColor: searchColorScheme[ds]}}>
                    <input type={"checkbox"} value={ds} onClick={(e) => {
                        let newdsf = JSON.parse(JSON.stringify(variationTypeFilter));
                        newdsf[e.target.value] = e.target.checked;
                        setVariationTypeFilter(newdsf);
                        forceUpdate();
                    }} checked={variationTypeFilter[ds]}
                    />
                    <label>{ds}</label>
                </span>
            })}
        </div>
    </>

}


function LineGraph(props){
    let data = props.data;

    data = [
        [0, 0],
        [100, 100],
    ];

    const chartRender = (svg) => {
        const height = 100;
        const width = 100;
        const margin = { top: 10, right: 5, bottom: 10, left:5 };

        const scaleX = d3.scaleLinear()
            .domain([0, 5])
            .rangeRound([margin.left, width - margin.right])
        const scaleY = d3.scaleLinear()
            .domain([0, 5])
            .rangeRound([height - margin.bottom, margin.top]);
        const scaleXPercentage = (x) => {return x.toString() + "%"}



        svg.selectAll('*').remove();
        svg.append("g").attr("class", "plot-area")



        svg.select(".plot-area")
            .selectAll(".rect")
            .data(data)
            .join("rect")
            .attr("x",      (d) => d[0])
            .attr("y",      (d) => d[1])
            .attr("width",  (d) => "10px")
            .attr("height", (d) => "10px")
            .attr("fill", (d) => "blue")


    }

    const ref = useD3(
        chartRender,
        [data]
    );

    return (
        <div style={{width: "100%", height: "600px"}}>
            <svg ref={ref} style={{width: "100%", height: "100%", marginRight: "0px", marginLeft: "0px"}} >
            </svg>
        </div>
    )
}




function OneThousandGenomeGraphs(props){
    const d = props.data;

    const narrowStart = props.narrowStart;
    const narrowEnd = props.narrowEnd;

    let template = {
        x: [],
        y: [],
        type: "bar",
        name: 'other',
    };

    let graphdata = {};
    let graphKeys = ["method", "EFFECT", "FEATURE", "IMPACT", "GENE"];
    let methods = ["clinical", "coding", "coding_rare"];
    for (let k of graphKeys){
        graphdata[k] = [];
        for (let m of methods){
            let tmp = JSON.parse(JSON.stringify(template));
            tmp.name = m;
            graphdata[k].push(tmp)
        }
    }


    let xmin = 10000000000000000000000 ;
    let xmax = 0 ;

    for (let d0 of d){
        let p = d0.POS;

        if (p < narrowStart){
            continue
        }
        if (p > narrowEnd){
            continue
        }
        xmin = Math.min(p, xmin)
        xmax = Math.max(p, xmax)

        for (let k of graphKeys){
            let e = d0[k];
            let method = d0["method"];
            let methodi = methods.indexOf(method);
            if (!graphdata[k][methodi].x.includes(e)){
                graphdata[k][methodi].x.push(e)
                graphdata[k][methodi].y.push(0)
            }
            graphdata[k][methodi].y[graphdata[k][methodi].x.indexOf(e)] += 1
        }
    }

    const emptyJSX = <>
        <span>Nothing found</span>
    </>
    const plotsJSX = <>
        <Plot
            data={graphdata["method"]}
            useResizeHandler
            layout={ {responsive: true, autosize: true, title: 'Method', barmode: 'stack'} }
        />

        <Plot
            data={graphdata["EFFECT"]}
            useResizeHandler
            layout={ {responsive: true, autosize: true, title: 'Effect', barmode: 'stack'} }
        />

        <Plot
            data={graphdata["FEATURE"]}
            useResizeHandler
            layout={ {responsive: true, autosize: true, title: 'Feature', barmode: 'stack'} }
        />

        <Plot
            data={graphdata["IMPACT"]}
            useResizeHandler
            layout={ {responsive: true, autosize: true, title: 'Impact', barmode: 'stack'} }
        />

        <Plot
            data={graphdata["GENE"]}
            useResizeHandler
            layout={ {responsive: true, autosize: true, title: 'Gene', barmode: 'stack'} }
        />
    </>


    return (
        <div style={{width: "100%"}}>
            <h3>1000 Genomes Stat</h3>
            <img src={ThousandGenomeLogo} width={"200px"}/>
            <br></br>

            {
                d.length === 0 ? emptyJSX : plotsJSX
            }

        </div>
    )
}



function FavorGraphs(props){
    const d = props.data;

    const narrowStart = props.narrowStart;
    const narrowEnd = props.narrowEnd;

    let columns = [];

    let template = {
        x: [],
        type: "histogram",
        name: 'other',
    };

    const isCategorical = function (dataArray) {
        let count = [];
        for (let d of dataArray){
            if (d === undefined){
                continue
            }
            if (d === null){
                continue
            }

            if (!count.includes(d)){
                count.push(d)
            }

            if (count.length > 10){
                return false
            }

        }

        return true
    }

    const isNumerical = function (dataArray) {
        for (let d of dataArray){
            if (d === undefined){
                continue
            }
            if (d === null){
                continue
            }

            if (typeof d !== 'number'){
                return false
            }

        }

        return true
    }

    const [oneDimensionGraph, setOneDimensionGraph] = useState(true);
    const [axis1, setAxis1] = useState("");
    const [axis2, setAxis2] = useState("");


    let graphdata = {};
    let graphKeys = ["genecode_comprehensive_category", "linsight", "apc_conservation_v2", "apc_mappability", "cadd_phred"];
    let gccategory = ["intergenic", "upstream", "downstream", "upstream;downstream", "ncRNA_intronic", "ncRNA_exonic", "ncRNA_splicing"];
    for (let k of graphKeys){
        graphdata[k] = [];

        for (let gcc of gccategory){
            let tmp = JSON.parse(JSON.stringify(template));
            tmp.name = gcc;


            if (k === "genecode_comprehensive_category"){
                tmp = {
                    x: [],
                    y: [],
                    type: "bar",
                    name: gcc
                }
            }

            graphdata[k].push(tmp)
        }
    }




    /*
        chromosome	22
        position	10510084

        alt_vcf	"C"
        ref_vcf	"T"

        genecode_comprehensive_category	"intergenic"

        linsight	0.2149255327

        apc_conservation	1.2164893637
        apc_conservation_v2	1.3479426181
        apc_epigenetics	0.0541451147
        apc_epigenetics_active	0.2265586609
        apc_epigenetics_repressed	0.3103094811
        apc_epigenetics_transcription	0.3233638927
        apc_local_nucleotide_diversity	4.2766354969
        apc_local_nucleotide_diversity_v2	15.0339001522
        apc_local_nucleotide_diversity_v3	15.1012229481
        apc_mappability	0.2518803257
        apc_micro_rna	99.4511969671
        apc_mutation_density	14.9276816837
        apc_protein_function_v3	2.9694870303
        apc_proximity_to_coding	0.1365189915
        apc_proximity_to_coding_v2	15.1785531454
        apc_proximity_to_tsstes	0.2950929535
        apc_transcription_factor	3.1427874631
        cadd_phred	7.137

        fathmm_xf	0.4052740488
    * */



    let xmin = 10000000000000000000000 ;
    let xmax = 0 ;

    columns = [];
    for (let d0 of d){
        let p = d0.position;

        if (p < narrowStart){
            continue
        }
        if (p > narrowEnd){
            continue
        }

        xmin = Math.min(p, xmin)
        xmax = Math.max(p, xmax)

        /*
        histone_example1.x.push(d0.linsight)
        histone_example2.x.push(d0.apc_conservation_v2)
        histone_example3.x.push(d0.apc_mappability)
        histone_example4.x.push(d0.cadd_phred)
        */

        for (let k of Object.keys(d0)){
            if (!columns.includes(k)){
                columns.push(k)
            }
        }

        for (let k of graphKeys){
            let e = d0[k];
            let gccat = d0["genecode_comprehensive_category"];
            let gccati = gccategory.indexOf(gccat);

            if (k == "genecode_comprehensive_category"){
                if (!graphdata[k][gccati].x.includes(e)){
                    graphdata[k][gccati].x.push(e)
                    graphdata[k][gccati].y.push(0)

                    // console.log(k, e)
                }
                graphdata[k][gccati].y[graphdata[k][gccati].x.indexOf(e)] += 1

            }
            else {
                graphdata[k][gccati].x.push(e)
            }

        }

    }

    columns = columns.sort()

    const resizePlotWidth = () => {
        let wiw = window.innerWidth;
        let plotColumn = 1
        let plotWidth = 300;
        if (wiw > 1000){
            plotColumn = parseInt((wiw*0.83) / 600) ;
        }

        if (wiw <= 1000){
            plotWidth = (wiw-40) * 0.98
        } else {
            plotWidth = wiw * 0.83 / plotColumn
        }

        console.log("plotwidth: ", plotWidth)
        return plotWidth
    }
    let [plotWidth, setPlotWidth] = useState(resizePlotWidth());
    let lastResize = 0;
    window.addEventListener('resize', (e) => {
        // setPlotWidth(resizePlotWidth())
        lastResize = Date.now();
        setTimeout(() => {
            let now_ts = Date.now();
            if (now_ts - lastResize > 100){
                setPlotWidth(resizePlotWidth())
            }
        }, 200)
    });

    const [customGraphTitle, setCustomGraphTitle] = useState("");
    const [customGraphData, setCustomGraphData] = useState([]);
    const [customGraphData2DType, setCustomGraphData2DType] = useState("scatter");
    const [customGraphLayout, setCustomGraphLayout] = useState({autosize: false, title: customGraphTitle, barmode: 'stack', width: plotWidth});



    useEffect(() => {
        if (oneDimensionGraph){
            setCustomGraphTitle(axis1 + " histogram")
            console.log("1D", customGraphData, customGraphTitle)

            let customGraphData1DTMP = []
            for (let gcc of gccategory) {
                let tmp = JSON.parse(JSON.stringify(template));
                tmp.name = gcc;
                customGraphData1DTMP.push(tmp)
            }

            for (let d0 of d){
                let gccat = d0.genecode_comprehensive_category;
                let gccati = gccategory.indexOf(gccat);

                let e = d0[axis1];
                if (e === undefined || e === null){
                    continue
                }

                customGraphData1DTMP[gccati].x.push(e)
            }


            setCustomGraphData(customGraphData1DTMP);
            setCustomGraphLayout({autosize: false, title: customGraphTitle, barmode: 'stack', width: plotWidth})

        } else {
            setCustomGraphTitle(axis1 + " V " + axis2 + " " + customGraphData2DType)
            console.log("2D", customGraphData, customGraphTitle, customGraphData2DType)

            let customGraphData2DTMP = []
            for (let gcc of gccategory) {
                let tmp = JSON.parse(JSON.stringify(template));
                tmp.y = [];
                tmp.type = "scatter";
                tmp.mode = "markers";
                tmp.name = gcc;
                customGraphData2DTMP.push(tmp)
            }

            for (let d0 of d){
                let gccat = d0.genecode_comprehensive_category;
                let gccati = gccategory.indexOf(gccat);

                let x0 = d0[axis1];
                let y0 = d0[axis2];

                if (x0 === undefined){
                    continue
                }
                if (y0 === undefined){
                    continue
                }

                customGraphData2DTMP[gccati].x.push(x0)
                customGraphData2DTMP[gccati].y.push(y0)
            }


            for (let gccati in customGraphData2DTMP){
                console.log(gccati)
                let x = customGraphData2DTMP[gccati].x;
                let y = customGraphData2DTMP[gccati].y;

                console.log(isCategorical(x), isNumerical(x), x)
                console.log(isCategorical(y), isNumerical(y), y)
            }


            setCustomGraphData(customGraphData2DTMP);
            let layout = {
                scattermode: 'group',
                title: customGraphTitle,
                xaxis: {title: axis1},
                yaxis: {title: axis2},
                autoResize: false,
                width: plotWidth,
            }
            setCustomGraphLayout( layout )
        }
    },
        [oneDimensionGraph, axis1, axis2, customGraphData2DType, plotWidth])


    const emptyJSX = <>
        <span>Nothing found</span>
    </>
    const plotsJSX = <>
        <Plot
            data={graphdata["genecode_comprehensive_category"]}
            useResizeHandler
            layout={ {autosize: false, title: 'Genecode Comprehensive Category', barmode: 'overlay', width: plotWidth, legend: { x:1, y:1, xanchor: 'right', bgcolor: 'rgba(0,0,0,0)'}  } }
        />


        <Plot
            data={graphdata["linsight"]}
            useResizeHandler
            layout={ {autosize: false, title: 'LinSight', barmode: 'stack', width: plotWidth, legend: { x:1, y:1, xanchor: 'right', bgcolor: 'rgba(0,0,0,0)'}} }
        />

        <Plot
            data={graphdata["apc_conservation_v2"]}
            useResizeHandler
            layout={ {autosize: false, title: 'APC Conservation V2', barmode: 'stack', width: plotWidth, legend: { x:1, y:1, xanchor: 'right', bgcolor: 'rgba(0,0,0,0)'}} }
        />

        <Plot
            data={graphdata["apc_mappability"]}
            useResizeHandler
            layout={ {autosize: false, title: 'APC Mappability', barmode: 'stack', width: plotWidth, legend: { x:1, y:1, xanchor: 'right', bgcolor: 'rgba(0,0,0,0)'}} }
        />

        <Plot
            data={graphdata["cadd_phred"]}
            useResizeHandler
            layout={ {autosize: false, title: 'CADD phred', barmode: 'stack', width: plotWidth, legend: { x:1, y:1, xanchor: 'right', bgcolor: 'rgba(0,0,0,0)'}} }
        />
    </>

    let customGraphJSX = <>
        <div>
            <h3>Customized Plot</h3>
            <label>Column Number: </label>
            <select onChange={(e) => {
                if (e.target.value === "1"){
                    setOneDimensionGraph(true)
                } else {
                    setOneDimensionGraph(false)
                }
            }} >
                <option value="1" >1</option>
                <option value="2" >2</option>
            </select>

            <br></br>

            <label>Axis 1: </label>
            <select onChange={(event) => {setAxis1(event.target.value)} }>
                {
                    columns.map((e) => {
                        return <option value={e}>{e}</option>
                    })
                }
            </select>
            <br></br>

            {
                oneDimensionGraph ? <></> : (<>
                    <label>Axis 2: </label>
                    <select  onChange={(event) => {setAxis2(event.target.value)} }>
                        {
                            columns.map((e) => {
                                return <option value={e}>{e}</option>
                            })
                        }
                    </select>
                    <br></br>

                    <label>Graph Type: </label>
                    <select onChange={(event) => {setCustomGraphData2DType(event.target.value)} }>
                        <option value="scatter">Scatter</option>
                        <option value="heatmap">Heatmap</option>
                    </select>

                    <br></br><br></br>
                </>)
            }

            <Plot
                data={customGraphData}
                useResizeHandler
                layout={ customGraphLayout }
            />

        </div>
    </>


    return (
        <div style={{width: "100%"}}>
            <h3>Favor Stat</h3>
            <img src={FavorLogo} width={"200px"}/>
            <br></br>

            {
                d.length === 0 ? emptyJSX : plotsJSX
            }
            <br></br><br></br>
            {
                d.length === 0 ? <div></div> : customGraphJSX
            }

        </div>
    )
}





const genomeLocationRegex = /chr(\d{1,3}|[xymXYM]):(\d*)-(\d*)/i;

function CombinedVariationSearchResultTable(props){

    const narrowStart = props.narrowStart;
    const narrowEnd = props.narrowEnd;

    const [pageNum, setPageNum] = useState(1);
    const [rowPerPage, setRowPerPage] = useState(20);
    let maxPageNum = 1;


    let oneKGenomeData=props.oneKGenomeData;
    let favorData=props.favorData;

    let tableData = [];


    let tmp = 0;
    let posrange = 1000;
    for (let d of oneKGenomeData){

        let tmp1 = "";
        let tmp2 = "";

        tmp1 = d.CHROM + ":";
        if (parseInt(d.POS) > posrange){
            tmp1 += (parseInt(d.POS)-posrange).toString()
        } else {
            tmp1 += "1"
        }
        tmp1 += "-" + (parseInt(d.POS)+posrange).toString()

        tmp2 = "http://epigenomegateway.wustl.edu/browser/?genome=hg38&position=" + tmp1
        let pos = <a href={tmp2} target={"_blank"}>{d.CHROM + ":" + d.POS.toString()}</a>

        let vtype = "X";

        let conversion = "";
        // let conversion = d.REF + "/" + d.ALT;
        tmp1 = [d.REF, " / ", d.ALT]
        conversion = <>
            {tmp1.map((e) => {
                if (e.length > 10){
                    return <span title={e}>{e.slice(0, 10) + "..."}</span>
                } else {
                    return e
                }
            })}
        </>



        let dbsnpid = d.variant_ID;
        let desc = d.EFFECT;
        desc = desc.replaceAll("&", " & ")
        let source = "1000 Genomes"


        if (dbsnpid.startsWith("rs")){
            tmp1 = "./?variantID=" + dbsnpid
            dbsnpid = <a href={tmp1} target={"_blank"}>{dbsnpid}</a>
        }



        tableData.push([pos, vtype, conversion, dbsnpid, desc, source])

        tmp += 1;
        if (tmp < 20){
            // console.log(d);
        }
    }

    for (let d of favorData){
        let tmp1 = "";
        let tmp2 = "";



        tmp1 = "chr" + d.chromosome + ":";
        if (parseInt(d.position) > posrange){
            tmp1 += (parseInt(d.position)-posrange).toString()
        } else {
            tmp1 += "1"
        }
        tmp1 += "-" + (parseInt(d.position)+posrange).toString()

        tmp2 = "http://epigenomegateway.wustl.edu/browser/?genome=hg38&position=" + tmp1
        let pos = <a href={tmp2} target={"_blank"}>{"chr" + d.chromosome + ":" + d.position.toString()}</a>

        let vtype = "X";

        let conversion = "";
        // let conversion = d.REF + "/" + d.ALT;
        tmp1 = [d.ref_vcf, " / ", d.alt_vcf]
        conversion = <>
            {tmp1.map((e) => {
                if (e.length > 10){
                    return <span title={e}>{e.slice(0, 10) + "..."}</span>
                } else {
                    return e
                }
            })}
        </>



        let dbsnpid = ".";
        let desc = d.genecode_comprehensive_info;
        desc = d.genecode_comprehensive_category
        let source = "Favor"


        tableData.push([pos, vtype, conversion, dbsnpid, desc, source])

        tmp += 1;
        if (tmp < 20){
            // console.log(d);
        }
    }


    let sliceStart = (pageNum-1)*rowPerPage;
    let sliceEnd = sliceStart + rowPerPage;
    if (sliceEnd > tableData.length){
        sliceEnd = tableData.length
    }

    let selectedTableData = tableData.slice(sliceStart, sliceEnd);



    maxPageNum = Math.ceil(tableData.length / rowPerPage);

    let prefixTriDot = false;
    let suffixTriDot = false;
    let pageNumbers = [];
    if (maxPageNum <= 5){
        for (let i=1; i<=maxPageNum; i++){
            pageNumbers.push(i)
        }
    }
    else {
        if (pageNum > 3){
            prefixTriDot = true;
        }

        if (maxPageNum - pageNum > 3){
            suffixTriDot = true;
        }

        if (pageNum <= 3){
            for (let i=1; i<=5; i++){
                pageNumbers.push(i)
            }
        }

        else if (maxPageNum - pageNum < 3){
            for (let i=maxPageNum-5; i<=maxPageNum; i++){
                pageNumbers.push(i)
            }
        }

        else {
            for (let i=pageNum-2; i<=pageNum+2; i++){
                pageNumbers.push(i)
            }
        }


    }


    return <>

        <div className={"tableContainerWide"}>
            <table className={"table1"}>
                <caption>Result Table</caption>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Variation Type</th>
                        <th>Conversion</th>
                        <th>dbSNP ID</th>
                        <th>Description</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        selectedTableData.map((row) => {
                            return <tr>{
                                row.map((e) => {
                                    return <td>{e}</td>
                                })
                            }</tr>
                        })
                    }
                </tbody>

            </table>
        </div>

        <ul className={"table1pagebuttons"}>
            <li onClick={() => {setPageNum(1)} }>{"<<"}</li>
            <li onClick={() => pageNum>1 ? setPageNum(pageNum-1) : "" }>{"<"}</li>
            {prefixTriDot ? "...": ""}
            {
                pageNumbers.map((i) => {
                    if (i == pageNum){
                        return <li onClick={() => {setPageNum(i)} }  className={"table1pagebuttonsselected"}>{i}</li>
                    }
                    return <li onClick={() => {setPageNum(i)}} >{i}</li>
                })
            }
            {suffixTriDot ? "...": ""}
            <li onClick={() => pageNum<maxPageNum ? setPageNum(pageNum+1) : ""  } >{">"}</li>
            <li onClick={() => {setPageNum(maxPageNum)} }>{">>"}</li>
        </ul>
    </>
}


function LocationSearchFilterContainer(props){

    const chromosome = props.chromosome;
    const searchStart = parseInt(props.searchStart);
    const searchEnd = parseInt(props.searchEnd);

    const narrowStart = props.narrowStart;
    const narrowEnd = props.narrowEnd;
    const setNarrowStart = props.setNarrowStart;
    const setNarrowEnd = props.setNarrowEnd;

    const dataSourceFilter = props.dataSourceFilter;
    const setDataSourceFilter = props.setDataSourceFilter;


    const [narrowStartTMP, setNarrowStartTMP] = useState(narrowStart);
    const [narrowEndTMP, setNarrowEndTMP] = useState(narrowEnd);


    function SVGRender (svg){
        const height = 100;
        const width = 100;
        const margin = { top: 10, right: 5, bottom: 10, left:5 };

        const scaleX = d3.scaleLinear()
            .domain([searchStart, searchEnd])
            .rangeRound([margin.left, width - margin.right])
        const scaleY = d3.scaleLinear()
            .domain([0, 5])
            .rangeRound([height - margin.bottom, margin.top]);

        svg.selectAll('*').remove();
        svg.append("g").attr("class", "test")
        svg.append("g").attr("class", "localRuler")

        svg.select(".test")
            .selectAll(".line")
            .data([{x1:"0%", x2:"100%", y1:"0%", y2:"100%"}])
            .join("line")
            .attr("x1", (d) => d.x1)
            .attr("y1", (d) => d.y1)
            .attr("x2", (d) => d.x2)
            .attr("y2", (d) => d.y2)
            .style("stroke", "green")

        const chrMinMaxRange = searchEnd - searchStart;
        let localTicks = [];
        const chrLocalUnit = findOptimalTick(chrMinMaxRange, 10);
        const chrLocalSubUnit = chrLocalUnit / 10;

        for (let tmp = 0; searchStart+chrLocalSubUnit*tmp <= searchEnd; tmp++){
            let localTickChrPos = Math.floor(searchStart/chrLocalSubUnit+tmp) * chrLocalSubUnit;
            let tmp2 = {};
            tmp2.x = (chrLocalSubUnit*tmp / chrMinMaxRange * 100).toString() + "%"
            tmp2.y = "90%"
            tmp2.width = "0.1%"
            tmp2.height = "3%"
            tmp2.fill = "lightgrey"
            tmp2.text = ""
            if (localTickChrPos % chrLocalUnit == 0){
                tmp2.y = "88%"
                tmp2.width = "0.1%"
                tmp2.height = "5%"
                tmp2.fill = "black"

                tmp2.text = (localTickChrPos).toString()
                if (chrLocalUnit >= 1000){
                    tmp2.text = (localTickChrPos/1000).toString()+"K"
                }
                if (chrLocalUnit >= 1000*1000){
                    tmp2.text = (localTickChrPos/1000000).toString()+"M"
                }

                //console.log(tmp, chrLocalUnit)
            }
            localTicks.push(tmp2)

        }



        let tmp2 = {};
        tmp2.x = ((narrowStart - searchStart) / chrMinMaxRange * 100).toString() + "%"
        tmp2.y = "88%"
        tmp2.width = ((narrowEnd - narrowStart) / chrMinMaxRange * 100).toString() + "%"
        tmp2.height = "5%"
        tmp2.fill = "green"
        tmp2.opacity = "40%"
        localTicks.unshift(tmp2)

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
            .attr("y", "85.5%")
            .attr("font-size","8px")
            .attr("text-anchor","middle")
            .style("fill", (d) => (d.fill))
            .text((d) => (d.text))

    }

    const ref = useD3(
        SVGRender,
        [searchStart, searchEnd, narrowStart, narrowEnd]
    );

    const dataSourceSelector = <>
        {
            Object.keys(dataSourceFilter).map( (ds) => {
                // console.log(ds, dataSourceFilter[ds])
                return <div><label className="checkboxes_container">{ds}
                    <input
                        type="checkbox"
                        name={ds}
                        checked={dataSourceFilter[ds]}
                        onChange={(e) => {
                            let dsf = JSON.parse(JSON.stringify(dataSourceFilter));
                            dsf[e.target.name] = !dsf[e.target.name];
                            setDataSourceFilter(dsf)
                        } }
                    />
                    <span className="checkbox_checkmark"></span>
                </label></div>
            })
        }
    </>

    return <>
        <h3>Filters</h3>

        <div style={{textAlign: "center"}}>
            {dataSourceSelector}
        </div>

        <span>Total Range: {searchStart}:{searchEnd}</span> <br></br>
        <span>Selected: {narrowStartTMP}:{narrowEndTMP}</span><span>({narrowEndTMP-narrowStartTMP} bp / {Math.round(100*(narrowEndTMP-narrowStartTMP)/(searchEnd-searchStart)) } %)</span>

        <GenomeBrowserRefGene
            svgHeight={"300px"}

            verticalGeneNumLimit={8}

            chromosome={chromosome}
            positionStart={narrowStart}
            positionEnd={narrowEnd}/>
        <GenomeBrowserRuler
            svgHeight={"30px"}

            tickNum={10}

            RulerStart={narrowStart}
            RulerEnd={narrowEnd}
        />
        <div style={{height: "20px"}}>  </div>
        <div>
            <div style={{height: "200px", backgroundColor: "lightgray"}}></div>
        </div>
        <div style={{height: "20px"}}>  </div>
        <GenomeBrowserRefGene
            svgHeight={"300px"}

            verticalGeneNumLimit={8}

            chromosome={chromosome}
            positionStart={searchStart}
            positionEnd={searchEnd}/>


        <div style={{height: "20px"}}>  </div>
        <GenomeBrowserRuler
            svgHeight={"30px"}

            tickNum={10}

            RulerStart={searchStart}
            RulerEnd={searchEnd}

            highlightRegionStart={narrowStart}
            highlightRegionEnd={narrowEnd}
        />

        <RangeSlider
            id="range-slider1"
            min={searchStart}
            max={searchEnd}
            step={1}
            defaultValue={[narrowStart, narrowEnd]}
            onInput={(e) => {
                setNarrowStartTMP(e[0])
                setNarrowEndTMP(e[1])
            }}
            onThumbDragEnd={() => {
                setNarrowStart(narrowStartTMP);
                setNarrowEnd(narrowEndTMP);
            }}
            onRangeDragEnd={() => {
                setNarrowStart(narrowStartTMP);
                setNarrowEnd(narrowEndTMP);
            }}
        />

        <ChromosomeCytoBand
            chromosome={chromosome}
            positionStart={searchStart}
            positionEnd={searchEnd}
        />
    </>
}





export function LocationSearchResultContainer(props){

    let genomicLocation = props.genomicLocation;
    let genomeAssembly = props.genomeAssembly;

    let searchCount = props.searchCount;

    const [oneKGenomeDataLoaded, setOneKGenomeDataLoaded] = useState(false);
    const [favorDataLoaded, setFavorDataLoaded] = useState(false);

    const [searchResult, setSearchResult] = useState([]);
    const [oneKGenomeData, setOneKGenomeData] = useState([]);
    const [favorData, setFavorData] = useState([]);

    const [dataSourceFilter, setDataSourceFilter] = useState({
        "1000Genome": true,
        "Favor": true
    });
    const [variationTypeFilter, setVariationTypeFilter] = useState({
        "SNV": true,
        "SNP": true,
        "insertion": true,
        "deletion": true,
        "other": true,
    });

    let locReResult = genomeLocationRegex.exec(genomicLocation);
    // TODO check isNull to prevent invalid result
    // console.log(genomicLocation, locReResult)
    let chr = "chr"+locReResult[1];
    let start = locReResult[2];
    let end = locReResult[3];


    const [searchChr, setSearchChr] = useState(chr);
    const [searchStart, setSearchStart] = useState(start);
    const [searchEnd, setSearchEnd] = useState(end);

    const [narrowStart, setNarrowStart] = useState(start);
    const [narrowEnd, setNarrowEnd] = useState(end);


    const [lastUpdatedSliderTS, setLastUpdatedSliderTS] = useState(Date.now());
    const [lastUpdatedResultTS, setLastUpdatedResultTS] = useState(Date.now());


    const queryOneKGenomeByRegion = function (){
        let rurl = oneThousandGenomeVariationSearchURLConstructor(chr, start, end);
        axios.get(rurl)
            .then(function (response) {
                setOneKGenomeDataLoaded(true);
                setOneKGenomeData(AWSLambdaFunctionBase64StringToArray(response.data.data))
            })
            .catch(function (error) {
                // console.log(geneName, error);
            });
    }

    const queryFavorByRegion = function (){
        let rurl = favorVariationSearchURLConstructor(chr, start, end);
        axios.get(rurl)
            .then(function (response) {
                setFavorDataLoaded(true);
                setFavorData(AWSLambdaFunctionBase64StringToArray(response.data.data))
            })
            .catch(function (error) {
                // console.log(geneName, error);
            });
    }




    useEffect(() => {
        setOneKGenomeDataLoaded(false);
        setFavorDataLoaded(false);

        queryOneKGenomeByRegion();
        queryFavorByRegion();
    }, [searchCount]);


    let oneKGenomeJSX = <></>;
    if (dataSourceFilter["1000Genome"]){
        oneKGenomeJSX = oneKGenomeDataLoaded ? <OneThousandGenomeGraphs data={oneKGenomeData} narrowStart={narrowStart} narrowEnd={narrowEnd}/> : <><h3>Fetching 1000 Genome</h3><LoadingContainer width={100}/></>
    }



    return <>

        <div className={"contentContainerBorder"}>
            <LocationSearchFilterContainer
                chromosome={chr}
                searchStart={searchStart}
                searchEnd={searchEnd}

                narrowStart={narrowStart}
                narrowEnd={narrowEnd}
                setNarrowStart={setNarrowStart}
                setNarrowEnd={setNarrowEnd}

                dataSourceFilter={dataSourceFilter}
                setDataSourceFilter={setDataSourceFilter}
            />
        </div>

        <div className={"contentContainerBorder tableContainerWide"} >
            <CombinedVariationSearchResultTable oneKGenomeData={oneKGenomeData} favorData={favorData} narrowStart={narrowStart} narrowEnd={narrowEnd}/>
            {
                [oneKGenomeDataLoaded, favorDataLoaded].includes(false) ? <><span>Still Fetching From Other Souces</span><LoadingContainer width={20}/></> : <></>
            }
        </div>


        {
            dataSourceFilter["1000Genome"] ? <div className={"contentContainerBorder"}> { oneKGenomeDataLoaded ? <OneThousandGenomeGraphs data={oneKGenomeData} narrowStart={narrowStart} narrowEnd={narrowEnd}/> : <><h3>Fetching 1000 Genome</h3><LoadingContainer width={100}/></> } </div> : <></>
        }

        {
            dataSourceFilter["Favor"] ? <div className={"contentContainerBorder"}> { favorDataLoaded ? <FavorGraphs data={favorData} narrowStart={narrowStart} narrowEnd={narrowEnd}/> : <><h3>Fetching FAVOR</h3><LoadingContainer width={100}/></> } </div> : <></>
        }



        <br></br><br></br><br></br>


    </>

}






