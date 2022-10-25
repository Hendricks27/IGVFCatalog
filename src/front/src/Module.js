
import ReactDOM from 'react-dom';
import * as V from 'victory';
import { VictoryBar, VictoryScatter, VictoryChart, VictoryAxis, VictoryTheme, VictoryGroup } from 'victory';

import {
    LineChart,
    Line,
    Brush,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer,
    Label,
    getIntroOfPage
} from 'recharts';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import React, {useContext, useEffect, useState, useReducer} from "react";
import {geneNameSearchURLConstructor, GoToEpiBrowserURLConstructor, UCSCClinvarURLConstructor, pseudoVariationResult, searchColorScheme} from "./API";

import loader from "./images/loader.gif"
import {tab} from "@testing-library/user-event/dist/tab";



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



function VariationSearchResultLollipopPlaceHolder(props){
    return <div>
        <br />
        <span>Pretend to be Lollipop</span>
        <br /><br />
    </div>
}



function VariationSearchResultLollipopInDev(props){

    const genomeAssembly = props.genomeAssembly;
    const searchResult = props.searchResult;

    const dataSourceFilter = props.dataSourceFilter;
    const variationTypeFilter = props.variationTypeFilter;

    let searchResultFiltered = [];

    let chrMin = 10000000000000000000000000000, chrMax = 0
    for (let r of searchResult){
        chrMin = Math.min(chrMin, parseInt(r.startPos), parseInt(r.endPos));
        chrMax = Math.max(chrMax, parseInt(r.startPos), parseInt(r.endPos));
    }
    console.log(chrMin, chrMax)
    for (let r of searchResult){

        if (!dataSourceFilter[r.source]){
            continue
        }
        if (!variationTypeFilter[r.variantType]){
            continue
        }


        let xcoord = (r.startPos+r.endPos)/2;
        let height = 0;

        if (r.source == "dbSNP"){height=1}
        else if (r.source == "ClinVar"){height=2}
        else if (r.source == "GnomAD"){height=3}
        else {height = 4}

        let d0 = {
            x: (r.startPos+r.endPos)/2,
            y: height,
            size: Math.max(r.endPos - r.startPos, 2),
            fill: searchColorScheme[r.variantType],
            opacity: 1,
            // label: "123",
        };
        searchResultFiltered.push(d0);
    }

    if (searchResultFiltered.length == 0){
        searchResultFiltered = [{x:0, y:0}]
    }


    return <div>
        <VictoryScatter
            data={searchResultFiltered}
            style={{
                data: {
                    fill: ({ datum }) => datum.fill,
                    opacity: ({ datum }) => datum.opacity
                }
            }}
        />
    </div>
}

function VariationSearchResultLollipopInDev2(props){

    const genomeAssembly = props.genomeAssembly;
    const searchResult = props.searchResult;

    const dataSourceFilter = props.dataSourceFilter;
    const variationTypeFilter = props.variationTypeFilter;

    let searchResultFiltered = [];

    let chrMin = 10000000000000000000000000000, chrMax = 0
    for (let r of searchResult){
        chrMin = Math.min(chrMin, parseInt(r.startPos), parseInt(r.endPos));
        chrMax = Math.max(chrMax, parseInt(r.startPos), parseInt(r.endPos));
    }
    console.log(chrMin, chrMax)
    for (let r of searchResult){

        if (!dataSourceFilter[r.source]){
            continue
        }
        if (!variationTypeFilter[r.variantType]){
            continue
        }

        let xcoord = (r.startPos+r.endPos)/2;
        let height = 0;

        if (r.source == "dbSNP"){height=1}
        else if (r.source == "ClinVar"){height=2}
        else if (r.source == "GnomAD"){height=3}
        else {height = 4}


        if (r.variantType == "SNV"){height-=0.15}
        if (r.variantType == "SNP"){height-=0.15*2}
        if (r.variantType == "insertion"){height-=0.15*3}
        if (r.variantType == "deletion"){height-=0.15*4}
        // if (r.variantType == "other"){height+=0.15*5}


        let d0 = {
            x: (r.startPos+r.endPos)/2,
            y: height,
            z: (r.endPos - r.startPos),
            variantType: r.variantType,
            range: Math.max(r.endPos - r.startPos, 2),
            fill: searchColorScheme[r.variantType],
            opacity: 1,
            label: "123",
        };
        searchResultFiltered.push(d0);
    }

    if (searchResultFiltered.length == 0){
        searchResultFiltered = [{x:0, y:0}]
    }


    // <p className="label">{`Location : ${payload[0].value}`}</p>
    // <p className="label">{`Type : ${payload[2].value}`}</p>
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p>Some Random Description About this variation. hhhhh ... mmmm ...</p>
                </div>
            );
        }

        return null;
    };


    return (
        <ResponsiveContainer width='95%' aspect={2} style={{margin: "auto"}}>
        <ScatterChart
            margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            }}
            data={searchResultFiltered}

            onClick={(e) => {window.open(GoToEpiBrowserURLConstructor(genomeAssembly, "chr3", parseInt(e.xValue)-100, parseInt(e.xValue)+100), "_blank") }}
        >
            <XAxis type="number" dataKey="x" domain={[chrMin, chrMax]} ></XAxis>
            <YAxis type="number" dataKey="y" domain={[0, 3]} >
                <Label angle={-90} value='Data Source' position='insideLeft' style={{textAnchor: 'middle'}} />
            </YAxis>
            <ZAxis dataKey="z" range={[60, 400]} ></ZAxis>

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={searchResultFiltered} isAnimationActive={false}/>
        </ScatterChart>
        </ResponsiveContainer>
    )
}

