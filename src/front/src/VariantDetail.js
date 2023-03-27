
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {geneNameSearchURLConstructor} from "./API";
import {tab} from "@testing-library/user-event/dist/tab";

import {LoadingContainer} from "./ReusableElements";


function arrayCount(arrayx, val){
    return arrayx.filter(e => e === val).length;
}

function VariantInput(props){

    const variantID = props.variantID;
    const setVariantID = props.setVariantID;

    const variantDetailCounter = props.variantDetailCounter;
    const setVariantDetailCounter = props.setVariantDetailCounter;

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Variant ID: </label>
                <input type={"text"} value={variantID} onChange={(e) => setVariantID(e.target.value)}></input>
                <br></br><br></br>
                <button className={"button1"} onClick={(e) => {setVariantDetailCounter(variantDetailCounter+1)} }>Update</button>
            </form>
        </div>
    )

}

function VariantTable(props){

    const variantID = props.variantID;
    const variantDetailResult = props.variantDetailResult;

    if (props.showLoading){
        return <LoadingContainer/>
    }

    if (variantDetailResult.length == 0){
        return <div>
            Variant ID {variantID} Not Found
        </div>
    }


    let tables = ["123"];
    let fixedProperty = ["variant_ID", "CHROM", "POS", "REF", "ALT", "ALLELE", "CLNSIG", "IMPACT", "EFFECT", "FEATURE", "GENE", "AR_GENE", "GENEID", "Entrez_gene_id", "MGI_mouse_gene"];


    // Find Common Property if there are multiple entries
    let commonPropertyKV = {};
    for (let eachResult of variantDetailResult){
        for (let key of Object.keys(eachResult)){
            commonPropertyKV[key] = [];
        }
    }
    for (let eachResult of variantDetailResult){
        for (let key of Object.keys(eachResult)){
            commonPropertyKV[key].push(eachResult[key])
        }
    }

    let commonProperty = [];
    let commonPropertySorted = [];
    for (let key of Object.keys(commonPropertyKV)){
        if (commonPropertyKV[key].includes(null)){
            continue
        }
        let wrong = false
        for (let value of commonPropertyKV[key]){
            if (arrayCount(commonPropertyKV[key], value) != variantDetailResult.length) {
                wrong = true;
                break
            }
        }
        if (wrong){
            continue
        }
        commonProperty.push(key)

    }
    commonProperty = commonProperty.sort()
    for (let key of fixedProperty){
        if(commonProperty.includes(key)){
            commonPropertySorted.push(key)
        }
    }
    for (let key of commonProperty){
        if(!commonPropertySorted.includes(key)){
            commonPropertySorted.push(key)
        }
    }


    for (let cleanedResultIndex in variantDetailResult) {
        for (let key of Object.keys(variantDetailResult[cleanedResultIndex])) {
            if (variantDetailResult[cleanedResultIndex][key] == null) {
                delete variantDetailResult[cleanedResultIndex][key]
            }
        }
    }



    if (variantDetailResult.length === 1){
        tables = [];

        let cleanedResult = variantDetailResult[0];
        let sortedProperty = [];

        let allKeys = Object.keys(cleanedResult);
        allKeys = allKeys.sort()

        for (let key of fixedProperty){
            if (allKeys.includes(key)){
                sortedProperty.push(key)
            }
        }
        allKeys = allKeys.filter(function(value, index, arr){
            return !fixedProperty.includes(value)
        })
        sortedProperty = sortedProperty.concat(allKeys)

        let washubrowserurl = ""
        if (cleanedResult["CHROM"] != undefined && cleanedResult["POS"] != undefined){
            let start = parseInt(cleanedResult["POS"]) - 1000
            let end = parseInt(cleanedResult["POS"]) + 1000

            start = start.toString()
            end = end.toString()
            washubrowserurl = "http://epigenomegateway.wustl.edu/browser/?genome=hg38&position="+cleanedResult["CHROM"]+":"+start+"-"+end+""
        }


        let table0 = <table className={"table1"} >
            <caption>Variant</caption>
            <thead><tr><th>Property</th><th>Value</th></tr></thead>
            <tbody>
            {
                sortedProperty.map((k) => {
                    let property = k.toString();
                    let value = cleanedResult[k].toString();


                    if (property == "variant_ID"){
                        value = <a target="_blank" href={"https://www.ncbi.nlm.nih.gov/snp/?term="+value}>{value}</a>
                    }

                    if (property == "POS"){
                        if (washubrowserurl != ""){
                            value = <a target="_blank" href={washubrowserurl}>{value}</a>
                        }
                    }

                    return <tr><td>{property}</td><td>{value}</td></tr>
                })
            }
            </tbody>
        </table>
        tables.push(table0)

    } else {

        for (let cleanedResultIndex in variantDetailResult){
            let cleanedResult = variantDetailResult[cleanedResultIndex];
            cleanedResultIndex = (parseInt(cleanedResultIndex) + 1).toString()
            let sortedProperty = [];

            let allKeys = Object.keys(cleanedResult);
            allKeys = allKeys.sort()

            for (let key of fixedProperty){
                if (allKeys.includes(key) && !commonPropertySorted.includes(key)){
                    sortedProperty.push(key)
                }
            }
            allKeys = allKeys.filter(function(value, index, arr){
                return !fixedProperty.includes(value) && !commonPropertySorted.includes(value)
            })
            sortedProperty = sortedProperty.concat(allKeys)

            let washubrowserurl = ""
            if (cleanedResult["CHROM"] != undefined && cleanedResult["POS"] != undefined){
                let start = parseInt(cleanedResult["POS"]) - 1000
                let end = parseInt(cleanedResult["POS"]) + 1000

                start = start.toString()
                end = end.toString()
                washubrowserurl = "http://epigenomegateway.wustl.edu/browser/?genome=hg38&position="+cleanedResult["CHROM"]+":"+start+"-"+end+""
            }


            let table0 = <table className={"table1"}>
                <caption>COMMON</caption>
                <thead><tr><th>Property</th><th>Value</th></tr></thead>
                <tbody>
                {
                    commonPropertySorted.map((k) => {
                        let property = k.toString();
                        let value = cleanedResult[k].toString();

                        if (property == "variant_ID"){
                            value = <a target="_blank" href={"https://www.ncbi.nlm.nih.gov/snp/?term="+value}>{value}</a>
                        }

                        if (property == "POS"){
                            if (washubrowserurl != ""){
                                value = <a target="_blank" href={washubrowserurl}>{value}</a>
                            }
                        }

                        return <tr><td>{property}</td><td>{value}</td></tr>
                    })
                }
                </tbody>
            </table>


            let table1 = <table className={"table1"}>
                <caption>Variant {cleanedResultIndex}</caption>
                <thead><tr><th>Property</th><th>Value</th></tr></thead>
                <tbody>
                {
                    sortedProperty.map((k) => {
                        let property = k.toString();
                        let value = cleanedResult[k].toString();

                        if (property == "variant_ID"){
                            value = <a target="_blank" href={"https://www.ncbi.nlm.nih.gov/snp/?term="+value}>{value}</a>
                        }

                        if (property == "POS"){
                            if (washubrowserurl != ""){
                                value = <a target="_blank" href={washubrowserurl}>{value}</a>
                            }
                        }

                        return <tr><td>{property}</td><td>{value}</td></tr>
                    })
                }
                </tbody>
            </table>

            tables[0] = table0;
            tables.push(table1)
        }


    }


    return <div className={"tableContainerWide"}>
        { tables.map((t) => <div>{t}<br></br><br></br></div>) }
        <br></br><br></br><br></br><br></br>
    </div>

}

