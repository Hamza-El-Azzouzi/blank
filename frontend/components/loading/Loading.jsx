'use client';

import "./loading.css"
import { BiLoaderCircle } from "react-icons/bi";




export default function Loading() {
    return (
        <div className="loading-container">
            <span><BiLoaderCircle /></span>
        </div>
    )
}