// const VariationSearchResultLollipop = VariationSearchResultLollipopPlaceHolder;
const VariationSearchResultLollipop = VariationSearchResultLollipopInDev2;




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
        <table style={{width: "100%"}}>
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
            <tbody>
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

                return <tr style={{backgroundColor: searchColorScheme[r.variantType], opacity: 0.5}}>
                    <td onClick={() => {
                        const gotourl = GoToEpiBrowserURLConstructor(genomeAssembly, r.chr, startpos, endpos);
                        window.open(gotourl, "_blank");
                    }
                    }>{pos}</td>
                    <td>{r.variantType}</td>
                    <td>{r.conversion}</td>
                    <td>{r.dbSNPID}</td>
                    <td>{r.description}</td>
                    <td>{r.source}</td>
                </tr>
            }) }
            </tbody>
        </table>
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

const genomeLocationRegex = /chr(\d{1,3}|[xym]):(\d*)-(\d*)/i;
export function LocationSearchResult(props){

    let genomicLocation = props.genomicLocation;
    let genomeAssembly = props.genomeAssembly;

    let searchCount = props.searchCount;

    const [searchResult, setSearchResult] = useState([]);

    const [dataSourceFilter, setDataSourceFilter] = useState({
        "dbSNP": true,
        "ClinVar": true,
        "GnomAD": true,
        "MPRA": true,
        "BRCA1SE": true,
    });
    const [variationTypeFilter, setVariationTypeFilter] = useState({
        "SNV": true,
        "SNP": true,
        "insertion": true,
        "deletion": true,
        "others": true,
    });


    const constructClinvar = function (){

        let locReResult = genomeLocationRegex.exec(genomicLocation);
        // TODO check isNull to prevent invalid result
        // console.log(location, locReResult);

        let chr = "chr"+locReResult[1];
        let start = locReResult[2];
        let end = locReResult[3];

        return UCSCClinvarURLConstructor(genomeAssembly, chr, start, end)
    }


    useEffect(() => {
        fetch(constructClinvar())
            .then(res => res.json())
            .then(
                (result) => {
                    setSearchResult(pseudoVariationResult);
                },
                (error) => {
                }
            )
    }, [searchCount])


    return <>
        <VariationSearchResultFilter
            dataSourceFilter={dataSourceFilter}
            setDataSourceFilter={setDataSourceFilter}
            variationTypeFilter={variationTypeFilter}
            setVariationTypeFilter={setVariationTypeFilter}
        />
        <VariationSearchResultLollipop
            genomeAssembly={genomeAssembly}
            searchResult={searchResult}
            dataSourceFilter={dataSourceFilter}
            variationTypeFilter={variationTypeFilter}
        />
        <VariationSearchResultTable
            genomeAssembly={genomeAssembly}
            searchResult={searchResult}
            dataSourceFilter={dataSourceFilter}
            variationTypeFilter={variationTypeFilter}
        />
    </>

}