function VariantTableContainer(props){

    const variantID = props.variantID;
    const setVariantID = props.setVariantID;

    const variantDetailCounter = props.variantDetailCounter;
    const setVariantDetailCounter = props.setVariantDetailCounter;

    const showLoading = props.showLoading;
    const setShowLoading = props.setShowLoading;

    const [variantDetailResult, setVariantDetailResult] = useState([]);

    let searchurl = "https://8z6tnsj4te.execute-api.us-east-2.amazonaws.com/dev/1000genome/variantsearch/" + variantID;

    const queryVariantByID = function (){
        setShowLoading(true)
        axios.get(searchurl)
            .then(function (response) {
                setVariantDetailResult(response.data)
                setShowLoading(false)
            })
            .catch(function (error) {
                // console.log(geneName, error);
            });

    }

    useEffect(() => {
        queryVariantByID();
    }, [variantDetailCounter]);

    return <VariantTable
        variantDetailResult={variantDetailResult}
        variantID={variantID}
        showLoading={showLoading}
    />

}


function VariantdbSNPTableContainer(props){

    const variantID = props.variantID;
    const setVariantID = props.setVariantID;

    const variantDetailCounter = props.variantDetailCounter;
    const setVariantDetailCounter = props.setVariantDetailCounter;

    const [variantdbSNPDetailResult, setVariantdbSNPDetailResult] = useState([]);

    let searchurl = "https://epigenome.wustl.edu/cors/https://api.ncbi.nlm.nih.gov/variation/v0/refsnp/" + variantID.slice(2);

    const queryVariantByID = function (){

        axios.get(searchurl)
            .then(function (response) {
                setVariantdbSNPDetailResult(response.data)
                // console.log(response.data)
            })
            .catch(function (error) {
                // console.log(geneName, error);
            });

    }

    useEffect(() => {
        queryVariantByID();
    }, [variantDetailCounter]);

    return <></>

}



export default function VariantDetail(props){

    const urlParams = props.urlParams;
    let variantIDtmp = "rs78196225";
    if (urlParams.get('variantID') != null){
        variantIDtmp = urlParams.get('variantID')
    }

    const [variantID, setVariantID] = useState(variantIDtmp);
    const [variantDetailCounter, setVariantDetailCounter] = useState(0);
    const [showLoading, setShowLoading] = useState(false);

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?variantID=" + variantID
    )

    return <div className={"contentContainerBorder"}>
        <VariantInput
            variantID={variantID}
            setVariantID={setVariantID}
            variantDetailCounter={variantDetailCounter}
            setVariantDetailCounter={setVariantDetailCounter}
        />
        <br></br><br></br><br></br>
        <VariantdbSNPTableContainer
            variantID={variantID}
            setVariantID={setVariantID}
            variantDetailCounter={variantDetailCounter}
            setVariantDetailCounter={setVariantDetailCounter}
        />
        <VariantTableContainer
            variantID={variantID}
            setVariantID={setVariantID}
            variantDetailCounter={variantDetailCounter}
            setVariantDetailCounter={setVariantDetailCounter}
            showLoading={showLoading}
            setShowLoading={setShowLoading}
        />
    </div>
}



