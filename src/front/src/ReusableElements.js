import axios from "axios";
import React, { useContext, useEffect, useState } from "react";





export function Table1(props){

    const original_caption = props.data[0];
    const original_header = props.data[1];
    const original_data = props.data[2];
    let option = {};
    if (props.data.length > 3){
        option = props.data[3];
    }

    //console.log(original_header)
    //console.log(original_data)
    //console.log(option)

    let tableData = [];
    let selectedTableData = [];

    for (let rd of original_data){
        tableData.push(rd)
    }

    for (let rd of tableData){
        selectedTableData.push(rd)
    }


    return <>
        <table className={"table1"}>
            <caption>{original_caption}</caption>
            <tr>
                {
                    original_header.map((e) => {
                        return <th>{e}</th>
                    })
                }
            </tr>
            {
                selectedTableData.map((row) => {
                    return <tr>{
                        row.map((e) => {
                            return <td>{e}</td>
                        })
                    }</tr>
                })
            }

        </table>
    </>

}



export function Table1Test(){
    let caption = "123123123";
    let header = ["1", "2", "3", "4ewjqehqwjk", "5"];
    let data = [];
    let option = {};

    let d = [caption, header, data, option];

    for (let i=0; i<100; i++){
        let d0 = [1, 2, 3, 4, 5];
        data.push(d0)
    }

    return <div className={"searchContainer"}>
        <Table1 data={d}></Table1>
    </div>
}


export default function A123(){

}











