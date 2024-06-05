import React, { useState, useEffect } from "react";
import Papa from "papaparse";

interface LogEntry {
  id: string;
  user_id: string;
  action: string;
  category: string;
  cat_id: string;
  date: string;
}

const userImages: { [key: string]: string } = {
  "1": "/images/Support-Abdu.jpg",
  "4": "/images/instructor_fawzy.jpg",
  "5": "/images/Support-Aya.jpg",
  "6": "/images/instructor_aml.jpg",
  "9": "/images/esraa.jpg",
  "10": "/images/sohir.jpg",
  "12": "/images/lina.jpg",
  "15": "/images/mohamed kamel.jpg",
  "24": "/images/Abdu.jpg",
  "53": "/images/Adham Usama.jpg",
};

const LogsTable: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSet, setCurrentSet] = useState(0);
  const entriesPerPage = 20;
  const pagesPerSet = 4;

  const fetchLogs = async () => {
    const response = await fetch("/Logs.csv");
    const csvText = await response.text();
    Papa.parse<LogEntry>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<LogEntry>) => {
        setLogs(result.data);
        setFilteredLogs(result.data);
      },
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(
        (log) =>
          log.id.includes(searchTerm) ||
          log.user_id.includes(searchTerm) ||
          log.action.includes(searchTerm) ||
          log.category.includes(searchTerm) ||
          log.cat_id.includes(searchTerm) ||
          log.date.includes(searchTerm)
      );
      setFilteredLogs(filtered);
      setCurrentPage(1);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchTerm, logs]);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredLogs.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  const startPage = currentSet * pagesPerSet + 1;
  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextSet = () => {
    if (endPage < totalPages) {
      setCurrentSet(currentSet + 1);
    }
  };

  const handlePreviousSet = () => {
    if (currentSet > 0) {
      setCurrentSet(currentSet - 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} style={{ color: "red" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const extractActionDetails = (action: string) => {
    const regex = /^([^,]+),\s*([^,]+),?\s*(.*)/;
    const match = action.match(regex);
    return match
      ? { actionType: match[2].split(" ")[0], details: match[2] + " " + (match[3] || "") }
      : { actionType: "", details: "" };
  };

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <i className="fa fa-search search-icon"></i>
      </div>
      <table className="u">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>USER ID</th>
            <th>MODIFIED BY</th>
            <th>ACTION</th>
            <th>DETAILS</th>
            <th>CATEGORY</th>
            <th>CAT ID</th>
            <th className="date">
              DATE OF CHANGE
              <span>
                <i className="fa-solid fa-calendar-days p-0 m-0 mx-3"></i>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.map((log) => {
            const {  actionType, details } = extractActionDetails(log.action);
            const modifiedBy = log.action.split(",")[0]; 
            return (
              <tr key={log.id}>
                <td>{highlightSearchTerm(log.id)}</td>
                <td>{highlightSearchTerm(log.user_id)}</td>
                <td className="modified-by d-flex align-items-center">
                  <img
                    src={userImages[log.user_id] || "/images/default.jpeg"}
                    alt={`Instructor ${log.user_id}`}
                    className="instructor-image"
                  />
                  {highlightSearchTerm(modifiedBy)}
                </td>
                <td>{highlightSearchTerm(actionType)}</td>
                <td>{highlightSearchTerm(details)}</td>
                <td>{highlightSearchTerm(log.category)}</td>
                <td>{highlightSearchTerm(log.cat_id)}</td>
                <td>{highlightSearchTerm(log.date)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <div className="d">
          {currentSet > 0 && (
            <button
              className="pagination-button border rounded-3"
              onClick={handlePreviousSet}
            >
              <i className="fa-solid fa-angles-left"></i>
            </button>
          )}
          {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
            <button
              key={startPage + index}
              onClick={() => handlePageChange(startPage + index)}
              className={`pagination-button border rounded-3 ${
                currentPage === startPage + index ? "active" : ""
              }`}
            >
              {startPage + index}
            </button>
          ))}
          {endPage < totalPages && (
            <button
              className="pagination-button border rounded-3"
              onClick={handleNextSet}
            >
              <i className="fa-solid fa-angles-right"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsTable;

