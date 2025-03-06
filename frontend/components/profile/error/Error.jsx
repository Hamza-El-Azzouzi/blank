'use client';
import "./error.css";
import { TbError404 } from "react-icons/tb";
import { MdError, MdOutlineReportProblem } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";

export default function Error({ error }) {
    const errorDetails = {
        404: { icon: <MdOutlineReportProblem />, header: "404 | Not Found", message: "The page you are looking for does not exist." },
        400: { icon: <MdOutlineReportProblem />, header: "400 | Bad Request", message: "Your request was not valid." },
        500: { icon: <MdError />, header: "500 | Server Error", message: "Something went wrong on our end." },
        default: { icon: <IoMdRefresh />, header: "Unknown Error", message: "An unexpected error occurred." },
    };

    const { icon, header, message } = errorDetails[error?.status] || errorDetails.default;

    return (
        <div className="not-found-component">
            <div className="error-box">
                <h1>{icon} {header}</h1>
                <p>{error?.message || message}</p>
                <button className="back-button" onClick={() => window.history.back()}>Go Back</button>
            </div>
        </div>
    );
}
