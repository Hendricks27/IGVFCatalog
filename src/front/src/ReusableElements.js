import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {tab} from "@testing-library/user-event/dist/tab";
import LoadingImg from "./images/loader.gif"



export function Table1(props){

    const tableDataOriginal = props.tableData;
    const optionOriginal = props.option;

    let caption = "";
    let header = tableDataOriginal.header;
    const tableData = tableDataOriginal.rows;
    let tableDataSelected = [];

    let sortable = false;
    let rowPerPageTmp = 10;
    let download = false;

    let showBottomPageButton = false;

    if (optionOriginal.sortable === true){
        sortable = true;
    }

    if (optionOriginal.download === true){
        download = true;
    }

    if (optionOriginal.rowPerPage === true){

    }

    if (tableDataOriginal.caption !== undefined){
        caption = tableDataOriginal.caption;
    }

    const [pageNum, setPageNum] = useState(1);
    const [rowPerPage, setRowPerPage] = useState(rowPerPageTmp);
    const [sortKey, setSortKey] = useState(["", true])




    // Figure out the bottom pages
    let maxPageNum = Math.ceil(tableData.length / rowPerPage);

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

    if (maxPageNum === 1){
        showBottomPageButton = false
    } else {
        showBottomPageButton = true
    }


    //
    if (sortable){
        let sortKeyColumnIndex = header.indexOf(sortKey[0]);
        // console.log(sortKeyColumnIndex, sortKey, header)

        if (sortKeyColumnIndex !== -1){
            tableData.sort((a, b) => {
                let result = b[sortKeyColumnIndex].sortKey > a[sortKeyColumnIndex].sortKey
                result ? result=-1 : result=1
                if (sortKey[1]){
                    return result
                }
                return -result
            })
        }
    }


    //
    let sliceStart = (pageNum-1)*rowPerPage;
    let sliceEnd = sliceStart + rowPerPage;
    if (sliceEnd > tableData.length){
        sliceEnd = tableData.length
    }
    tableDataSelected = tableData.slice(sliceStart, sliceEnd);





    // Generate download table on-the-fly
    const newLineOct = "%0A";
    const commaOct = "%2C";

    let table_str = "";
    for (let h of header){
        table_str += h + commaOct
    }
    table_str += newLineOct
    for (let r of tableData){
        for (let c of r){
            table_str += c.sortKey + commaOct
        }
        table_str += newLineOct
    }


    return <>
        <table className={"table1"}>
            <caption>{caption}</caption>
            <tr>
                {
                    header.map((e) => {
                        return <th onClick={(event) => {
                            let sk = event.target.innerText;
                            let asec = true;

                            if (sk === sortKey[0]){
                                asec = !sortKey[1]
                            }
                            setSortKey([sk, asec])
                        } }>{e}</th>
                    })
                }
            </tr>
            {
                tableDataSelected.map((r) => {
                    return <tr>{
                        r.map( (c) => <td>{c.content}</td>)
                    }</tr>
                })
            }
        </table>

        {
            tableData.length > 10 ?
                <div>
                    <label>Show </label>
                    <select onChange={(e) => {
                        setPageNum(1);
                        setRowPerPage([10, 25, 50, 100][e.target.options.selectedIndex])
                    } }>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <label> Per Page</label>
                </div>
                :
                <></>
        }

        {
            download ?
                <>
                    <label>Download </label>
                    <a href={"data:application/octet-stream,"+table_str} download="data.csv">Me</a>
                    <label> as CSV</label>
                </>
                :
                <></>
        }


        {
            showBottomPageButton ?
                <>
                    <ul className={"table1pagebuttons"}>
                        <li onClick={() => {setPageNum(1)} }>{"<<"}</li>
                        <li onClick={() => pageNum>1 ? setPageNum(pageNum-1) : "" }>{"<"}</li>
                        {prefixTriDot ? "...": ""}
                        {
                            pageNumbers.map((i) => {
                                if (i === pageNum){
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
                :
                <></>
        }

    </>


}


function r(){
    return Math.floor(Math.random() * 10000);
}

/*

4. Caption font size
5. Mouse over to show more
6.
* */
export function Table1ComplicateTest(){

    const tableData = {
        "caption": "Pseudo Table",
        "header": ["1", "2", "3", "423341", "5"],
        "rows": [],
    }

    const option = {
        "sortable": true,
        "rowPerPage": 0,
        "download": true,
    };

    for (let i=0; i<100; i++){
        let row = [];
        for (let i=0; i<5; i++) {
            let cell = {
                "content": "123",
                "sortKey": "456",
            }
            let tmp = r()
            cell.content = tmp.toString();
            cell.sortKey = tmp;
            row.push(JSON.parse(JSON.stringify(cell)))
        }
        tableData.rows.push(row)
    }

    return <div className={"searchContainer"}>
        <Table1
            tableData={tableData}
            option={option}
        ></Table1>
        <LoadingContainer width={120} ></LoadingContainer>
        <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
    </div>
}


export function LoadingContainer(props){

    let width = 100;
    let height = 100;

    if (props.width !== undefined){
        width = props.width;
        height = props.width;
    }

    if (props.height !== undefined){
        height = props.height;
    }

    const res = <>
        <img src={LoadingImg} alt={"loading"} width={width} height={height}></img>
    </>

    return res

}


export default function A123(){

}











