
import axios from "axios";
import React, { useState, useContext, useEffect } from 'react';
import * as pako from "pako";
import {raw} from "plotly.js/src/components/dragelement/unhover";




export function BaseSchema() {

    this.name = "NoName";
    this.BaseURL = "https://www.fake.com/api?";
    // this.b64Encoded = false;
    this.AWSLambdaFunctionSource = false;

    /*
    * Sample Schema:
    * chr: string
    * start_pos: number
    * */

    /*
    * Sample Plot 1:
    * dimension: 1
    * type: "bar";
    * x: gene name
    * legend: some category
    *
    * Sample Plot 2:
    * dimension: 2
    * type: "Scatter"
    * x: gene name
    * y: some score
    * legend: some category
    *
    * */
    this.Schema = {};
    this.Plots = [];









    this.log = function () {
        let msg = "BaseSchema: " + this.BaseURL + "\n";
        msg += " URLParams: " + JSON.stringify(this.URLParams) + "\n";
        msg += " AWSLambdaFunctionSource: " + this.AWSLambdaFunctionSource + "\n";
        console.log(msg);
    }

    this.CleanUpParams = function (URLParams) {
        return URLParams;
    }

    this.RequestURL = function(URLParams) {

        let query = "";
        if ( !this.BaseURL.endsWith("?") ) {
            query += "?";
        }

        let CleanedURLParams = this.CleanUpParams(URLParams);
        let keys = Object.keys(CleanedURLParams);
        for (let ki = 0; ki < keys.length; ki++) {
            let key = keys[ki];
            query += key.toString() + "=" + CleanedURLParams[key].toString();

            if ( parseInt(ki) != keys.length - 1) {
                query += "&";
            }

        }

        let res = this.BaseURL + query;
        return res;

    }

    // Helper function to convert base64 string to array
    this.AWSLambdaFunctionBase64StringToArray = function (b64s){
        const strData = atob(b64s);
        const charData = strData.split("").map((x) => { return x.charCodeAt(0); });
        const binData = new Uint8Array(charData);
        return JSON.parse(pako.inflate(binData, { to: "string" }));
    }

    this.AWSLambdaCleanUpData = function (rawdata) {
        return this.AWSLambdaFunctionBase64StringToArray(rawdata.data);
    }

    this.CleanUpDataRow = function (dataRow) {
        return dataRow;
    }

    this.CleanUpData = function (rawdata) {

        let data = rawdata;
        if (this.AWSLambdaFunctionSource) {
            data = this.AWSLambdaCleanUpData(data);
        }

        let data2 = [];
        for (let row of data) {
            data2.push(this.CleanUpDataRow(row));
        }



        return data2
    }


    this.request = async function (URLParams) {
        let rurl = this.RequestURL(URLParams);
        let rawResponse = await axios.get(rurl);
        // console.log(rawResponse.data)
        let data = this.CleanUpData(rawResponse.data);

        return data;
    }

    this.toTableData = function (data) {
        let tableData = [];

        return tableData;
    }



    return this;

}






export function ClinVarSchema() {

    BaseSchema.call(this);

    this.BaseURL = "https://www.ncbi.nlm.nih.gov/wrongapi";
    this.URLParams = {};

}
ClinVarSchema.prototype = new BaseSchema();
ClinVarSchema.prototype.constructor = ClinVarSchema;



export function OneThousandGenomeSchema() {

    BaseSchema.call(this);

    this.name = "1000 Genome";
    this.BaseURL = "https://8z6tnsj4te.execute-api.us-east-2.amazonaws.com/dev/1000genome/region/?";
    this.AWSLambdaFunctionSource = true;

    this.CleanUpDataRow = function (dataRow) {
        let deleteKeys = ["_id", "CHROM", "POS"];
        let res = JSON.parse(JSON.stringify(dataRow));

        let chromosome = dataRow["CHROM"];
        let start_pos = dataRow["POS"];
        let end_pos = start_pos;

        for (let key of deleteKeys) {
            delete res[key];
        }
        res["variant_position"] = [chromosome, start_pos, end_pos];
        return res;
    }


}

OneThousandGenomeSchema.prototype = new BaseSchema();
OneThousandGenomeSchema.prototype.constructor = OneThousandGenomeSchema;







// Debugging purposes
let baseSchema = new BaseSchema();
let clinVarSchema = new ClinVarSchema();
let oneThousandGenomeSchema = new OneThousandGenomeSchema();



async function test() {
    console.log("test");

    for (let schema of [oneThousandGenomeSchema, clinVarSchema, ]){
        schema.log();
        let data = await schema.request({"chr":"chrX", "start_pos":0, "end_pos": 100000000});
        console.log("Data: ", data)
    }

}
test();


console.log("Schema loaded");


